# OpenSensor story

## Style Prompt
One continuous illustrated workspace: moving air enters a sensor; readings become
small balls, then a tangible Parquet card with sample values. The same device and
card persist as the old ingestion detour is crossed out and files travel directly
to object storage. The browser reads those files. A secondary, proposed JSON/CSV
export branches toward OpenAQ. Object labels stay small; prose lives in the parent.

## Colors and type
Use the sensing palette passed by the parent. Quicksand / Cairo are local.
Blue and teal identify the shared scene; removal uses the supplied coral token.
The numbers in the measurement card are explicitly illustrative, not live data.

## Motion and layout
One paused, seekable 70-second GSAP timeline named `opensensor`. Objects persist;
there are no whole-scene crossfades or autoplay loops. Time 2 shows the common
server/database dependency; 12 captures locally; 22 exposes card contents; 32
removes the detour; 42 reads the archive; 52 shows proposed sharing; 62 holds the
compact direct route, with one final finite reading transfer through time 70.

Desktop is 1100 × 700. Phone reflows the same objects within a 600px-wide stage whose height contracts
with the narrative. Old services sit above local capture. Once they are removed,
the sensor, storage and browser settle into one straight row. A separate sharing
row sits below the object labels, with its connector outside their text zones.
The stored card uses a readable PARQUET motif rather than miniature sample rows.
A separate layout wrapper moves the file into storage without replacing it.
Responsive geometry derives from the current timeline time and viewport, including
when seeking backwards. Fit centers both horizontally and vertically.

## HyperFrames catalog references
- `arc-motion-path`: curved paths clarify transfer, adapted as finite SVG motion.
- `camera-rig-depth-stack`: CSS perspective file fan with a legible front card.
- `svg-stroke-trace`: measured strokes draw deliberate red removal marks.
- `orbit-card`: card-and-dots relationship, without the unrelated sphere or WebGL.

## Constraints
- No measured carbon/cost percentages or implication of deployed integration.
- OpenAQ branch is marked proposed; public API is not a POST endpoint.
- No vendor logos implying endorsement, remote fonts, CDN runtime or WebGL.
- Parent owns language, theme, cadence, scroll, reduced motion and connection demo.
