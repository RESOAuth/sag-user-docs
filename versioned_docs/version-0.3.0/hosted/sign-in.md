---
sidebar_label: "The sign-in experience"
sidebar_position: 5
description: "What the person actually sees: one address box, routing by email domain, one-time codes, and how sign-out behaves when a session is shared."
---

# The sign-in experience

Your application sends the person to `/authorize`. This is what happens to
them, and why it looks the way it does.

## One box, not a wall of buttons

They type their email address. That is the whole first screen.

SAG then works out where that address should sign in:

1. **A provider configured for their domain.** If `example.com` is a Microsoft
   tenant SAG knows about, they go to Microsoft.
2. **A common endpoint**, if the deployment has one. This is how any Microsoft
   or Google account works without every domain being listed.
3. **A one-time code by email.** If nothing else fits, SAG emails a code.

They are never shown a "choose your provider" wall. When two providers could
both accept an address, SAG reads the domain's mail records to work out which
one, rather than asking a person who has no way of knowing.

The routing rules, and the mail-record lookup, are in the
[upstreams reference](../reference/upstreams.md).

## The one-time code

When there is no provider to send them to, SAG emails a code.

The code is long and high-entropy, not a six-digit PIN, and it is
alphanumeric using an alphabet with the confusable characters removed. It
expires, the number of guesses is capped, and the number of resends is capped.
The design and the reasoning are in
[ADR 0002](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0002-email-otp-code-design.md).

A code proves somebody controls that mailbox right now. It does not prove
anything about who they are. If that distinction matters to your application,
see [asking for a stronger sign-in](./assurance.md).

## Remember me

The address box has a "Remember me" tick box. Ticking it means the next
sign-in on that browser arrives with the address already filled in, so the
person confirms rather than types.

It remembers one thing: the address. It is a separate cookie from the session,
it is written only after a sign-in has finished, and it proves nothing about
who is holding the browser - the sign-in still happens in full. The cookie
lasts a year from its last use, is encrypted, and only SAG can read it.
Unticking the box on the next sign-in throws it away.

For your application this changes nothing: the same flow, the same tokens.
It is worth knowing about only because somebody who shares a computer may see
a colleague's address prefilled, which is why the box is theirs to untick and
never ticked on their behalf.

## The screen never says whether an address exists

Type an unknown address and you get the same screen, in the same time, as a
known one. Hit a rate limit and you get the same screen again.

This is deliberate. A sign-in surface that answers "no such user" is a
directory anybody can read, and one that answers "too many attempts" tells an
attacker exactly when to back off. The full reasoning is in
[ADR 0003](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0003-silent-enumeration-and-rate-limit-defence.md).

The practical consequence for you: SAG cannot tell your support desk why a
particular sign-in failed, and neither can the person. That is the cost of the
property, and it was chosen knowingly.

## Signing out

`/logout` is the `end_session_endpoint`. It may ask the person to confirm
before it acts.

That is because a SAG session can be shared between several applications.
Signing out of one can sign you out of all of them, and doing that silently
because somebody clicked "log out" in a small tool is a bad surprise. When
only your application is affected, there is nothing to confirm and no prompt.
The behaviour is set per deployment and per client; see
[ADR 0004](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0004-session-scope-and-sign-out-confirmation.md).

Send your `client_id` on the request and the sign-out is yours alone: only the
cookie your application's session uses is cleared. A `/logout` with no client
named is the global one, on a deployment where sessions are shared.

`post_logout_redirect_uri` has to be one your metadata document declared, and
it is matched exactly. Anything else is refused and the person lands on SAG's
own "signed out" page instead, because an endpoint that redirects anywhere it
is asked to is an open redirector with a session cookie attached.

Signing out ends the session itself, not only the copy in that browser: where
the deployment has a state store, SAG records that session as signed out until
its absolute expiry, so a copied cookie stops working too. There is still no
way for your application to sign one person out everywhere on demand - there
is no index of a person's sessions to look them up in. See
[ADR 0012](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0012-store-backed-session-revocation.md)
and [limitations](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/limitations.md).

## How long a session lasts

Two clocks: an idle timeout, and an absolute lifetime. Using the session pushes
the idle timeout forward - a person who signs in to something every morning is
not asked again - but nothing pushes the absolute one, so a session ends on its
own eventually whatever happens. The defaults are twelve hours and seven days;
the hosted gateway sets its own, and on your own deployment they are
`SESSION_TTL` and `SESSION_MAX_LIFETIME` in the
[configuration reference](../reference/configuration.md).

## It works without CSS or JavaScript

The pages are semantic HTML that happens to be styled. They reflow at 400%
zoom, respect reduced motion and increased contrast, and submit correctly with
scripting switched off.

There is no inline script and no inline style on any page, which is what lets
every page carry a content security policy starting at `default-src 'none'`.

The light and dark toggle only exists when the script that builds it has run,
so a page whose script was blocked shows no dead control rather than a button
that does nothing.

## What it looks like

A `logo_uri` in your metadata document is shown above the sign-in heading, so
the person sees your application's mark on the page asking for their address.
Set `client_name` as well and the page says "Continue to Ledger" in words too.

The hosted gateway carries RESOAuth®'s branding by default. On your own
deployment you can put your own organisation in front, add custom CSS, and set
your terms and privacy links. Attribution to the SAG project is never
removable. See [branding](../reference/branding.md) and
[ADR 0008](https://github.com/RESOAuth/smart-access-gateway/blob/main/docs/adr/0008-branding-and-attribution.md).
