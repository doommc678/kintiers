# BlockTiers green-and-yellow redesign

## Changes
- Rename visible branding and page metadata from KinTiers to BlockTiers across every page.
- Replace the red/black styling with a dark Minecraft-inspired green and yellow gradient system, including buttons, glow, particles, cards, and focus states.
- Add decorative pixel-style Minecraft vines hanging from the upper-right without blocking navigation or content.
- Make every gamemode/category icon lift and enlarge in a polished popup effect on pointer hover and keyboard focus.
- Preserve existing data, server monitoring, admin access, rankings, and mobile layouts.

## Validation
- Check all pages for leftover KinTiers branding.
- Verify the main page and category selector at desktop and mobile sizes.
- Confirm the app builds cleanly and interactions remain usable with reduced-motion preferences.

## Technical details
- Use semantic theme tokens in the global stylesheet so the full interface adopts the new palette consistently.
- Implement vines as a lightweight decorative component and reuse the existing gamemode image assets.
