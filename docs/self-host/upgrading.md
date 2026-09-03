---
sidebar_label: "Upgrading"
sidebar_position: 7
description: "How to move a deployment from one SAG release to the next, what a rolling upgrade does to sessions, and the specific things to check when going from 0.1.0 to 0.2.0."
---

# Upgrading

SAG keeps no database, so an upgrade is a new build of the same software
reading the same environment variables. There is nothing to migrate. What
changes between releases is the set of variables, and occasionally what a
default means.

Releases use semantic versions matching this site's version picker. A patch
release fixes the release it is numbered from. A minor release may add a
variable, change a default, or retire a variable. A major release may remove
one for good.

## The routine

1. **Read the release notes.** Every release lists its changes in
   [the changelog](https://github.com/RESOAuth/smart-access-gateway/blob/main/CHANGELOG.md)
   and on
   [the releases page](https://github.com/RESOAuth/smart-access-gateway/releases).
2. **Read this page for that version.** Switch the version picker to the
   release you are moving *to*; anything needing a decision from you is below.
3. **Deploy one instance first**, if you run more than one, and read its
   start-up warnings.
4. **Check `/healthz`** on it before letting traffic at it. It answers whether
   that instance can actually sign somebody in, which `/alive` does not. See
   [Operations](operations.md).

### Containers

```sh
docker compose pull && docker compose up -d
```

Pin the tag you deploy rather than tracking `latest`, so an upgrade is
something you did rather than something that happened. See
[Pre-built images](docker.md#pre-built-images).

### Cloudflare Workers and AWS Lambda

Redeploy the new version the way you deployed the old one. Both are
stateless, so the previous version stops being used once the new one is live;
neither keeps anything an upgrade could corrupt. See
[Deployment](deployment.md).

## What an upgrade does to signed-in people

Sessions, in-flight sign-ins, and authorisation codes are encrypted values
held by the browser rather than rows in a store, and they are sealed with
`SAG_SECRET`. Keep the secret the same across the upgrade and every one of
them survives it.

Two things do interrupt people, and both are worth timing deliberately:

- **A change to the session cookie's name** means the browser's cookie is no
  longer the one SAG looks for. Everybody signs in once more. The upgrade to
  0.2.0 is such a change; see below.
- **A rolling upgrade with instances of both versions live** can put a person
  on an instance that does not read what the other one wrote. Where a release
  changes a cookie, in-flight sign-ins on the version being retired fail and
  have to be started again. Nothing is lost beyond the sign-in in progress.

Rolling back is the same operation in reverse: deploy the previous version
with the same configuration. Anything the newer version issued that the older
one cannot read is discarded, which again means somebody signs in again.

## Moving from 0.1.0 to 0.2.0

Nine things to check. The first three change behaviour whether or not you do
anything.

### 1. Everybody signs in once more

In production the session cookie is now `__Host-sag_session`, or your own
`SESSION_COOKIE_NAME` with `__Host-` in front of it. The prefix is what makes
a browser refuse to let another application on a parent domain plant the
cookie, and it requires `Secure` and `Path=/`, which SAG now sets. Existing
cookies are not read under the new name, so every current session ends at the
moment you deploy. Development mode is unchanged.

### 2. Client ID Metadata Documents are off in production until you say otherwise

`CLIENTS_CIMD_ENABLED` defaulted to `true`. It now defaults to on in
development and **off** everywhere else, because accepting a client that
describes itself is a decision an operator should make out loud. If your
deployment has CIMD clients, set it before you upgrade:

```sh
CLIENTS_CIMD_ENABLED=true
```

Without that, every CIMD client stops being a client at all, which looks to
the application like an unknown `client_id`. Statically configured and
store-held clients are unaffected. See
[Relying parties](../reference/relying-parties.md).

### 3. A multi-tenant Microsoft upstream has to say which tenants it is for

An `UPSTREAM_MICROSOFT_<NAME>_CLIENT_ID` of the form `common:<client id>`
accepts any Microsoft tenant, and a tenant administrator sets their own
users' addresses. Such an upstream now refuses every sign-in until it is
bounded, by one of:

```sh
# The tenants you mean, checked against the tid Microsoft issues
UPSTREAM_MICROSOFT_COMMON_ALLOWED_TENANTS=11111111-2222-3333-4444-555555555555
```

or the `xms_edov` optional claim on the app registration, which has Entra say
per sign-in whether the tenant verified the domain of that address. The
address is also read from the `email` claim only, never `preferred_username`
or `upn`. A start-up warning says when the tenant list is missing, because SAG
cannot see your app registration. Domain-specific upstreams are unaffected -
their `CLIENT_ID` already names the domain. See
[Upstreams](../reference/upstreams.md).

### 4. `PROMPT_NONE_SHARED_SESSION` is gone

It was parsed and never read, so removing it changes no behaviour. Take it out
of your configuration anyway, where it is now ignored rather than read.
`prompt=none` follows `SESSION_SCOPE`: under `shared` a session can answer for
a relying party that never signed the person in itself, and under `rp` it
cannot. See [Configuration](../reference/configuration.md).

### 5. `/token` and `/userinfo` now answer cross-origin requests

Both carry CORS headers, defaulting to every origin, so a single-page
application can redeem its own code from the browser. Neither route depends
on the session cookie, which is why the default is what it is. To narrow it:

```sh
CORS_ALLOWED_ORIGINS=https://ledger.example.com
CORS_ENABLED=false                 # or turn it off entirely
```

Narrowing keeps your statically configured clients' own redirect URI origins
trusted alongside the list. A client that exists only in a store or as a
metadata document has to be named. See
[Configuration](../reference/configuration.md).

### 6. Signing out is per client when a client asks

A `/logout` carrying a `client_id` clears only that client's session cookie; a
`/logout` with no client named remains the global one where sessions are
shared. `post_logout_redirect_uri` must be registered for that client, and now
also has to satisfy `CLIENTS_REDIRECT_URI_SCHEMES` where you have narrowed it.
An expired or invented confirmation token no longer clears any cookie.

### 7. A state store now does more, and DynamoDB needs one more permission

With a store configured, SAG also makes `private_key_jwt` client assertions
single-use and records a signed-out session as revoked until its absolute
expiry, so a copied session cookie stops working. Both fail closed if the
store is unreachable.

On DynamoDB, the role needs `dynamodb:GetItem` alongside `dynamodb:PutItem`
and `dynamodb:UpdateItem`. Add it before upgrading, or the reads that check a
revocation fail and take the sign-in with them. See
[State and limits](state-and-limits.md).

### 8. Peered deployments: name each peer by its own hostname

A `PEER_JWKS_URLS` entry on the issuer's own origin is now refused at
start-up. It has to be each instance's own per-instance hostname, otherwise
the fetch lands on whichever instance the traffic manager currently prefers -
possibly the one doing the fetching. A peered deployment on the `memory` cache
backend is now warned about in the log, and `REQUIRE_PEER_JWKS_CACHE=true`
turns that into a refusal to start. Check the log of the first instance you
deploy. See [Multi-region](multi-region.md).

### 9. On Workers, drop `DNS_RESOLVER_URL`

The Cloudflare adapter now hands the runtime's own resolver to SAG, and a
Worker's `fetch` to a public DNS-over-HTTPS endpoint does not come back.
Setting `DNS_RESOLVER_URL` there overrides the resolver that works, and CIMD
clients then fail with "Could not resolve the client metadata host". Lambda
still uses DNS-over-HTTPS and still wants it. See
[Upstreams](../reference/upstreams.md).

### Worth adopting while you are there

- **Sealed environment variables.** Any value can be a reference into AWS KMS,
  Secrets Manager, or SSM instead of plain text, resolved once per instance
  before configuration is parsed. See
  [Configuration](../reference/configuration.md).
- **A short `SUBJECT_SALT` now warns.** Under 16 characters produces a
  start-up warning and nothing else, because changing the salt orphans every
  account at every relying party and is never done automatically. See
  [Operations](operations.md).
- **`SAG_SECRET` per issuer.** Sealed values are bound to their purpose but
  not to an issuer name, so two deployments must not share a secret.
- **`/healthz` reports `key_count` per peer**, which is the quickest answer to
  "why is this key missing from the JWKS".
