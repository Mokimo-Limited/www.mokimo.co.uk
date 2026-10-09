# mokimo-web

Source for the [Mokimo](https://www.mokimo.co.uk) website. A small Jekyll
site: HTML/CSS/JS source pages; Jekyll applies the shared layouts and
includes when it publishes the site.

## Local Jekyll build (Docker)

No Ruby, Bundler, or gems need to be installed on the host. The local
previews use the `jekyll/jekyll:latest` image and read this repository's
`_config.yml` automatically.

Build the deployable site entirely inside a temporary container directory:

```sh
docker run --rm \
  --volume "$PWD:/srv/jekyll" \
  --workdir /srv/jekyll \
  jekyll/jekyll:latest \
  jekyll build --disable-disk-cache --destination /tmp/_site
```

Preview the site locally, rebuilding it as files change:

```sh
docker run --rm --name jekyll-preview \
  --publish 8000:4000 \
  --volume "$PWD:/srv/jekyll" \
  --workdir /srv/jekyll \
  jekyll/jekyll:latest \
  jekyll serve --host 0.0.0.0 --disable-disk-cache --destination /tmp/_site
```

Then open <http://localhost:8000>. Both commands put generated files in
`/tmp/_site` inside the container, so the working tree stays clean.

A second long-running preview, `jekyll-preview-concept`, serves the same
repository on port **8002** and is routed publicly through Caddy at
`webpreview.mokimo.co.uk` (see `/home/tom/network/reverse-proxy/`) — a
convenient way to check the site on a phone or share a draft.

## Structure

```
_config.yml            Jekyll config
_layouts/default.html  Single layout: head → header → content → footer
_layouts/case.html     Case-study page layout
_includes/             head / header / footer / case-card fragments
index.html             Homepage
story/                 Story page
work/                  Work hub + case-study pages
contact/ privacy/ terms/
styles/core.css        Loaded on every page
styles/pages/          Per-page stylesheets (opted in via extra_css)
scripts/               Per-page JS, referenced at the end of <body>
_data/cases/           Case-study content, one JSON file per card
images/                Site images
```

## CSS conventions

- **`styles/core.css`** is loaded on every page via `_includes/head.html`.
  It holds everything page-agnostic: design tokens, reset, typography,
  layout primitives (`.container`, `.section`), reusable components
  (`.btn`, `.badge`, `.card`, `.case-print`), header and footer.
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
homepage carousel and the work hub via `_includes/case-card.html` (edit
the card in one place). To add one, copy an existing file, bump the
numeric prefix, and edit the fields:

| Field       | Purpose |
|-------------|---------|
| `type`      | `case` (default), `article`, or `photo` — sets the card variant and link text; `photo` cards open the image in an in-page lightbox |
| `slug`      | URL slug — makes the card a link to `/work/<slug>/` (not used by `photo`) |
| `draft`     | `true` = card renders unlinked with a "Coming soon" footer |
| `featured`  | `true` = shown in the homepage carousel (cases only; the hub always lists everything) |
| `title`     | Card heading (all types, photos included) |
| `image`     | Photo path, shown in the pinned-postcard print |
| `image_alt` | Alt text for the photo |
| `caption`   | Mono caption on the print's white strip — keep it short, it renders on one line |
| `tags`      | Footer tag labels — homepage carousel only (decoration); the hub omits them |

The numeric filename prefix sets the hub's card order: interleave types
when adding entries so the wall stays mixed.

### Case-study pages

Each case with a `slug` links to a page at `work/<slug>/index.html`, built
with `layout: case` (see `_layouts/case.html` and `work/bikestow/` for the
pattern). The layout renders the shared template — breadcrumb, badge,
heading, lede, tags and a pinned hero print — from front matter fields
(`client`, `lede`, `image`, `image_alt`, `caption`, `tags`), and the page
body holds the narrative. Page styles live in `styles/pages/case.css`
(shared by all case pages).

## Adding a page

1. Create `<slug>/index.html` with `layout: default` front matter.
2. Create `styles/pages/<slug>.css` for page-specific layout and reference
   it via `extra_css`.
3. Reuse `core.css` primitives (`.section`, `.card`, `.btn`, `.badge`)
   before defining anything new.
4. Add the page to the nav links in `_includes/header.html` and
   `_includes/footer.html` as appropriate.

## Deployment

Hosted on GitHub Pages at [www.mokimo.co.uk](https://www.mokimo.co.uk).
Pushing `main` publishes the site.