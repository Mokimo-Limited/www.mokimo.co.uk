# `next/` — concept website

This directory is a standalone Jekyll site: a side-loaded redesign of the
Mokimo website, previewed separately from the live site. It is excluded from
the live build (see `../_config.yml`) and is not referenced by anything in
`../`.

**Note on git coverage:** this repository also contains the previous website
content (everything under `services/website/` outside this directory). That
is the old site, kept only for reference/history — it is not part of this
concept site and can be ignored when working in `next/`.

## Previewing

Served by the `jekyll-preview-concept` Docker container on port **8002**
(the live site preview runs on 8000, erpnext-mcp on 8001). The full run
command, including resource limits, is documented in `_config.yml`.

## Structure

```
_config.yml            Jekyll config (standalone preview)
_layouts/default.html  Single layout: head → header → content → footer
_includes/head.html    <head>: fonts, core.css, per-page CSS, robots
_includes/header.html  Shared sticky header
_includes/footer.html  Shared footer
index.html             Homepage
story/                 Story page (secondary page)
styles/core.css        Loaded on every page
styles/pages/          Per-page stylesheets
scripts/               Per-page JS, referenced at the end of <body>
_data/cases/           Case-study content, one JSON file per card
images/                Site images
```

## CSS conventions

- **`styles/core.css`** is loaded on every page via `_includes/head.html`.
  It holds everything page-agnostic: design tokens, reset, typography,
  layout primitives (`.container`, `.section`), reusable components
  (`.btn`, `.badge`, `.card`), header and footer.
- **Page styles** live in `styles/pages/<page>.css` and are opted into via
  the page's front matter:

  ```yaml
  ---
  extra_css:
    - home
  ---
  ```

- Page stylesheets should only contain what that page needs on top of
  `core.css`. If a pattern starts being used by more than one page (a new
  card variant, a form style, a shared layout), move it up into `core.css`
  rather than duplicating it.

## Adding a case study

Case cards are generated from `_data/cases/*.json` — one file per case,
looped over (sorted by filename, hence the numeric prefixes) by the
homepage template. To add one, copy an existing file, bump the numeric
prefix, and edit the fields:

| Field          | Purpose                                        |
|----------------|------------------------------------------------|
| `type`         | `case` (default), `article`, or `photo` — sets the type marker and link text; `photo` cards link to the image itself |
| `slug`         | URL slug — makes the card a link to `/work/<slug>/` (not used by `photo`) |
| `featured`     | `true` = shown in the homepage carousel (cases only; the work hub always lists everything) |
| `title`        | Card heading (all types, photos included)      |
| `image`        | Photo path, shown full-frame in the card       |
| `image_alt`    | Alt text for the photo                         |
| `caption`      | Mono caption on the print's white strip — keep it short, it renders on one line |
| `tags`         | Footer tag labels — homepage carousel only (decoration); the hub omits them |

The include renders three variants: the **full card** on the homepage
carousel (kicker, print, title, description, tags, link), **compact cards**
on the hub (type marker, print, title, link), and hub photo entries as
**solo prints** — the pinned postcard straight on the page, no wrapper
card, title or link. The numeric filename prefix sets the hub's card
order: interleave types when adding entries so the wall stays mixed.

The carousel adapts to the number of files automatically.

### Work hub

`work/index.html` lists everything in `_data/cases/` as one mixed grid of
the same cards (via `_includes/case-card.html`, shared with the homepage
carousel — edit the card in one place). Cards are typed (`case`, `article`,
`photo`) so short notes and standalone photos can sit alongside full case
studies without each needing a write-up. The homepage carousel only shows
featured cases; the hub always shows all of them. Nav links for "Selected
Work" point at the hub.

### Case-study pages

Each case with a `slug` links to a page at `work/<slug>/index.html`, built
with `layout: case` (see `_layouts/case.html` and `work/bikestow/` for the
pattern). The layout renders the shared template — breadcrumb, badge,
heading, lede, tags and a pinned hero print — from front matter fields
(`client`, `lede`, `image`, `image_alt`, `caption`, `tags`), and the page
body holds the story-like narrative. Page styles live in
`styles/pages/case.css` (shared by all case pages); the `.case-print` /
`.case-pin` / `.case-tag` component styles live in `core.css` because both
the homepage and the case pages use them.

## Adding a page (e.g. project case studies)

1. Create `<slug>.html` with `layout: default` front matter.
2. Create `styles/pages/<slug>.css` for page-specific layout and reference
   it via `extra_css`.
3. Reuse `core.css` primitives (`.section`, `.card`, `.btn`, `.badge`)
   before defining anything new. Case-study pages will mostly need their
   own article/case layout styles; the shared scaffolding is already
   covered.
4. Add the page to the nav links in `_includes/header.html` and
   `_includes/footer.html` as appropriate.
