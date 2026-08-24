---
sidebar_label: "Client ID Metadata Documents"
sidebar_position: 3
description: "Use an https URL as your client_id and serve your own metadata there. Nothing is registered with anybody, because the URL is the identity."
---

# Client ID Metadata Documents

A Client ID Metadata Document, or CIMD, removes the registration step. Your
`client_id` is an `https` URL. That URL serves a small JSON document
describing your application. SAG fetches it when your application first
appears.

Nothing is registered anywhere, because the document's URL **is** the
identity. Only somebody who controls that origin can change what your
application claims to be.

## The shortest possible one

Serve this at `https://ledger.example.com/oauth-client`, with
`Content-Type: application/json`:

```json
{
  "client_id": "https://ledger.example.com/oauth-client",
  "client_name": "Ledger",
  "redirect_uris": ["https://ledger.example.com/auth/callback"]
}
```

Then use that URL as your `client_id`. That is the entire onboarding process.

## The four rules

SAG will refuse a document that breaks any of these. Together they are what
stops a published document sending authorisation codes somewhere else.

1. **The document must claim its own URL.** The `client_id` inside must equal
   the URL it was fetched from, exactly. A document cannot speak for a
   `client_id` it does not live at.
2. **Every redirect URI must share the document's origin.** Same scheme, host,
   and port. You cannot publish a document at your domain that redirects to
   somebody else's.
3. **No redirects while fetching.** SAG will not follow one. If it did, an
   open redirect anywhere on your origin would become a way to serve a
   document from elsewhere under your name.
4. **There is a size cap.** The document is small by nature, and a cap means a
   hostile or broken URL cannot be used to exhaust the fetcher.

## Such a client is public

The document is readable by anybody, so it can hold no secret. That is not a
limitation to work around; it is what the design says. SAG therefore requires
PKCE from a CIMD client whatever the document says about it.

If your application needs to authenticate at the token endpoint, publish a
`jwks` or `jwks_uri` in the document and use `private_key_jwt`. That is the
only way a self-describing client stops being public, and it is the right
answer for anything long-lived:

```json
{
  "client_id": "https://ledger.example.com/oauth-client",
  "client_name": "Ledger",
  "redirect_uris": ["https://ledger.example.com/auth/callback"],
  "token_endpoint_auth_method": "private_key_jwt",
  "jwks_uri": "https://ledger.example.com/oauth-client/jwks.json"
}
```

The private half never leaves your application, and no shared secret ever
crosses the wire.

## Fields worth setting

| Field | Why |
| --- | --- |
| `client_name` | Shown to the person: "Continue to Ledger". Set it, or they see a URL |
| `redirect_uris` | Required. Matched exactly |
| `post_logout_redirect_uris` | Where sign-out may return to |
| `tos_uri`, `policy_uri` | Your terms and privacy links, shown on the sign-in screens |
| `logo_uri` | Your logo, if the deployment displays one |
| `jwks_uri` or `jwks` | Only if you are using `private_key_jwt` |

## The one practical constraint

The `client_id` URL has to resolve to the same place twice: once for the
browser following a redirect, and once for SAG fetching the document
server-side. Anything that makes those two differ will break it.

In practice this catches people out with split-horizon DNS, a document behind
a VPN or an IP allowlist, or a local development hostname that only exists on
the developer's machine. If SAG cannot fetch the document from where it runs,
the client does not exist as far as SAG is concerned.

For local development against your own instance, run SAG and the relying party
where each can reach the other. The
[local stack](../self-host/local-stack.md) demonstrates exactly this, with a
CIMD client as one of four applications signing in.

## Caching, and changing the document

SAG caches a fetched document for a short period, so an edit is not
instantaneous. Adding a redirect URI is not a change to make five minutes
before you need it. On [your own deployment](../self-host/quickstart.md) the
cache lifetime is `CLIENTS_CIMD_CACHE_TTL`; on the hosted gateway it is
whatever RESOAuth® has configured.

## If CIMD does not fit

CIMD is not compulsory in general, but it is the only way to connect an
application to the shared hosted gateway today - there is no manual
registration route. See [beyond a public client](./registering.md) for what
that rules out, and how to ask about it.

On your own deployment, the same four ways of describing a relying party are
in the [relying parties reference](../reference/relying-parties.md), along
with every `CLIENTS_CIMD_*` switch that controls this behaviour.
