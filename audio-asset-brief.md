# The 8 West Trail — Audio Asset Brief

*Written 2026-08-25 for the audio pass. This is the complete list of music and sound effects the
game wants, in the order they should be made, with a prompt for each. Hand this whole file to the
generating script (`generate_audio.py` + the ElevenLabs API). Work one batch at a time, 5–10 files per batch,
then stop and wait for review before starting the next. Fable (Claude) reviews every batch against
this brief and either approves it or sends back specific files with changes.*

---

## 0. How this works

1. **Read §1 (rules) and §2 (style) before generating anything.** Every file must obey them.
2. **Generate one batch (§4–§13) at a time, in order.** Do not skip ahead, do not merge batches.
3. **Save the files exactly where and exactly as named in the table.** The game's build scans
   `public/assets/` and picks files up by base name; a misspelled name is a silent miss.
4. **After each batch, post the batch manifest (§14)** — one row per file with the prompt you
   actually sent, the API you used, the duration, and anything you had to change. Then stop.
5. **Wait for the review.** Approved files are done. Files marked *redo* get a note saying what
   to change; regenerate only those, overwrite in place (same filename), repost the manifest.
6. **Never rename, never add version suffixes** (`-v2`, `-final`, ` (1)`). One slot = one file.
   If you make alternates, put them in `art-masters/audio/alts/<name>-alt1.mp3`, never in
   `public/assets/`.

---

## 1. Hard rules (apply to every file)

| Rule | Value |
|---|---|
| Where music goes | `public/assets/audio/<name>.mp3` |
| Where sound effects go | `public/assets/audio/sfx/<name>.mp3` |
| Filenames | lowercase, kebab-case, ASCII only, `.mp3` extension. Exactly as listed. |
| Format | MP3, 44.1 kHz, **192 kbps CBR** for music, **128 kbps** for SFX |
| Channels | Music and ambience loops: stereo. One-shot SFX and UI sounds: **mono** |
| Loudness | Music loops −16 LUFS integrated, true-peak ≤ −1 dBTP. SFX peak −3 to −1 dBTP. Nothing clipped. |
| Silence | Trim leading silence to ≤ 10 ms on every one-shot. Trailing tail may ring out naturally, then hard-trim. |
| Loop headroom | The Music API composes an *ending* into the last 2–3 s of whatever length you request. So for every music **LOOP**, request **8 s longer** than the table length, then hard-cut to the last whole 4/4 bar that ends *before* the fade begins. The cut, not the API, makes the seam. |
| Loops | Anything marked **LOOP** must be seamless: no fade in/out, no silence at either end, the last beat leads straight back into the first. Test by playing it twice back to back. |
| Vocals | **No sung lyrics, no spoken words** anywhere. Wordless crowd shouts (`hooray`) are fine. |
| Real music | Nothing that imitates a specific real song, artist, TV theme, or game. Original only. The style references in §2 are *flavor*, not targets to copy. |
| Size | Music ≤ 3 MB per file. SFX ≤ 300 KB per file. Ambience loops ≤ 800 KB. |
| SFX prompt length | Prompt **plus** the §2 style tail must be ≤ 450 characters — the Sound Effects API rejects longer text. The tail is ~135 chars, so keep SFX prompts under ~310. `--dry-run` now fails loudly on this. |
| Masters | If the API returns WAV, keep the WAV in `art-masters/audio/<name>.wav` and put only the MP3 in `public/assets/`. |

**ElevenLabs API mapping**

- **Music tracks (§4, §5)** → ElevenLabs *Music* endpoint. Pass the prompt, the duration in ms,
  and `force_instrumental: true`. For loops, ask for it in the prompt *and* trim the render to a
  clean bar boundary afterwards.
- **Sound effects and ambience (§6–§13)** → ElevenLabs *Sound Effects* endpoint
  (`text-to-sound-effects`). Use `duration_seconds` from the table, `prompt_influence` 0.6–0.8
  (higher = more literal). Use the `loop: true` parameter for anything marked **LOOP**.
  The SFX endpoint caps around 22–30 s; that is why ambience loops are specified ≤ 20 s.
- Send each prompt in the table **verbatim**, then append the style tail in §2 where the table
  says *(+ style tail)*. Music prompts are already complete.

---

## 2. Style bible

The 8 West Trail is a Saturday-morning-cartoon comic-book road trip: five friends in a boxy white
1980s van driving Interstate 8 from Las Cruces, New Mexico to Sunset Cliffs on the Pacific. The
art is bold ink, flat bright cel color, halftone dots, giant sound-effect lettering
(`SCREEECH`, `KRASHH`, `KA-CHING!`). The audio must sound like that art looks.

**Music palette:** 1970s cartoon-mystery-gang energy meets surf rock and desert twang. Bouncy
electric bass, wah guitar, Hammond organ stabs, brass hits, hand claps, bongos, vibraphone,
theremin for spooky bits, whistling, slide guitar for the desert, ukulele for the beach. Always
playful; suspense is *fun-spooky*, never grim. Tragedy is comic-tragic (muted trumpet wah-wah,
slide whistle down), never mournful for real.

**SFX palette:** cartoon foley. Exaggerated, clean, instantly readable, a little bit funny.
Springs, boings, slide whistles, kettle whistles, cash registers, brass bells, cartoon skids.
Think classic animation sound libraries, not Hollywood realism. Every one-shot should read in
the first 200 ms.

**Style tail** — append this to every SFX prompt marked *(+ style tail)*:

> *Cartoon-style sound effect, exaggerated and clean, classic animation foley, dry with minimal
> reverb, no music, no voices.*

**The lettering pack** (§6) is special: each of those 16 sounds plays at the exact moment the
matching comic lettering slams onto the panel, so the sound must *be* the word — a `HISSSSS` that
sounds like hissing, a `KA-CHING!` that is unmistakably a cash register.

---

## 3. Slot inventory (what exists today, what is new)

Already registered in the game (`src/ui/assets.ts` → `AUDIO_IDS`): `title-loop`, `travel-day`,
`travel-night`, `victory`, `death-sting`. Everything else in this brief is **new** and will be
registered when the files land. Filenames in this brief are final; the code adapts to them, not
the other way round.

Total: **11 music tracks, 74 sound effects** — 85 files across 10 batches.

---

## 4. Batch 1 — Core music (5 files) · `public/assets/audio/`

| File | Length | LOOP | Prompt |
|---|---|---|---|
| `title-loop.mp3` | 90 s | yes | Instrumental, 120 BPM, seamless loop: bright 1970s cartoon-mystery-theme energy — bouncy electric bass, wah guitar, Hammond organ stabs, brass hits, hand claps, a surf-rock lead guitar melody — playful, spooky-fun, road-trip ready. A hook you could hum. No vocals. |
| `travel-day.mp3` | 120 s | yes | Instrumental, 110 BPM, seamless loop: upbeat cartoon desert road-trip groove — chugging rhythm guitar, bongos, Hammond organ, a whistled melody, slide guitar answering, hand claps, the feeling of a van full of friends on a sunny highway. Light and endless. No vocals. |
| `travel-night.mp3` | 120 s | yes | Instrumental, 90 BPM, seamless loop: spooky-fun cartoon night-drive suspense — walking upright bass, vibraphone, a theremin wobble, soft bongos, muted guitar, a distant owl hoot woven into the arrangement, warm not scary. No vocals. |
| `victory.mp3` | 45 s | no | Instrumental, 130 BPM, one-shot: a triumphant cartoon finale — full brass fanfare, crashing surf-rock cymbals, hand claps, ukulele strum under the melody, seagull-like guitar bends, building to a final ringing major chord with a cymbal splash and a beat of silence. No vocals. |
| `death-sting.mp3` | 4 s | no | A 4-second comic-tragic sting: a sad muted trumpet playing "wah-wah-wah-waaah" descending, with a slide whistle falling underneath, ending on a soft timpani thud. Cartoon, not sad for real. No vocals. |

---

## 5. Batch 2 — Scene music (6 files) · `public/assets/audio/`

| File | Length | LOOP | Where it plays | Prompt |
|---|---|---|---|---|
| `outfitter-loop.mp3` | 60 s | yes | Setup + the outfitter store, every stop's shop | Instrumental, 100 BPM, seamless loop: laid-back 1970s shopping-montage groove — Fender Rhodes electric piano, soft funk bass, brushed drums, a light flute melody, occasional cash-register-like glockenspiel dings on the beat. Cozy, unhurried, a general store on a desert highway. No vocals. |
| `stop-loop.mp3` | 60 s | yes | Standing at a roadside town / landmark | Instrumental, 95 BPM, seamless loop: dusty roadside-diner twang — slide guitar, Telecaster twang, a lazy shuffle beat, upright bass, harmonica phrase, the sound of a small desert town at midday. Warm, a little corny. No vocals. |
| `grade-tension.mp3` | 40 s | yes | The In-Ko-Pah / Laguna grade minigame (brakes vs. heat) | Instrumental, 140 BPM, seamless loop: cartoon chase-scene tension — driving surf-rock drums, tremolo guitar, staccato brass stabs rising in pitch every four bars, a ticking hi-hat, rising urgency but still fun, like a downhill runaway in a cartoon. No vocals. |
| `crossing-tension.mp3` | 30 s | yes | The river crossing decision (ford / float / ferry / wait) | Instrumental, 80 BPM, seamless loop, continuous with no pauses or breaks: suspenseful cartoon riverbank standoff — a low sustained tremolo organ chord held the entire time, slow steady bongos on every beat, a repeating pizzicato string figure, a water-like vibraphone shimmer over the top. The harmony stays unresolved but the sound never stops. Tense but playful. No vocals. |
| `snack-loop.mp3` | 30 s | yes | The snack-stand typing minigame | Instrumental, 150 BPM, seamless loop: frantic cartoon typing-race — fast honky-tonk piano, xylophone runs, a kazoo-like lead line, a walking tuba bass, snare rolls, comic urgency. No vocals. |
| `grave-theme.mp3` | 45 s | yes | The roadside memorial / game-over screen | Instrumental, 70 BPM, seamless loop: a comic-tragic desert lament — solo muted trumpet over slow slide guitar, a single tolling tubular bell, soft brushed snare, distant harmonica; sad in a cartoon way, a tumbleweed rolling past a tiny grave, with a hint of a smile. No vocals. |

---

## 6. Batch 3 — The lettering pack, part 1 (8 files) · `public/assets/audio/sfx/`

Each plays with the matching comic-lettering art in `public/assets/sfx/<name>.webp`. Same base
name on purpose. Mono, one-shot, punchy. Durations are maximums; shorter is fine if it reads.

| File | Length | Triggered by | Prompt *(+ style tail)* |
|---|---|---|---|
| `screech.mp3` | 1.5 s | Speed trap, arriving at the bottom of a grade | Long cartoon tire screech, a car skidding to a hard stop on asphalt, rubber squeal rising then cut off with a small thump. |
| `krashh.mp3` | 1.5 s | Runaway ramp, van rolled in the river | Big cartoon crash: metal clatter, a hubcap wobbling to a stop, a small spring boing at the end. Comic, not violent. |
| `vroom.mp3` | 1.5 s | Tailwind, driving off | Cartoon van engine revving hard and zooming away, a doppler whoosh as it passes, exaggerated and quick. |
| `bang.mp3` | 1.0 s | Flat tire | A tire blowout as a single cartoon BANG, a firecracker pop, followed by a rubbery flap-flap-flap and a spring boing. |
| `hisss.mp3` | 2.0 s | Radiator boils over | A radiator boiling over: a sharp steam hiss that rises into a tea-kettle whistle, then sputters out. |
| `snap.mp3` | 0.8 s | Belt snaps | A thick rubber belt snapping with a loud twang, then a brief slapping flutter as it whips around and stops. |
| `kaching.mp3` | 1.0 s | Ransomware demand, buying things | A classic mechanical cash register: bell ka-ching and a cash drawer sliding open. |
| `zzz.mp3` | 2.0 s | Resting a day | Cartoon snoring: a comic inhale snore and a whistling exhale, two cycles, gentle and funny. |

---

## 7. Batch 4 — The lettering pack, part 2 (8 files) · `public/assets/audio/sfx/`

| File | Length | Triggered by | Prompt *(+ style tail)* |
|---|---|---|---|
| `chomp.mp3` | 0.8 s | Gas-station sushi, snack stand win | A big exaggerated cartoon bite: a loud crunchy chomp and a quick satisfied gulp. |
| `sploosh.mp3` | 1.5 s | Van swamped fording the river | A cartoon cannonball splash: a big heavy plunge into water with a spray and a few dripping plops after. |
| `whoosh.mp3` | 2.0 s | Dust storm hits | A wall of desert wind and sand whooshing past, gritty and gusty, rising fast then rushing away. |
| `kraka-boom.mp3` | 2.5 s | Monsoon thunder | A sharp lightning crack followed immediately by a deep rolling cartoon thunder boom that rumbles away. |
| `rattle.mp3` | 1.5 s | Rattlesnake | A rattlesnake's rattle: a dry rapid buzzing rattle, close-miked and loud, full volume throughout, menacing, with a tiny cartoon hiss at the end. |
| `beep-beep.mp3` | 1.5 s | Tow truck arrives | A tow truck reversing: two loud piercing backup beeps close to the microphone at full volume, a diesel idle underneath, a chain clink. |
| `wah-wah.mp3` | 2.0 s | Death | A sad muted trumpet playing "wah-wah-wah-waaah", four descending notes, the classic comic failure sound. |
| `hooray.mp3` | 2.0 s | Victory at Sunset Cliffs | A small crowd of friends cheering "hooray!" with whoops and clapping, joyful and bright, five or six people. No words other than the cheer. |

---

## 8. Batch 5 — User interface (10 files) · `public/assets/audio/sfx/`

Short, dry, quiet (these fire constantly; peak −6 dBTP). Mono. The game is a comic book, so the
UI sounds are paper, ink, and typewriter — not digital bleeps.

| File | Length | Used for | Prompt *(+ style tail)* |
|---|---|---|---|
| `ui-move.mp3` | 0.15 s | Cursor moves between menu options | A tiny soft paper tick, like a fingertip flicking the corner of a comic page. Very short, very quiet. |
| `ui-select.mp3` | 0.3 s | Confirming a choice | A satisfying single typewriter key clack with a faint ink-stamp thump. Short and crisp. |
| `ui-back.mp3` | 0.3 s | Backing out of a menu | A soft reversed page flick, a quick paper slide backwards. Short and quiet. |
| `ui-page-turn.mp3` | 0.6 s | Moving to a new comic page / scene | A comic-book page turning: a crisp paper flip with a light whoosh and a settle. |
| `ui-panel-slam.mp3` | 0.5 s | A new panel or lettering slams in | A stamp slamming onto paper: a quick heavy thud with a tiny rattle, like a rubber stamp hitting a desk. |
| `ui-balloon-pop.mp3` | 0.3 s | A speech balloon appears | A soft cartoon pop, like a bubble appearing, light and round, with a tiny rising pitch. |
| `ui-type-key.mp3` | 0.1 s | Each keystroke while naming crew / typing an epitaph / snack game | A single manual typewriter key strike, mechanical and dry. Extremely short. |
| `ui-type-ding.mp3` | 0.8 s | Typed word accepted | A typewriter carriage-return bell ding followed by the carriage sliding back. |
| `ui-error.mp3` | 0.5 s | Invalid input, can't afford it | A comic "nope": a short muted trumpet blat, a single low buzzy note. Not a digital buzzer. |
| `ui-notice.mp3` | 0.5 s | A "* * *" event notice appears | A soft two-note glockenspiel chime, gentle attention-getter, ascending. |

---

## 9. Batch 6 — The van (9 files) · `public/assets/audio/sfx/`

| File | Length | LOOP | Used for | Prompt *(+ style tail)* |
|---|---|---|---|---|
| `van-start.mp3` | 3.0 s | no | Leaving a stop, starting the run | A cartoon 1980s van starting: key turn, starter cranking, the engine coughs twice, sputters, then catches with a satisfying roar and settles to an idle. |
| `van-idle.mp3` | 8.0 s | yes | Stopped at the roadside, menus during travel | A boxy old van idling, seamless loop: a gentle lumpy V8 idle with a faint belt squeak, close and warm. |
| `van-cruise-day.mp3` | 12 s | yes | Driving, the travel screen | A van cruising steadily on an open desert highway from inside the cab, seamless loop: engine hum, tire roar on asphalt, light wind through a cracked window, a rhythmic expansion-joint thump every few seconds. |
| `van-cruise-strain.mp3` | 10 s | yes | Climbing a grade | An old van straining uphill in low gear, seamless loop: engine laboring at high revs, a slight rattle from the dash, a faint fan whir. |
| `van-brakes.mp3` | 2.5 s | no | Grade minigame: braking | Overheating drum brakes: a long squealing groan, a metallic grind, a puff of a hiss at the end. Cartoon-exaggerated. |
| `van-downshift.mp3` | 1.5 s | no | Grade minigame: shifting down | A manual downshift: clutch, gear clunk, engine revs jump up with a growl. |
| `van-door.mp3` | 0.8 s | no | Arriving at / leaving a stop | A big hollow sliding van door rolling and slamming shut with a metallic clunk and a slight rattle. |
| `van-horn.mp3` | 1.0 s | no | Victory, tailwind, celebration | A cheerful two-tone cartoon van horn: "beep-beeeep", bright and friendly. |
| `van-gravel.mp3` | 3.0 s | no | Runaway ramp, wrong turn onto dirt | A vehicle plowing into deep gravel: crunching stones spraying against sheet metal, tires digging in, slowing to a stop. |

---

## 10. Batch 7 — Weather and ambience loops (9 files) · `public/assets/audio/sfx/`

All stereo, all **LOOP**, all quiet beds (−22 LUFS) that sit under the music. Seamless is
non-negotiable here — these run for minutes.

| File | Length | Region | Prompt *(+ style tail, but allow light natural reverb)* |
|---|---|---|---|
| `amb-desert-day.mp3` | 20 s | Regions 1–9 by day | Open desert at midday, seamless loop: a steady dry warm wind, cicadas buzzing, a distant hawk cry once, heat shimmer stillness. Sparse and wide. |
| `amb-desert-night.mp3` | 20 s | Regions 1–9 by night | Desert at night, seamless loop: crickets, a soft cool breeze, one distant coyote yip, a single owl hoot, vast quiet. |
| `amb-heat.mp3` | 15 s | Heat level 3 (heatstroke risk) | Oppressive desert heat, seamless loop: a shimmering high drone, cicadas buzzing intensely, a faint ringing in the ears, almost no wind. Uncomfortable but not harsh. |
| `amb-dust-storm.mp3` | 20 s | Dust storm event | Inside a dust storm, seamless loop: one unchanging roar of gritty wind at a constant level, sand hissing steadily against metal and glass the entire time. No gusts, no swells, no lulls, no pauses — the same intensity from the first second to the last. |
| `amb-monsoon.mp3` | 20 s | Monsoon event | A desert monsoon downpour, seamless loop: heavy rain drumming on a van roof, water rushing in a wash, distant rolling thunder, gusts of wind. |
| `amb-mountain.mp3` | 20 s | Regions 10–11: In-Ko-Pah, Laguna Summit | High mountain pass, seamless loop: cool wind through pines and boulders, a raven croak, a distant truck downshifting far below, clear thin air. |
| `amb-ocean.mp3` | 20 s | Region 12: Sunset Cliffs, victory | Pacific coast cliffs at sunset, seamless loop: rolling surf breaking on rocks below, seagulls, a steady sea breeze, a bell buoy far off. |
| `amb-town.mp3` | 20 s | Standing at a stop | A small desert highway town at midday, seamless loop: a constant bed of swamp-cooler hum and cicada buzz the entire time, never silent; faint and distant under it, a truck passing, a screen door creak, one gas-station bell ding, a far-off dog bark. Steady, continuous. |
| `amb-store.mp3` | 20 s | Inside the outfitter / store | Inside a small general store, seamless loop: a constant refrigerator-case hum and a ceiling fan ticking steadily the entire time, never silent; faintly under it an AM radio murmuring indistinctly and, once, a bell over the door. No recognizable music. |

---

## 11. Batch 8 — Event foley, part 1 (10 files) · `public/assets/audio/sfx/`

These play on the event strip (`public/assets/events/<name>.webp`) alongside — or instead of —
a lettering word. Mono one-shots.

| File | Length | Event | Prompt *(+ style tail)* |
|---|---|---|---|
| `ev-snake.mp3` | 2.0 s | `snake` | A rattlesnake strike: a rising dry rattle, a fast snap-hiss lunge, a startled cartoon yelp-like slide whistle up. |
| `ev-heatstroke.mp3` | 2.5 s | `heatstroke` | Cartoon heatstroke: a woozy descending slide whistle, a heat-shimmer high drone, a dizzy wobbling spring twang, then a soft thump of someone sitting down hard. |
| `ev-speed-trap.mp3` | 2.5 s | `speed-trap` | A police siren gives one short whoop-whoop chirp, then a tire screech, then a ticket pad being flipped open. |
| `ev-thief.mp3` | 2.5 s | `thief` | A thief in the night: sneaky tiptoe footsteps on gravel, a zipper opening, coins and keys jingling, then fast running footsteps fading away. |
| `ev-ransomware.mp3` | 2.5 s | `ransomware` | A laptop ransomware attack: rapid keyboard clatter, an old dial-up modem screech, a harsh computer error boop-boop, a skull-and-crossbones sting on a cheap synth. |
| `ev-sushi.mp3` | 2.5 s | `sushi` | Gas-station sushi regret: a cellophane package crinkling open, one big crunchy bite, a pause, then a long comic stomach gurgle. |
| `ev-wrong-turn.mp3` | 1.5 s | `wrong-turn` | A vinyl record scratch stop, followed by a paper map being rustled and turned upside down. |
| `ev-tailwind.mp3` | 2.0 s | `tailwind` | A big friendly gust of wind from behind, a whoosh that lifts, with a happy rising slide whistle and the van engine easing off. |
| `ev-pecan-stand.mp3` | 2.0 s | `pecan-stand` | A roadside pecan stand: nuts pouring into a paper bag, a crunchy pecan crack, a cheerful cash register ding. |
| `ev-historic-80.mp3` | 2.5 s | `historic-80`, `old-80` | Turning onto old Historic Highway 80: tires leaving smooth asphalt onto cracked bumpy old pavement, a rhythmic bump-bump over the cracks, a faint nostalgic harmonica note. |

---

## 12. Batch 9 — Event foley, part 2 (10 files) · `public/assets/audio/sfx/`

| File | Length | Event | Prompt *(+ style tail)* |
|---|---|---|---|
| `ev-flat-tire.mp3` | 3.0 s | `flat-tire` (full sequence) | A flat tire on the highway: a pop, the rubbery flap-flap-flap slowing down, the van pulling onto the gravel shoulder and stopping, a jack ratcheting twice. |
| `ev-radiator.mp3` | 3.0 s | `radiator` | A radiator overheating: a rising steam hiss, a tea-kettle whistle, the hood creaking open, a big cloud-of-steam whoosh. |
| `ev-belt.mp3` | 2.0 s | `belt` | A serpentine belt snapping: a loud rubber twang, a whipping flutter, then the engine's whine dying as the accessories stop. |
| `ev-tow-truck.mp3` | 3.0 s | `tow-truck`, `gas-tow` | A tow truck arriving: a diesel engine pulling up, air brakes hissing, backup beeps, a winch cable clanking and winding. |
| `ev-river-ford.mp3` | 3.0 s | `river-ford`, ford success | A van fording a shallow river: engine revving, water sloshing against the doors, tires splashing, then climbing out onto the bank with a squelch. |
| `ev-river-ferry.mp3` | 3.0 s | `river-ferry`, ferry crossing | A small river ferry: a boat horn honk, a wooden ramp clunking down, a chugging outboard motor, water lapping. |
| `ev-runaway-ramp.mp3` | 3.0 s | `runaway-ramp`, `grade-ramp` | A runaway truck ramp: screaming hot brakes, a horn blaring, then tires plowing into deep gravel and slowing to a crunching stop, a hubcap wobbling. |
| `ev-dunes.mp3` | 2.5 s | `dunes-closure`, Imperial Dunes | Sand dunes: wind whistling over sand, a dune buggy engine buzzing past in the distance, sand sliding down a slope. |
| `ev-hot-springs.mp3` | 2.5 s | `hot-springs` | Natural hot springs: bubbling gurgling water, a soft steam hiss, one contented cartoon "ahhh"-like slide whistle down, a light splash. |
| `ev-date-shake.mp3` | 2.5 s | `date-shake`, Dateland | A date shake at a desert stand: a blender whirring for a second, a scoop plopping, a straw slurp, a satisfied cartoon gulp. |

---

## 13. Batch 10 — Landmarks, crew, and the ending (10 files) · `public/assets/audio/sfx/`

| File | Length | LOOP | Used for | Prompt *(+ style tail)* |
|---|---|---|---|---|
| `ev-border-checkpoint.mp3` | 3.0 s | no | `border-checkpoint` | A highway border-patrol checkpoint: a car slowing and stopping, a two-way radio squelch and chirp, a dog panting and one bark, a hand slapping the roof twice: go ahead. No speech. |
| `ev-sea-level.mp3` | 2.0 s | no | `sea-level` (dropping below sea level in the Imperial Valley) | A cartoon descent: a long downward slide whistle, ears popping with a soft plop, a bubbly underwater blub-blub, a small triumphant ding. |
| `ev-insulin-cooler.mp3` | 2.0 s | no | `insulin-cooler`, `dexcom` (Kannon's Type 1 diabetes moments) | A continuous glucose monitor alert: three clear rising electronic beeps, a cooler-bag zipper opening, ice packs shifting, a small reassuring click. Gentle, not alarming. |
| `ev-memorial.mp3` | 3.0 s | no | Passing a roadside memorial | Passing a roadside memorial in the desert: a soft wind chime tinkling, wind through dry grass, a single distant church bell toll, a tumbleweed rustling by. |
| `ev-snack-stand.mp3` | 2.0 s | no | Snack stand start | A roadside snack stand: a metal awning creaking open, a bell dinging, a fryer sizzling, paper bags rustling. |
| `snack-hit.mp3` | 0.5 s | no | Snack minigame: word typed right | A bright cartoon success: a quick xylophone ascending three-note ping and a crunchy chomp. |
| `snack-miss.mp3` | 0.5 s | no | Snack minigame: typo / too slow | A cartoon miss: a short slide whistle down and a wet splat, like a taco hitting the ground. |
| `stop-arrive.mp3` | 2.0 s | no | Pulling into any stop | A van pulling into a gravel lot and stopping: tires on gravel, engine shutting off with a shudder, parking brake ratchet, a satisfied engine tick. |
| `victory-fireworks.mp3` | 6.0 s | no | Victory screen, `victory-night` | Beach celebration at sunset: three fireworks whistling up and bursting with crackles, surf breaking, seagulls, a crowd of friends whooping, a bonfire crackling under it all. |
| `grave-shovel.mp3` | 3.0 s | no | The grave / epitaph screen | Digging a shallow grave in the desert: three shovel scoops of gritty sand, a wooden cross being tapped in with a rock, a gust of wind, a crow caws once. Comic-solemn. |

---

## 14. Batch manifest (post after every batch)

Copy this table, fill one row per file, post it, then stop and wait.

```
## Batch N manifest

| File | Endpoint | Duration (s) | Loop-tested | Peak dBTP | LUFS | Prompt sent (verbatim) | Notes / deviations |
|---|---|---|---|---|---|---|---|
| public/assets/audio/sfx/bang.mp3 | sound-effects | 0.9 | n/a | -1.8 | — | "A tire blowout as ... no voices." | 2 takes, chose the one with clearer boing |
```

**Review outcome per file** (Fable fills this in): `approved` · `redo: <what to change>`.

Common reasons a file gets sent back, so you can self-check first:

- Loop has a click, gap, or fade at the seam.
- One-shot has leading silence, or the sound arrives late (must read in 200 ms).
- Sounds realistic/cinematic instead of cartoon (too much reverb, too subtle, too "Hollywood").
- Any voice, word, or hummed melody in an SFX; any lyrics in music.
- Music quotes a recognizable real theme.
- Wrong filename, wrong folder, wrong channel count, clipped peaks.
- Length wildly off the table (±30 % is fine).

---

## 15. Priority if time is short

If the whole list can't be finished, this order gets the most game per file:

1. Batch 1 (core music) — the game is silent without it.
2. Batches 3–4 (lettering pack) — the signature comic moments.
3. Batch 5 (UI) — every keypress.
4. Batch 6 (van) + Batch 7 (ambience) — the drive itself.
5. Batch 2 (scene music).
6. Batches 8–10 (event foley) — nice-to-have detail; the lettering pack already covers the big ones.

---

## 16. Review log

Measured with ffmpeg `ebur128` (loudness, true peak) and `silencedetect` / head-tail RMS (loop
seams). "Seam" = level in the last 50 ms vs. the first 50 ms; a loop needs both similar and non-silent.

### Batch 1 — reviewed 2026-08-25

| File | LUFS | Peak | Seam / silence | Verdict |
|---|---|---|---|---|
| `travel-day.mp3` | −16.3 | −4.0 | head −22 / tail −28, clean | **approved** |
| `travel-night.mp3` | −16.2 | −2.8 | head −18 / tail −25, clean | **approved** |
| `victory.mp3` | −16.2 | −3.6 | one-shot; ends in the specified beat of silence | **approved** |
| `title-loop.mp3` | −16.2 | −2.8 | **fails**: fades out at 88.0 s then 1.7 s of silence to 90 s; the loop will hiccup every pass | **redo** — render a true seamless loop: no fade, no trailing silence, last bar leads into bar 1. Or render ~96 s and hard-cut at the bar boundary nearest 90 s. |
| `death-sting.mp3` | −16.1 | −2.3 | 0.35 s of **leading silence** (rule: ≤ 10 ms) | **redo** — trim the head so the trumpet hits at 0 ms. Same take is fine; this is an edit, not a regeneration. |

### Batch 2 — reviewed 2026-08-25

| File | LUFS | Peak | Seam / silence | Verdict |
|---|---|---|---|---|
| `stop-loop.mp3` | −16.3 | −2.7 | head −18 / tail −24, clean | **approved** |
| `snack-loop.mp3` | −16.4 | −3.9 | head −25 / tail −25, clean | **approved** |
| `outfitter-loop.mp3` | −16.2 | −3.9 | **fails**: fades to silence for the last 0.19 s | **redo** — trim the fade/silence so the tail runs straight into the head (an edit, not a regeneration). |
| `grade-tension.mp3` | −16.3 | −4.5 | **weak**: tail (−47 dB) is a fade-out vs. head −22 | **redo** — no fade-out; must loop hot at 140 BPM. Hard-cut at the last full bar. |
| `grave-theme.mp3` | −16.3 | −1.1 | **weak**: tail (−47 dB) is a fade-out vs. head −12 | **redo** — no fade-out. Hard-cut at a bar boundary, or render longer and cut. |
| `crossing-tension.mp3` | −16.2 | −1.2 | **fails**: near-silent gaps of ~1 s at 5 s, 11 s, 17 s, 23 s, and 28–30 s; loudness range 21 LU (everything else is 2–8) | **redo from scratch** — this render is broken (dropouts every ~6 s). Regenerate; a "hanging unresolved chord" should sustain, not drop to silence. |

**Batch 2 may begin / continue as planned. Re-deliver the 6 redo files (2 from Batch 1, 4 from
Batch 2) alongside Batch 3; overwrite in place, same filenames.**

### Redo pass — 2026-08-25 (reprocessed from raw, no API credits)

`generate_audio.py` now requests +8 s on music loops and cuts before the composed fade, snaps the
cut to an onset, strips leading/trailing silence on one-shots, and prints a seam verdict per loop.
The five fixable redos were rebuilt from `art-masters/audio/raw/` with `--reprocess`:

| File | Now | Seam | Verdict |
|---|---|---|---|
| `title-loop.mp3` | 84.0 s (42 bars; cut before the fade at 85.8 s) | ok | **approved** — listen twice through once; if the last bars sound like an ending, regenerate |
| `death-sting.mp3` | 3.34 s, trumpet hits at 0 ms | n/a | **approved** |
| `outfitter-loop.mp3` | 57.6 s (24 bars) | ok (rest before the downbeat, not a fade) | **approved** |
| `grade-tension.mp3` | 37.7 s (22 bars) | ok | **approved** |
| `grave-theme.mp3` | 44.6 s (13 bars, onset-snapped) | ok (phrase decay, not a fade) | **approved** |
| `crossing-tension.mp3` | regenerated 15:03 with the rewritten prompt: 30.0 s (10 bars), −16.4 LUFS, peak −1.2, zero dropouts | ok | **approved** |

Batch 1: 5/5 approved. Batch 2: 6/6 approved.

### Batch 3 — reviewed 2026-08-25

All eight measured: mono, 128 kbps, 13–33 KB, true peak −2.0 to −2.4 dBTP, duration within 0.02 s of
spec, sound arrives at 0 ms (hisss at 80 ms — a hiss ramps in, that is correct).

| File | Verdict |
|---|---|
| `screech`, `krashh`, `vroom`, `bang`, `hisss`, `snap`, `kaching`, `zzz` | **approved on spec** — content is the ear's call: each must *be* its word (§2). Play the eight once (12 s total); send back any that doesn't read instantly. |

Batch 3: 8/8 pass spec.

### Batch 4 — reviewed 2026-08-25 (pack re-levelled, analysis fixed)

Two script fixes came out of this batch. (1) SFX are now **body-normalized** (loudest 50 ms →
−9 dBFS) with a true-peak limiter at −2 dBTP, instead of peak-normalized — a spiky soft render no
longer ends up 25 dB under the rest. (2) The level analysis was downmixing to 8 kHz, which is blind
above 4 kHz; `rattle` looked 18 dB too quiet purely because of that. Analysis is now full-band.
Batches 3 and 4 were reprocessed from raw with both fixes; `beep-beep` was regenerated once with the
stronger prompt (the first two renders really were soft).

Final pack: all 16 at −9 to −14 dBFS body, true peak −2.0 to −3.1, except three dense sounds
(`hisss` −3.9, `sploosh` −4.4, `kraka-boom` −3.5) a hair under the −3 floor — accepted.

| File | Verdict |
|---|---|
| `chomp`, `sploosh`, `whoosh`, `kraka-boom`, `rattle`, `beep-beep`, `wah-wah`, `hooray` | **approved on spec** — play the 16 once (25 s) to confirm each *is* its word |

Batch 3: 8/8. Batch 4: 8/8. The lettering pack is complete.

### Batch 5 — reviewed 2026-08-25

All ten UI sounds: mono, 2–13 KB, durations exactly on spec (the API's 0.5 s minimum trimmed down
correctly, including the 100 ms `ui-type-key` and 150 ms `ui-move`), true peak −5.9 to −6.4 dBTP
(spec −6), body −14 to −21 dBFS, sound at 0 ms on every file, no failures.

| File | Verdict |
|---|---|
| `ui-move`, `ui-select`, `ui-back`, `ui-page-turn`, `ui-panel-slam`, `ui-balloon-pop`, `ui-type-key`, `ui-type-ding`, `ui-error`, `ui-notice` | **approved on spec** — the ear test here is "paper and typewriter, not digital bleeps"; `ui-type-key` fires on every keystroke so listen to it five times fast. |

Batch 5: 10/10.

### Batch 6 — reviewed 2026-08-25

All nine on spec: peaks −1.9 to −2.5 dBTP, sound at 0 ms, no failures. The three loops are stereo
as required and pass the seam check (`van-idle` head −10.6 / tail −13.7; `van-cruise-day` −12.9 /
−15.2; `van-cruise-strain` −11.7 / −10.2). `van-downshift` came out 1.06 s against a 1.5 s max
after trailing-silence trim — fine.

| File | Verdict |
|---|---|
| `van-start`, `van-brakes`, `van-downshift`, `van-door`, `van-horn`, `van-gravel` | **approved on spec** |
| `van-idle`, `van-cruise-day`, `van-cruise-strain` | **approved on spec** — the level check can't hear a *click* at an SFX loop seam (no bar grid to cut on; the API's own loop flag did the join), so play each one twice through. |

Note for the playback code, not the files: these engine beds sit at −7 to −9 dBFS body, far hotter
than the −22 LUFS ambience beds coming in Batch 7. They get ducked in the mixer (≈ −14 dB under
music), not re-rendered.

Batch 6: 9/9.

### Batch 7 — reviewed 2026-08-25 (beds now levelled in the pipeline)

The model writes 20–30 dB gust/swell arcs into ambience renders. Rather than fight it per prompt, the
script now levels every ambience bed: the loop is played three times, run through a fixed compander
(−50 dB → −34, −20 → −24; true silence stays silent), and the middle copy is kept, so the seam has
context on both sides. All of Batch 7 was reprocessed from raw. Two other fixes fell out: a 450-char
guard on SFX prompts (the API limit; `amb-town` tripped it) and atomic raw writes (a failed call
had left a 0-byte raw over the old one).

Level range across 0.5 s windows after levelling — a bed should stay within ~10 dB:

| File | Range (dBFS) | Verdict |
|---|---|---|
| `amb-desert-day` | −32..−25 | **approved** |
| `amb-desert-night` | −28..−24 | **approved** |
| `amb-heat` | −29..−25 | **approved** |
| `amb-monsoon` | −27..−26 | **approved** |
| `amb-mountain` | −28..−19 | **approved** (the −19 is the raven) |
| `amb-ocean` | −29..−19 | **approved** (waves breaking) |
| `amb-dust-storm` | −38..−15 | **regenerate** — still a 23 dB swing after levelling; the raw lulls to −54. Prompt now forbids gusts and swells outright. |
| `amb-store` | −47..−19 | **regenerate** — two 2-second holes at −45 where the hum stops. Prompt now leads with a constant hum, never silent. |
| `amb-town` | −57..−19 | **regenerate** — the old dead-air render; its raw was lost to the 400 error. Prompt shortened under 450 chars. |

`--batch 7 --only amb-dust-storm.mp3,amb-store.mp3,amb-town.mp3 --force`

Batch 7: 6/9 approved, 3 regenerate.

### Batch 7 redo — 2026-08-25

| File | Range (dBFS) | Verdict |
|---|---|---|
| `amb-store` | −24..−19 | **approved** — a textbook bed now, within 5 dB for all 20 s |
| `amb-town` | −44..−23 | **approved** — steady −25/−26 throughout with one half-second dip (the door bell); seam ok |
| `amb-dust-storm` | −39..−21 | **approved with a note** — third render, sits at −29..−32 for most of its length with one 1.5 s lull to −39 and a swell to −21; the model shapes wind no matter what. Acceptable under music and the `whoosh` hit; revisit only if it reads as pumping in-game. |

Batch 7: 9/9.

### Batch 8 — reviewed 2026-08-25

All ten: mono, 24–39 KB, durations on spec (three trimmed shorter by trailing-silence removal:
`sushi` 2.35 s, `pecan-stand` 1.77 s, `historic-80` 2.25 s — fine), body −9.5 to −15 dBFS, sound at
0 ms (`sushi` opens with a soft cellophane crinkle that crosses −35 dB at 150 ms — correct, not
silence). No failures. Three dense sounds (`heatstroke` −5.7, `wrong-turn` −4.1, `tailwind` −4.1
dBTP) sit under the −3 peak floor for the same reason as `hisss` in Batch 3: their body is already at
target, so the limiter never engages — accepted.

| File | Verdict |
|---|---|
| all ten `ev-*` | **approved on spec** — these are three-beat mini-stories (pop → flap → jack; siren → screech → ticket pad), so the ear test is "can you hear all three beats in order". |

Batch 8: 10/10.

### Batch 9 — reviewed 2026-08-25

All ten: mono, 32–47 KB, durations on spec, body −9.3 to −14.6 dBFS, sound at 0 ms, no failures.
Four dense sounds (`belt` −5.5, `river-ford` −5.3, `runaway-ramp` −4.0, `hot-springs` −6.2 dBTP)
under the −3 peak floor for the usual reason (body at target, limiter idle) — accepted.

| File | Verdict |
|---|---|
| all ten `ev-*` | **approved on spec** — three-beat stories again; `river-ford` vs `river-ferry` must be clearly different sounds (engine-and-slosh vs horn-and-outboard). |

Batch 9: 10/10.

### Batch 10 — reviewed 2026-08-25

All ten: mono, 8–94 KB, durations on spec, body −9.4 to −14.4 dBFS, sound within 50 ms, no failures.
Under-floor peaks on the dense ones as usual (`sea-level` −5.8, `border-checkpoint` −4.8,
`snack-miss` −4.2, `insulin-cooler` −3.7) — accepted.

| File | Verdict |
|---|---|
| all ten | **approved on spec** — two ear tests that matter: `ev-insulin-cooler` must be gentle, not an alarm (it plays on Kannon's T1D moments); `snack-hit` / `snack-miss` must read instantly as win / lose since they fire mid-typing. |

Batch 10: 10/10.

---

## 17. Audio pass complete — 2026-08-25

**85 / 85 files delivered and approved on spec** (11 music, 74 SFX), all in `public/assets/audio/`
and `public/assets/audio/sfx/`, raw API sources in `art-masters/audio/raw/`, per-batch manifests in
`art-masters/audio/manifests/`. Regenerations spent: `crossing-tension`, `beep-beep` ×2,
`rattle` (unneeded — measurement bug), `amb-dust-storm` ×2, `amb-store`, `amb-town` ×2.

What "approved on spec" means: format, level, duration, seam and silence are machine-verified.
Whether each sound *is its word* is still the ear's call — the per-batch notes above say what to
listen for. Frank's listening pass is the last gate before the ids are registered in
`src/ui/assets.ts` and playback is wired.

Pipeline lessons baked into `generate_audio.py` (so the next audio pass doesn't relearn them):
music loops need +8 s headroom and an onset-aligned cut before the composed fade; SFX are
body-normalised with a true-peak limiter, not peak-normalised; level analysis must be full-band;
ambience beds are companded over a tripled loop; SFX prompts ≤ 450 chars; raw writes are atomic;
`--reprocess` is free and comes before `--force`.

## 18. Playback wired — 2026-08-25

All 85 ids are registered in `src/ui/assets.ts` (`AUDIO_IDS`, `AUDIO_SFX_IDS`, slots `audio/<id>` and
`audio/sfx/<id>`, resolver `audioSfx()`). The Comic theme now plays them:

- `src/ui/comic/audio.ts` — the pure planner (tested in `test/comic-audio.test.ts`): music by scene
  kind (menus keep what was playing), ambience by weather → heat → region, engine bed by motion,
  one-shots from the lettering transition plus event foley, UI sounds and the set pieces. An event
  with foley plays the foley instead of its word; a click never plays under a fanfare or a sting.
- `src/ui/comic/mixer.ts` — Web Audio: three crossfading loop channels (music 0.55, beds 0.8,
  engine 0.28 ≈ −11 dB) and a one-shot bus (0.9); decoded buffers so MP3 loops are gapless; keypress
  sounds preloaded at mount; the browser's autoplay lock is released on the first pointer/key
  gesture; the tab going hidden suspends the context.
- Masthead sign **SOUND: ON / OFF**, remembered in localStorage (`8wt.audio.v1`). Heritage is silent.

Browser-verified 2026-08-25 (Chromium, dev server): every bed and one-shot fetched on cue from the
cover through the outfitter, the road, Deming, a dust storm and a tow-truck event; no console errors.
