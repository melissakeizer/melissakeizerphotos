# Adding a story or gallery

Start by copying the Markdown file that most closely resembles the new post in `src/content/stories/`. Use a readable filename: it becomes the web address.

Every post needs a title, date, order, categories, cover image, photos, description, and a `type`.

## Narrative story

Use `type: "story"` for an editorial piece with a full or split hero, text sections, and intentional photo groupings. The body is the existing JSON section format; copying a similar story is the safest approach.

## Photo gallery

Use `type: "gallery"` when the post is a compact introduction followed by photos. Galleries never show a hero image.

```yaml
type: "gallery"
galleryLayout: "fitted-grid"
coverImage: "/photos/my-new-gallery/000-cover.jpg"
photos:
  - "/photos/my-new-gallery/001-photo.jpg"
```

`fitted-grid` is the Exposure-style responsive photo grid. Use `horizontal` only when the intended experience is a swipeable horizontal gallery. The cover is automatically included as the first gallery photo, so do not repeat it in `photos`.

## Images and checks

Put images under `public/photos/<story-slug>/` and reference them with paths beginning `/photos/`. Before publishing, run:

```sh
npm run check:content
npm run build
```

The content check catches missing images and layout metadata. New posts should have a real publication date; `date: null` is reserved for the older Exposure galleries where no date was available.
