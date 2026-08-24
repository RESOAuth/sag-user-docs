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
- **No central session revocation.** There is no store to revoke sessions in.
  Sessions expire; they cannot be killed.
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
