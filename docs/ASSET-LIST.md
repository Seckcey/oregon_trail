# THE 8 WEST TRAIL — Master Asset List & Generation Prompts (COMIC-BOOK EDITION)

*Lead design, revised 2026-08-24 for the comic-book art direction (supersedes the travel-poster
list). Every asset the Comic theme and the marketing push want, each with a ready-to-paste Claude
Imagine prompt. Nothing here blocks the build — the game ships SVG placeholders in every slot and
real art replaces them as it lands.*

---

## 0. How to use this document

1. **Paste the prompt block verbatim** into Copilot M365 (see rule 8). Every prompt is complete as written — the style
   paragraphs are already inside it, so there is nothing to add. Generate 3–4 variations; keep the one that matches the Style Bible best — consistency across
   assets matters more than any single image being perfect.
2. **Save with the exact filename** listed, into `public/assets/<category>/`. PNG for anything cut
   out or layered; WebP (quality 85) for full scenes; SVG only if the tool gives real vectors (it
   won't — I vectorize logos, SFX lettering, and icons myself with Adobe tools).
3. **Backgrounds:** anything marked **CUTOUT** is generated on a *flat, solid neon-green #00FF00
   background* and I key it out. Don't ask for "transparent" — the tool fakes a checkerboard.
4. **Text in images:** image tools mangle words. Where text is essential (SFX lettering, covers,
   signs) the prompt gives *exact, short* strings. Expect to regenerate; I'll fix letters in post.
   Every text-bearing asset also asks for a **clean plate** (same image, no text) so I can set real
   comic lettering in-engine.
5. **Speech balloons:** never in the generated art. Balloons, captions, and panel borders are
   drawn by the game in CSS/SVG so the words can change. Prompts say "no speech balloons".
6. **Resolution:** biggest available. Wide panels ≥ 2400 px wide; sprites ≥ 1600 px long side.
7. **Priority:** ★★★ = the look can't land without it · ★★ = depth and delight · ★ = polish.
8. **Use ChatGPT Codex's image generation for every prompt** — it's the one that reliably
   works. Copilot M365 and Claude Design block anything naming a real vehicle make/model or a
   famous cartoon animal, so every prompt now says "boxy 1980s cargo van" with no brand, and no
   roadrunners. If a tool still balks, delete the sentence it complains about and resend.
9. **Skip these — I build them from your other art:** A4 share card, A5 "presents" plate,
   A6 parent-company plate, and everything in section 17 (marketing) except the variant covers.
   They are layout jobs, not drawings.

---

## 1. The Style Bible — "Saturday Morning Mystery Comic"

**The world:** an all-ages comic book about five friends, a terrible van, and 730 miles of
desert. Bold ink, flat bright color, big expressions, giant sound effects, panels that tilt when
the action does. Funny first, thrilling second, always readable at a glance. Classy in the way a
well-drawn comic is classy: confident lines, nothing muddy.

**IP discipline:** the *style* is a homage to classic mystery-gang comics; the *content* is ours.
Original characters only. The van is white with a red-over-blue stripe — never teal/green,
never flowers, never psychedelic. No famous dogs. Every prompt says so.

**Palette:**

| Token | Hex | Use |
|---|---|---|
| Ink black | `#111111` | outlines, lettering |
| Interstate red | `#C41E2A` | brand, danger, SFX fills |
| Ocean-wave blue | `#1F8FD6` | brand, water, cool shadows |
| Sunflower yellow | `#FFC72C` | caption boxes, SFX, sun |
| Lime green | `#7AC143` | desert plants, "go" |
| Sky blue | `#5BC0EB` | skies |
| Hot orange | `#F58220` | dust, sunsets, heat |
| Grape purple | `#6A4C93` | night, mountains, spooky |
| Paper white | `#FFFFFF` | page, van body |

**Lettering (Google Fonts, loaded by the game):** **Bangers** for SFX and titles, **Luckiest
Guy** for cover masthead, **Comic Neue** for balloons and body. Caption boxes are yellow with a
black border; narration is set in small caps.

### The three LOCK paragraphs (paste where prompts say so)

**[COMIC LOCK]**
> Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated
> cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions
> and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and
> dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds.
> Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow
> #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93,
> white. In the spirit of classic all-ages mystery-gang comics, but with original characters
> and an original van. No gradients, no painterly texture, no photorealism, no speech balloons,
> no text unless specified. Same illustrated universe as the other 8 West Trail assets.

**[VAN LOCK]**
> The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly
> cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide
> red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue
> water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading
> "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never
> teal or green, never flowers, never psychedelic paint.

**[CREW LOCK]**
> Original cartoon character in classic comic-book style: bold ink outlines, big expressive
> eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading,
> simple readable silhouette, consistent with the other 8 West Trail crew.

---

## 2. Brand & identity — ★★★

### A1 · Comic-cover title masthead — `brand/masthead.png` (→ I vectorize)
3:1, min 3000×1000. **Text essential.**
```
Comic-book cover masthead logo: the words "THE 8 WEST TRAIL" in huge chunky comic display
lettering with a thick black outline, a second thinner white outline, and a hard drop shadow;
the "8" is drawn inside a red-and-blue American interstate highway shield that leans slightly;
the letters are yellow #FFC72C fading to orange #F58220 with a subtle halftone; a thin black
speed-line burst behind the lettering. On a plain solid white background, no scene. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```
Also **A1-plate**: the same masthead on solid neon-green #00FF00 (CUTOUT for overlaying on covers).

### A2 · Issue cover — the title screen — `brand/cover-01.png` ★★★
Comic cover proportions 2:3, min 2000×3000. **This is the title screen.** Text: masthead only
(I overlay the real masthead), plus a corner box.
```
A comic-book cover, portrait 2:3. Leave the top 22 percent of the page clear white for a
masthead. Scene: the white 8 West IT van (see van description) skids around a desert highway
curve toward the viewer at a dramatic low angle, tires smoking, dust puffing, five cartoon
friends visible through the windshield — one pointing ahead excitedly, one screaming, one
calmly reading a map, one asleep, one holding a taco — a giant saguaro cactus and a red-and-blue
"8" interstate shield sign flashing past, purple mountains, a blazing orange sunset sky with
speed lines. Upper right corner: a small white box reading "No. 1". Bottom edge: a thin strip
reading "8 WEST IT PRESENTS". Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint.
```
Also generate the **clean plate** (no "No. 1", no strip) as `brand/cover-01-plate.png`.

### A3 · App icon / favicon — `brand/icon.png`
1:1, min 1024×1024.
```
App icon: a red-and-blue American interstate highway shield with a big white "8", drawn with a
thick black comic ink outline and a hard black drop shadow, on a solid sunflower-yellow #FFC72C
square with softly rounded corners, a few short black speed lines behind it. Readable at 32
pixels. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

### A4 · Social share card — `brand/og-card.png`
1200×630 exactly.
```
A wide comic-book panel, 1.9:1, thick black panel border with a white gutter margin: the white
8 West IT van drives left-to-right on a two-lane desert highway toward purple mountains under an
orange sunset, dust puffing behind the tires, speed lines.
Leave the upper-left third clear sky for lettering. No text. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint.
```

### A5 · "8 WEST IT PRESENTS" end plate — `brand/presented-by.png`
16:9, min 1920×1080.
```
A comic-book end-page: a black background with a subtle halftone dot pattern, a yellow caption
box in the center with a thick black border reading "8 WEST IT PRESENTS" in bold comic
lettering, and beneath it a small red-and-blue interstate shield; a thin white speed-line burst
radiating from behind the box. Minimal. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

### A6 · Parent-company plate (subtle) — `brand/ventures-plate.png`
6:1, min 2400×400.
```
A tiny, quiet comic-style credit strip: a small outline-only interstate shield and the words "AN
8 WEST VENTURES COMPANY" in thin black comic lettering inside a narrow white caption box with a
thin black border, on a solid white background. Nothing else. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

### A7 · Splash / loading page — `brand/splash.png` (9:16) and `brand/splash-wide.png` (16:9)
```
A full-page comic splash: the white 8 West IT van seen from behind at dawn, parked at the very
start of a dead-straight highway between pecan orchards, the jagged Organ Mountains in the
distance, a huge pale-yellow sky with two fading stars; on the right shoulder a green highway
guide sign reading "SUNSET CLIFFS 730". A yellow caption box at the top reads "LAS CRUCES, NEW
MEXICO. DAY ONE." Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint.
```
Plus the clean plate (no caption, blank sign) as `-plate`.

---

## 3. The van — hero sprite and action poses — ★★★

All van sprites: **CUTOUT** on flat solid neon-green #00FF00, no ground, no shadow (I add
shadows in-engine). Min 2400×1200 unless noted.

| filename | Prompt |
|---|---|
| `van/van-clean.png` | *"Side view, driver's side facing left, perfectly horizontal, the whole vehicle in frame with margin. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Clean and proud, headlights like friendly eyes. Flat solid neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-dusty.png` | *"Exactly the same side-view van as before, now coated in pale desert dust up to the windows, a finger-drawn smiley in the dust on the rear panel, bug splats on the windshield. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-battered.png` | *"Exactly the same side-view van, beaten up: a tiny donut spare on the rear wheel, a crumpled bumper held on with duct tape, a cracked window patched with cardboard, the roof rack missing its spare tire, a wisp of steam from the hood, but still proudly rolling. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-wheel.png` (1:1) | *"A single cartoon van wheel in side view: black tire with a simple tread, plain silver steel wheel with five lug nuts and a chrome center cap, thick ink outline, perfectly circular and centered, neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-hero.png` (4:3) ★★★ | *"Front three-quarter view of the van angled toward the viewer, low heroic camera, headlights gleaming, a little cartoon wobble in the lines like it just came to a stop, dust puffs at the tires. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-skid.png` ★★★ | *"Side view of the van mid-skid: tilted onto two wheels, tires smoking, speed lines streaming off the back, the roof-rack water jugs flying loose on their straps. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-airborne.png` ★★ | *"Side view of the van airborne off a bump: all four wheels off the ground, front end lifted, motion lines beneath, a spare tire and a taco flying off the roof rack. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-steam.png` ★★ | *"Side view of the van stopped with the hood popped open, a huge white cartoon cloud of steam billowing up, the headlights drooping like sad eyes. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-splash.png` ★★ (P2) | *"Side view of the van fording a river: water up to the doors, a big cartoon bow wave splashing forward, a fish flying out of the spray. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/van-night.png` ★★ | *"Side view of the van at night: headlights throwing bright yellow cones, brake lights glowing red, warm light in the windows, the body in cool purple shadow. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `van/dashboard.png` (21:9, min 3440×1440) ★★ | *"First-person view from the driver's seat of a cartoon 1980s van: a simple cream-and-navy vinyl dashboard fills the bottom third with a big round speedometer, a fuel gauge, a temperature gauge, and three square blank indicator lights, all with thick ink outlines and no numbers; a two-spoke steering wheel lower left; a rearview mirror top center with a tiny interstate-shield air freshener; the windshield above is EMPTY flat solid neon-green #00FF00. A small '8 WEST IT' sticker on the glove box. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |

---

## 4. The crew — characters, not just portraits — ★★★

Comics need bodies. Each crew member gets a **model sheet** (the master), a **headshot**
(status bar), and **pose sheets** (for panels). All CUTOUT on neon-green #00FF00.

### The twelve (use these exact descriptions every time so they stay consistent)

| id | Character |
|---|---|
| 01 | **Wes** — a woman in her 50s, silver-streaked black hair under a red bandana, aviator sunglasses pushed up, denim work shirt, sleeves rolled; the road boss, unflappable |
| 02 | **Dot** — a Black woman in her 30s, short natural hair, round tortoiseshell glasses, crisp yellow polo, a lanyard with a badge; the planner, holds the clipboard |
| 03 | **Cache** — a lanky young man, red beard, green trucker cap, gray hoodie, headphones around his neck; the sysadmin, permanently mildly alarmed |
| 04 | **Sol** — a Latino man in his 40s, thick mustache, straw cowboy hat, orange western shirt with pearl snaps; knows every diner, laughs with his whole face |
| 05 | **Piper** — a South Asian woman in her 20s, long braid, bright yellow rain shell, a camera on a strap; the photographer, always leaning out a window |
| 06 | **Hank** — an older white man, white beard, loud Hawaiian shirt, reading glasses on a cord, sandals with socks; came for the beach |
| 07 | **Kannon** — a teenage boy with short curly brown hair faded on the sides, a plain black tee with a small blue circle on the chest, black jeans, black-and-white skate shoes (no brand lettering), and a small round Dexcom continuous glucose sensor on the back of his upper arm; easy grin. He lives with Type 1 diabetes and handles it like it's nothing. (Drawn from life — see `crew/07-model.png`; keep every generation consistent with it.) |
| 08 | **Ping** — an East Asian man in his 30s, tousled hair, white tee, a small interstate-shield tattoo on his forearm, a rag in his back pocket; the mechanic |
| 09 | **Rosa** — a Native American woman in her 40s, long dark hair, turquoise earrings, a blue fleece vest, a folded paper map always in hand; the navigator |
| 10 | **Bo** — a heavyset white guy in his 20s, buzzcut, enormous grin, a navy "8 WEST IT" company polo; the new hire, eats everything |
| 11 | **Marge** — a woman in her 60s, cropped gray hair, wide sun hat, binoculars around her neck, khaki vest; the birder, notices everything |
| 12 | **Kit** — a teenage boy, curly hair, braces, a backwards blue baseball cap, an oversized hoodie; somebody's kid, insisted on coming |

### Prompt frames

**Model sheet** — `crew/NN-model.png`, 16:9, min 2400×1350:
```
Character model sheet for an original comic character: [CHARACTER]. Three full-body views in a
row on a flat solid neon-green #00FF00 background — front, three-quarter, and side — standing
relaxed, same outfit and colors in all three, plus two small head studies in the corner showing a
big grin and a worried face. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

**Headshot** — `crew/NN.png`, 1:1, min 1024×1024:
```
Head-and-shoulders portrait of [CHARACTER], neutral-friendly expression, looking slightly toward
camera, inside a simple circle, on a flat solid neon-green #00FF00 background. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew.
Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

**Mood headshots** (★★) — `crew/NN-rough.png`, `crew/NN-critical.png`: same as headshot with
*"...sunburned, sweating, exhausted"* and *"...pale green, wrapped in a blanket, spiral eyes"*.

**Pose sheet** (★★) — `crew/NN-poses.png`, 16:9, min 2400×1350:
```
A comic pose sheet of [CHARACTER], five full-body poses in a row on a flat solid neon-green
#00FF00 background: (1) cheering with both arms up, (2) panicking mid-run with legs a blur,
(3) slumped asleep on an invisible seat, (4) pointing dramatically off to the left, (5) sitting
cross-legged eating a taco. Same outfit and colors throughout. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

### Group shots — ★★★
- `crew/group-windshield.png` (16:9, CUTOUT): *"The five default crew — Wes, Dot, Cache, Sol, and Piper (see descriptions) — crammed shoulder to shoulder as seen through a van windshield, framed by the windshield's thick ink outline, each with a different expression (excited, calm, alarmed, laughing, snapping a photo), neon-green #00FF00 background outside the glass. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*
- `crew/group-lineup.png` (21:9, CUTOUT): *"All twelve crew characters standing in a row like a team lineup, varied heights and poses, on a flat solid neon-green #00FF00 background. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*

---

## 5. Establishing-shot panels (the twelve regions) — ★★★

The Comic theme's travel screen is a wide splash panel with the van sprite composited on the
road. **8:3, min 3200×1200**, drawn *as a comic panel* (thick black border with a white margin is
fine — I crop). The road runs left to right across the bottom quarter, seen slightly from above
and behind. No van in these (it's composited). No text.

| filename | Scene (prefix each with "A wide comic-book establishing-shot panel:" and suffix with "Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.") |
|---|---|
| `regions/01-mesilla.webp` | a two-lane highway across the bottom; rows of bright green pecan orchards, an adobe farmhouse with red chile ristras by the door, the jagged Organ Mountains in the distance under a dawn sky, yellow at the horizon to sky-blue, two fading stars |
| `regions/02-dust-flats.webp` | a dead-straight highway across dead-flat sand-and-sage desert to a razor horizon, a leaning barbed-wire fence, a distant water tower, a yellow diamond road sign, a faint brown haze lifting on the far right; harsh noon light, wavy heat lines |
| `regions/03-texas-canyon.webp` | the highway curving through a field of enormous rounded granite boulders stacked like a giant's marbles, tan and rust with deep purple shadows, scrub oak and yucca, a picnic ramada |
| `regions/04-sonoran.webp` | the highway descending into a valley forest of tall saguaros with raised arms, ocotillo, palo verde, the white domes of a Spanish mission glowing far off, purple mountains, an orange-to-blue sky |
| `regions/05-picacho.webp` | a lone volcanic peak with a notched tilted summit on the left; neat rows of green cotton fields and a center-pivot irrigation arm on the right; big bright sky with flat-bottomed clouds |
| `regions/06-lowlands.webp` | bone-dry desert with a sandy dry riverbed crossed by a small concrete bridge, a grove of tall date palms around a tiny roadside stand, black volcanic hills, a mid-century motel sign with a rocket far off; blazing yellow-white sky |
| `regions/07-yuma.webp` | a wide fast green-blue river crossed by an old steel truss bridge, cottonwoods on the banks, an adobe territorial prison on a bluff, a little paddle ferry at a landing, the highway approaching the bridge from the left |
| `regions/08-dunes.webp` | enormous golden dunes with knife-edged ridges rolling to the horizon, the highway cut through with sand drifting across the asphalt, a "BLOWING SAND" yellow diamond sign, a tiny dune buggy on a distant crest, wind streaks in a pale sky |
| `regions/09-imperial-valley.webp` | vast flat farm fields in stripes of green and yellow, straight irrigation canals, distant packing sheds, a green sign on a post reading "SEA LEVEL", the Laguna Mountains a faint purple wall on the far horizon |
| `regions/10-in-ko-pah.webp` | the highway climbing steeply into a mountain of piled tan boulders, a runaway-truck ramp of deep gravel branching right, a strange stone tower on a summit, the valley floor falling away far below on the left, first pines |
| `regions/11-laguna.webp` | a mountain highway at the summit among tall pines and black oaks, a yellow "6% GRADE" sign with a truck-on-a-slope symbol, the road dropping steeply right toward a hazy coastal plain and a thin silver line of ocean, cool purple-and-gold evening light |
| `regions/12-sunset-cliffs.webp` ★★★ | the road ends at the edge of the continent: golden sandstone cliffs dropping to a blue Pacific with white surf, sea caves, ice plant and palms, a lifeguard truck, a low orange sun on the water, gulls, and a green highway sign at the road's end reading "END 8" |

**Night variants** (★★): regenerate 10 and 11 with *"...at night: a deep grape-purple sky full of
stars and a big cartoon moon, the road lit only by headlight cones, city glow on the horizon."*

---

## 6. Weather plates — ★★

8:3, min 3200×1200, CUTOUT on neon-green #00FF00 where the weather doesn't cover.

| filename | Prompt |
|---|---|
| `weather/dust-wall.png` | *"A towering cartoon wall of brown desert dust rolling toward the viewer, billowing orange and umber with a bright yellow lit edge on top, a boiling roll of dark sand at the base, drawn with bold ink outlines and halftone, on a flat solid neon-green #00FF00 background wherever the dust does not cover. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `weather/monsoon.png` | *"A massive dark purple-teal cartoon thunderhead with a flat anvil top, a gray curtain of slanted rain streaks, one jagged yellow lightning bolt with a black outline, on a flat solid neon-green #00FF00 background below and around it. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `weather/heat.png` — **SKIP: the game draws heat shimmer in CSS; the generated plate read as yellow squiggles** | *"A thin horizontal band of cartoon heat shimmer: wavy pale-yellow ripple lines with thin ink outlines, on a flat solid neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `weather/stars.png` ★ | *"A seamless deep grape-purple night sky full of small crisp white cartoon stars of three sizes and a faint Milky Way band, tileable horizontally, no ground, no moon. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |

---

## 7. Stop postcards (17) — ★★★ for the six majors, ★★ for the rest

Now drawn as **single comic panels with a yellow caption box** naming the stop. 8:5, min
1600×1000. Each also as a **clean plate** (no caption) — `stops/<id>-plate.webp`.

Frame: *"A single comic-book panel with a thick black border, 8:5. A yellow caption box in the
top-left corner reads '[NAME]' in bold comic lettering. Scene: [SCENE]. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*

| id / filename | NAME | SCENE |
|---|---|---|
| `stops/las-cruces.webp` ★★★ | LAS CRUCES | the Organ Mountains' granite needles at sunrise behind an adobe plaza, strings of red chile ristras, a pecan orchard, a general store with an "OUTFITTER" sign and a chalkboard of prices |
| `stops/deming.webp` | DEMING | a chrome-and-neon roadside diner with a giant cartoon duck mascot on the roof, a "DUCK RACES" banner, big rigs in the lot, dust on the horizon |
| `stops/lordsburg.webp` | LORDSBURG | a wind-bent 1960s motel sign with half its bulbs out, a tumbleweed frozen mid-roll, a brown dust haze swallowing the road west |
| `stops/texas-canyon.webp` | TEXAS CANYON | enormous balanced granite boulders stacked impossibly, a tiny figure taking a photo of a boulder the size of a house |
| `stops/tucson.webp` ★★★ | TUCSON | a forest of saguaros with raised arms in front of a white mission church, purple mountains, an orange sky, an arrow-shaped sign reading "WEST" |
| `stops/picacho-peak.webp` | PICACHO PEAK | the notched volcanic peak at golden hour above a field of orange poppies |
| `stops/casa-grande.webp` | CASA GRANDE | a highway junction with a big green sign and a red-and-blue interstate "8" shield pointing west, cotton fields, an ancient adobe ruin under a modern steel roof |
| `stops/gila-bend.webp` | GILA BEND | a mid-century space-age motel with a rocket-shaped neon sign and a flying-saucer roof, a dry riverbed bridge, black lava hills |
| `stops/dateland.webp` | DATELAND | a roadside stand under tall date palms with a hand-painted "DATE SHAKES" sign, a frosty shake in a paper cup huge in the foreground |
| `stops/yuma.webp` ★★★ | YUMA | an old steel truss bridge over the wide green Colorado River, an adobe territorial prison on the bluff, a little paddle ferry, cottonwoods |
| `stops/center-of-the-world.webp` | CENTER OF THE WORLD | a small pink granite pyramid on a plaza with a bronze plaque, a maze of engraved granite walls, endless flat desert, one very serious sundial |
| `stops/imperial-dunes.webp` | IMPERIAL DUNES | knife-edged golden dunes with the highway half-buried, a dune buggy airborne off a crest with speed lines |
| `stops/el-centro.webp` ★★★ | EL CENTRO | a green "ELEVATION SEA LEVEL" sign on a post in the middle of flat green farm fields with a straight irrigation canal, heat lines everywhere |
| `stops/in-ko-pah.webp` | IN-KO-PAH | a mountain of piled tan boulders with a hand-built stone tower on top, a deep gravel runaway-truck ramp, the valley floor far below |
| `stops/jacumba.webp` | JACUMBA | a steaming hot-spring pool at a small desert resort at dusk, string lights, boulders, purple border hills |
| `stops/laguna-summit.webp` ★★★ | LAGUNA SUMMIT | tall pines at a mountain summit, a yellow "6% GRADE" sign, the road plunging toward a hazy coastal plain and a silver sliver of ocean |
| `stops/sunset-cliffs.webp` ★★★ | SUNSET CLIFFS | golden sandstone cliffs at the end of the road, white surf forty feet below, a green sign reading "END 8", a huge orange sun on the Pacific |

---

## 8. SFX lettering pack — ★★★ (pure comic; the game slams these on screen)

Each word as chunky comic sound-effect lettering, **CUTOUT** on neon-green #00FF00, 3:1 or 2:1,
min 2400 px wide. I vectorize these so they can scale and animate. Frame:

*"Comic-book sound-effect lettering of the single word '[WORD]' in huge chunky, tilted,
overlapping capital letters with a thick black outline, a second white outline, a hard black
drop shadow, and a [COLOR] fill with a subtle halftone; a small black speed-line burst behind
it; on a flat solid neon-green #00FF00 background; nothing else. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*

| filename | WORD | COLOR | Used for |
|---|---|---|---|
| `sfx/screech.png` | SCREEECH | yellow-to-orange | skids, storm choices |
| `sfx/krashh.png` | KRASHH | red | crashes, the grade |
| `sfx/vroom.png` | VROOOM | blue | departure, tailwind |
| `sfx/bang.png` | BANG! | red | flat tire |
| `sfx/hisss.png` | HISSSSS | white-to-gray | radiator |
| `sfx/snap.png` | SNAP! | orange | belt |
| `sfx/kaching.png` | KA-CHING! | green | store purchases |
| `sfx/zzz.png` | ZZZ | purple | rest day |
| `sfx/chomp.png` | CHOMP! | orange | snack run hits |
| `sfx/sploosh.png` | SPLOOSH | blue | river fording |
| `sfx/whoosh.png` | WHOOSH | tan | dust storm |
| `sfx/kraka-boom.png` | KRAKA-BOOM | purple-and-yellow | monsoon lightning |
| `sfx/rattle.png` | RATTLE RATTLE | green | snakebite |
| `sfx/beep-beep.png` | BEEP BEEP | yellow | tow truck |
| `sfx/wah-wah.png` | WAH-WAAAH | gray | deaths (sad trombone) |
| `sfx/hooray.png` | HOORAY! | rainbow | victory |

---

## 9. Billboards & signage — the marketing core — ★★★

Billboards scroll past roadside while driving — the loudest 8 West IT placement in the game.
3:1, min 2400×800, CUTOUT on neon-green #00FF00: a wooden-and-steel roadside billboard on two
posts seen slightly from below, drawn with thick ink outlines. Generate each **with text** and one
**blank-face plate** (`billboards/plate-blank.png`) for in-engine lettering.

Frame: *"A classic American roadside billboard on two steel posts seen slightly from below,
drawn with a thick black comic outline, on a flat solid neon-green #00FF00 background (no scene).
The billboard face design: [DESIGN]. Bold, flat, poster-simple, readable at a glance. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*

| filename | DESIGN (exact text in quotes) |
|---|---|
| `billboards/8westit-01.png` | white face, a huge red comic headline "WE FIX IT BEFORE IT BREAKS!" with a small red-and-blue interstate shield and "8 WEST IT 365" bottom right |
| `billboards/8westit-02.png` | dark navy face, a cartoon lighthouse throwing a yellow beam across it, headline in white "365 DAYS. ZERO FIRE DRILLS." and "8 WEST IT 365" |
| `billboards/8westit-03.png` | orange face, the white 8 West IT van with a cartoon laptop buckled into the passenger seat giving a thumbs-up, headline "YOUR IT, RIDING SHOTGUN." and "8 WEST IT 365" |
| `billboards/8westit-04.png` | styled exactly like a green highway guide sign with white capitals "NEXT EXIT: PEACE OF MIND" and a white arrow, small line "8 WEST IT 365 · 8WESTIT.COM" |
| `billboards/8westit-05.png` | white face, a cartoon padlock in sunglasses lounging on a beach chair, headline "RANSOMWARE? NOT ON OUR ROAD." and "8 WEST IT 365" |
| `billboards/8westit-06.png` | sky-blue face, a cartoon San Diego skyline and pier, headline "SAN DIEGO'S IT CREW. NOW SERVING THE WHOLE 8." and "8 WEST IT 365" |
| `billboards/8westit-07.png` | yellow face, three big green checkmarks beside "PATCHED. BACKED UP. BEACH-READY." and "8 WEST IT 365" |
| `billboards/8westit-08.png` | split face: a tidy cartoon server rack on the left, a perfect ocean sunset on the right, headline "MANAGED IT. UNMANAGED SUNSETS." and "8 WEST IT 365" |

**Subtle parent-company set** (★★, all CUTOUT, Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.):
- `signage/water-tower.png` — *"A small-town steel water tower on four legs with a round tank, faded white paint, the words '8 WEST' in weathered navy capitals around the tank and much smaller beneath, 'VENTURES', a little rust, a ladder up one leg, thick ink outlines, neon-green #00FF00 background."*
- `signage/ghost-sign.png` — *"The side wall of an old brick warehouse with a faded, peeling painted advertisement: '8 WEST VENTURES' in ghostly white block capitals with an old-fashioned interstate shield, half worn away, and a small fresh '8 WEST IT' sticker on the door below; thick ink outlines; neon-green #00FF00 background."*
- `signage/tow-truck.png` ★★★ — *"Side view of a chunky cartoon 1980s wrecker tow truck with a boom and hook, white with a red-over-blue fleet stripe, an amber light bar, the door reading '8 WEST IT' in bold navy with a small interstate shield and beneath it 'ROADSIDE DIV.', a tiny 'AN 8 WEST VENTURES COMPANY' line on the rear fender, thick ink outlines, neon-green #00FF00 background."*

**Highway signage kit** (★★, each CUTOUT, front-on, thick ink outlines, Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.):
`signage/shield-i8.png` (red-crown, blue-body interstate shield with white "8") · `shield-historic-80.png` (brown-and-cream "HISTORIC US 80" badge) · `guide-sign-blank.png` (blank green highway guide sign on two posts — **these become the Comic theme's buttons**) · `exit-sign.png` ("EXIT" with an arrow) · `mile-marker.png` (green post, white "8") · `sign-dust-storms.png` (yellow diamond "DUST STORMS MAY EXIST") · `sign-flash-flood.png` ("WATCH FOR FLASH FLOODS") · `sign-grade.png` (truck-on-slope, "6% GRADE") · `sign-runaway-ramp.png` ("RUNAWAY TRUCK RAMP") · `sign-sea-level.png` (green "ELEVATION SEA LEVEL") · `sign-end-8.png` (green "END 8" over a small shield) · `sign-outfitter.png` (hand-painted wooden "THE OUTFITTER" with ".85" chalked in a corner).

---

## 10. Event strips — ★★★ (this is where the comic *sings*)

Each event renders as a **three-panel comic strip**. Ask for the strip as one image: **3:1, min
3600×1200**, three equal panels with thick black borders and white gutters, **no speech balloons,
no captions** (the game letters them). Frame: *"A three-panel comic strip, 3:1, thick black panel
borders with white gutters, no speech balloons, no text. Panel 1: [P1]. Panel 2: [P2]. Panel 3:
[P3]. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* Use the crew descriptions from section 4 for named characters.

| filename | P1 / P2 / P3 |
|---|---|
| `events/flat-tire.webp` | the van cruising happily / close on a rear tire exploding with a burst of rubber and a startled face in the window / Ping and Bo wrestling a spare off the roof rack as a semi blurs past in a cloud of dust |
| `events/radiator.webp` | the van climbing a hill with a small puff from the hood / the hood popped and a HUGE white steam cloud, everyone's hair blown back / Ping holding a split rubber hose at arm's length like a dead snake, grimacing |
| `events/belt.webp` | under-the-hood close-up of a belt fraying / the belt snapping with a whip-crack motion line, sparks / Cache staring at the dead dashboard lights with spiral eyes |
| `events/sushi.webp` | a gas-station cooler under buzzing fluorescents with one sad tray of sushi and a "2 FOR $8.85" sticker / Bo grinning with the tray, everyone else recoiling / Bo green-faced clutching his stomach in the back of the van, the others holding their noses |
| `events/heatstroke.webp` | blinding noon at a rest-stop ramada, heat lines everywhere / Hank slumped on a bench, tongue out, a cartoon sun laughing overhead / Rosa pouring a blue water jug over his head, steam rising |
| `events/snake.webp` | shade under a rest-stop bench, two glowing eyes / a coiled diamondback lunging with a RATTLE motion blur at a sneaker / Sol hopping on one foot clutching his ankle, hat flying |
| `events/speed-trap.webp` | the van blazing down the highway, speed lines, everyone's cheeks rippling / a highway patrol cruiser with lights bursting in the mirror / a trooper in a campaign hat writing a ticket while Wes smiles innocently at the wheel |
| `events/thief.webp` | a neon "VACANCY" motel at night, the van asleep in the lot / a hooded figure tiptoeing away with a blue water jug and a sack of food / the crew at dawn staring at the open side door, Dot checking her clipboard in horror |
| `events/ransomware.webp` | a truck-stop booth at night, a laptop showing a red padlock and a countdown / a stranger in a leather vest leaning in, "I know computers" energy / Cache paying him $185 with a face like a funeral |
| `events/wrong-turn.webp` | a lonely dirt crossroads with three unmarked roads and a crooked sign / Rosa and Sol arguing over an unfolded map on the hood, buzzards circling / the van driving back the way it came, everyone slumped |
| `events/tailwind.webp` | a straight empty highway, a cartoon wind with puffed cheeks blowing from behind / the van rocketing forward with every window down, hair streaming, Piper leaning out with her camera / a green mile-marker whipping past in a blur |
| `events/pecan-stand.webp` | a roadside farm stand under a cottonwood with sacks of pecans and red chiles / a smiling older woman in an apron handing over a paper bag and waving off the cash / the van pulling away with a mountain of pecans in the back and Bo already eating |
| `events/historic-80.webp` | a weathered brown "HISTORIC US 80" shield on a bent post beside a cracked, abandoned two-lane road / the crew standing quietly at the old road, wildflowers in the cracks, golden light / Hank taking off his hat, moved, while Kit rolls his eyes |
| `events/dust-storm.webp` | the van tiny as a colossal brown dust wall rises behind it / inside the van, everyone's faces pressed to the rear window in horror / the wall swallowing the road, the van's taillights the last thing visible |
| `events/monsoon.webp` | a purple-teal thunderhead with a lightning bolt over the desert / a wash running with fast brown floodwater across the highway / the van stopped at the water's edge, Wes at the wheel weighing it, rain sheeting |
| `events/tow-truck.webp` | the van dead on the shoulder, hood up, the crew sitting in a sad row on the bumper / the white 8 West IT wrecker (see tow truck description) pulling up at golden hour, light bar flashing / the tow driver leaning out with a thumbs-up and a red jerry can |
| `events/siphon.webp` | night on the shoulder, the crew huddled in blankets, a big rig's running lights approaching / a kindly trucker crouched with a siphon hose and a red jerry can / the van's gauge needle creeping up one notch, five tiny relieved faces |
| `events/memorial.webp` | the crew gathered by the roadside at dusk, heads bowed / a small white cross made of lath with a chrome hubcap nailed to its center, plastic flowers, a single work boot / the van pulling away smaller, one taillight, first stars |
| `events/snack-stand.webp` | a roadside taco stand at sunset with a hand-painted menu and a smoking grill / Kannon at the counter shouting an order with motion lines, the vendor scribbling fast / the crew staggering back to the van under a comically enormous tower of paper plates |
| `events/dexcom.webp` ★★★ | inside the moving van, Kannon in the back seat glancing at his phone as it buzzes, the small round sensor visible on the back of his arm, a blue circle on his shirt / the van pulled off on a wide desert shoulder, Kannon sitting on the open tailgate with a juice box, Wes checking her watch, the rest of the crew hovering a respectful distance away / Kannon rolling his eyes with a thumbs-up, the phone in his other hand showing an arrow pointing up, everyone relaxing (no readable numbers on the phone) |
| `events/date-shake.webp` (P2) | tall date palms and a hand-painted "DATE SHAKES" sign / a frosty shake in a paper cup, sweating, huge in frame / Marge with a blissed-out face and a milk mustache |
| `events/river-ford.webp` (P2) | the van at the bank of the wide green Colorado, everyone leaning forward / the van halfway across with water at the doors, a bow wave, a fish flying past / the van climbing out the far side pouring water from every seam, a catfish in the roof rack |
| `events/river-ferry.webp` (P2) | a little paddle ferry with a hand-painted fare sign at the landing / the van riding the ferry, a ferryman in a straw hat pulling a cable, Kit dangling his feet over the side / the far shore, cottonwoods, the ferryman waving |
| `events/dunes-closure.webp` (P2) | sand blowing across the highway between huge golden dunes / a "ROAD CLOSED" barricade half buried, the van's wipers going / the crew playing cards on the dashboard while the dunes creep closer |
| `events/hot-springs.webp` (P2) | a steaming natural pool at dusk under string lights / the whole crew soaking with towels on their heads, Hank in a rubber duck float / stars out, the van parked among boulders, snoring Zs |
| `events/runaway-ramp.webp` (P2) | the van hurtling down a mountain grade, brakes smoking, Wes's eyes huge / the van veering onto a gravel runaway-truck ramp, gravel exploding / the van nose-deep in gravel, everyone flung forward, Bo still holding his taco |
| `events/the-grade.webp` (P2) | the yellow "6% GRADE" sign at the summit, the road plunging away / the van dropping downhill between boulders and pines, brake lights glowing, a sliver of ocean below / the crew white-knuckled, Piper filming anyway |
| `events/old-80.webp` (P2) | the faded "US 80" shield on a post at a narrow old two-lane fork / the van creeping along the cracked mountain road at dusk, boulders looming, no guardrail / headlights on, an owl watching from a pine |

---

## 11. Splash pages (full-screen moments) — ★★★

16:9, min 2560×1440, drawn as a single dramatic full-page comic splash. No text unless noted.

| filename | Prompt |
|---|---|
| `scenes/outfitter.webp` | *"A comic splash of the inside of a sun-drenched desert general store: wooden shelves of canned food, stacked blue water jugs, red jerry cans, tires and belts on pegboard, a brass cash register, a chalkboard price list where every price ends in '.85', a ceiling fan, a bearded shopkeeper in suspenders leaning on the counter, big front windows showing the white van outside. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `scenes/loading.webp` | *"A comic splash at dawn outside a general store: the five default crew (Wes, Dot, Cache, Sol, Piper) loading the white van — Wes on the roof strapping water jugs, Bo-style Sol carrying a cooler, Dot checking a clipboard, Cache clutching a coffee, Piper already photographing — long shadows, the Organ Mountains pink behind. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew."* |
| `scenes/tucson.webp` | *"A comic splash: the white van cresting a rise as a valley of saguaros opens below, every arm out every window, a white mission glowing far off, purple mountains, orange light, a giant 'halfway there' feeling. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `scenes/yuma-decision.webp` | *"A comic splash from the riverbank: the wide green Colorado River, a shallow ford marked with stakes on the left, an old steel truss bridge in the center distance, a little paddle ferry with a fare sign on the right, storm clouds building upstream, the van at the water's edge, the crew looking at each other. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `scenes/laguna-decision.webp` | *"A comic splash from a mountain summit at dusk: the road forks — left, the interstate plunges downhill past a '6% GRADE' sign with brake-light red glow; right, a narrow old two-lane road winds among boulders past a faded 'US 80' shield; below both, a hazy coastal plain and a thin silver Pacific under an orange sky. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `scenes/victory.webp` ★★★ | *"A triumphant comic splash at Sunset Cliffs: the white van parked at the very end of the road on golden sandstone cliffs, doors flung open, and the five crew caught mid-air in a joyous cliff jump toward the blue Pacific forty feet below — arms and legs everywhere, a hat flying, Hank in a cannonball, Piper snapping a selfie on the way down — white surf, gulls, a huge orange sun on the water, speed lines, a green 'END 8' sign at the road's end. Leave the upper-left sky clear for lettering. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew."* |
| `scenes/victory-night.webp` ★★ | same as victory *"...an hour later: the crew wrapped in towels around a bonfire on the cliff top, the van's headlights off, a sky full of stars and a big cartoon moon, the ocean glittering below."* |
| `scenes/memorial.webp` | *"A quiet comic splash at dusk: a small white roadside cross with a chrome hubcap at its center, plastic flowers, the empty highway stretching to a purple horizon, one distant pair of taillights, the first stars. Leave the center-left empty for lettering. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `scenes/game-over.webp` ★★ | *"A darkly funny comic splash: the white van abandoned on the shoulder at noon, hood up, doors open, a vulture wearing sunglasses perched on the roof rack, heat lines, a mile marker, nothing else for a hundred miles. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |

---

## 12. Comic page furniture — ★★ (mostly CSS/SVG; these are my references)

| filename | Prompt |
|---|---|
| `furniture/paper.png` (tileable, 2048²) | *"A seamless, tileable texture of slightly off-white aged comic-book newsprint paper with a very faint halftone dot pattern and tiny fiber specks, no other marks. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `furniture/halftone.png` (tileable, 1024²) | *"A seamless tileable pattern of evenly spaced small black halftone dots on solid white, medium density, crisp edges."* |
| `furniture/burst.png` (1:1, CUTOUT) | *"A comic-book radial speed-line burst: thin black lines radiating from an empty center to the edges, on a flat solid neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `furniture/balloon-sheet.png` (reference only, 16:9) | *"A reference sheet of empty comic-book speech balloons on white: a round speech balloon with a tail, a jagged shout balloon, a wobbly whisper balloon, a cloud-shaped thought balloon, a rectangular yellow caption box with a black border, a burst balloon for sound effects, all with thick black outlines, no text."* |
| `furniture/panel-corners.png` (reference) | *"A reference sheet of hand-inked comic panel borders on white: a straight rectangular panel, a tilted action panel, a jagged broken panel, a rounded flashback panel, all thick black brush lines."* |

---

## 13. UI icon reference — ★★ (I draw the final SVGs)

`icons/reference-sheet.png`, 1:1, min 2048×2048:
```
A clean comic-style icon sheet, 5 by 5 grid on white, each icon a simple flat cartoon object with
a thick black outline and one bright fill color, readable at 24 pixels: a canned-food case, a blue
water jug, a red jerry can, a tire, a serpentine belt, a radiator hose, a dollar bill, a boxy white
van, a wrench, a turtle (steady pace), a hare (strenuous), a rocket (grueling), a full plate, a
half plate, an empty plate, a smiling sun (mild), a sun with heat waves (hot), a bursting
thermometer (scorching), a dust cloud, a storm cloud with lightning, a bed, a taco, a folded map,
a heart, a skull in a cowboy hat. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets.
```

---

## 14. Heritage theme extras — ★

- `heritage/crt-bezel.png` (CUTOUT screen area): *"A beige 1980s computer monitor bezel seen straight on filling the frame, rounded screen corners, a power LED and a brightness knob lower right, scuffs and a faded inventory sticker, the whole screen area flat solid neon-green #00FF00, drawn with thick ink outlines. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*
- `heritage/toggle-heritage.png` (1:1 CUTOUT): *"A tiny comic icon of a beige 1980s computer monitor with a glowing green screen, thick outline, neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*
- `heritage/toggle-comic.png` (1:1 CUTOUT): *"A tiny comic icon of a rolled-up comic book with a 'POW!' burst on its cover, thick outline, neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."*

---

## 15. Audio — ★ (prompts for Suno / Udio / ElevenLabs — not Copilot M365)

| filename | Prompt |
|---|---|
| `audio/title-loop.mp3` | *"Instrumental, 120 BPM, 90 seconds, seamless loop: bright 1970s cartoon-mystery-theme energy — bouncy bass, wah guitar, Hammond organ stabs, brass hits, hand claps, a surf-rock lead — playful, spooky-fun, road-trip ready. No vocals."* |
| `audio/travel-day.mp3` | *"Instrumental, 110 BPM, 2 minutes, seamless loop: upbeat cartoon road-trip groove with a chugging guitar, bongos, organ, a whistled melody, the feeling of a van full of friends. No vocals."* |
| `audio/travel-night.mp3` | *"Instrumental, 90 BPM, 2 minutes, seamless loop: spooky-fun cartoon suspense — walking bass, vibraphone, a theremin wobble, soft bongos, a distant owl. No vocals."* |
| `audio/victory.mp3` | *"Instrumental, 130 BPM, 45 seconds: a triumphant cartoon finale with a full brass fanfare, crashing surf cymbals, hand claps, and a final ringing major chord with a splash. No vocals."* |
| `audio/death-sting.mp3` | *"A 4-second comic-tragic sting: a sad muted trumpet 'wah-wah-wah-waaah' with a slide whistle falling underneath."* |
| `audio/sfx/*.mp3` | cartoon engine start (cough, sputter, roar) · tire BANG with a spring boing · cash register ka-ching · brass shop bell · typewriter clack and ding · radiator hiss with a kettle whistle · rattlesnake rattle · thunder roll · wind with sand · seagulls and surf · tow-truck backup beep · laptop error boop · van door slam · slide whistle up · slide whistle down · crowd "HOORAY" · cannonball splash |

---

## 16. Video — ★ (prompts for a video generator)

- `video/intro.mp4` (+ .webm), 6 s, 16:9, ≤ 3 MB: *"Six-second animated comic-book sting: a red-and-blue interstate shield with a white '8' slams down with a 'KRASHH' burst; the white 8 West IT van (boxy 1980s van of no real make, red-over-blue stripe, roof rack) skids in from the left with a 'SCREEECH' and stops beneath it, five cartoon friends bouncing inside; the words 'THE 8 WEST TRAIL' pop on in chunky yellow comic lettering with a black outline; a small caption box reads '8 WEST IT PRESENTS'. Bold black ink outlines, flat cel colors, halftone, motion lines."*
- `video/billboards-loop.mp4`, 10 s seamless: *"Seamless side-scrolling comic-book animation: a desert highway rolls right to left past saguaros and a green guide sign, a roadside billboard reading 'WE FIX IT BEFORE IT BREAKS! — 8 WEST IT 365' slides past, parallax between road, scrub, and purple mountains, thick ink outlines, flat cel colors."*

---

## 17. Marketing & web extras — ★★ (because this *is* the marketing tool)

| filename | Spec | Prompt |
|---|---|---|
| `marketing/hero-tile.png` | 16:9, min 1600×900 | *"A comic panel for a website tile: the white 8 West IT van racing toward an orange sunset on a desert highway, a giant interstate '8' shield in the sky, speed lines, room top-left for a headline. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `marketing/cover-02.png` … `cover-05.png` | 2:3, min 2000×3000 | Variant covers for social/share cards (masthead area left clear): *"...No. 2: the van fording the Colorado River with a catfish in the roof rack"* · *"No. 3: the van tiny before a colossal dust wall"* · *"No. 4: the crew cliff-jumping at Sunset Cliffs"* · *"No. 5: a roadside memorial at dusk, the crew with hats off"* — each *"Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint. Original cartoon character in classic comic-book style: bold ink outlines, big expressive eyes and eyebrows, exaggerated body language, flat cel colors with hard two-tone shading, simple readable silhouette, consistent with the other 8 West Trail crew."* |
| `marketing/social-square-01.png` | 1:1, 1080² | *"A comic-book panel: the white 8 West IT van under a giant saguaro with the crew leaning out every window, a yellow caption box reading 'CAN YOU MAKE IT TO THE BEACH?' and a small strip reading '8WT.8WESTIT.COM'. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `marketing/social-square-02.png` | 1:1 | *"A comic panel styled as a giant green highway guide sign reading 'YOU HAVE DIED OF GAS-STATION SUSHI' in white capitals with a white arrow, and small '8WT.8WESTIT.COM'. Deadpan. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `marketing/social-story.png` | 9:16, 1080×1920 | *"A vertical comic page in three stacked panels: the van tiny beneath a towering dust wall; the crew's terrified faces at the rear window; a yellow caption box at the bottom reading 'PLAY THE 8 WEST TRAIL'. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `marketing/sticker-sheet.png` | 4:3, 2400×1800, white | *"A die-cut comic sticker sheet: the interstate '8' shield, the white 8 West IT van, a taco, a rattlesnake in sunglasses, a padlock on a beach chair, a 'SCREEECH' sound effect, a skull in a cowboy hat, a blue water jug, a date shake, a green sign reading 'NEXT EXIT: PEACE OF MIND', a tiny 'AN 8 WEST VENTURES COMPANY' badge — each with a thick white die-cut border. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |
| `marketing/email-header.png` | 3:1, 1800×600 | *"A wide comic panel: the white 8 West IT van at the edge of Sunset Cliffs at sunset, a green 'END 8' sign, empty sky on the right for text. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style shield. Never teal or green, never flowers, never psychedelic paint."* |
| `marketing/leaderboard-badge.png` | 1:1 CUTOUT | *"A gold-and-navy enamel-pin badge shaped like an interstate shield with a laurel wreath and a star, blank center, thick ink outline, neon-green #00FF00 background. Saturday-morning comic-book illustration: bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue #5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original van. No gradients, no painterly texture, no photorealism, no speech balloons, no text unless specified. Same illustrated universe as the other 8 West Trail assets."* |

---

## 18. Priority order if you're doing this in evenings

1. **A2 cover No. 1**, **B van-clean + van-skid + van-hero**, **the five default crew model
   sheets (Wes, Dot, Cache, Sol, Piper)**, **SFX: SCREEECH, KRASHH, BANG!, KA-CHING!** — one
   evening, and the game already *looks* like a comic.
2. **Billboards 01–08**, **regions 01, 04, 12**, **victory splash**.
3. **Event strips**: flat-tire, sushi, dust-storm, tow-truck, memorial, snack-stand.
4. The rest of the regions, postcards, crew, strips, and the marketing kit.
5. Everything ★ whenever the mood strikes.

Every slot has a placeholder until then. Send me anything as it lands — I'll key it out,
vectorize what needs vectorizing, tune colors to the bible, and wire it in.

---

## 19. Additions (added after the list was first written — work these when you reach the end)

New slots that came out of gameplay changes. Same rules as everything above.

### 19.1 · Kannon's Dexcom strip — `events/dexcom.webp` ★★★
Three-panel event strip, 3:1, min 3600×1200, thick black panel borders with white gutters, no
speech balloons, no text, no readable numbers on any screen. Use Kannon exactly as drawn in
`crew/07-model.png` (short curly brown hair faded at the sides, black tee with the small blue
circle, black jeans, black-and-white skate shoes, the small round sensor on the back of his upper
arm) and Wes as drawn in `crew/01-model.png`.
```
A three-panel comic strip, 3:1, thick black panel borders with white gutters, no speech
balloons, no text. Panel 1: inside the moving van, Kannon in the back seat glancing down at a
phone that is buzzing with little motion lines, the small round sensor visible on the back of
his upper arm, the blue circle on his black tee, desert blurring past the window. Panel 2: the
white van pulled off on a wide desert shoulder, Kannon sitting on the open rear tailgate calmly
drinking a juice box, Wes beside him checking her watch, the rest of the crew hovering a
respectful distance away pretending not to hover, a saguaro, big sky. Panel 3: Kannon rolling
his eyes with a thumbs-up, the phone in his other hand showing only a big arrow pointing up (no
numbers), everyone visibly relaxing, Wes grinning. Saturday-morning comic-book illustration:
bold, uniform black ink outlines; flat, saturated cel-shaded colors with simple hard-edged
two-tone shadows; exaggerated cartoon proportions and big expressive faces; dynamic low or
tilted camera angles; motion lines, speed lines, and dust puffs for action; a subtle
halftone-dot texture in the shadows; clean bright backgrounds. Palette: ink black, interstate
red #C41E2A, ocean-wave blue #1F8FD6, sunflower yellow #FFC72C, lime green #7AC143, sky blue
#5BC0EB, hot orange #F58220, grape purple #6A4C93, white. Original characters and an original
van. No gradients, no painterly texture, no photorealism. Same illustrated universe as the other
8 West Trail assets. The van: a boxy 1980s cargo van of no real make or model drawn with bold
ink outlines and slightly cartoon-squashed proportions, big round friendly headlights, a WHITE
body with a wide red-over-blue racing stripe along the beltline, chrome bumpers, a roof rack
carrying two blue water jugs and a spare tire, a slightly sagging rear end, and a magnetic door
sign reading "8 WEST IT" in bold navy capitals beside a small red-and-blue interstate-style
shield. Never teal or green, never flowers, never psychedelic paint.
```

### 19.2 · Kannon's headshot, moods, and poses — `crew/07.png`, `07-rough.png`, `07-critical.png`, `07-poses.png` ★★
Already covered by the section 4 frames — just make sure slot 07 uses **Kannon** (above), not
the retired Sky description, and keep him consistent with `crew/07-model.png`.

### 19.3 · Note on backgrounds
The game's art pipeline now keys the neon-green #00FF00 background out automatically (only green
touching the border is removed, so lime-green plants and shirts inside a drawing are safe). Keep
generating cutouts on solid #00FF00 exactly as before.
