# 🚀 **STRIPE PAYMENTS DEPLOYMENT GUIDE**

## ✅ **YOUR BACKEND IS READY!**

You already have all the necessary Stripe API endpoints created. Here's how to deploy them and get payments working:

---

## 🔧 **STEP 1: CREATE ENVIRONMENT VARIABLES**

Create a `.env.local` file in your project root:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zlxbmtpuekcvtmqwfaie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGJtdHB1ZWtjdnRtcXdmYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjk4NzYsImV4cCI6MjA3MDg0NTg3Nn0.ajCrljPdh6OiP93GIl5BmV-howpKzTNpToN3ZqFfOOM
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGJtdHB1ZWtjdnRtcXdmYWllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2OTg3NiwiZXhwIjoyMDcwODQ1ODc2fQ._gHu3FB_jAe51_13gSZ0ZzJrGasawRe5VmDyLLjbI2E

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🗄️ **STEP 2: CREATE DATABASE TABLES**

Run this SQL in your Supabase SQL Editor:

```sql
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
```

---

## 🚀 **STEP 3: DEPLOY YOUR BACKEND**

### **Option A: Vercel (Recommended)**

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Add Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add all the environment variables from Step 1

### **Option B: Netlify**

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Deploy:**
```bash
netlify deploy --prod
```

3. **Add Environment Variables in Netlify Dashboard**

### **Option C: Railway**

1. **Install Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Deploy:**
```bash
railway login
railway init
railway up
```

3. **Add Environment Variables in Railway Dashboard**

---

## 🔗 **STEP 4: UPDATE MOBILE APP**

Update your mobile app's API URL:

```typescript
// In mobile-app/config/stripe.ts
export const STRIPE_CONFIG = {
  // ... existing config
  apiUrl: 'https://your-deployed-app.vercel.app', // Update this
};
```

---

## 🎣 **STEP 5: SET UP STRIPE WEBHOOKS**

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com/webhooks
2. **Click "Add endpoint"**
3. **URL:** `https://your-deployed-app.vercel.app/api/stripe/webhook`
4. **Events to send:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy webhook secret** and add to your environment variables

---

## 🧪 **STEP 6: TEST PAYMENTS**

### **Test with Stripe Test Cards:**

- **Success:** `4242424242424242`
- **Decline:** `4000000000000002`
- **3D Secure:** `4000002500003155`

### **Test Flow:**
1. Open your mobile app
2. Try to access a premium feature
3. Go through payment flow
4. Use test card `4242424242424242`
5. Check if user gets premium access

---

## 🎯 **STEP 7: GO LIVE**

### **Switch to Live Mode:**
1. **Update Stripe keys** to live keys in environment variables
2. **Update mobile app** to use live publishable key
3. **Test with real cards** (small amounts first)
4. **Monitor payments** in Stripe Dashboard

---

## 🎉 **YOU'RE READY TO MAKE MONEY!**

With these steps:
- ✅ **Real subscription processing**
- ✅ **Automatic premium management**
- ✅ **Webhook handling**
- ✅ **Database synchronization**
- ✅ **Production ready**

**Your Stripe integration will be fully functional!** 💰

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

1. **"Failed to create payment intent"**
   - Check if backend is deployed
   - Verify environment variables
   - Check API URL in mobile app

2. **"User not found"**
   - Ensure user is logged in
   - Check Supabase connection
   - Verify user exists in profiles table

3. **"Invalid signature"**
   - Check webhook secret
   - Ensure webhook URL is correct
   - Test webhook endpoint

### **Debug Commands:**
```bash
# Check if backend is running
curl https://your-domain.com/api/stripe/create-subscription

# Test webhook
curl -X POST https://your-domain.com/api/stripe/webhook
```

---

## 📞 **SUPPORT**

If you need help:
1. Check Stripe Dashboard for payment logs
2. Check Vercel/Netlify logs for API errors
3. Check Supabase logs for database issues
4. Test with Stripe test cards first

**Your payment system is ready to go live!** 🚀


