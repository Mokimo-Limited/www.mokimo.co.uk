# mokimo-web

Source for the [Mokimo](https://www.mokimo.co.uk) website. It is a small Jekyll site with HTML/CSS/JS source pages; Jekyll applies the shared layouts and includes when it publishes the site.

## Local Jekyll build (Docker)

No Ruby, Bundler, or gems need to be installed on the host. The existing local preview uses the `jekyll/jekyll:latest` image and reads this repository's `_config.yml` automatically.

Build the deployable site entirely inside a temporary container directory:

```sh
docker run --rm \
  --volume "$PWD:/srv/jekyll" \
  --workdir /srv/jekyll \
  jekyll/jekyll:latest \
  jekyll build --disable-disk-cache --destination /tmp/_site
```

Preview the site locally, rebuilding it as files change. This is the command used by the running `jekyll-preview` container:

```sh
docker run --rm --name jekyll-preview \
  --publish 8000:4000 \
  --volume "$PWD:/srv/jekyll" \
  --workdir /srv/jekyll \
  jekyll/jekyll:latest \
  jekyll serve --host 0.0.0.0 --disable-disk-cache --destination /tmp/_site
```

Then open <http://localhost:8000>. Stop the preview with `Ctrl-C`. Both commands put generated files in `/tmp/_site` inside the container, so the working tree stays clean.

### Site structure

- `_config.yml` contains the site metadata and Jekyll settings.
- `_layouts/default.html` provides the outer page frame.
- `_includes/` contains reusable header, head, and footer fragments.
- Page directories contain `index.html` files with YAML front matter. Keep that front matter so Jekyll processes the page and applies its layout.
- `styles/`, `scripts/`, and `images/` are static assets copied into the generated site.

## Deployment
Hosted on GitHub Pages at [www.mokimo.co.uk](https://www.mokimo.co.uk).
