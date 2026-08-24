# Art drop zone

Drop real art in these folders using the filenames from `docs/ASSET-LIST.md`. The build scans
this tree (`vite.config.ts`) and the Comic theme uses whatever it finds; anything missing gets a
built-in SVG placeholder. In `npm run dev` the server restarts itself when a file lands.

**Formats:** any slot accepts `.svg`, `.webp`, `.png`, `.jpg`, `.gif` (art) or `.mp3`, `.ogg`,
`.mp4`, `.webm` (media). If several files share a base name, the vector master wins, then WebP,
then PNG. So `sfx/bang.png` from the image tool works today and `sfx/bang.svg` replaces it later
with no code change.

| Folder | What goes here | Names |
|---|---|---|
| `brand/` | masthead, Cover No. 1, icon, share card, plates, logos | `masthead`, `cover-01`, `cover-01-plate`, `icon`, `og-card`, `presented-by`, `ventures-plate`, `splash`, `splash-wide`, `8westit-logo`, `8westventures-logo`, `interstate-8`, … |
| `van/` | the Econoline in every pose (cutouts) | `van-clean`, `van-dusty`, `van-battered`, `van-wheel`, `van-hero`, `van-skid`, `van-airborne`, `van-steam`, `van-splash`, `van-night`, `dashboard` |
| `crew/` | the twelve crew: headshot, model sheet, poses, mood heads | `01` … `12`, `NN-model`, `NN-poses`, `NN-rough`, `NN-critical`, `group-windshield`, `group-lineup` |
| `regions/` | twelve establishing-shot panels, 8:3 | `01-mesilla` … `12-sunset-cliffs`, plus `10-in-ko-pah-night`, `11-laguna-night` |
| `weather/` | plates layered over the establishing shot | `dust-wall`, `monsoon`, `heat`, `stars` |
| `stops/` | seventeen postcards (+ clean plates) | `<stop-id>`, `<stop-id>-plate` — ids in `src/sim/data/route.ts` |
| `sfx/` | the lettering pack | `screech`, `krashh`, `vroom`, `bang`, `hisss`, `snap`, `kaching`, `zzz`, `chomp`, `sploosh`, `whoosh`, `kraka-boom`, `rattle`, `beep-beep`, `wah-wah`, `hooray` |
| `billboards/` | the 8 West IT billboards (+ blank plate) | `8westit-01` … `8westit-08`, `plate-blank` |
| `signage/` | parent-company winks and the highway sign kit | `water-tower`, `ghost-sign`, `tow-truck`, `shield-i8`, `guide-sign-blank`, `sign-grade`, … |
| `events/` | three-panel strips | `flat-tire`, `radiator`, `sushi`, `dust-storm`, `tow-truck`, `river-ford`, `the-grade`, … (27; see the list) |
| `scenes/` | full-page splashes | `outfitter`, `loading`, `tucson`, `yuma-decision`, `laguna-decision`, `victory`, `victory-night`, `memorial`, `game-over` |
| `furniture/`, `icons/`, `heritage/` | references and extras | `paper`, `halftone`, `burst`, `reference-sheet`, `crt-bezel`, … |
| `audio/`, `video/` | optional | `title-loop`, `travel-day`, `travel-night`, `victory`, `death-sting`, `intro`, `billboards-loop` |

The full slot table lives in `src/ui/assets.ts` (`ALL_SLOTS`). Files outside the table still
resolve by base path, so extra layers (`regions/03-texas-canyon-sky.png`) are fine.
