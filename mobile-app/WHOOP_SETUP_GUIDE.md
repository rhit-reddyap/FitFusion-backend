# Whoop API Integration Setup Guide

This guide will help you set up the Whoop API integration for Fit Fusion.

## Prerequisites

1. A Whoop developer account
2. Node.js installed on your system
3. Your Fit Fusion app running

## Step 1: Create Whoop Developer Account

1. Go to [https://developer.whoop.com](https://developer.whoop.com)
2. Sign up for a developer account
3. Create a new application
4. Note down your Client ID and Client Secret

## Step 2: Set Up Privacy Policy Server

### Option A: Local Development (Recommended for testing)

1. Install dependencies:
```bash
cd mobile-app
cp privacy-server-package.json package.json
npm install
```

2. Start the privacy policy server:
```bash
npm start
```

This will start a server at `http://localhost:3001` with:
- Privacy Policy: `http://localhost:3001/privacy-policy`
- Whoop Callback: `http://localhost:3001/whoop-callback`

### Option B: Deploy to Production

1. Deploy the privacy policy files to your web server
2. Update the redirect URI in your environment variables

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Whoop API Configuration
EXPO_PUBLIC_WHOOP_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_WHOOP_CLIENT_SECRET=your_client_secret_here
EXPO_PUBLIC_WHOOP_REDIRECT_URI=http://localhost:3001/whoop-callback

# For production, use your deployed URL:
# EXPO_PUBLIC_WHOOP_REDIRECT_URI=https://yourdomain.com/whoop-callback
```

## Step 4: Configure Whoop Application

In your Whoop developer dashboard:

1. **Application Name**: Fit Fusion
2. **Description**: AI-powered fitness tracking app with comprehensive health analytics
3. **Privacy Policy URL**: `http://localhost:3001/privacy-policy` (or your deployed URL)
4. **Redirect URI**: `http://localhost:3001/whoop-callback` (or your deployed URL)
5. **Scopes**: Select all available scopes:
   - `read:recovery`
   - `read:workout`
   - `read:profile`
   - `read:body_measurement`
   - `read:cycles`
   - `read:sleep`

## Step 5: Test the Integration

1. Start your Fit Fusion app
2. Go to Profile → Wearable Integration
3. Click "Connect" next to Whoop
4. You should be redirected to Whoop's authorization page
5. After authorization, you'll be redirected back to the callback page
6. Return to the app to see your Whoop data

## Step 6: Production Deployment

For production deployment:

1. Deploy the privacy policy files to your web server
2. Update the redirect URI in your Whoop application settings
3. Update the environment variables with your production URLs
4. Test the integration thoroughly

## Troubleshooting

### Common Issues

1. **"invalid_client" Error**
   - Check that your Client ID and Client Secret are correct
   - Ensure the redirect URI matches exactly in both your app and Whoop settings

2. **Redirect URI Mismatch**
   - Make sure the redirect URI in your Whoop app settings matches exactly
   - Check for trailing slashes and protocol (http vs https)

3. **Privacy Policy Required**
   - Whoop requires a publicly accessible privacy policy
   - Make sure your privacy policy URL is accessible from the internet

4. **CORS Issues**
   - The callback page should be served from a proper web server
   - Avoid using file:// URLs

### Testing the Privacy Policy

Visit your privacy policy URL to ensure it's accessible:
- Local: `http://localhost:3001/privacy-policy`
- Production: `https://yourdomain.com/privacy-policy`

### Testing the Callback

Test the callback URL:
- Local: `http://localhost:3001/whoop-callback`
- Production: `https://yourdomain.com/whoop-callback`

## Data Collected from Whoop

The integration collects the following data from Whoop:

- **Recovery Data**: Recovery scores, HRV, resting heart rate
- **Sleep Data**: Sleep duration, stages, efficiency, consistency
- **Strain Data**: Daily strain scores, kilojoules burned, heart rate zones
- **Workout Data**: Exercise activities, heart rate during workouts
- **Body Measurements**: Height, weight, maximum heart rate

## Security Notes

- All data is encrypted in transit and at rest
- OAuth tokens are stored securely on the device
- Users can disconnect their Whoop account at any time
- Data is only used for fitness tracking and analytics within the app

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your environment variables are set correctly
3. Ensure your Whoop application is configured properly
4. Test with the demo mode first to verify the app works

For additional help, contact the Fit Fusion development team.





