# THE 8 WEST TRAIL — Master Asset List & Generation Prompts

*Lead design, 2026-08-24. Every asset the Coastal theme and the marketing push want, each with a
ready-to-paste Claude Imagine prompt. Nothing here blocks the build — the game ships SVG
placeholders in every slot and real art replaces them as it lands.*

---

## 0. How to use this document

1. **Paste the prompt block verbatim** into Claude Imagine. Generate 3–4 variations; keep the one
   that matches the Style Bible best (consistency across assets matters more than any single
   image being perfect).
2. **Save with the exact filename** listed, into `public/assets/<category>/`. Formats: WebP for
   scenes (quality 80–85), PNG for anything that will be cut out or layered, SVG only if the
   tool gives you vectors (it usually won't — I'll vectorize logos/icons myself with Adobe tools).
3. **Backgrounds:** anything marked **CUTOUT** should be generated on a *flat, solid, plain
   background* (the prompt says which color). I'll remove it. Don't ask the tool for
   "transparent" — it fakes a checkerboard.
4. **Text in images:** image tools mangle words. Where text is essential (billboards, postcards,
   signs) the prompt gives *exact, short* strings. Expect to regenerate or I'll fix typography in
   post. Every text-bearing asset also asks for a **clean plate** (same image, no text) so I can
   overlay real type in-game.
5. **Resolution:** generate at the largest size available; minimums are listed. Landscape scenes
   want at least 2400 px wide; sprites at least 1600 px on the long side.
6. **Priority:** ★★★ = the brand can't land without it · ★★ = depth and delight · ★ = polish.
   If you only do ten things, do every ★★★.

---

## 1. The Style Bible (read once; every prompt repeats the lock)

**The world:** a sun-bleached Americana road trip, seen through the eyes of someone who loved
1980s national-park travel posters and modern flat app design in equal measure. Bold, clean,
warm, a little wistful. Classy first, flashy second — the flash comes from color and motion,
never from clutter.

**Palette (from the 8 West Ventures brand, extended for the desert):**

| Token | Hex | Use |
|---|---|---|
| Interstate red | `#C41E2A` | brand, shields, danger |
| Ocean-wave blue | `#1F8FD6` | brand, water, sky base |
| Highway-sign green | `#147A4D` | guide signs, buttons, "go" |
| Desert sand | `#E9C46A` | ground, warmth |
| Sunset coral | `#F4845F` | dusk, alerts, heat |
| Sky gradient | `#7ECBFF → #FFD08A` | day skies |
| Ink navy | `#0C1830` | text, night, shadows |
| Bone white | `#FFFFFF` | signs, van body |

**Light:** late-afternoon sun from the upper-left (we are driving *west*, into it). Long warm
shadows. Skies do the emotional work.

**The STYLE LOCK sentence** (it is inside every prompt below — do not shorten it):

> Sun-bleached Americana road-trip illustration: flat vector-style shapes with soft painterly
> gradients, bold clean silhouettes, minimal outlines, subtle paper grain, late-afternoon desert
> light from the upper left with long warm shadows. Palette: interstate red #C41E2A, ocean-wave
> blue #1F8FD6, highway-sign green #147A4D, desert sand #E9C46A, sunset coral #F4845F, sky
> gradient #7ECBFF to #FFD08A, ink navy #0C1830, white. 1980s national-park travel-poster DNA
> meets modern flat app clarity. Same illustrated universe as the other 8 West Trail assets. No
> photorealism. No text unless specified.

**The VAN LOCK** (every van appearance): a boxy 1985 Ford Econoline cargo van, white body with a
wide red-over-blue racing stripe along the beltline, chrome bumpers, round headlights, a roof
rack carrying two blue water jugs and a spare tire, slightly sagging rear suspension, and a
magnetic door sign reading **8 WEST IT** in bold navy with a small red-and-blue interstate-style
shield.

**The CREW LOCK** (every portrait): friendly modern cartoon portrait, head and shoulders, simple
shapes, warm believable skin tones, expressive eyes, flat color with soft shading, on a plain
circular desert-sand background.

---

## 2. Brand & identity — ★★★

### A1 · Title lockup, horizontal — `brand/title-lockup.png` (→ I vectorize)
Where: title screen, masthead, share cards. Min 3000×1000, 3:1. **Text is essential.**
```
Logo design for a video game titled "THE 8 WEST TRAIL". A wide horizontal lockup: on the left, a
classic American interstate highway shield shape, red crown on top and blue body, containing a
large bold white numeral "8" and the small word "WEST" above it; to the right, the words "THE 8
WEST TRAIL" in heavy condensed slab-serif capitals, ink navy, with a thin white highway dashed
center-line running through the letters like a road; beneath in small clean sans-serif capitals,
"PRESENTED BY 8 WEST IT". Flat vector style, crisp edges, on a plain solid white background, no
shadows, no scene. Sun-bleached Americana road-trip illustration: flat vector-style shapes with
soft painterly gradients, bold clean silhouettes, minimal outlines, subtle paper grain, late-
afternoon desert light from the upper left with long warm shadows. Palette: interstate red
#C41E2A, ocean-wave blue #1F8FD6, highway-sign green #147A4D, desert sand #E9C46A, sunset coral
#F4845F, sky gradient #7ECBFF to #FFD08A, ink navy #0C1830, white. 1980s national-park travel-
poster DNA meets modern flat app clarity. Same illustrated universe as the other 8 West Trail
assets. No photorealism.
```
Also generate: **A1-white** (same, white lettering on solid ink-navy background) for dark scenes.

### A2 · Title lockup, stacked — `brand/title-stacked.png`
Where: mobile title, app icon source, splash. Square 1:1, min 2000×2000.
```
Stacked square logo for the video game "THE 8 WEST TRAIL": a large American interstate highway
shield (red crown, blue body) with a bold white "8" and small "WEST" above it fills the upper
two-thirds; below it, "THE 8 WEST TRAIL" in heavy condensed slab-serif capitals on two lines,
ink navy; a tiny line of small capitals at the very bottom reads "AN 8 WEST VENTURES COMPANY".
Flat vector style, crisp edges, plain solid white background, centered, no scene. [STYLE LOCK]
```
*(Wherever you see `[STYLE LOCK]`, paste the full lock sentence from section 1.)*

### A3 · App icon / favicon — `brand/icon.png`
Square, min 1024×1024. **CUTOUT-free** — solid design fills the square.
```
App icon: a single American interstate highway shield, red crown, deep blue body, bold white
numeral "8" centered, tiny white "WEST" text above the numeral, on a solid sunset-coral #F4845F
square with softly rounded corners. Flat vector style, high contrast, readable at 32 pixels, no
other elements. [STYLE LOCK]
```

### A4 · Social share card — `brand/og-card.png`
1200×630 exactly (1.9:1). Text essential, keep it short.
```
Social media preview card, wide 1.9:1. Left third: the 8 West Trail interstate shield logo (red
crown, blue body, white "8"). Center: a white 1985 Ford Econoline cargo van with a red-over-blue
racing stripe, roof rack with blue water jugs and a spare tire, driving left-to-right on a
two-lane desert highway toward distant purple mountains and a huge coral-and-gold sunset sky.
Top right, heavy slab-serif capitals: "THE 8 WEST TRAIL". Bottom right, small capitals: "A ROAD
GAME FROM 8 WEST IT". [STYLE LOCK] + [VAN LOCK]
```
Also generate a **clean plate** (no text) as `brand/og-card-plate.png`.

### A5 · "Presented by 8 West IT" end plate — `brand/presented-by.png`
16:9, min 1920×1080. Used on victory, death, and the intro sting.
```
A cinematic end-card: centered on a deep ink-navy background, a small glowing lighthouse beam
sweeps from the left; center text in clean white geometric sans-serif capitals, "PRESENTED BY",
and beneath it larger, "8 WEST IT", with a small red-and-blue interstate shield between the two
lines; subtle radial vignette; a faint dotted highway center-line runs across the bottom edge.
Minimal, elegant, lots of empty space. [STYLE LOCK]
```

### A6 · Parent company plate (subtle) — `brand/ventures-plate.png`
6:1 strip, min 2400×400. Monochrome, quiet.
```
A tiny, elegant single-line credit plate: the words "AN 8 WEST VENTURES COMPANY" in thin,
widely letter-spaced white capitals, a small outline-only interstate shield to the left of the
text, on a solid ink-navy background. Extremely minimal, like a film credit. [STYLE LOCK]
```

### A7 · Splash / loading art — `brand/splash.png`
9:16 portrait for phones, min 1080×1920; and a 16:9 variant `brand/splash-wide.png`.
```
Loading screen illustration: a lone white 1985 Ford Econoline van with a red-over-blue stripe and
a roof rack, seen from behind at dawn, parked at the very start of an empty two-lane highway
that runs dead straight to the horizon between pecan orchards; the Organ Mountains jagged in the
distance; a huge pale-gold sky with the last stars fading; a green highway guide sign on the
right shoulder reads "OCEAN BEACH 730". Quiet, hopeful, epic. [STYLE LOCK] + [VAN LOCK]
```

---

## 3. The van — hero sprite — ★★★

All van sprites: **CUTOUT** on a *flat solid neon-green #00FF00 background*, side view, full
vehicle in frame with margin, no ground shadow (I add shadows in-engine). Min 2400×1200, 2:1.

### B1 · Van, clean — `van/van-clean.png`
```
Product-style side view of a boxy 1985 Ford Econoline cargo van, driver's side facing left,
perfectly horizontal, whole vehicle in frame with margin. White body, a wide red-over-blue racing
stripe along the beltline, chrome bumpers, round headlights, black rubber trim, a roof rack
carrying two blue water jugs and a spare tire, the rear suspension sagging slightly under load.
On the driver's door, a magnetic sign reading "8 WEST IT" in bold navy capitals beside a small
red-and-blue interstate-style shield. Flat vector illustration, no ground, no shadow, on a flat
solid neon-green #00FF00 background. [STYLE LOCK]
```

### B2 · Van, dusty — `van/van-dusty.png`
```
Exactly the same side-view 1985 Ford Econoline van as before (white body, red-over-blue stripe,
roof rack with two blue water jugs and a spare tire, "8 WEST IT" door sign with a small
interstate shield), now coated in pale desert dust from the wheel arches up to the windows, a
finger-drawn smiley in the dust on the rear panel, a bug-splattered windshield. Flat vector
illustration, no ground, no shadow, on a flat solid neon-green #00FF00 background. [STYLE LOCK]
```

### B3 · Van, battered — `van/van-battered.png`
```
Exactly the same side-view 1985 Ford Econoline van (white, red-over-blue stripe, roof rack with
water jugs and spare tire, "8 WEST IT" door sign with shield), now beaten up: a tiny donut spare
on the rear wheel, a crumpled front bumper held with duct tape, a cracked side window patched
with cardboard, the roof rack missing its spare tire, a wisp of steam from the hood. Still
proudly rolling. Flat vector illustration, no ground, no shadow, flat solid neon-green #00FF00
background. [STYLE LOCK]
```

### B4 · Wheel (for rolling animation) — `van/van-wheel.png`
Square 1:1, min 1000×1000.
```
A single van wheel in side view: a black tire with a simple tread pattern and a plain silver
steel wheel with five lug nuts and a small chrome center cap, perfectly circular, centered, flat
vector illustration, on a flat solid neon-green #00FF00 background. [STYLE LOCK]
```

### B5 · Van, front three-quarter hero — `van/van-hero.png`
4:3, min 2400×1800. For the title screen and marketing.
```
Front three-quarter view of a boxy 1985 Ford Econoline van (white body, red-over-blue racing
stripe, chrome bumper, round headlights, roof rack with two blue water jugs and a spare tire,
"8 WEST IT" magnetic door sign with a small interstate shield) angled toward the viewer, parked
on cracked desert asphalt, low camera, heroic and slightly comic. Flat vector illustration on a
flat solid neon-green #00FF00 background, no scene. [STYLE LOCK]
```

### B6 · Van at night — `van/van-night.png`
Same as B1 spec, for the Laguna grade / finale.
```
Same side-view 1985 Ford Econoline van (white, red-over-blue stripe, roof rack, "8 WEST IT" door
sign), at night: headlights and taillights glowing, warm cabin light in the windows, cool blue
moonlight on the body, brake lights bright red. Flat vector illustration, no ground, no shadow,
flat solid neon-green #00FF00 background. [STYLE LOCK]
```

### B7 · Dashboard cockpit frame — `van/dashboard.png` ★★
21:9 ultrawide, min 3440×1440. This becomes the modern travel screen's HUD: the status bar lives
in the gauges.
```
First-person view from the driver's seat of a 1985 Ford Econoline van: a wide, simple cream-and-
navy vinyl dashboard filling the bottom third of the frame with a large round speedometer, a fuel
gauge, a temperature gauge, and three small square empty indicator lights; a thin two-spoke
steering wheel at the lower left; a rearview mirror hanging at the top center with a tiny
interstate-shield air freshener; the windshield above is EMPTY plain solid neon-green #00FF00
(the road scene is composited later). A small "8 WEST IT" sticker on the glove box. Flat vector
illustration, clean readable gauges with no numbers. [STYLE LOCK]
```

---

## 4. Region backdrops (parallax panoramas) — ★★★

Ultrawide 8:3, min 3200×1200. Each region: full scene first; then, if the tool cooperates, the
same scene as **three layers** — `-sky` (sky and far mountains only), `-mid` (middle-distance
land and landmarks, sky area flat neon-green), `-road` (road and roadside foreground only,
everything else neon-green). Full scene alone is fine for v1. The road always runs left-to-right
along the bottom quarter, seen from slightly above and behind (the van sprite drives on it).

### C01 · Mesilla Valley, dawn — `regions/01-mesilla.webp`
```
Ultrawide panoramic landscape: a two-lane highway runs left to right across the bottom quarter;
beyond it, rows of pecan orchards in bright green, an adobe farmhouse with red chile ristras
hanging by the door, and in the distance the jagged granite spires of the Organ Mountains under
a dawn sky, pale gold at the horizon fading to soft blue, the last two stars still out. [STYLE
LOCK]
```

### C02 · The dust flats — `regions/02-dust-flats.webp`
```
Ultrawide panoramic landscape: a straight two-lane highway across the bottom, dead flat desert
scrub in sand and sage on both sides stretching to a razor-flat horizon, a leaning barbed-wire
fence, a distant water tower, a yellow diamond road sign, and on the far right edge a faint brown
haze beginning to lift off the ground. Big hard blue sky, harsh midday light, heat shimmer
implied by the wavy horizon line. [STYLE LOCK]
```

### C03 · Texas Canyon — `regions/03-texas-canyon.webp`
```
Ultrawide panoramic landscape: the highway curves gently through a field of enormous rounded
granite boulders stacked and balanced on each other like a giant's abandoned marbles, warm tan
and rust, with dark shadows in the gaps; scrub oak and yucca between them; a low afternoon sun
throwing long shadows; a rest-area picnic ramada in the middle distance. [STYLE LOCK]
```

### C04 · Sonoran saguaro / Tucson valley — `regions/04-sonoran.webp`
```
Ultrawide panoramic landscape: the highway descends into a wide valley forest of tall saguaro
cacti with raised arms, ocotillo and palo verde, the low white domes of a Spanish mission
glowing in the distance, the Santa Catalina mountains blue-purple behind, a sky going from gold
at the horizon to deep blue overhead. [STYLE LOCK]
```

### C05 · Picacho Peak and the farmland — `regions/05-picacho.webp`
```
Ultrawide panoramic landscape: a dramatic lone volcanic peak with a distinctive notched, tilted
summit rises on the left; to the right, flat irrigated cotton fields in neat green rows, a
center-pivot irrigation arm, and a green highway sign; a two-lane road across the bottom; a big
bright afternoon sky with a few flat-bottomed clouds. [STYLE LOCK]
```

### C06 · Gila Bend and Dateland lowlands — `regions/06-lowlands.webp`
```
Ultrawide panoramic landscape: low bone-dry desert with a dry sandy riverbed (the Gila) crossed
by a small concrete bridge, a grove of tall date palms around a tiny roadside stand with a
hand-painted sign, black volcanic hills in the distance, a mid-century space-age motel sign with
a stylized rocket far off on the right, blazing white-gold sky. [STYLE LOCK]
```

### C07 · Yuma and the Colorado River — `regions/07-yuma.webp`
```
Ultrawide panoramic landscape: a wide, fast green-blue river (the Colorado) crossed by an old
steel truss bridge, cottonwoods along the banks, the sandstone walls of an old territorial
prison on a bluff, a small paddle ferry landing, farm fields beyond; the highway approaches the
bridge from the left; warm late light on the water. [STYLE LOCK]
```

### C08 · Imperial Dunes — `regions/08-dunes.webp`
```
Ultrawide panoramic landscape: enormous golden sand dunes with sharp wind-carved ridges rolling
away to the horizon, the highway cutting through with sand drifting across the asphalt, a
"BLOWING SAND" yellow diamond sign, a tiny dune buggy on a distant crest, a hazy pale sky with
wind streaks. [STYLE LOCK]
```

### C09 · Imperial Valley, below sea level — `regions/09-imperial-valley.webp`
```
Ultrawide panoramic landscape: vast flat farm fields in stripes of green and gold, irrigation
canals with straight water, distant packing sheds, a green highway sign on a post reading "SEA
LEVEL" with a horizontal line, hazy white heat, the Laguna Mountains a faint blue wall on the
far right horizon. [STYLE LOCK]
```

### C10 · In-Ko-Pah boulders and Jacumba — `regions/10-in-ko-pah.webp`
```
Ultrawide panoramic landscape: the highway climbs steeply into a mountain of piled tan granite
boulders, a runaway-truck ramp of deep gravel branching off to the right, a strange stone tower
built of boulders on a summit, the flat valley floor falling away far below on the left, a
cooler sky, first pines appearing. [STYLE LOCK]
```

### C11 · Laguna Summit, the pines — `regions/11-laguna.webp`
```
Ultrawide panoramic landscape: a mountain highway at the summit among tall Jeffrey pines and
black oak, a yellow sign reading "6% GRADE" with a truck-on-a-slope symbol, the road dropping
away steeply to the right toward a distant hazy coastal plain and, on the very far horizon, a
thin silver line of the Pacific Ocean; cool blue-and-gold evening light. [STYLE LOCK]
```

### C12 · Ocean Beach, the end of the 8 — `regions/12-ocean-beach.webp`
```
Ultrawide panoramic landscape: the highway ends at a beach — a long wooden pier stretches into
a calm Pacific Ocean, palm trees lean in a sea breeze, a lifeguard tower, surfers, an enormous
coral-gold-and-violet sunset sky with the sun touching the water, gulls, and a green highway
sign reading "END 8" at the sand's edge. Triumphant and calm. [STYLE LOCK]
```

### C13 · Night variants — `regions/10-in-ko-pah-night.webp`, `11-laguna-night.webp` ★★
Regenerate C10 and C11 with: *"...at night: a deep ink-navy sky full of stars, a bright moon,
the road lit only by headlight cones, distant city glow on the horizon."*

---

## 5. Weather plates — ★★

Ultrawide 8:3, min 3200×1200. Layered over regions; semi-transparent in-engine.

### D1 · Dust-storm wall — `weather/dust-wall.png` (CUTOUT, neon-green background)
```
A towering wall of brown desert dust rolling toward the viewer, filling the frame from the
ground to the top, dense billowing ochre and umber with a bright dusty-gold edge at the top
where the sun still hits it, the base a boiling roll of dark sand. No ground, no sky visible
above it, on a flat solid neon-green #00FF00 background where the storm does not cover. [STYLE
LOCK]
```

### D2 · Monsoon cell — `weather/monsoon.png` (CUTOUT)
```
A massive dark-teal monsoon thunderhead with a flat anvil top, a gray curtain of heavy rain
falling from it in slanted streaks, a single bright lightning bolt, on a flat solid neon-green
#00FF00 background below and around it. [STYLE LOCK]
```

### D3 · Heat shimmer strip — `weather/heat.png` ★
```
An abstract horizontal band of desert heat shimmer: wavy transparent-looking ripples in pale
gold and white on a flat solid neon-green #00FF00 background, very subtle, wide and thin. [STYLE
LOCK]
```

### D4 · Star field — `weather/stars.png` ★
```
A seamless deep ink-navy night sky full of small crisp white stars of varying sizes and a faint
band of the Milky Way, no ground, no moon, tileable horizontally. [STYLE LOCK]
```

---

## 6. Stop postcards (17) — ★★★ for the six majors, ★★ for the rest

Vintage "greetings from" travel postcard. 8:5, min 1600×1000. Text: only the place name in big
retro letters. Generate a **clean plate** (no lettering) for each as `stops/<id>-plate.webp`.
Standard prompt frame:

> *"A vintage travel postcard illustration, 8:5 landscape, with the place name in big
> retro block letters across the top: '[NAME]'. Scene: [SCENE]. Slightly faded, a thin white
> border with rounded corners, a tiny 'THE 8 WEST TRAIL' stamp in the corner. [STYLE LOCK]"*

| id / filename | NAME | SCENE |
|---|---|---|
| `stops/las-cruces.webp` ★★★ | LAS CRUCES | the Organ Mountains' granite needles at sunrise behind an adobe plaza, strings of red chile ristras, a pecan orchard, and the white van parked at a general store with an "OUTFITTER" sign |
| `stops/deming.webp` | DEMING | a chrome-and-neon roadside diner with a giant duck mascot on the roof, a duck race banner, trucks in the lot, dust on the horizon |
| `stops/lordsburg.webp` | LORDSBURG | a wind-bent 1960s motel sign with half its bulbs out, tumbleweed frozen mid-roll, a brown dust haze swallowing the road west |
| `stops/texas-canyon.webp` | TEXAS CANYON | enormous balanced granite boulders stacked improbably, a tiny figure taking a photo, long shadows |
| `stops/tucson.webp` ★★★ | TUCSON | a forest of saguaro cacti with raised arms in front of a white mission church, purple mountains, a gold sky, a road sign shaped like an arrow saying "WEST" |
| `stops/picacho-peak.webp` | PICACHO PEAK | the notched volcanic peak at golden hour above a field of orange poppies |
| `stops/casa-grande.webp` | CASA GRANDE | a highway junction with a big green sign and an interstate "8" shield pointing west, cotton fields, an ancient adobe ruin under a modern protective roof in the distance |
| `stops/gila-bend.webp` | GILA BEND | a mid-century space-age motel with a rocket-shaped neon sign and a flying-saucer roof, a dry riverbed bridge, black lava hills |
| `stops/dateland.webp` | DATELAND | a roadside stand under tall date palms with a hand-painted "DATE SHAKES" sign, a frosty shake in a paper cup in the foreground |
| `stops/yuma.webp` ★★★ | YUMA | an old steel truss bridge over the wide green Colorado River, an adobe territorial prison on the bluff, a paddle ferry, cottonwoods |
| `stops/center-of-the-world.webp` | CENTER OF THE WORLD | a small pink granite pyramid on a plaza, a bronze plaque, a maze of engraved granite walls, endless flat desert, one very serious sundial |
| `stops/imperial-dunes.webp` | IMPERIAL DUNES | knife-edged golden sand dunes with the highway half-buried, a dune buggy airborne off a crest |
| `stops/el-centro.webp` ★★★ | EL CENTRO | a green "ELEVATION SEA LEVEL" sign on a post in the middle of flat green farm fields with a straight irrigation canal, hazy heat |
| `stops/in-ko-pah.webp` | IN-KO-PAH | a mountain of piled tan boulders with a hand-built stone tower on top, a deep gravel runaway-truck ramp, the valley floor far below |
| `stops/jacumba.webp` | JACUMBA | a steaming hot-spring pool at a small desert resort at dusk, string lights, boulders, the border hills |
| `stops/laguna-summit.webp` ★★★ | LAGUNA SUMMIT | tall pines at a mountain summit, a yellow "6% GRADE" sign, the road plunging toward a hazy coastal plain and a silver sliver of ocean |
| `stops/ocean-beach.webp` ★★★ | OCEAN BEACH | a long wooden pier into a calm Pacific at sunset, palm trees, surfers, gulls, and a small green sign at the sand reading "END 8" |

---

## 7. Billboards & signage — the marketing core — ★★★

Billboards are seen roadside as the van drives; they are the loudest 8 West IT placement in the
game. **Aspect 3:1, min 2400×800.** Each: a wooden-and-steel roadside billboard structure seen
slightly from below, the face carrying the design. Generate every one **twice**: with text, and
a **clean plate** with an empty white face (`billboards/plate-blank.png` once is enough).

Standard frame:

> *"A classic American roadside highway billboard on two steel posts, seen slightly from below
> against a plain flat neon-green #00FF00 background (no scene). The billboard face design:
> [DESIGN]. Clean flat vector poster style, high contrast, readable at a glance. [STYLE LOCK]"*

| filename | DESIGN (exact text in quotes) |
|---|---|
| `billboards/8westit-01.png` | white face, huge navy slab-serif headline "WE FIX IT BEFORE IT BREAKS." with a small red-and-blue interstate shield and the words "8 WEST IT 365" bottom right |
| `billboards/8westit-02.png` | ink-navy face, a glowing lighthouse beam sweeping across, headline in white "365 DAYS. ZERO FIRE DRILLS." and "8 WEST IT 365" in the corner |
| `billboards/8westit-03.png` | sunset-coral face, an illustration of the white 8 West IT van with a laptop riding in the passenger seat wearing a seatbelt, headline "YOUR IT, RIDING SHOTGUN." and "8 WEST IT 365" |
| `billboards/8westit-04.png` | styled exactly like a green highway guide sign with white capitals: "NEXT EXIT: PEACE OF MIND" with a white arrow, small line "8 WEST IT 365 · 8WESTIT.COM" |
| `billboards/8westit-05.png` | white face, a cartoon padlock wearing sunglasses on a beach chair, headline "RANSOMWARE? NOT ON OUR ROAD." and "8 WEST IT 365" |
| `billboards/8westit-06.png` | ocean-blue face, a stylized San Diego skyline and pier, headline "SAN DIEGO'S IT CREW. NOW SERVING THE WHOLE 8." and "8 WEST IT 365" |
| `billboards/8westit-07.png` | desert-sand face, three checkmarks stacked next to the words "PATCHED. BACKED UP. BEACH-READY." and "8 WEST IT 365" |
| `billboards/8westit-08.png` | split face: left half a tidy server rack, right half a perfect sunset over the ocean, headline "MANAGED IT. UNMANAGED SUNSETS." and "8 WEST IT 365" |

### F9 · Water tower (subtle parent) — `signage/water-tower.png` (CUTOUT) ★★
```
A classic small-town steel water tower on four legs with a round tank, painted a faded white,
with the words "8 WEST" in weathered navy capitals around the tank and, much smaller beneath,
"VENTURES". Slightly rusted, a ladder up one leg. Flat vector illustration on a flat solid
neon-green #00FF00 background. [STYLE LOCK]
```

### F10 · Ghost sign on brick (subtle parent) — `signage/ghost-sign.png` (CUTOUT) ★★
```
The side wall of an old brick warehouse with a faded, peeling painted advertisement from decades
ago: "8 WEST VENTURES" in ghostly white block capitals with an old-fashioned interstate shield,
half worn away by sun, a small modern 8 West IT sticker fresh on the door below. Flat vector
illustration on a flat solid neon-green #00FF00 background. [STYLE LOCK]
```

### F11 · Tow truck — `signage/tow-truck.png` (CUTOUT) ★★★
```
Side view of a chunky 1980s wrecker tow truck with a boom and hook, painted white with a red-
over-blue stripe matching a company fleet, amber light bar on the cab, the door reading "8 WEST
IT" in bold navy with a small interstate shield and beneath it in small letters "ROADSIDE DIV.",
a tiny "AN 8 WEST VENTURES COMPANY" line on the rear fender. Flat vector illustration on a flat
solid neon-green #00FF00 background. [STYLE LOCK]
```

### F12 · Highway signage kit — `signage/*.png` (each CUTOUT) ★★
One prompt each; all "flat vector, front-on, on a flat solid neon-green #00FF00 background,
[STYLE LOCK]":
- `shield-i8.png` — *"An American interstate highway shield: red crown reading 'INTERSTATE', blue body with a large white '8'."*
- `shield-historic-80.png` — *"A brown-and-cream 'HISTORIC US 80' route marker shield with the number 80 in the classic US highway badge shape."*
- `guide-sign-blank.png` — *"A blank green highway guide sign, white border, mounted on two gray posts, empty face."* (I set the text in-engine: these become the modern theme's **buttons**.)
- `exit-sign.png` — *"A green highway exit sign reading 'EXIT' with a white arrow angled up-right."*
- `mile-marker.png` — *"A small green roadside mile-marker post with the white number '8'."*
- `sign-dust-storms.png` — *"A yellow diamond warning sign reading 'DUST STORMS MAY EXIST' in black."* (real Arizona sign)
- `sign-flash-flood.png` — *"A yellow diamond warning sign reading 'WATCH FOR FLASH FLOODS'."*
- `sign-grade.png` — *"A yellow diamond warning sign showing a truck on a slope with '6% GRADE' beneath."*
- `sign-runaway-ramp.png` — *"A yellow warning sign reading 'RUNAWAY TRUCK RAMP' with an arrow."*
- `sign-sea-level.png` — *"A green sign on a post reading 'ELEVATION SEA LEVEL' with a horizontal line."*
- `sign-end-8.png` — *"A green highway sign reading 'END 8' above a small interstate shield."*
- `sign-outfitter.png` — *"A hand-painted wooden general-store sign reading 'THE OUTFITTER' with '.85' scrawled in chalk in one corner."*

---

## 8. Crew portraits (12) — ★★

Square 1:1, min 1024×1024. Standard frame:

> *"[CREW LOCK]. [PERSON]. Neutral-friendly expression, looking slightly toward camera. Same
> style as the other 8 West Trail crew portraits. [STYLE LOCK]"*

| filename | PERSON |
|---|---|
| `crew/01.png` | a woman in her 50s with silver-streaked black hair in a bandana, aviator sunglasses pushed up, a denim work shirt — the veteran road boss |
| `crew/02.png` | a lanky young man with a red beard and a trucker cap, a hoodie reading nothing, headphones around his neck — the sysadmin |
| `crew/03.png` | a Black woman in her 30s with short natural hair, round tortoiseshell glasses, a crisp polo, a lanyard — the project manager who packed the spreadsheets |
| `crew/04.png` | a Latino man in his 40s with a thick mustache, a straw cowboy hat, a friendly squint — knows every diner on the 10 |
| `crew/05.png` | a South Asian woman in her 20s with a long braid, a bright yellow rain shell, a camera strap — the photographer |
| `crew/06.png` | an older white man with a white beard and a Hawaiian shirt, reading glasses on a cord — the retiree who just came for the beach |
| `crew/07.png` | a nonbinary person with a teal undercut, a nose ring, a vintage band tee — the intern who can type 140 words a minute |
| `crew/08.png` | an East Asian man in his 30s with tousled hair and a clean white tee, a small tattoo of an interstate shield on his forearm — the mechanic |
| `crew/09.png` | a Native American woman in her 40s with long dark hair, turquoise earrings, a fleece vest — the navigator, keeps the map |
| `crew/10.png` | a heavyset white guy in his 20s with a buzzcut and a big grin, a company polo with an "8 WEST IT" logo — the new hire |
| `crew/11.png` | a woman in her 60s with cropped gray hair, a sun hat, binoculars around her neck — the birder |
| `crew/12.png` | a teenage boy with curly hair, braces, and a Dodgers cap on backwards — somebody's kid who insisted on coming |

★ Optional mood variants per portrait: regenerate with *"...looking sunburned and exhausted"*
(`crew/NN-rough.png`) and *"...pale, sweating, wrapped in a blanket"* (`crew/NN-critical.png`).

---

## 9. Event cards — ★★

4:3, min 1600×1200. Full scene illustrations; no text. Standard suffix: *"[STYLE LOCK] + [VAN
LOCK] where the van appears."*

| filename | Prompt |
|---|---|
| `events/flat-tire.webp` | *"The white 8 West IT van on a gravel highway shoulder, rear tire shredded, two people wrestling a spare out of the roof rack while a semi-truck blurs past, dust and heat, midday."* |
| `events/radiator.webp` | *"Hood up on the white 8 West IT van, a geyser of white steam, a man in sunglasses holding a split rubber hose at arm's length like a dead snake, the desert flat and merciless behind."* |
| `events/belt.webp` | *"Close view under a van's hood: a shredded black serpentine belt hanging off the pulleys, a hand reaching in with a flashlight, sparks of worry."* |
| `events/sushi.webp` | *"A gas station convenience-store cooler under fluorescent light, a single sad plastic tray of sushi with a bright orange '2 FOR $8.85' sticker, a hand reaching for it, a rattlesnake-shaped air freshener watching from the counter."* |
| `events/heatstroke.webp` | *"A rest-stop picnic ramada in blinding noon heat, a crew member slumped on the bench with a wet bandana on their head, another pouring water from a blue jug, the van in the shade."* |
| `events/snake.webp` | *"A coiled diamondback rattlesnake in the shade under a rest-stop bench, rattle raised, a sneaker frozen mid-step inches away, long sharp shadows."* |
| `events/speed-trap.webp` | *"A highway patrol cruiser with its lights on parked behind the white 8 West IT van on the shoulder, a trooper in a campaign hat writing in a ticket book, the driver's hands on the wheel, sunset."* |
| `events/thief.webp` | *"A 1960s motel parking lot at night under a buzzing neon VACANCY sign, the van's side door slid open, a figure in a hoodie hurrying away with a blue water jug."* |
| `events/ransomware.webp` | *"A truck-stop booth at night, a laptop on the table showing a red padlock and a countdown timer, a stranger in a leather vest leaning over saying something, coffee cups, neon through the window."* |
| `events/wrong-turn.webp` | *"Two crew members arguing over an unfolded paper map on the van's hood at a lonely dirt crossroads with three unmarked roads, a crooked sign, buzzards overhead."* |
| `events/tailwind.webp` | *"The white 8 West IT van cruising an empty straight highway with every window down, hair and a bandana streaming, a long trailing tailwind of dust, a wide smile on the driver, big blue sky."* |
| `events/pecan-stand.webp` | *"A roadside farm stand under a cottonwood: burlap sacks of pecans, strings of red chiles, jars of honey, a smiling older woman in an apron handing over a paper bag, the van parked behind."* |
| `events/historic-80.webp` | *"A weathered brown-and-cream 'HISTORIC US 80' shield on a bent post beside a cracked, abandoned two-lane road running parallel to the modern interstate, wildflowers in the cracks, golden light."* |
| `events/dust-storm.webp` | *"The white 8 West IT van tiny in the foreground as a colossal brown dust wall bears down from behind, the road vanishing into it, the last sunlight on the storm's crest."* |
| `events/monsoon.webp` | *"A desert wash running with fast brown floodwater across the highway, a dark teal thunderhead with a lightning bolt overhead, the van stopped at the water's edge, rain sheeting."* |
| `events/tow-truck.webp` | *"The white 8 West IT wrecker tow truck (matching fleet stripe, 'ROADSIDE DIV.' on the door) pulling up behind the dead van on the shoulder at golden hour, the driver leaning out with a thumbs-up and a red jerry can."* |
| `events/siphon.webp` | *"Night on the shoulder, a big-rig's running lights, a kindly trucker crouched with a siphon hose between his tank and a red jerry can, the crew huddled in blankets against the van."* |
| `events/memorial.webp` | *"A small roadside memorial at dusk: a white cross made of lath with a chrome hubcap nailed to the center, plastic flowers, a single work boot, the highway stretching on, a violet sky."* |
| `events/snack-stand.webp` | *"A bustling roadside taco stand at sunset with a hand-painted menu, a smoking grill, a line of truckers, paper plates piled high with carne asada, string lights, the van parked with its doors open."* |
| `events/date-shake.webp` (P2) | *"A frosty date shake in a paper cup sweating in the sun on a picnic table under date palms, a crew member with a blissed-out face, a hand-painted 'DATE SHAKES' sign."* |
| `events/river-ford.webp` (P2) | *"The white 8 West IT van halfway across the wide Colorado River with water up to the doors, a bow wave, a nervous face at the wheel, the old truss bridge in the background."* |
| `events/river-ferry.webp` (P2) | *"The van riding a small flat paddle ferry across a green river, a ferryman in a straw hat pulling a cable, cottonwoods, calm water, a hand-painted fare sign."* |
| `events/dunes-closure.webp` (P2) | *"Sand blowing across the highway between huge golden dunes, a 'ROAD CLOSED' barricade, the van waiting with wipers going, a lone tumbleweed."* |
| `events/hot-springs.webp` (P2) | *"The crew soaking in a steaming natural hot-spring pool at dusk under string lights, the van parked by boulders, stars beginning."* |
| `events/runaway-ramp.webp` (P2) | *"The white 8 West IT van nose-deep in the gravel of a runaway-truck ramp on a mountain grade, brakes smoking, gravel flying, a very relieved driver."* |
| `events/the-grade.webp` (P2) | *"The van on a steep mountain highway plunging downhill between boulders and pines toward a hazy coastal plain, brake lights glowing red, a '6% GRADE' sign, a sliver of ocean far below."* |
| `events/old-80.webp` (P2) | *"The van creeping along a narrow, winding, cracked old two-lane mountain road at dusk, guardrail-free, boulders looming, a faded 'US 80' shield on a post, headlights on."* |

---

## 10. Scenes (full-screen moments) — ★★★

16:9, min 2560×1440. These are the big emotional beats.

### J1 · Title hero — `scenes/title.webp`
```
Wide cinematic illustration: the white 8 West IT van (boxy 1985 Ford Econoline, red-over-blue
stripe, roof rack with blue water jugs and a spare tire, "8 WEST IT" door sign) small on an
empty two-lane highway that runs straight toward a range of purple mountains, under an enormous
gold-to-blue afternoon sky with one long cloud, saguaros on the shoulders, a green highway sign
on the right reading "OCEAN BEACH 730". Leave the upper-left third of the sky calm and empty for
a title to sit in. [STYLE LOCK] + [VAN LOCK]
```

### J2 · The outfitter — `scenes/outfitter.webp`
```
Wide illustration of the interior of a sun-drenched desert general store: wooden shelves of
canned food, stacked blue water jugs, red jerry cans, tires and belts hung on pegboard, a brass
cash register, a chalkboard price list with every price ending in ".85", a ceiling fan, a
bearded shopkeeper in suspenders, big front windows showing the white van parked outside. [STYLE
LOCK]
```

### J3 · Loading the van (crew naming) — `scenes/loading.webp`
```
Wide illustration: five silhouetted-but-friendly people loading the white 8 West IT van at dawn
outside a general store — one on the roof strapping down water jugs, one carrying a cooler, one
checking a paper map, one holding a coffee, one already asleep in the passenger seat — long
morning shadows, the Organ Mountains pink in the distance. [STYLE LOCK] + [VAN LOCK]
```

### J4 · Tucson milestone — `scenes/tucson.webp`
```
Wide illustration: the white 8 West IT van cresting a rise as a valley of saguaros opens below,
the crew's arms out every window, a white mission glowing far off, purple mountains, gold light
— a moment of triumph halfway there. [STYLE LOCK] + [VAN LOCK]
```

### J5 · The Yuma crossing decision — `scenes/yuma-decision.webp`
```
Wide illustration from the riverbank: the wide green Colorado River in front of the van, a
shallow ford marked by stakes on the left, an old steel truss bridge in the center distance, a
small paddle ferry with a fare sign on the right, storm clouds building upstream; a decision
point. [STYLE LOCK] + [VAN LOCK]
```

### J6 · Laguna Summit — the finale choice — `scenes/laguna-decision.webp`
```
Wide illustration from the summit at dusk: the road forks — left, the modern interstate plunges
steeply downhill with a "6% GRADE" sign and brake-light red glow; right, a narrow old two-lane
road winds off among boulders with a faded "US 80" shield; below both, a hazy coastal plain and
a thin silver Pacific horizon under a coral sky. [STYLE LOCK]
```

### J7 · Victory at Ocean Beach — `scenes/victory.webp`
```
Wide cinematic illustration: the white 8 West IT van parked on the sand at Ocean Beach where the
highway ends, doors open, the crew silhouetted running toward the water, the long pier, palm
trees, gulls, and a vast coral-gold-violet sunset with the sun touching the Pacific. Pure joy.
Leave the upper-left sky calm for a title. [STYLE LOCK] + [VAN LOCK]
```

### J8 · Victory, night variant — `scenes/victory-night.webp` ★★
Same as J7 *"...an hour later: a bonfire on the sand, the van's headlights off, a sky full of
stars, the pier lights reflected in dark water."*

### J9 · The memorial — `scenes/memorial.webp`
```
Wide, quiet illustration at dusk: a small white roadside cross with a chrome hubcap at its
center, plastic flowers, the empty highway stretching to a violet horizon, one distant pair of
taillights, the first stars. Leave the center-left empty for an epitaph to be lettered. [STYLE
LOCK]
```

### J10 · Game over, van abandoned — `scenes/game-over.webp` ★★
```
Wide illustration: the white 8 West IT van abandoned on the shoulder at noon, hood up, doors
open, a vulture on the roof rack, heat shimmer, a mile marker, nothing else for a hundred miles.
Darkly funny. [STYLE LOCK] + [VAN LOCK]
```

---

## 11. UI icons — ★★ (I draw the final SVGs; this sheet is my reference)

### I1 · Icon reference sheet — `icons/reference-sheet.png`
Square, min 2048×2048.
```
A clean icon sheet, 5 by 5 grid on a plain white background, each icon a single flat navy
silhouette with one red or blue accent, consistent 2-pixel stroke weight, rounded corners,
simple and readable at 24 pixels: a canned-food case, a blue water jug, a red jerry can, a tire,
a serpentine belt, a radiator hose, a dollar bill, a boxy van, a wrench, a turtle (steady pace),
a hare (strenuous pace), a rocket (grueling pace), a full plate (filling rations), a half plate
(meager), an empty plate (bare-bones), a sun (mild), a sun with heat waves (hot), a thermometer
bursting (scorching), a dust cloud, a storm cloud with lightning, a bed (rest), a taco (snack
run), a folded map, a heart (health), a skull with a cowboy hat. [STYLE LOCK]
```

---

## 12. Heritage theme extras — ★

### N1 · CRT bezel frame — `heritage/crt-bezel.png` (CUTOUT: screen area neon-green)
```
A beige 1980s computer monitor bezel seen straight on, filling the frame edge to edge, rounded
screen corners, a small power LED and brightness knob at the lower right, faint scuffs and a
faded inventory sticker, the entire screen area a flat solid neon-green #00FF00. Flat vector
illustration. [STYLE LOCK]
```

### N2 · Theme toggle icons — `heritage/toggle-heritage.png`, `heritage/toggle-coastal.png`
Square 1:1, min 512×512, CUTOUT.
- *"A tiny flat icon of a beige 1980s computer monitor with a glowing green screen, on a flat solid neon-green #00FF00 background."*
- *"A tiny flat icon of a pair of red sunglasses in front of a coral sunset over blue water, on a flat solid neon-green #00FF00 background."*

---

## 13. Audio — ★ (these are prompts for a music/SFX generator such as Suno, Udio, or ElevenLabs — not Claude Imagine)

| filename | Prompt |
|---|---|
| `audio/title-loop.mp3` | *"Instrumental, 75 BPM, 90 seconds, seamless loop: dreamy surf-rock guitar with spring reverb over a warm 1980s synthwave pad and a slow driving drum machine, a hint of pedal steel, hopeful and wide-open like an empty desert highway at golden hour. No vocals."* |
| `audio/travel-day.mp3` | *"Instrumental, 96 BPM, 2 minutes, seamless loop: upbeat road-trip surf-rock with a chugging rhythm guitar, bright organ stabs, hand claps, a tremolo lead, the feeling of windows down on a straight desert road. No vocals."* |
| `audio/travel-mountain.mp3` | *"Instrumental, 80 BPM, 2 minutes, seamless loop: tense, cinematic synthwave with a pulsing bass, distant electric guitar, low toms, cold mountain-night atmosphere, building but never resolving. No vocals."* |
| `audio/victory.mp3` | *"Instrumental, 100 BPM, 45 seconds: triumphant surf-rock crescendo with a full brass hit, crashing cymbals like waves, a final ringing major chord, a sunset-at-the-beach feeling. No vocals."* |
| `audio/death-sting.mp3` | *"A 4-second comic-tragic sting: a sad muted trumpet 'wah-wah-wah-waaah' with a single somber pedal-steel slide underneath."* |
| `audio/sfx/*.mp3` | engine start (old V8 cough then idle) · tire blowout BANG · cash register ka-ching · brass-bell shop door · typewriter key click and carriage-return ding · radiator hiss · rattlesnake rattle · thunder roll · gust of wind with sand · seagulls and surf · tow-truck backup beep · laptop error chime · van door slam · celebratory car horn |

---

## 14. Video — ★ (prompts for a video generator; or I reuse the Ventures `hero.mp4`)

### M1 · Intro sting — `video/intro.mp4` (+ `.webm`), 6 seconds, 16:9, under 3 MB
```
Six-second animated logo sting in flat vector illustration style: a red-and-blue interstate
shield with a white "8" drops in and lands with a small dust puff; the white 8 West IT van
(1985 Econoline, red-over-blue stripe, roof rack) drives in from the left and stops beneath it;
the words "THE 8 WEST TRAIL" wipe on in heavy slab-serif capitals; a small "PRESENTED BY 8 WEST
IT" fades in below. Sun-bleached Americana palette (interstate red #C41E2A, ocean blue #1F8FD6,
sand #E9C46A, coral #F4845F, navy #0C1830), paper-grain texture, no photorealism.
```

### M2 · Highway flyby loop — `video/billboards-loop.mp4`, 10 seconds, seamless ★
```
Seamless 10-second loop, side-scrolling flat vector illustration: a desert highway rolls right
to left past saguaros and a green guide sign, with a roadside billboard reading "WE FIX IT
BEFORE IT BREAKS. — 8 WEST IT 365" sliding past, big gold-to-blue sky, gentle parallax between
foreground road, midground scrub, and far mountains. Sun-bleached Americana palette, paper
grain, no photorealism.
```

---

## 15. Marketing & web extras (because this *is* the marketing tool) — ★★

| filename | Spec | Prompt |
|---|---|---|
| `marketing/hero-tile.png` | 16:9, min 1600×900 — the tile on 8westit.com that links to the game | *"Website hero tile: the white 8 West IT van racing toward a sunset on a desert highway, a big interstate '8' shield in the sky, room top-left for a headline; energetic, inviting. [STYLE LOCK] + [VAN LOCK]"* |
| `marketing/social-square-01.png` | 1:1, min 1080×1080 | *"Social post: a retro travel poster of the white 8 West IT van under a giant saguaro with the headline 'CAN YOU MAKE IT TO THE BEACH?' in slab-serif capitals and a small '8WT.8WESTIT.COM' at the bottom. [STYLE LOCK] + [VAN LOCK]"* |
| `marketing/social-square-02.png` | 1:1 | *"Social post styled as a green highway guide sign: 'YOU HAVE DIED OF GAS-STATION SUSHI' in white capitals, a small white arrow, and '8WT.8WESTIT.COM'. Deadpan, funny. [STYLE LOCK]"* |
| `marketing/social-story.png` | 9:16, min 1080×1920 | *"Vertical story graphic: the white 8 West IT van tiny at the bottom of a towering dust-storm wall, headline at top 'SPRING IS DUST SEASON.' and at the bottom 'PLAY THE 8 WEST TRAIL'. [STYLE LOCK] + [VAN LOCK]"* |
| `marketing/sticker-sheet.png` | 4:3, min 2400×1800, white background | *"A die-cut sticker sheet: the interstate '8' shield, the white 8 West IT van, a taco, a rattlesnake in sunglasses, a padlock on a beach chair, a green sign reading 'NEXT EXIT: PEACE OF MIND', a skull in a cowboy hat, a blue water jug, a date shake, a tiny 'AN 8 WEST VENTURES COMPANY' badge — each with a white die-cut border. [STYLE LOCK]"* |
| `marketing/email-header.png` | 3:1, min 1800×600 | *"Email newsletter header: the white 8 West IT van at the Ocean Beach pier at sunset, with a green guide sign reading 'END 8' and empty space on the right for text. [STYLE LOCK] + [VAN LOCK]"* |
| `marketing/leaderboard-badge.png` | 1:1 CUTOUT | *"A gold-and-navy enamel-pin style badge shaped like an interstate shield with a laurel wreath, a small star at the top, blank center (numbers go in later), on a flat solid neon-green #00FF00 background. [STYLE LOCK]"* |

---

## 16. Priority order if you're doing this in evenings

1. **A1 title lockup**, **B1 van clean**, **F1–F8 billboards** (the brand, in one evening).
2. **C01 Mesilla**, **C04 Sonoran**, **C12 Ocean Beach**, **J1 title hero**, **J7 victory**.
3. **B2/B3 van states**, **F11 tow truck**, the six ★★★ postcards, **A4 share card**.
4. The rest of the regions and postcards, then event cards, then crew.
5. Everything ★ whenever the mood strikes.

Every slot has a placeholder until then. Send me anything as it lands — I'll cut it out,
vectorize what needs vectorizing, tune the colors to the bible, and wire it in.
