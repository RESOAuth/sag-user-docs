---
sidebar_label: "Tokens and claims"
sidebar_position: 6
description: "What comes back from a successful sign-in: the id_token claims, the acr and amr values, profile claims, and why there are no refresh tokens."
---

# Tokens and claims

A successful exchange at `/token` returns an `id_token` and a short-lived
access token. This page is what is inside them, and what you can rely on.

Verify the `id_token` against `/.well-known/jwks.json` before reading a single
claim from it.

## Claims that are always there

| Claim | What it is |
| --- | --- |
| `iss` | The issuer. Check it matches exactly |
| `sub` | The person, stable for as long as their email address is |
| `aud` | Your `client_id`. Check it |
| `exp`, `iat` | Expiry and issue time |
| `auth_time` | When they actually authenticated, which may be earlier than `iat` |
| `nonce` | The value you sent. Check it |
| `acr` | How strongly they authenticated. See below |
| `amr` | What they actually did. See below |
| `sid` | The session, so you can tell two sign-ins apart |

With the `email` scope you also get `email` and `email_verified`.

## What `sub` is, and is not

`sub` is derived from the verified email address. It is stable, it is not the
address itself, and it is not the upstream provider's identifier for that
person.

Two consequences worth designing around:

- **A person who changes email address becomes a different `sub`.** SAG knows
  they control an address. It has no way to know that yesterday's address and
  today's belong to the same human, because it has no user database to record
  that in.
- **Moving a domain from email codes to Microsoft does not change `sub`.**
  The address is the same, so the subject is the same. This is exactly why it
  is derived from the address rather than the upstream.

If your application needs an identity that survives an address change, keep
your own identifier and let the person link a new address to it. The full
reasoning is in
[ADR 0011](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0011-subject-derived-from-the-verified-address.md).

## `acr`: how strong the sign-in was

Three values, weakest to strongest:

| `acr` | Meaning |
| --- | --- |
| `urn:sag:acr:email-otp` | A code sent to their address |
| `urn:sag:acr:federated` | An upstream identity provider signed them in |
| `urn:sag:acr:federated-mfa` | The upstream reported multi-factor |

These are not decoration. You can demand a minimum and have the request
refused if it cannot be met: see
[asking for a stronger sign-in](./assurance.md).

## `amr`: what actually happened

Short tokens rather than URNs. SAG's own values are `otp`, `email`, `fed`, and
`mfa`; `pwd`, `hwk`, and `swk` are recognised when an upstream reports them.

- An email code produces `["otp", "email"]`.
- A federated sign-in produces `["fed", ...]` plus whatever the upstream
  reported, with `"mfa"` added when the upstream indicated multi-factor.

Values SAG does not recognise are passed through untouched rather than
dropped, within a bound on how many and how long they may be. Treat `amr` as
descriptive. If you want to *enforce* something, use `acr`.

## Profile claims

With the `profile` scope, and only when an upstream actually provides them:
`name`, `given_name`, `family_name`, `preferred_username`, `picture`, and
`locale`. A deployment may narrow that list further.

Two things to know:

- **`profile` is only advertised when it can be filled.** If the instance has
  no upstream configured, the scope does not appear in discovery at all. Read
  discovery rather than assuming.
- **A guessed name is labelled as a guess.** Where a deployment infers a name
  from the address rather than relaying one, the token carries
  `urn:sag:name_inferred: true` alongside it. Inference is off by default.
  Never present an inferred name as verified.

There is no email-code path to a real name, because there is nothing to relay:
a mailbox proves an address, not a person. See
[profile claims](../reference/profile-claims.md).

## The access token

Short-lived, and scoped to `/userinfo` only. It is not a general-purpose API
token, and it is not for your own APIs. Mint your own for those.

## There are no refresh tokens

`offline_access` is accepted and produces nothing. This is a deliberate
choice, not an omission: a refresh token is long-lived credential state, and
storing or revoking it is exactly the database SAG does not have.

What this means in practice: when your session expires, send the person to
`/authorize` again. If they still have a SAG session, it is a redirect they
barely notice. If they do not, they sign in.

The reasoning is in
[ADR 0005](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0005-no-refresh-tokens.md), and a proposal to
back refresh tokens with the upstream token is written up as
[RFC 0002](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/rfcs/0002-refresh-tokens-backed-by-upstream.md).

## Signing algorithms

Read `id_token_signing_alg_values_supported` from discovery. SAG's signing
layer is algorithm-agile and can publish more than one algorithm at once, so a
deployment can offer a post-quantum ML-DSA key alongside ES256 and let relying
parties migrate one at a time. See
[post-quantum](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/post-quantum.md).

Use your library's JWKS handling and let it pick by `kid`. Do not hard-code an
algorithm.
