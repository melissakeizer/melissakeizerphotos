# Homepage layout studies

Preview routes: `/previews/homepage/1/` through `/previews/homepage/6/`.
The main homepage now uses `OpeningSpread.astro`, shared with preview 5.
Preview 6 preserves the previous composition in `HomepageView.astro`, including
its two feature treatments and supporting row. To restore that layout, render
`HomepageView` from `src/pages/index.astro` again (it supplies its own Layout).

Shared heading and paragraph tokens live in `src/styles/typography.css`; the
`Heading.astro` component and `/typefaces/` reference use the same scale.

## Future editorial control

Melissa would like a local editing control on post cards (a star or “Make featured”
action on hover, with an equivalent touch/keyboard control) to choose the homepage's
featured posts. Build this separately after choosing the homepage composition.
Save selections explicitly rather than coupling them to publication date or random
rotation. The public site should not expose editing controls.
