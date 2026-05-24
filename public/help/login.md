# Logging In

← [Home](index.md)

The IZ Gateway Transformation Console uses Okta for authentication. You must have a valid
Okta account provisioned by your administrator before you can sign in.

## Sign-in Flow

1. Navigate to the Transformation Console URL provided by your administrator.
2. If you are not already signed in, you will be redirected automatically to the Okta
   sign-in page.
3. Enter your Okta username and password, then click **Sign In**.
4. If multi-factor authentication (MFA) is enabled on your account, complete the MFA
   challenge.
5. After a successful authentication, Okta redirects you back to the Transformation
   Console and you land on the home page.

![Login screen](images/login.png)

## Session Handling

Your session is maintained by a secure server-side cookie issued by NextAuth. Sessions
expire after a period of inactivity. When your session expires you will be redirected
back to the Okta sign-in page automatically — any unsaved work will be lost.

> **Tip:** If you are stepping away for an extended period, save or submit your work
> before leaving the browser tab idle.

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| Redirected back to the sign-in page immediately after signing in | Your account is not provisioned in the Transformation Console | Contact your administrator |
| MFA prompt does not appear | MFA may not be configured on your account | Contact your administrator |
| Stuck on "Signing in…" spinner | Network or Okta service issue | Wait a moment and refresh; check Okta service status |

## Signing Out

To sign out, click the **Log Out** button at the bottom of the navigation sidebar. This
ends your Transformation Console session. Your Okta session may remain active; to fully
sign out of Okta as well, visit your Okta dashboard and sign out there.
