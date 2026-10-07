# Project mascots

CapyBrain uses a tan capybara. OpenSensor.Space uses a blue and teal peacock.
The final transparent assets are `public/mascots/capybara.webp` (768 × 768,
107,578 bytes) and `public/mascots/peacock.webp` (768 × 768, 191,142 bytes).
They were generated with the built-in image-generation tool, then resized and
encoded as WebP for the static site. Generated originals remain in the local
image-generation archive; the website uses only the committed WebP files.

`lib/brand.ts` owns each project's mascot asset, alternative text and greeting; homepage project previews, strategic goals and full covers all read this registry. `components/shared/project-mascot.tsx` owns each character's narrative and accepts a project identity. `app/globals.css` owns the shared scene and finite animation. Replace
artwork at those references without changing the controls or narrative. Preserve
alpha, square dimensions and full-character framing. The capybara's tan/brown
colors come from the `capybrain` project override in `lib/brand.ts`; OpenSensor
keeps the blue/teal sensing family. Scientific data colors remain independent.

Both characters have a short greeting and thought-bubble reveal. Visitors select
story steps or replay the greeting; nothing advances automatically. Reduced
motion disables entrances, pointer movement and SVG path drawing. These are
illustrated guides, not simulated sensor measurements or scientific results.

## Capybara generation prompt

> Create an original capybara mascot for CapyBrain, a thoughtful research website about people, places and urban wellbeing. Asset: one full-body character cutout with genuine transparent background, no ground plane, no scenery, no words. Premium playful 3D clay illustration, matte tactile clay with subtle short-fur texture, refined editorial design rather than toy packaging. A recognizably capybara-shaped animal: broad long rectangular rounded muzzle, tiny round ears high on head, small kind dark eyes, stout barrel body and short legs, no visible tail. Warm tan #C69A70 and caramel #D8B784 fur, chocolate brown #745139 details. Sitting in a relaxed pose, three-quarter view facing slightly left, curious gentle expression, one front paw very subtly raised. Natural animal anatomy with friendly stylization, not a bear, beaver or hamster, no human clothing, no hats, no brain sticking out. Entire animal with comfortable padding around ears and feet. Soft studio light, soft self-shadows only, clear silhouette that reads at 200px. Square composition. Transparent background.

## Peacock generation prompt

> Create an original peacock mascot for OpenSensor.Space, an environmental sensing and open-data project. One full-body character cutout with genuine transparent background, no scenery, no ground plane and no words. Friendly premium 3D character illustration with tactile feather detail and soft studio light, matching the gentle expressive style of a capybara companion mascot. A male peacock with a graceful cobalt and sapphire-blue neck and head, small upright crown feathers, intelligent kind eyes, blue-green body, and an elegant partly fanned emerald and teal tail with recognizable turquoise, sapphire and warm-gold eye spots. Natural bird anatomy with friendly stylization; tiny beak, visible feet, not humanoid. Facing slightly left in a three-quarter view, standing calmly, wings folded. Tail makes a pleasing semicircle around the body and stays fully inside the image. Clear balanced silhouette that reads well at 250px, 10% clear padding, full bird and complete feather tips visible. No clothes, props, text, border, logo or watermark. Square composition; genuinely transparent background.
