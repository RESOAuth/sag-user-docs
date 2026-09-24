---
sidebar_label: "Beyond a public client"
sidebar_position: 4
description: "The shared hosted gateway only supports public clients today, using a Client ID Metadata Document, with no manual registration step."
---

# Beyond a public client

The shared hosted gateway only supports public clients today: publish a
[Client ID Metadata Document](./client-id-metadata.md) and there is nothing
further to register.

There is no manual registration step, so a confidential client authenticated
by a shared secret, a scope allowlist, or a minimum `acr` floor that applies
to a client rather than a request are not available on the shared instance
yet. Self-service client management is planned.

If your application needs one of those,
[get in touch](../support/index.md) - a dedicated instance on your own domain
is one option.
