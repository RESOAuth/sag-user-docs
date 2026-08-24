| Path | Method | What it is |
| --- | --- | --- |
| `/.well-known/openid-configuration` | GET | OpenID Connect discovery. Start here |
| `/.well-known/oauth-authorization-server` | GET | The same instance described as an OAuth authorisation server (RFC 8414) |
| `/.well-known/oauth-protected-resource` | GET | Describes `/userinfo` as a protected resource (RFC 9728) |
| `/.well-known/jwks.json` | GET | The public keys that verify an `id_token` |
| `/jwks.json` | GET | The same keys at the pre-RFC 8414 location, for older libraries |
| `/authorize` | GET, POST | Where you send the person to sign in |
| `/callback` | GET | Where an upstream provider returns them. Not for your application |
| `/token` | POST | Exchange an authorisation code for an `id_token` |
| `/userinfo` | GET, POST | Claims about the signed-in person, using the access token |
| `/logout` | GET, POST | End the session (`end_session_endpoint`) |
| `/healthz` | GET | Whether this instance can actually sign somebody in |
| `/alive` | GET | Whether a process is listening at all |

The `/authorize/*` sub-paths (`/authorize/email`, `/authorize/otp`,
`/authorize/resend`, and the rest) belong to the sign-in screens themselves.
They are form targets, not an API, and their shape may change between
releases. Your application only ever needs `/authorize`.

`/` is deliberately not a landing page. It returns 404 with "This is a
sign-in service. Start from the application you want to use."
