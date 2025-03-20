# Google OAuth Setup for Fitness App

## Issue: App not verified by Google

When connecting to Google Fit, you might see an error message saying:
"App has not completed Google verification process"

This is normal for apps in development. Until your app is fully verified by Google,
only designated test users can access the OAuth scopes required by Google Fit.

## How to add yourself as a test user:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `fittler-app` (or whatever you named it)
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Scroll down to "Test users" section
5. Click "ADD USERS"
6. Add your Google email address and any other test users
7. Click "SAVE"

## Required OAuth Scopes:

The app uses these scopes for Google Fit integration:
- `https://www.googleapis.com/auth/fitness.activity.read`
- `https://www.googleapis.com/auth/fitness.body.read`

## Production Verification:

Before publishing your app, you'll need to:

1. Complete Google's OAuth verification process
2. Provide privacy policy URL
3. Submit for app review
4. Wait for Google to approve your app (can take several days)

For testing purposes, using test users is sufficient.
