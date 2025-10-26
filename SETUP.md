# Fit Fusion AI Setup Guide

## 🚀 Quick Start (Development Mode)

The app is already running in development mode! You can test all features using the admin account.

### **Admin Access**
- **Email**: admin@fitnesspro.com
- **Access**: All premium features unlocked
- **How to use**: Click "Sign In as Admin" on the sign-in page

## 🔧 Production Setup

To set up the full app with real authentication and database:

### 1. **Supabase Setup**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API to get your keys
3. Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_monthly_id
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_annual_id
NEXT_PUBLIC_STRIPE_COOKBOOK_PRICE_ID=price_cookbook_id
```

### 2. **Database Setup**
Run the database migrations in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/migrations/0002_comprehensive_schema.sql
```

### 3. **Stripe Setup** (Optional - for payments)
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Create products and prices for:
   - Monthly subscription ($19.99/month)
   - Annual subscription ($199.99/year)
   - Cookbook one-time purchase ($29.99)

## 🎯 Features Available

### **With Admin Account (Current)**
- ✅ Full dashboard with all widgets
- ✅ Exercise library with embedded videos
- ✅ Workout tracker and logging
- ✅ Food tracker and nutrition logging
- ✅ Analytics dashboard with charts
- ✅ AI Coach recommendations
- ✅ Cookbook with all recipes unlocked
- ✅ Communities and social features
- ✅ Profile management
- ✅ All premium features unlocked

### **With Real Supabase Setup**
- ✅ User authentication (email/password + Google)
- ✅ User profiles and data persistence
- ✅ Real-time data sync
- ✅ Stripe payment integration
- ✅ Subscription management
- ✅ All features above + real data storage

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 App Structure

- **Dashboard**: Main overview with stats and quick actions
- **AI Plans**: Personalized workout and nutrition plans
- **Food Tracker**: Log meals and track macros
- **Cookbook**: Recipe collection (premium feature)
- **Workout Tracker**: Exercise library with videos and logging
- **Analytics**: Charts and progress tracking
- **Communities**: Social features and leaderboards
- **Profile**: User settings and subscription management

## 🔐 Admin Features

The admin account has access to:
- All premium features without payment
- Full cookbook access
- Advanced analytics
- All workout and nutrition tracking
- Community features
- Profile customization

## 🚨 Troubleshooting

### **"Failed to fetch" errors**
- This is normal in development mode without Supabase
- Use the admin account to test all features
- Set up Supabase for real authentication

### **Video not loading**
- Check if YouTube videos are accessible in your region
- Videos are embedded from YouTube

### **Styling issues**
- Make sure Tailwind CSS is properly configured
- Check if all dependencies are installed

## 📞 Support

If you need help setting up any part of the app, the admin account gives you full access to test all features without any external dependencies!
