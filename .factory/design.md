# Orderly Chaos visual thesis

## Direction

Orderly Chaos uses a **surreal balance archive**: an impossible museum storeroom
where six odd exhibits rest on a giant brass balance. The scene gives the
ordering problem a physical setting, while the game board uses flat paper
labels, stamped shapes, and direct controls. It should feel like handling a
carefully kept collection, not using a generic dashboard.

The interface stays single-theme and explicitly paints every surface. A second
theme would weaken the printed-archive metaphor; strong contrast and reduced
motion are provided within this treatment.

## Tokens

- `paper` `#f4eddf`: page background
- `paper-raised` `#fffaf0`: game surface
- `ink` `#172b3a`: primary text and outlines (12.4:1 on paper)
- `ink-muted` `#52616a`: secondary text (5.5:1 on paper)
- `vermilion` `#b63c2e`: decisions and selection (5.1:1 on paper)
- `brass` `#9b6c20`: measurement marks and clue edges
- `moss` `#2e6a4f`: success
- `danger` `#9d2c35`: loss and errors
- `night` `#0d202c`: footer and image plate

Spacing follows an 8 px rhythm, with 4 px only inside compact marks. Corners
are clipped or lightly rounded (2–12 px), like mounted catalogue labels. Cards
are reserved for independent exhibits and the active game surface.

## Type

The display face is Georgia, a local system serif with editorial character.
The body and controls use the system sans stack. No font files or third-party
font requests are needed. Headings are sparse; data and comparison counts use
tabular figures.

## Interaction grammar

Selecting an exhibit presses its paper label inward and adds a numbered stamp.
The second selection spends one comparison and draws a clue line. Reordering
uses explicit “toward lightest” and “toward heaviest” buttons, so the game does
not depend on drag precision or color. Every status change is repeated in
plain text and an `aria-live` region.

## Motion policy

New clue lines draw from the compared objects over 220 ms. Exhibit movement is
a 180 ms transform/opacity transition. Nothing loops. Under
`prefers-reduced-motion` or the in-game reduced-motion setting, transitions
become instant. The logic clock uses a clamped fixed 60 Hz update and pauses in
hidden tabs; rendering follows `requestAnimationFrame`.

## Difficulty curve

Each case has six objects, one free relation, and nine comparison tokens. The
free case uses distinct shapes and direct wording. The paid pack adds denser
starting layouts and varied exhibit sets, but never changes the controls. The
information limit is fair: one known binary relation reduces the 720 possible
orders enough for a nine-comparison worst-case decision tree.

## Generated scene prompt

Use case: `stylized-concept`

Asset type: wide landing-page and social-preview illustration.

Primary request: An impossible museum archive built around a monumental brass
balance holding six eccentric, clearly fictional objects: a paper moon, a
ceramic spiral, a glass seed, a folded copper bird, a stone ribbon, and a small
wooden comet.

Scene/backdrop: Tall blue-black archive shelves recede into a quiet vaulted
room; cream catalogue papers float in orderly layers around the scale.

Style/medium: Tactile editorial illustration, cut-paper shapes with subtle
gouache grain and precise engraved brass lines. Not photorealistic.

Composition/framing: 3:2 landscape. Balance centered slightly right. Calm,
uncluttered negative space at upper left. Readable at a small thumbnail.

Lighting/mood: Warm museum work-light against deep ink-blue recesses. Curious,
focused, and calm.

Color palette: Warm paper, ink blue, restrained vermilion, aged brass, and
moss green.

Constraints: Six objects only. Original fictional objects. No people. No
letters, numbers, labels, words, logos, or watermark.

Avoid: gradients, glossy 3D, neon, generic app imagery, recognizable brands,
text artifacts, symbols that resemble a real institution, busy edges.

## Asset provenance

`assets/src/balance-archive.png` and its optimized derivatives are generated
for this product with the Param Factory image model on 2026-09-06 from the
prompt above. Generated imagery is disclosed in the footer. All interface
marks and icons are original CSS/SVG work in this repository.
