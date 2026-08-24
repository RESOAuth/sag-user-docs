# SAG documentation

The documentation site for [Smart Access Gateway](https://github.com/RESOAuth/smart-access-gateway),
an identity proxy by [RESOAuth Ltd](https://resoauth.dev).

Built with [Docusaurus](https://docusaurus.io). The content is Markdown; the
only reason there is a build step at all is versioning and search.

## Running it

```sh
npm install
npm start          # http://localhost:3000, reloads as you edit
```

```sh
npm run build      # production build into build/
npm run serve      # serve that build, to check it before pushing
npm run typecheck  # the config and sidebars are TypeScript
```

The build **fails on a broken internal link**, so `npm run build` is the link
checker as well. CI runs it on every pull request.

## What is where

| Path | What it holds |
| --- | --- |
| `docs/` | The unreleased version, served at `/next` |
| `docs/hosted/` | Using the gateway RESOAuth® runs at `auth.resoauth.cloud` |
| `docs/self-host/` | Deploying SAG yourself |
| `docs/reference/` | Environment variables, endpoints, claims |
| `docs/_snippets/` | Markdown partials shared between pages |
| `versioned_docs/` | Cut releases. Do not edit by hand unless fixing that release |
| `docusaurus.config.ts` | Site configuration, including versioning |
| `sidebars.ts` | Four sidebars, each generated from its folder |

## Adding a page

Add a Markdown file to the right folder under `docs/`. Give it frontmatter:

```md
---
sidebar_label: "Short label"
sidebar_position: 3
description: "One sentence, used for search results and link previews."
---

# The full title
```

The sidebar is generated from the folder, so there is nothing else to update.

Link between pages with **relative paths including the `.md` extension**:

```md
See the [configuration reference](../reference/configuration.md).
```

This matters. Docusaurus resolves those per version, so a link written this
way keeps the reader inside the version they are reading. An absolute path
such as `/reference/configuration` silently sends them to the default version
instead.

To reuse a block of Markdown, put it in `docs/_snippets/` with a leading
underscore and import it into an `.mdx` page:

```mdx
import Endpoints from '@site/docs/_snippets/_endpoints.md';

<Endpoints />
```

## Versioning

The site is keyed by SAG release, in the way Bootstrap's documentation is.
Readers get a version picker, and an old version says so at the top of every
page.

When SAG cuts a release:

```sh
npm run cut-version -- 0.2
```

That snapshots `docs/` into `versioned_docs/version-0.2/` and adds it to
`versions.json`. `docusaurus.config.ts` reads that file, so nothing else needs
editing: 0.2 becomes the default, `docs/` goes back to being the unreleased
`/next`, and 0.1 starts serving a "no longer maintained" banner on its own.

Update the `announcementBar` text in `docusaurus.config.ts` if you want to say
something about the release. Its `id` is derived from the version, so readers
who dismissed the last notice will still see the new one.

Fixing a typo in a released version means editing the file under
`versioned_docs/`. Editing `docs/` only changes what the next release will say.

## Where the content comes from

This site covers **using** SAG: connecting an application, deploying it, and
every configuration switch. It deliberately does not carry the reasoning
behind the software. Limitations, decision records, RFCs, and the
post-quantum discussion stay in
[`docs/` in the SAG repository](https://github.com/RESOAuth/smart-access-gateway/tree/main/docs)
and are linked to, not copied.

Pages under `self-host/` and `reference/` did begin as files in that folder.
They are copies rather than a live import, because this site is versioned per
release and the code repository is not. When SAG changes, port the change here
as part of cutting the version.

The `hosted/` section has no counterpart in the code repository and is
maintained only here.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Enable Pages
for the repository with "GitHub Actions" as the source; there is no `gh-pages`
branch.

The site URL lives in two places that must agree: the `SITE_URL` and
`SITE_BASE_URL` environment variables in the deploy workflow, and the defaults
at the top of `docusaurus.config.ts`. For a custom domain, set both to the new
host with a base URL of `/`, and add a `static/CNAME` file containing the
hostname.

## Style

British English, Oxford commas, hyphens rather than em-dashes. Short sentences
and plain words, without simplifying the technical content or reaching for
analogies. Match the voice already in the files rather than introducing a new
one.

More detail, and the conventions that are easy to get wrong, are in
[AGENTS.md](AGENTS.md).

## Licence

Documentation is CC BY 4.0. SAG itself is AGPL-3.0.
