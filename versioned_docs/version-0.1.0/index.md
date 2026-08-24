---
sidebar_label: "Documentation home"
sidebar_position: 0
slug: /
description: "Smart Access Gateway is an identity proxy. It gives your application one OpenID Connect endpoint, and behind it uses whatever sign-in the person already has."
---

# Smart Access Gateway

SAG is an identity proxy rather than an identity provider. Your application
talks to one OpenID Connect endpoint. Behind that endpoint, SAG uses whatever
the person already has: a Microsoft account, a Google account, or a code sent
to their email address. You never hold a password, and you never run a user
database.

```
your app  ──OIDC──▶  SAG  ──OIDC──▶  Microsoft / Google
                      └────email───▶  a one-time code
```

There are two ways to use it, and this site covers both.

## Use the gateway RESOAuth® runs

RESOAuth operates SAG at `auth.resoauth.cloud`. Point your application at it,
and somebody else keeps the keys, the patches, and the uptime.

Start with [the hosted gateway](./hosted/index.md), then
[connect an application](./hosted/connect.mdx).

## Run your own

SAG is AGPL-3.0 and deploys to a Cloudflare Worker, an AWS Lambda, a
container, or a plain Node process from the same code. It needs no database.

Start with the [quickstart](./self-host/quickstart.md), which gets an instance
running with no configuration at all, then read the
[configuration reference](./reference/configuration.md) for every switch.

## Finding your way around

| Section | What is in it |
| --- | --- |
| [Use the hosted gateway](./hosted/index.md) | Connecting an application to `auth.resoauth.cloud` |
| [Deploy your own](./self-host/quickstart.md) | Running SAG yourself, on any of four platforms |
| [Reference](./reference/configuration.md) | Every environment variable, endpoint, and claim |

Each page belongs to a numbered version of SAG. The version picker is in the
top right. If you are reading an old version, the site says so at the top of
the page.

## Why SAG works the way it does

This site is about using SAG. The reasoning behind it is not copied here,
because it is already written down once, next to the code it describes:

- [Limitations](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/limitations.md)
  - what SAG does not do, the choice behind each gap, and what would close it.
  Worth reading before you commit to anything.
- [Decision records](https://github.com/RESOAuth/smart-access-gateway/tree/main/docs/adr)
  - one short record per decision, written when it was made and never edited
  to match what happened next.
- [RFCs](https://github.com/RESOAuth/smart-access-gateway/tree/main/docs/rfcs)
  - proposed, written up in enough detail to build from, not yet decided.
- [Post-quantum](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/post-quantum.md)
  - where the cryptography stands, and how a migration runs.

All of it is in
[the repository's docs folder](https://github.com/RESOAuth/smart-access-gateway/tree/main/docs).
