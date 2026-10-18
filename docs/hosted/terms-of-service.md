---
sidebar_label: "Terms of service"
sidebar_position: 10
description: "The terms for using RESOAuth's free shared sign-in gateway and Dynamic CIMD service."
---

# Terms of service for the hosted services

Last updated: 19 October 2026.

These terms cover the free shared sign-in gateway RESOAuth Ltd runs at
`auth.resoauth.cloud` and the Dynamic CIMD service at
`dynamic-cimd.resoauth.cloud`. They do not change the licences for the
open-source software you can run yourself. A separate agreement with RESOAuth
takes precedence if you have one.

## Free services, with no guarantee

You can connect an application to the shared gateway or use Dynamic CIMD to
generate a [Client ID Metadata Document](./client-id-metadata.md) URL without
paying us. We work to keep both services available and secure, but we do not
promise that they will always be available, uninterrupted, or suitable for a
particular purpose. We may change, limit, or stop either free service.

Your application remains responsible for checking the tokens it receives and
for deciding what a signed-in person may do. See
[Tokens and claims](./tokens-and-claims.md).

## Using Dynamic CIMD

Dynamic CIMD puts the metadata you provide in the generated URL and serves it
to anyone who requests that URL. Do not include secrets or private keys. You
are responsible for the metadata you publish, including redirect URIs and any
personal details you include. Changing the metadata creates a new URL and
client ID.

Anyone can generate a URL on `dynamic-cimd.resoauth.cloud`. We do not verify or
endorse the applications described by those documents.

## Use it fairly

Use both services lawfully. Do not attack them, try to bypass their security or
rate limits, or send traffic that prevents other people from using them.

We may slow down or pause traffic to protect either shared service. On the
gateway, this may happen if your application opens a large number of
connections or more than 100 people sign in through it in an hour. People
signing in may see a message asking them to wait. The figure is a guide to
when we may act, not a promise of capacity or an automatic cut-off.

If you expect that level of use, [get in touch](../support/index.md) so we can
discuss a dedicated instance or other arrangements.

## Contact

Email [sag@resoauth.email](mailto:sag@resoauth.email) with questions about
the services. For sign-in information handled by the gateway, see its
[privacy notice](./privacy-notice.md).
