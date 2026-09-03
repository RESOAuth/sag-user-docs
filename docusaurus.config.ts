import fs from 'node:fs';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

// Where the built site will be served from. Override both when moving to a
// custom domain: SITE_URL=https://sag.resoauth.dev SITE_BASE_URL=/ npm run build
// (and add a static/CNAME file containing the hostname).
const url = process.env.SITE_URL ?? 'https://sag.resoauth.dev';
const baseUrl = process.env.SITE_BASE_URL ?? '/';

// Cut versions, newest first, straight from the file Docusaurus maintains.
// Reading it here rather than repeating the number means `npm run cut-version
// -- 0.2` is the whole release process: 0.2 becomes the default, and 0.1
// starts serving a "no longer maintained" banner of its own accord.
const releases: string[] = fs.existsSync('./versions.json')
  ? JSON.parse(fs.readFileSync('./versions.json', 'utf8'))
  : [];
const currentRelease = releases[0];

const config: Config = {
  title: 'Smart Access Gateway',
  tagline: 'One OpenID Connect endpoint in front of whatever the person already has',
  favicon: 'img/resoauth-logo.svg',

  future: { v4: true, faster: true },

  url,
  baseUrl,
  organizationName: 'RESOAuth',
  projectName: 'sag-user-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  i18n: { defaultLocale: 'en-GB', locales: ['en-GB'] },

  markdown: {
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      // Offline search. No account, no third-party service, no request leaving
      // the reader's browser - which is the only kind that suits a site about
      // an identity gateway.
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        indexBlog: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/RESOAuth/sag-user-docs/edit/main/',
          showLastUpdateTime: true,

          // Versioning, Bootstrap-style. `current` is the unreleased work in
          // docs/ and is served under /next with a banner saying so. Each cut
          // release lives in versioned_docs/. Anything older than
          // `lastVersion` gets an "unmaintained" banner automatically, which
          // is the behaviour we actually wanted from this.
          ...(currentRelease
            ? {
                lastVersion: currentRelease,
                versions: {
                  current: {
                    label: 'Next (unreleased)',
                    path: 'next',
                    banner: 'unreleased' as const,
                  },
                  [currentRelease]: { label: currentRelease, banner: 'none' as const },
                },
              }
            : {}),
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
        sitemap: { lastmod: 'date', changefreq: null, priority: null },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    docs: { sidebar: { hideable: true, autoCollapseCategories: true } },

    // Site-wide notice. Change `id` whenever the text changes, otherwise a
    // reader who dismissed the previous one never sees the new one.
    ...(currentRelease
      ? {
          announcementBar: {
            // Bump the id whenever the text changes, or a reader who dismissed
            // the previous notice never sees the new one.
            id: `release-${currentRelease}`,
            content: `SAG ${currentRelease} is the current release. Upgrading from an earlier one has <a href="${baseUrl}self-host/upgrading">a few things to check</a>. Unreleased work is under <a href="${baseUrl}next/">Next</a>.`,
            backgroundColor: 'var(--sag-announcement-bg)',
            textColor: 'var(--sag-announcement-fg)',
            isCloseable: true,
          },
        }
      : {}),

    navbar: {
      title: 'SAG',
      logo: { alt: 'RESOAuth', src: 'img/resoauth-logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'hosted', position: 'left', label: 'Use the hosted gateway' },
        { type: 'docSidebar', sidebarId: 'selfHost', position: 'left', label: 'Deploy your own' },
        { type: 'docSidebar', sidebarId: 'reference', position: 'left', label: 'Reference' },
        { type: 'docSidebar', sidebarId: 'support', position: 'left', label: 'Support' },
        {
          href: 'https://github.com/RESOAuth/smart-access-gateway/tree/main/docs',
          label: 'Design notes',
          position: 'left',
        },
        { type: 'docsVersionDropdown', position: 'right' },
        { href: 'https://github.com/RESOAuth/smart-access-gateway', label: 'GitHub', position: 'right' },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Use it',
          items: [
            { label: 'The hosted gateway', to: '/hosted/' },
            { label: 'Connect an application', to: '/hosted/connect' },
            { label: 'Client ID Metadata Documents', to: '/hosted/client-id-metadata' },
          ],
        },
        {
          title: 'Run it',
          items: [
            { label: 'Quickstart', to: '/self-host/quickstart' },
            { label: 'Deployment', to: '/self-host/deployment' },
            { label: 'Upgrading', to: '/self-host/upgrading' },
            { label: 'Configuration reference', to: '/reference/configuration' },
          ],
        },
        {
          title: 'Get help',
          items: [
            { label: 'Contact', to: '/support/' },
            { label: 'Custom instances and professional services', to: '/support/custom-instances' },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Design notes and decisions',
              href: 'https://github.com/RESOAuth/smart-access-gateway/tree/main/docs',
            },
            { label: 'SAG on GitHub', href: 'https://github.com/RESOAuth/smart-access-gateway' },
            {
              label: 'Contributing',
              href: 'https://github.com/RESOAuth/smart-access-gateway/blob/main/CONTRIBUTING.md',
            },
            {
              label: 'Reporting a vulnerability',
              href: 'https://github.com/RESOAuth/smart-access-gateway/blob/main/SECURITY.md',
            },
            {
              // OpenSSF Best Practices evidence, kept next to the code so
              // there is one copy. Add the badge image here once the project
              // has an entry at bestpractices.dev to link to.
              label: 'Project practices',
              href: 'https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/best-practices.md',
            },
            { label: 'RESOAuth', href: 'https://resoauth.dev' },
          ],
        },
      ],
      copyright: `SAG is AGPL-3.0. © ${new Date().getFullYear()} RESOAuth Ltd, registered in England and Wales, company number 15175188.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'toml', 'yaml', 'ini', 'nginx', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
