---
sidebar_label: "Deployment"
sidebar_position: 3
description: "One core, thin adapters. The same configuration variables mean the same thing everywhere. Whichever platform, two things are worth doing before you take..."
---

# Deploying SAG

One core, thin adapters. The same configuration variables mean the same thing
everywhere. Whichever platform, two things are worth doing before you take
traffic: configure a [state store](state-and-limits.md), and put a rate
limiting rule in front of `/authorize`. Once a state store is configured, set
`REQUIRE_STATE_STORE=true` as well: a later deployment that loses its store
configuration must refuse to start, not quietly lose single-use codes and OTP
send limits.

## Before any deployment

```sh
npm run keygen                          # ES256 and a master secret
npm run keygen -- --alg ES256,ML-DSA-44 # and a post-quantum key alongside
```

At a real hostname, set every value below once and keep it in a secret store.
`npm run keygen` supplies `SAG_SECRET` and, where a local key is used, the
private JWK. Generate `SUBJECT_SALT` separately with `openssl rand -base64 32`.
It is required even when subjects are public, and changing it later gives every
person a new `sub`.

At minimum:

```sh
SAG_ISSUER=https://id.example.com
SAG_SECRET=<from keygen>
SUBJECT_SALT=<openssl rand -base64 32, generated once>
SIGNING_PRIVATE_JWK=<from keygen, with a local signer or the Cloudflare HSM>
EMAIL_PROVIDER=ses            # or notify, mailchannels, smtp, cloudflare
EMAIL_FROM=Sign in <no-reply@id.example.com>
```

SAG refuses to start with a development default once the issuer is a real
hostname, and refuses an `http` issuer outright.

## Cloudflare Workers

Workers have no asymmetric key service, so the signing key lives in a second
Worker reached only over a service binding - a small private HSM. Deploy it
first. The HSM Worker must have no route and no `workers.dev` subdomain: the
service binding is its only intended entry point.

```sh
wrangler deploy --config adapters/cloudflare/wrangler.hsm.toml
wrangler deploy --config adapters/cloudflare/wrangler.toml
```

Secrets go in with `wrangler secret put`, never in the TOML. Generate a
separate high-entropy `HSM_SHARED_SECRET` with `openssl rand -base64 48`, and
enter the same value at both prompts. The private signing JWK belongs only in
the HSM Worker, not in the public-facing Worker:

```sh
# Main Worker
wrangler secret put SAG_SECRET --config adapters/cloudflare/wrangler.toml
wrangler secret put SUBJECT_SALT --config adapters/cloudflare/wrangler.toml
wrangler secret put HSM_SHARED_SECRET --config adapters/cloudflare/wrangler.toml
wrangler secret put MAILCHANNELS_API_KEY --config adapters/cloudflare/wrangler.toml

# Private HSM Worker
wrangler secret put HSM_SHARED_SECRET --config adapters/cloudflare/wrangler.hsm.toml
wrangler secret put SIGNING_PRIVATE_JWK --config adapters/cloudflare/wrangler.hsm.toml
```

Recommended extras:

- **State store**: Durable Objects. Add `STATE_STORE_BACKEND` and
  `REQUIRE_STATE_STORE` to the existing `[vars]` table, then add the Durable
  Object binding and migration. Do not create a second `[vars]` table. See
  [State and limits](state-and-limits.md).
- **Rate limiting**: a Cloudflare rate limiting rule on `/authorize*`, and a
  stricter one on `POST /authorize/email` and `/authorize/resend`.
- **Relying parties**: a KV namespace bound as `SAG_CLIENTS` when there are
  more than a handful.

## AWS Lambda

`adapters/lambda/handler.js` handles API Gateway HTTP API v2, function URLs
and the older v1 REST shape. Everything is `process.env`, so the configuration
is the same as anywhere else.

```sh
SIGNING_BACKEND=aws-kms
SIGNING_KMS_KEY_ID=arn:aws:kms:eu-west-2:123456789012:key/...
SIGNING_KMS_REGION=eu-west-2
```

With KMS the private key never exists in the function's memory. The execution
role needs `kms:Sign` and `kms:GetPublicKey` on that key and nothing else.

Recommended extras:

- **State store**: DynamoDB, one small table. See
  [State and limits](state-and-limits.md).
- **Rate limiting**: AWS WAF in front of API Gateway or the function URL, with
  a rate-based rule on `/authorize` and its sub-paths.
- **Mail**: SES in the same region, with `SES_CONFIGURATION_SET` if you want
  bounce and complaint handling.

## Containers, and anywhere else

`docker compose up`, or run `node adapters/node/server.js` behind whatever
proxy you already have. See [Docker](docker.md).

Behind a proxy, `SAG_ISSUER` must be the public URL: SAG never derives what it
is from a `Host` header on a real deployment, because that would let a header
decide what it claims to be.

Recommended extras:

- **State store**: `memory` for a single container, DynamoDB for several.
- **Rate limiting**: nginx `limit_req`, Caddy's `rate_limit`, or the load
  balancer's own, on `/authorize` and its sub-paths.

## After deploying, check

```sh
curl -s https://id.example.com/alive
curl -s https://id.example.com/healthz | jq
curl -s https://id.example.com/.well-known/openid-configuration | jq
```

`/alive` is an unconditional `200`, there to say a process is listening at
all. `/healthz` reports the signing backend, which algorithms are really
available, and safe configuration warnings. It deliberately does not report
whether the state store is configured, because that would expose which replay
and rate-limit defences are absent. [Operations](operations.md) explains how
to read it, how to rotate secrets and keys, and what to do after a suspected
compromise.

## More than one instance behind one issuer

Several regions, several clouds, or both, all answering as the same issuer,
is [Multi-region](multi-region.md): what has to be identical everywhere,
why most of it already works, and which health endpoint a failover check
should actually use.
