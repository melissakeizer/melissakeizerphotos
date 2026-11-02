# Website content ideas

Open the private board while the development server is running:

http://127.0.0.1:4322/melissakeizerphotos/content-board/

The board reads `ideas.json`. Moving cards or ticking Published saves their status
back to that file, so Melissa and Codex share the same plan across sessions.
The board and its notes are not rendered into the production site. `ideas.json`
is also ignored by Git so personal planning notes are not pushed to the public
repository. Keep a local backup of it alongside the photo originals.

New ideas and changes to their notes can be added to `ideas.json` during our work.
Ready means the material or finished page is ready for the next stage; Published
means it has actually been deployed, rather than merely built locally.

`A Few Favourites` is marked `draft: true` in its story file. Its source and photos
are retained for reuse, while its page and public listings are excluded.
