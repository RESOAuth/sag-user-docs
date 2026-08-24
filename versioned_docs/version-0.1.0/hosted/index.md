---
sidebar_label: "The hosted gateway"
sidebar_position: 1
description: "RESOAuth runs SAG at auth.resoauth.cloud. Point an OpenID Connect application at it and you never hold a password or run a user database."
---

# The hosted gateway

RESOAuth Ltd runs an instance of SAG at `auth.resoauth.cloud`. It is the same
open-source software described in the rest of this site, operated for you.

Use it when you want sign-in working this afternoon and would rather not own
the keys, the patching, or the pager.

## What you get

- **One OpenID Connect issuer.** `https://auth.resoauth.cloud`. Any standard
  OpenID Connect library can talk to it. There is nothing SAG-specific to
  install.
- **Sign-in by whatever the person already has.** They type their email
  address. If their domain uses Microsoft or Google, they go there. If it does
  not, SAG emails them a one-time code. They are never asked to choose a
  provider from a wall of buttons.
- **No password to store.** SAG never handles one, so neither do you.
- **No registration step, if you want none.** A
  [Client ID Metadata Document](./client-id-metadata.md) lets your application
  describe itself at a URL you control. Nothing is registered anywhere.
- **Honest authentication strength.** The `acr` and `amr` claims say what
  actually happened. If you demand multi-factor and it did not happen, the
  request is refused rather than quietly answered with an email code. See
  [asking for a stronger sign-in](./assurance.md).

## What it costs you architecturally

SAG issues identity tokens. It is not a user directory, an authorisation
server for your own APIs, or a place to store profile data. It tells you that
somebody controls an email address, and how confident it is about that. What
you do with the person after that is your application's job.

There are no refresh tokens. The access token SAG issues is short-lived and
works against `/userinfo` only. The reasoning is in
[ADR 0005](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0005-no-refresh-tokens.md), and the effect on your
application is covered in [tokens and claims](./tokens-and-claims.md).

## Current status

The hosted gateway is operated by RESOAuth Ltd. Two things are worth knowing
before you plan around it:

- **Only public clients are supported today.** Publish a
  [Client ID Metadata Document](./client-id-metadata.md), which needs nothing
  from RESOAuth® at all. There is no manual registration route, and
  self-service client management is planned but not built. See
  [beyond a public client](./registering.md) if your application needs more.
- **Check the service description before relying on it commercially.** The
  limits, availability, and support arrangements that actually apply to you
  are the ones in your agreement with RESOAuth, not the defaults on this site.
  [Service limits](./service-limits.md) describes the defaults.

If you would rather not depend on any of that, everything here also works on
[your own deployment](../self-host/quickstart.md). The software is the same,
and so are the documents describing it.

## Where to go next

| If you want to | Read |
| --- | --- |
| Connect an application now | [Connect an application](./connect.mdx) |
| Avoid registering anything | [Client ID Metadata Documents](./client-id-metadata.md) |
| Need more than a public client | [Beyond a public client](./registering.md) |
| Know what the person will see | [The sign-in experience](./sign-in.md) |
| Know what comes back | [Tokens and claims](./tokens-and-claims.md) |
| Demand multi-factor | [Asking for a stronger sign-in](./assurance.md) |
| Know the limits | [Service limits](./service-limits.md) |
