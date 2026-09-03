---
sidebar_label: "Service limits"
sidebar_position: 8
description: "Rate limits, availability, what the hosted gateway deliberately does not do, and when to run your own instead."
---

# Service limits

The defaults below describe how SAG behaves. What applies to you commercially
is whatever is in your agreement with RESOAuth®, which takes precedence over
this page.

## Rate limits

Sign-in is rate limited, and a refusal looks exactly like any other outcome:
the same screen, in the same time. You cannot detect a limit by probing, which
is the point.

Email codes are limited per address, not per session, so opening a new browser
does not reset anything:

- A cap on codes sent to one address within a window.
- A daily cap per address.
- A cap on guesses per code, and on resends.

Your application should treat a sign-in that does not complete as ordinary. Do
not retry automatically, and do not present "too many attempts" to the person,
because you will not reliably be told that is what happened.

The knobs behind these, for your own deployment, are the `OTP_SEND_*` and
`OTP_MAX_*` variables in the
[configuration reference](../reference/configuration.md), and the reasoning is
in [state and limits](../self-host/state-and-limits.md).

## Availability

`/healthz` reports whether an instance can actually sign somebody in, and
which version it is running. `/alive` reports only that a process is
listening. Both are public.

Do not poll `/healthz` from your application as a dependency check. If sign-in
is failing, your users are already telling you.

## What the hosted gateway does not do

These are properties of SAG itself, not gaps in the hosting:

- **No refresh tokens.** Send the person back to `/authorize`.
- **No central session revocation.** Signing out ends that session, including
  any copy of its cookie, but there is no operation that signs one person out
  of everything on demand: SAG keeps no index of a person's sessions.
- **No user database.** No profile storage, no groups, no roles. SAG tells you
  somebody controls an address, and how confident it is. Everything else is
  your application's.
- **No self-service client management yet.** Publish a
  [metadata document](./client-id-metadata.md) - the only route today. See
  [beyond a public client](./registering.md) if that does not fit.
- **No implicit or hybrid flow.** Authorisation code with PKCE only.

The complete list, each with the choice behind it and what would close it, is
in [limitations](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/limitations.md). It is worth reading before you
commit to anything.

## What you can and cannot expect of it, security-wise

Worth being explicit, because "identity" invites assumptions:

- **What a sign-in proves.** That somebody controlled a mailbox, or that
  Microsoft or Google said they authenticated the person - and, in the `acr`
  and `amr` claims, which of those it was. SAG relays an upstream's claim of
  multi-factor; it cannot audit it. See
  [asking for a stronger sign-in](./assurance.md).
- **What SAG holds.** No password, ever, and no user database. A session is an
  encrypted cookie rather than a row somewhere.
- **What is yours.** Verifying the `id_token` signature, `iss`, `aud`, `exp`,
  and `nonce` on every sign-in, and deciding what your application lets that
  person do. A token that arrived over TLS is not a verified token.
- **The gaps, written down.** Every limitation is listed with the choice
  behind it and what would close it, in
  [limitations](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/limitations.md).
- **Reporting a weakness.** Privately, through the process in
  [SECURITY.md](https://github.com/RESOAuth/smart-access-gateway/blob/main/SECURITY.md).
  Please do not open a public issue for one.

## When to run your own instead

Run your own if you need to:

- Configure upstream tenants for your own domains.
- Whitelabel the sign-in screens, or apply your own CSS.
- Keep sign-in inside a particular jurisdiction, network, or cloud account.
- Guarantee an upgrade window rather than take one.
- Change client registrations at the speed of your own deploy, without CIMD.

It is the same software, it needs no database, and the
[quickstart](../self-host/quickstart.md) has it running with no configuration
at all. Moving later is a change of issuer URL, but note that `sub` values are
derived per deployment, so plan for your users' subjects to change.

## Getting in touch

See [Support](../support/index.md) for contact details, and
[custom instances and professional services](../support/custom-instances.md)
if neither the shared gateway nor self-hosting fits.
