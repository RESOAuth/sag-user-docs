---
sidebar_label: "Asking for a stronger sign-in"
sidebar_position: 7
description: "Demand multi-factor with acr_values and have the request refused rather than quietly answered with something weaker."
---

# Asking for a stronger sign-in

Most identity systems will tell you how somebody signed in. SAG will also
refuse to sign them in any other way.

## Demand it in the request

Send `acr_values` on the authorisation request:

```
GET /authorize
  ?...
  &acr_values=urn:sag:acr:federated-mfa
```

If SAG cannot meet it, the request fails with
`unmet_authentication_requirements`. It does not quietly answer with an email
code and leave you to notice.

This is the part that matters. A system that reports `acr` but happily signs
somebody in at a lower strength has moved the check to you, and it is a check
that gets forgotten.

## The three levels

| `acr_values` | Satisfied by |
| --- | --- |
| `urn:sag:acr:email-otp` | Any sign-in |
| `urn:sag:acr:federated` | An upstream provider, or an upstream with MFA |
| `urn:sag:acr:federated-mfa` | An upstream that reported multi-factor |

They are ordered, so asking for `federated` is met by a `federated-mfa`
sign-in. Asking for a value SAG does not know is an error, not a shrug.

## A floor that applies whatever you ask

A registered client can carry a minimum `acr` that applies whether or not the
request asks for it. If the client's floor is `urn:sag:acr:federated-mfa`,
every sign-in to that application needs multi-factor, including the ones where
somebody forgot to set `acr_values`.

This is how an organisation stops one neglected application becoming the weak
way in, but it needs a registered client, which the shared hosted gateway
does not offer today - see [beyond a public client](./registering.md). On
your own deployment it is `CLIENT_<SLUG>_ACR_VALUES`, in the
[relying parties reference](../reference/relying-parties.md).

Use both. The floor is the safety net; the request is what makes the intent
visible in your own code.

## Step-up within one application

Ask for the low level at first sign-in, and send the person back to
`/authorize` with a higher `acr_values` when they reach the part that needs
it. They already have a session, so meeting a stronger requirement usually
means one more step rather than starting again.

Check the `acr` in the returned `id_token` before you act on it. You asked,
and SAG will refuse rather than under-deliver, but the token is the record.

## What it cannot tell you

`urn:sag:acr:federated-mfa` means the upstream provider said multi-factor
happened. SAG relays that; it cannot audit it. How much that assertion is
worth is a question about your trust in Microsoft or Google, and about how
that tenant is configured.

Similarly, `urn:sag:acr:email-otp` proves somebody read a mailbox. If that
mailbox is itself protected by a weak password, the code inherits that
weakness. This is stated plainly under
[limitations](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/limitations.md).
