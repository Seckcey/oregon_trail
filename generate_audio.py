#!/usr/bin/env python3
r"""Generate The 8 West Trail audio assets from the Markdown audio brief.

Examples (PowerShell):
    python .\generate_audio.py .\audio-asset-brief.md --list
    python .\generate_audio.py .\audio-asset-brief.md --batch 1 --dry-run
    python .\generate_audio.py .\audio-asset-brief.md --batch 1
    python .\generate_audio.py .\audio-asset-brief.md --batch 1 --only title-loop.mp3,death-sting.mp3 --force
    python .\generate_audio.py .\audio-asset-brief.md --batch 1 --only title-loop.mp3,death-sting.mp3 --reprocess

Requirements:
    python -m pip install elevenlabs
    ffmpeg and ffprobe available on PATH
    ELEVENLABS_API_KEY set in the environment

The script intentionally generates ONE batch at a time. Existing files are skipped unless
--force is supplied, so an approved batch is not silently regenerated and billed again.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


DEFAULT_STYLE_TAIL = (
    "Cartoon-style sound effect, exaggerated and clean, classic animation foley, "
    "dry with minimal reverb, no music, no voices."
)
AMBIENCE_STYLE_TAIL = (
    "Cartoon-style sound effect, exaggerated and clean, classic animation foley, "
    "light natural reverb allowed, no music, no voices."
)

MUSIC_BATCHES = {1, 2}
AMBIENCE_BATCH = 7
UI_BATCH = 5
# The Sound Effects endpoint rejects text over 450 characters (prompt + style tail together).
SFX_PROMPT_MAX_CHARS = 450

# The Music API composes a musical *ending* (ritardando + fade) into the last 2-3 s of whatever
# length is requested. For loops we request this much extra, then cut before the fade.
LOOP_HEADROOM_SECONDS = 8.0
# One-shots: keep at most this much leading / trailing silence.
LEAD_SILENCE_SECONDS = 0.01
TAIL_SILENCE_SECONDS = 0.4
SILENCE_THRESHOLD_DB = -55.0
# Fade detection: 250 ms RMS windows; the tail is "fading" while it sits this far below the body.
FADE_WINDOW_SECONDS = 0.25
FADE_DROP_DB = 4.0
FADE_GUARD_SECONDS = 0.5



@dataclass
class Asset:
    batch: int
    filename: str
    requested_seconds: float
    loop: bool
    prompt_base: str
    prompt_sent: str
    kind: str  # music | sfx
    destination: Path
    bpm: float | None = None


@dataclass
class Result:
    asset: Asset
    endpoint: str
    actual_seconds: float | None
    peak_dbtp: float | None
    lufs: float | None
    loop_tested: str
    notes: str
    status: str


def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def normalize_markdown(text: str) -> str:
    """Undo the common Markdown escaping seen in ChatGPT/editor exports.

    The user's brief may contain either normal Markdown (`|`, `*`, backticks) or escaped
    Markdown (`\\|`, `\\*`, `\\``). This keeps the parser tolerant of both forms.
    """
    replacements = {
        r"\|": "|",
        r"\`": "`",
        r"\*": "*",
        r"\_": "_",
        r"\#": "#",
        r"\>": ">",
        r"\.": ".",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Horizontal rules in the pasted file arrive as \---.
    text = re.sub(r"(?m)^\\---\s*$", "---", text)
    # Normalize NBSPs introduced by rich-text copy/paste.
    text = text.replace("\u00a0", " ")
    return text


def strip_md(value: str) -> str:
    value = value.strip()
    value = value.replace("**", "").replace("*", "")
    value = value.strip().strip("`").strip()
    return value


def split_table_row(line: str) -> list[str]:
    line = line.strip()
    if not line.startswith("|"):
        return []
    return [c.strip() for c in line.strip("|").split("|")]


def parse_seconds(value: str) -> float:
    m = re.search(r"(\d+(?:\.\d+)?)\s*s\b", strip_md(value), re.I)
    if not m:
        raise ValueError(f"Could not parse duration from {value!r}")
    return float(m.group(1))


def parse_bpm(prompt: str) -> float | None:
    m = re.search(r"\b(\d+(?:\.\d+)?)\s*BPM\b", prompt, re.I)
    return float(m.group(1)) if m else None


def clean_filename(value: str) -> str:
    name = strip_md(value)
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*\.mp3", name):
        raise ValueError(f"Unsafe or unexpected filename in brief: {name!r}")
    return name


def parse_brief(brief_path: Path, project_root: Path) -> dict[int, list[Asset]]:
    text = normalize_markdown(brief_path.read_text(encoding="utf-8"))
    lines = text.splitlines()

    batches: dict[int, list[Asset]] = {}
    current_batch: int | None = None
    header_cols: list[str] | None = None

    for raw_line in lines:
        line = raw_line.strip()

        batch_match = re.search(r"\bBatch\s+(\d+)\s+—", line)
        if batch_match:
            current_batch = int(batch_match.group(1))
            header_cols = None
            if 1 <= current_batch <= 10:
                batches.setdefault(current_batch, [])
            else:
                current_batch = None
            continue

        if current_batch is None or not line.startswith("|"):
            continue

        cells = split_table_row(line)
        if not cells:
            continue

        # Header row
        if any(strip_md(c).lower() == "file" for c in cells) and any(
            "prompt" in strip_md(c).lower() for c in cells
        ):
            header_cols = [strip_md(c) for c in cells]
            continue

        # Markdown separator row
        if all(re.fullmatch(r":?-{3,}:?", strip_md(c)) for c in cells if strip_md(c)):
            continue

        if not header_cols or len(cells) < 2:
            continue

        # Pad short rows just in case; ignore excess cells after the prompt by rejoining them.
        if len(cells) > len(header_cols):
            cells = cells[: len(header_cols) - 1] + [" | ".join(cells[len(header_cols) - 1 :])]
        while len(cells) < len(header_cols):
            cells.append("")

        row = dict(zip(header_cols, cells))
        file_key = next((k for k in row if strip_md(k).lower() == "file"), None)
        length_key = next((k for k in row if strip_md(k).lower() == "length"), None)
        prompt_key = next((k for k in row if "prompt" in strip_md(k).lower()), None)
        loop_key = next((k for k in row if strip_md(k).lower() == "loop"), None)

        if not file_key or not length_key or not prompt_key:
            continue

        filename = clean_filename(row[file_key])
        requested_seconds = parse_seconds(row[length_key])
        prompt_base = strip_md(row[prompt_key])
        if not prompt_base:
            raise ValueError(f"Missing prompt for {filename}")

        if loop_key:
            loop = strip_md(row[loop_key]).lower() == "yes"
        else:
            loop = current_batch == AMBIENCE_BATCH

        kind = "music" if current_batch in MUSIC_BATCHES else "sfx"
        if kind == "music":
            destination = project_root / "public" / "assets" / "audio" / filename
            prompt_sent = prompt_base
        else:
            destination = project_root / "public" / "assets" / "audio" / "sfx" / filename
            tail = AMBIENCE_STYLE_TAIL if current_batch == AMBIENCE_BATCH else DEFAULT_STYLE_TAIL
            prompt_sent = f"{prompt_base} {tail}"
            if len(prompt_sent) > SFX_PROMPT_MAX_CHARS:
                raise ValueError(
                    f"{filename}: prompt + style tail is {len(prompt_sent)} chars; the Sound Effects API "
                    f"rejects anything over {SFX_PROMPT_MAX_CHARS}. Shorten the prompt in the brief."
                )

        batches[current_batch].append(
            Asset(
                batch=current_batch,
                filename=filename,
                requested_seconds=requested_seconds,
                loop=loop,
                prompt_base=prompt_base,
                prompt_sent=prompt_sent,
                kind=kind,
                destination=destination,
                bpm=parse_bpm(prompt_base),
            )
        )

    return batches


def bar_floor(seconds: float, bpm: float | None) -> float:
    """Round DOWN to a whole 4/4 bar when BPM is known; otherwise return seconds unchanged."""
    if not bpm:
        return seconds
    bar_seconds = 240.0 / bpm  # 4 beats per bar
    bars = max(1, math.floor(seconds / bar_seconds + 1e-9))
    return bars * bar_seconds


def clean_bar_duration(asset: Asset) -> float:
    """For looping music, the longest whole-bar length that fits the brief's requested length."""
    if asset.kind != "music" or not asset.loop:
        return asset.requested_seconds
    return bar_floor(asset.requested_seconds, asset.bpm)


def api_request_seconds(asset: Asset) -> float:
    """What we ask the API for. Music loops get headroom so the composed ending can be cut off."""
    if asset.kind == "music" and asset.loop:
        return asset.requested_seconds + LOOP_HEADROOM_SECONDS
    if asset.kind == "sfx":
        return max(0.5, asset.requested_seconds)
    return asset.requested_seconds


def require_command(name: str) -> None:
    if shutil.which(name) is None:
        raise RuntimeError(
            f"{name} is required but was not found on PATH. Install FFmpeg and reopen PowerShell."
        )


def run(cmd: list[str], *, capture: bool = False, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        check=check,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )


def write_chunks(chunks: Iterable[bytes], path: Path) -> None:
    """Stream the API response to disk atomically: a call that fails mid-stream (or before the
    first byte, e.g. a 400 validation error) must not leave a 0-byte file over the previous raw."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".part")
    written = 0
    try:
        with tmp.open("wb") as f:
            for chunk in chunks:
                if chunk:
                    f.write(chunk)
                    written += len(chunk)
        if written == 0:
            raise RuntimeError("API returned no audio data")
        tmp.replace(path)
    finally:
        tmp.unlink(missing_ok=True)


def ffprobe_duration(path: Path) -> float:
    cp = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture=True,
    )
    return float(cp.stdout.strip())


def ffmpeg_to_wav(source: Path, wav_path: Path, *, channels: int, filters: list[str]) -> None:
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source)]
    if filters:
        cmd += ["-af", ",".join(filters)]
    cmd += ["-ar", "44100", "-ac", str(channels), "-c:a", "pcm_s24le", str(wav_path)]
    run(cmd)


def window_rms_db(path: Path, window_seconds: float) -> list[float]:
    """RMS level (dBFS) per window, full bandwidth, mono-summed, measured by ffmpeg's astats.

    (An earlier version downmixed to 8 kHz first, which low-passes at 4 kHz and made hiss-like
    sounds — a rattlesnake, sand, steam — read 15-20 dB quieter than they are.)
    """
    rate = 44100
    n = max(1, int(rate * window_seconds))
    filt = (
        f"aformat=channel_layouts=mono,aresample={rate},asetnsamples=n={n}:p=0,"
        "astats=metadata=1:reset=1:measure_perchannel=none:measure_overall=RMS_level,"
        "ametadata=mode=print:key=lavfi.astats.Overall.RMS_level:file=-"
    )
    cp = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-af", filt, "-f", "null", "-"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    levels: list[float] = []
    for m in re.finditer(r"lavfi\.astats\.Overall\.RMS_level=(-?(?:inf|nan|\d+(?:\.\d+)?))", cp.stdout):
        v = m.group(1)
        levels.append(-120.0 if v in ("-inf", "nan") else float(v))
    # The final partial window is dropped, matching the previous behaviour.
    return levels[:-1] if levels else levels


def detect_tail_fade_start(path: Path) -> float | None:
    """Seconds at which the composed ending starts to fade, or None if the tail holds its level.

    The body level is the median window RMS across the middle 80 % of the file. Walking back from
    the end, the tail is "fading" for as long as windows sit FADE_DROP_DB below that; the first
    window that is back up to body level marks the end of the real music. A guard is subtracted
    because the shallow first part of a fade hides above the threshold.
    """
    levels = window_rms_db(path, FADE_WINDOW_SECONDS)
    n = len(levels)
    if n < 8:
        return None
    body = sorted(levels[int(n * 0.1) : int(n * 0.9)])
    if not body:
        return None
    median = body[len(body) // 2]
    threshold = median - FADE_DROP_DB
    i = n
    while i > 0 and levels[i - 1] < threshold:
        i -= 1
    if i == n:
        return None
    return max(0.0, i * FADE_WINDOW_SECONDS - FADE_GUARD_SECONDS)


def edge_rms_db(path: Path, seconds: float) -> tuple[float, float]:
    """RMS (dBFS) of the first and last `seconds` of a file — the two sides of a loop seam."""
    filt = "astats=measure_overall=RMS_level:measure_perchannel=none"

    def measure(extra: list[str]) -> float:
        cp = run(
            ["ffmpeg", "-hide_banner", "-nostats", *extra, "-i", str(path), "-af", filt, "-f", "null", "-"],
            capture=True,
            check=False,
        )
        m = re.findall(r"RMS level dB:\s*(-?(?:inf|\d+(?:\.\d+)?))", cp.stderr)
        if not m:
            raise RuntimeError(f"Could not measure edge level for {path.name}")
        return -120.0 if m[-1] == "-inf" else float(m[-1])

    head = measure(["-t", f"{seconds:.3f}"])
    tail = measure(["-sseof", f"-{seconds:.3f}"])
    return head, tail


def seam_verdict(path: Path) -> tuple[bool, str]:
    """Does the loop end the way it plays, and start with sound?

    A rest before the downbeat is normal music, so the tail is judged against the file's OWN quiet
    moments (10th-percentile window level), not against the head. Three failure modes:
      - fades out: the last 300 ms sit well below the quietest normal passage
      - silent tail: the final 100 ms are essentially digital silence (a gap at the seam)
      - starts quiet: the first 100 ms are far below the body (a loop that begins with silence)
    """
    levels = window_rms_db(path, 0.1)
    n = len(levels)
    if n < 10:
        return True, "seam untested (too short)"
    lo, hi = int(n * 0.1), int(n * 0.9)
    body = sorted(levels[lo:hi])
    median = body[len(body) // 2]
    # Like-for-like: the deepest 300 ms rest the body itself contains (5th percentile of span minima).
    span_minima = sorted(min(levels[i : i + 3]) for i in range(lo, hi - 2))
    quiet_rest = span_minima[int(len(span_minima) * 0.05)] if span_minima else median
    head = levels[0]
    tail_min = min(levels[-3:])
    last = levels[-1]

    problems: list[str] = []
    if tail_min < quiet_rest - 6.0:
        problems.append(f"fades out (tail {tail_min:.1f} vs deepest normal rest {quiet_rest:.1f} dBFS)")
    if last < -60.0:
        problems.append(f"silent tail ({last:.1f} dBFS)")
    if head < median - 12.0:
        problems.append(f"starts quiet (head {head:.1f} vs body {median:.1f} dBFS)")
    if problems:
        return False, "SEAM FAIL: " + "; ".join(problems)
    return True, f"seam ok (head {head:.1f} / tail {tail_min:.1f} / body {median:.1f} dBFS)"


def snap_cut_to_onset(path: Path, cut: float, radius: float) -> float:
    """Move a cut point to the strongest onset within +/- radius, so the loop restarts on a hit.

    The generated tempo drifts from the nominal BPM over a minute or two; a pure bar-grid cut can
    land a few tens of ms inside a note. Cutting right where the level jumps up keeps the head of
    the loop on the attack and leaves whatever rest precedes it as the tail.
    """
    window = 0.05
    levels = window_rms_db(path, window)
    lo = max(1, int((cut - radius) / window))
    hi = min(len(levels) - 1, int((cut + radius) / window))
    if hi <= lo:
        return cut
    best_i, best_jump = None, 6.0  # ignore anything less than a 6 dB step up
    for i in range(lo, hi + 1):
        jump = levels[i] - levels[i - 1]
        if jump > best_jump:
            best_i, best_jump = i, jump
    return best_i * window if best_i is not None else cut


def ffmpeg_prepare_pcm(asset: Asset, source: Path, wav_path: Path) -> tuple[float, str]:
    """Decode, trim, channel-map, and resample to a PCM working file.

    One-shots: strip leading silence (<= LEAD_SILENCE_SECONDS kept), cap trailing silence, cap length.
    Loops: strip leading silence, then cut at the last whole bar that ends before the composed
    ending starts to fade (and never longer than the brief's length). Returns (seconds, note).
    """
    channels = 2 if (asset.kind == "music" or asset.loop) else 1
    head_trim = f"silenceremove=start_periods=1:start_silence={LEAD_SILENCE_SECONDS}:start_threshold={SILENCE_THRESHOLD_DB:g}dB"
    notes: list[str] = []

    if not asset.loop:
        tail_trim = (
            "areverse,"
            f"silenceremove=start_periods=1:start_silence={TAIL_SILENCE_SECONDS}:start_threshold={SILENCE_THRESHOLD_DB:g}dB,"
            "areverse"
        )
        filters = [head_trim, tail_trim, f"atrim=duration={asset.requested_seconds:.6f}", "asetpts=N/SR/TB"]
        ffmpeg_to_wav(source, wav_path, channels=channels, filters=filters)
        return ffprobe_duration(wav_path), ""

    # Loop: decode with the head trimmed, analyse, then cut.
    full_wav = wav_path.with_name(wav_path.stem + ".full.wav")
    ffmpeg_to_wav(source, full_wav, channels=channels, filters=[head_trim, "asetpts=N/SR/TB"])
    available = ffprobe_duration(full_wav)
    limit = min(asset.requested_seconds, available)

    if asset.kind == "music":
        fade_at = detect_tail_fade_start(full_wav)
        if fade_at is not None and fade_at < limit:
            notes.append(f"fade detected at {fade_at:.2f}s")
            if fade_at >= 0.5 * asset.requested_seconds:
                limit = fade_at
            else:
                notes.append("ignored (would cut more than half the loop) — listen to the seam")
        grid_cut = bar_floor(limit, asset.bpm)
        if asset.bpm:
            beat = 60.0 / asset.bpm
            cut = min(limit, snap_cut_to_onset(full_wav, grid_cut, radius=beat / 2))
            bars = round(grid_cut / (240.0 / asset.bpm))
            snapped = f", snapped to onset at {cut:.3f}s" if abs(cut - grid_cut) > 0.001 else ""
            notes.append(f"cut at {grid_cut:.3f}s = {bars} bars @ {asset.bpm:g} BPM{snapped}")
        else:
            cut = grid_cut
            notes.append(f"cut at {cut:.3f}s (no BPM in prompt; not bar-aligned)")
    else:
        # SFX/ambience loops come back loopable from the API at the requested length; just cap.
        cut = limit

    final_filters = [f"atrim=duration={cut:.6f}", "asetpts=N/SR/TB"]
    if asset.batch == AMBIENCE_BATCH:
        # A bed must hold its level, and the model writes 20-30 dB gust/swell arcs into ambience
        # renders. Flatten them with a fixed compander curve (-50 dB in -> -34 out, -20 -> -24,
        # so a 30 dB swell becomes ~10 dB; true silence below -60 stays silent). It runs on the
        # loop played three times and keeps the middle copy, so the envelope follower has real
        # audio on both sides of the seam and there is no start-up ramp at the head.
        samples = int(round(cut * 44100))
        final_filters += [
            f"aloop=loop=2:size={samples}",
            "compand=attacks=0.3:decays=1.0:points=-90/-90|-60/-48|-50/-34|-30/-27|-20/-24|0/-18:soft-knee=6",
            f"atrim=start={cut:.6f}:end={2 * cut:.6f}",
            "asetpts=N/SR/TB",
        ]
        notes.append("bed levelled (compand over the tripled loop, middle copy kept)")

    ffmpeg_to_wav(full_wav, wav_path, channels=channels, filters=final_filters)
    full_wav.unlink(missing_ok=True)
    return cut, "; ".join(notes)


def analyze_loudnorm(path: Path, target_i: float, target_tp: float) -> dict[str, float | str]:
    filt = f"loudnorm=I={target_i}:TP={target_tp}:LRA=11:print_format=json"
    cp = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-af",
            filt,
            "-f",
            "null",
            "-",
        ],
        capture=True,
        check=False,
    )
    # loudnorm prints JSON to stderr. Grab the final JSON object.
    matches = re.findall(r"\{\s*\"input_i\".*?\}", cp.stderr, flags=re.S)
    if not matches:
        raise RuntimeError(f"Could not read loudness analysis for {path.name}\n{cp.stderr[-2000:]}")
    data = json.loads(matches[-1])
    return data


def encode_loudnorm(source_wav: Path, destination: Path, *, target_i: float, target_tp: float, bitrate: str) -> None:
    first = analyze_loudnorm(source_wav, target_i, target_tp)

    # Two-pass EBU R128 normalization. `linear=true` is appropriate because the source is already a
    # finished generation and we want level correction, not creative dynamics processing.
    filt = (
        f"loudnorm=I={target_i}:TP={target_tp}:LRA=11:"
        f"measured_I={first['input_i']}:"
        f"measured_TP={first['input_tp']}:"
        f"measured_LRA={first['input_lra']}:"
        f"measured_thresh={first['input_thresh']}:"
        f"offset={first['target_offset']}:linear=true:print_format=summary"
    )
    destination.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source_wav),
            "-af",
            filt,
            "-ar",
            "44100",
            "-b:a",
            bitrate,
            "-write_xing",
            "1",
            str(destination),
        ]
    )


def sample_peak_db(path: Path) -> float:
    cp = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-af",
            "volumedetect",
            "-f",
            "null",
            "-",
        ],
        capture=True,
        check=False,
    )
    matches = re.findall(r"max_volume:\s*(-?(?:inf|\d+(?:\.\d+)?))\s*dB", cp.stderr)
    if not matches:
        raise RuntimeError(f"Could not measure peak level for {path.name}")
    value = matches[-1]
    return -120.0 if value == "-inf" else float(value)


def encode_peak_normalized(source_wav: Path, destination: Path, *, target_peak: float, bitrate: str) -> None:
    """Bring the loudest 50 ms of the sound up to a body target, limiting true peaks to target_peak.

    Pure peak normalization let one spike set the level and left soft renders (beep-beep, rattle)
    25-30 dB below the rest of the pack. Now the *body* is what gets normalized; the limiter only
    catches the spikes. Body target sits 10 dB under the peak ceiling; gain is capped at +30 dB so
    a near-silent render doesn't become amplified noise.
    """
    target_body = target_peak - 7.0
    loudest_window = max(window_rms_db(source_wav, 0.05) or [-60.0])
    gain = min(30.0, target_body - loudest_window)
    destination.parent.mkdir(parents=True, exist_ok=True)

    def encode(extra_reduction: float = 0.0) -> None:
        # The MP3 encoder overshoots the limiter ceiling slightly; on retry lower the ceiling itself
        # (lowering the pre-limiter gain would leave the peaks pinned at the same ceiling).
        limit = 10 ** ((target_peak + extra_reduction) / 20.0)
        run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(source_wav),
                "-af",
                f"volume={gain:.3f}dB,alimiter=limit={limit:.4f}:attack=1:release=40:level=false",
                "-ar",
                "44100",
                "-b:a",
                bitrate,
                "-write_xing",
                "1",
                str(destination),
            ]
        )

    encode()
    # MP3 encoding can increase inter-sample/true peak. Measure and pull back if needed.
    metrics = analyze_loudnorm(destination, -24.0, target_peak)
    true_peak = float(metrics["input_tp"])
    if true_peak > target_peak + 0.15:
        encode(target_peak - true_peak - 0.1)


def analysis_targets(asset: Asset) -> tuple[float, float, bool]:
    """(target LUFS, target true-peak, report LUFS?) for an asset's class."""
    if asset.kind == "music":
        return -16.0, -1.0, True
    if asset.batch == AMBIENCE_BATCH:
        return -22.0, -1.0, True
    if asset.batch == UI_BATCH:
        return -24.0, -6.0, False
    return -24.0, -2.0, False


def measure_final(asset: Asset, destination: Path) -> tuple[float, float, float | None, str]:
    """Duration, true peak, LUFS (music/ambience only) and seam verdict of a finished file."""
    target_i, target_tp, report_lufs = analysis_targets(asset)
    duration = ffprobe_duration(destination)
    metrics = analyze_loudnorm(destination, target_i, target_tp)
    peak = float(metrics["input_tp"])
    lufs = float(metrics["input_i"]) if report_lufs else None
    loop_tested = seam_verdict(destination)[1] if asset.loop else "n/a"
    return duration, peak, lufs, loop_tested


def process_audio(asset: Asset, raw_path: Path, destination: Path, workdir: Path) -> tuple[float, float, float | None, str, str]:
    """Raw API file -> finished public asset. Returns duration, peak, LUFS, seam verdict, notes."""
    wav_path = workdir / f"{asset.filename}.work.wav"
    _, notes = ffmpeg_prepare_pcm(asset, raw_path, wav_path)

    target_i, target_tp, _ = analysis_targets(asset)
    if asset.kind == "music":
        encode_loudnorm(wav_path, destination, target_i=target_i, target_tp=target_tp, bitrate="192k")
    elif asset.batch == AMBIENCE_BATCH:
        encode_loudnorm(wav_path, destination, target_i=target_i, target_tp=target_tp, bitrate="128k")
    else:
        encode_peak_normalized(wav_path, destination, target_peak=target_tp, bitrate="128k")

    duration, peak, lufs, loop_tested = measure_final(asset, destination)
    return duration, peak, lufs, loop_tested, notes


def generate_raw(client, asset: Asset, raw_path: Path) -> tuple[str, str]:
    """Call ElevenLabs and write the unprocessed API response. Returns endpoint, notes."""
    notes: list[str] = []

    if asset.kind == "music":
        # Music v2's 192 kbps native format is 48 kHz; the brief requires 44.1 kHz, so FFmpeg
        # resamples after generation.
        api_seconds = api_request_seconds(asset)
        audio = client.music.compose(
            prompt=asset.prompt_sent,
            music_length_ms=int(round(api_seconds * 1000)),
            model_id="music_v2",
            force_instrumental=True,
            output_format="mp3_48000_192",
        )
        endpoint = "music_v2"
        if asset.loop:
            notes.append(
                f"requested {api_seconds:g}s (+{LOOP_HEADROOM_SECONDS:g}s headroom) so the composed ending can be cut off"
            )
    else:
        api_seconds = api_request_seconds(asset)
        if api_seconds != asset.requested_seconds:
            notes.append(
                f"ElevenLabs minimum request is 0.5s; generated 0.5s then trimmed to {asset.requested_seconds:g}s"
            )
        audio = client.text_to_sound_effects.convert(
            text=asset.prompt_sent,
            duration_seconds=api_seconds,
            prompt_influence=0.75,
            loop=asset.loop,
            model_id="eleven_text_to_sound_v2",
            output_format="mp3_44100_128",
        )
        endpoint = "sound-effects-v2"

    write_chunks(audio, raw_path)
    return endpoint, "; ".join(notes)


def md_escape(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ").strip()


def format_metric(value: float | None, decimals: int = 1) -> str:
    if value is None or not math.isfinite(value):
        return "—"
    return f"{value:.{decimals}f}"


def write_manifest(batch: int, results: list[Result], project_root: Path, *, partial: bool = False) -> Path:
    out_dir = project_root / "art-masters" / "audio" / "manifests"
    out_dir.mkdir(parents=True, exist_ok=True)
    # A --only / --reprocess run covers a subset; keep it from clobbering the full batch manifest.
    out_path = out_dir / (f"batch-{batch}-redo-manifest.md" if partial else f"batch-{batch}-manifest.md")

    rows = [
        f"## Batch {batch} manifest",
        "",
        "| File | Endpoint | Duration (s) | Loop-tested | Peak dBTP | LUFS | Prompt sent (verbatim) | Notes / deviations |",
        "|---|---|---:|---|---:|---:|---|---|",
    ]

    for result in results:
        try:
            rel = result.asset.destination.relative_to(project_root).as_posix()
        except ValueError:
            rel = result.asset.destination.as_posix()

        notes = result.notes
        if result.status != "generated":
            notes = f"{result.status}: {notes}" if notes else result.status

        rows.append(
            "| "
            + " | ".join(
                [
                    md_escape(rel),
                    md_escape(result.endpoint),
                    format_metric(result.actual_seconds, 3),
                    md_escape(result.loop_tested),
                    format_metric(result.peak_dbtp, 1),
                    format_metric(result.lufs, 1),
                    '"' + md_escape(result.asset.prompt_sent).replace('"', "'") + '"',
                    md_escape(notes),
                ]
            )
            + " |"
        )

    rows += [
        "",
        "**Review outcome per file:** `approved` · `redo: <what to change>`.",
        "",
        "> Loop-tested checks the finished loop for a fade-out (tail far below the file's own quietest",
        "> passage), a silent tail, or a silent head, and reports `SEAM FAIL` with the reason. A pass means",
        "> no fade or gap at the seam; it does not prove the last bar sounds like it leads into the first —",
        "> play each loop twice back-to-back before approving.",
        "",
    ]
    out_path.write_text("\n".join(rows), encoding="utf-8")
    return out_path


def print_batch_plan(assets: list[Asset], project_root: Path) -> None:
    for idx, a in enumerate(assets, 1):
        try:
            rel = a.destination.relative_to(project_root)
        except ValueError:
            rel = a.destination
        extra = []
        if a.loop:
            extra.append("LOOP")
        if a.kind == "music" and a.loop:
            extra.append(f"request {api_request_seconds(a):g}s, cut to <= {clean_bar_duration(a):.3f}s before the fade")
        print(f"{idx:2}. {a.kind.upper():5} {a.filename:28} {a.requested_seconds:6g}s  {rel} {' '.join(extra)}")
        print(f"    prompt: {a.prompt_sent}")


def main() -> int:
    # The brief and prompts contain em dashes etc.; never let a cp1252 console kill a paid run.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(
        description="Generate one ElevenLabs audio batch from The 8 West Trail Markdown brief."
    )
    parser.add_argument("brief", type=Path, help="Path to the Markdown audio brief")
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Project root containing public/assets (default: current directory)",
    )
    parser.add_argument("--batch", type=int, choices=range(1, 11), help="Batch number to generate")
    parser.add_argument("--list", action="store_true", help="List parsed batches and exit")
    parser.add_argument("--dry-run", action="store_true", help="Show exact calls/paths without using API credits")
    parser.add_argument("--force", action="store_true", help="Overwrite files that already exist")
    parser.add_argument(
        "--only",
        help="Comma-separated filenames to generate, useful for review redos (example: bang.mp3,hisss.mp3)",
    )
    parser.add_argument(
        "--reprocess",
        action="store_true",
        help="No API call: rebuild the public file from art-masters/audio/raw/<name>.source.mp3 with the "
        "current trim/cut/loudness rules. Implies --force. Free — use it before regenerating.",
    )
    args = parser.parse_args()
    if args.reprocess:
        args.force = True

    brief_path = args.brief.resolve()
    project_root = args.project_root.resolve()
    if not brief_path.is_file():
        parser.error(f"Brief not found: {brief_path}")

    try:
        batches = parse_brief(brief_path, project_root)
    except Exception as exc:
        eprint(f"ERROR parsing brief: {exc}")
        return 2

    if args.list:
        total = 0
        for batch in range(1, 11):
            assets = batches.get(batch, [])
            total += len(assets)
            kinds = ", ".join(sorted({a.kind for a in assets})) or "none"
            print(f"Batch {batch:2}: {len(assets):2} files ({kinds})")
        print(f"Total: {total} files")
        return 0

    if args.batch is None:
        parser.error("Choose --batch N, or use --list")

    assets = list(batches.get(args.batch, []))
    if not assets:
        eprint(f"ERROR: No assets parsed for batch {args.batch}.")
        return 2

    if args.only:
        wanted = {x.strip() for x in args.only.split(",") if x.strip()}
        known = {a.filename for a in assets}
        unknown = wanted - known
        if unknown:
            eprint(f"ERROR: --only contains files not in batch {args.batch}: {', '.join(sorted(unknown))}")
            return 2
        assets = [a for a in assets if a.filename in wanted]

    print(f"\nBatch {args.batch}: {len(assets)} asset(s) from {brief_path.name}\n")
    print_batch_plan(assets, project_root)

    if args.dry_run:
        print("\nDRY RUN: no API calls made, no credits used.")
        return 0

    try:
        require_command("ffmpeg")
        require_command("ffprobe")
    except RuntimeError as exc:
        eprint(f"\nERROR: {exc}")
        return 2

    client = None
    if not args.reprocess:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            eprint(
                "\nERROR: ELEVENLABS_API_KEY is not set. In PowerShell:\n"
                '  $env:ELEVENLABS_API_KEY = "YOUR_NEW_KEY"\n'
            )
            return 2

        try:
            from elevenlabs.client import ElevenLabs
        except ModuleNotFoundError:
            eprint(
                "\nERROR: Python package 'elevenlabs' is not installed for this Python. Run:\n"
                "  python -m pip install --upgrade elevenlabs\n"
            )
            return 2

        client = ElevenLabs(api_key=api_key)

    results: list[Result] = []

    raw_dir = project_root / "art-masters" / "audio" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="8west-audio-") as td:
        workdir = Path(td)

        for number, asset in enumerate(assets, 1):
            destination = asset.destination
            rel = destination.relative_to(project_root).as_posix()

            raw_path = raw_dir / f"{asset.filename[:-4]}.source.mp3"

            if destination.exists() and not args.force:
                print(f"\n[{number}/{len(assets)}] SKIP {rel} (already exists; use --force to overwrite)")
                try:
                    duration, peak, lufs, loop_tested = measure_final(asset, destination)
                except Exception:
                    duration, peak, lufs, loop_tested = None, None, None, "unmeasured"
                results.append(
                    Result(
                        asset=asset,
                        endpoint="—",
                        actual_seconds=duration,
                        peak_dbtp=peak,
                        lufs=lufs,
                        loop_tested=loop_tested,
                        notes="existing file preserved",
                        status="skipped",
                    )
                )
                continue

            if args.reprocess:
                print(f"\n[{number}/{len(assets)}] REPROCESS {rel} from {raw_path.relative_to(project_root).as_posix()}")
                if not raw_path.exists():
                    eprint("    FAILED: no raw source to reprocess; regenerate instead (drop --reprocess)")
                    results.append(
                        Result(asset=asset, endpoint="reprocess", actual_seconds=None, peak_dbtp=None, lufs=None,
                               loop_tested="n/a", notes="raw source missing", status="FAILED")
                    )
                    continue
            else:
                print(f"\n[{number}/{len(assets)}] GENERATE {rel}")

            try:
                if args.reprocess:
                    endpoint, notes = "reprocess (no API call)", "rebuilt from raw source"
                else:
                    endpoint, notes = generate_raw(client, asset, raw_path)
                    print("    API generation complete; applying brief format/loudness rules...")
                duration, peak, lufs, loop_tested, cut_notes = process_audio(asset, raw_path, destination, workdir)

                # Keep raw API response as a master/source reference. The public asset is the processed file.
                notes_parts = [
                    n
                    for n in [notes, cut_notes, f"raw source kept at {raw_path.relative_to(project_root).as_posix()}"]
                    if n
                ]
                results.append(
                    Result(
                        asset=asset,
                        endpoint=endpoint,
                        actual_seconds=duration,
                        peak_dbtp=peak,
                        lufs=lufs,
                        loop_tested=loop_tested,
                        notes="; ".join(notes_parts),
                        status="generated",
                    )
                )
                print(
                    f"    DONE {duration:.3f}s | peak {peak:.1f} dBTP"
                    + (f" | {lufs:.1f} LUFS" if lufs is not None else "")
                    + (f" | {loop_tested}" if asset.loop else "")
                    + (f"\n    {cut_notes}" if cut_notes else "")
                )
            except Exception as exc:
                eprint(f"    FAILED: {exc}")
                results.append(
                    Result(
                        asset=asset,
                        endpoint="music_v2" if asset.kind == "music" else "sound-effects-v2",
                        actual_seconds=None,
                        peak_dbtp=None,
                        lufs=None,
                        loop_tested="pending human review" if asset.loop else "n/a",
                        notes=str(exc),
                        status="FAILED",
                    )
                )
                # Continue the rest of the batch so one bad generation does not throw away the whole run.

    manifest = write_manifest(args.batch, results, project_root, partial=bool(args.only or args.reprocess))
    failures = [r for r in results if r.status == "FAILED"]

    print(f"\nManifest: {manifest.relative_to(project_root)}")
    if failures:
        print(f"Batch completed with {len(failures)} failure(s). Review the manifest and rerun only those files.")
        print(
            "Example: python .\\generate_audio.py .\\audio-asset-brief.md "
            f"--batch {args.batch} --only "
            + ",".join(r.asset.filename for r in failures)
            + " --force"
        )
        return 1

    print("Batch generation complete. Stop here and review this batch before generating the next one.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
