# Fit Fusion AI - Advanced Fitness App

A comprehensive, AI-powered fitness application built with Next.js, Supabase, and Stripe. Features workout tracking, nutrition logging, analytics, communities, gamification, and monetization.

## 🚀 Features

### 🔐 Authentication & User System
- **Supabase Auth** with Google Sign-In and email/password
- **User Profiles** with comprehensive data storage
- **Privacy Settings** and data sharing controls
- **Secure Authentication** with JWT tokens

### 💳 Monetization
- **Stripe Integration** for subscriptions and payments
- **Multiple Plans**: Monthly Pro, Annual Pro, Cookbook one-time purchase
- **Billing Portal** for subscription management
- **Promo Code Support** (e.g., "freshmanfriday")
- **Webhook Handling** for real-time subscription updates

### 🏋️ Workout Tracker (Whoop-style)
- **Comprehensive Exercise Library** with 8+ exercises and growing
- **Exercise Categories**: Strength, Cardio, Flexibility, Sports
- **Muscle Group Targeting** and equipment filtering
- **Workout Logging** with sets, reps, weights, RPE, and rest periods
- **Personal Records** tracking (all-time, 6-month, yearly)
- **1RM Calculator** and PR detection
- **Workout Templates** and programs
- **Real-time Analytics** with volume tracking

### 📊 Analytics Dashboard
- **Volume Tracking** by muscle group and time period
- **Calories In vs Out** visualization
- **Weight & Body Composition** trends
- **Streak Tracking** and badges
- **Interactive Charts** using Recharts
- **Performance Metrics** and insights
- **Time Range Filtering** (7d, 30d, 90d, 1y)

### 🍴 Food Tracker (MyFitnessPal-style)
- **Comprehensive Food Database** with 8+ foods and growing
- **Macro Tracking** (calories, protein, carbs, fat, fiber, sodium)
- **Daily Goals** with progress bars
- **Meal Categorization** (breakfast, lunch, dinner, snack)
- **Recipe Integration** (ready for expansion)
- **Barcode Scanner** support (mobile-ready)
- **Smart Add** functionality for quick logging

### 🌐 Communities & Social
- **Community Creation** and management
- **Member Roles** (owner, admin, moderator, member)
- **Social Feed** with real-time events
- **Live Chat** functionality
- **Data Sharing** controls
- **Leaderboards** and community stats
- **Event Types**: PRs, workouts, streaks, achievements

### 🎮 Gamification
- **XP System** with level progression
- **Badge System** with 5+ achievement types
- **Streak Tracking** for consistency
- **Leaderboards** per community
- **Achievement Categories**: Consistency, Strength, Social, Nutrition
- **Progress Visualization** and rewards

### 🤖 AI Coach
- **Personalized Plans** (workout, nutrition, comprehensive)
- **Goal-Based Recommendations**
- **Smart Scheduling** and optimization
- **Lifestyle Integration** suggestions
- **Progress Tracking** and adaptation

### 🎨 UI/UX
- **Dark Theme** inspired by Whoop
- **Neon Green/Blue Accents** for modern look
- **Paywall Overlays** for premium features
- **Smooth Animations** and transitions
- **Responsive Design** for all devices
- **Loading States** and error handling

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Main dashboard
│   ├── workouts/          # Workout tracker
│   ├── food/              # Food tracker
│   ├── analytics/         # Analytics dashboard
│   ├── communities/       # Social features
│   ├── profile/           # User profile
│   ├── ai/                # AI coach
│   ├── signin/            # Authentication
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── PricingCard.tsx    # Subscription plans
│   └── PaywallGate.tsx    # Premium feature gates
├── lib/                   # Utilities and configurations
│   ├── supabaseClient.ts  # Supabase client
│   └── stripe.ts          # Stripe configuration
└── hooks/                 # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fit-fusion-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
   STRIPE_ANNUAL_PRICE_ID=your_annual_price_id
   STRIPE_COOKBOOK_PRICE_ID=your_cookbook_price_id

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Enable Row Level Security (RLS)
   - Set up authentication providers

5. **Set up Stripe**
   - Create a Stripe account
   - Set up products and prices
   - Configure webhooks
   - Add webhook endpoints

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The app uses a comprehensive PostgreSQL schema with:
- **User Management**: Profiles, authentication, preferences
- **Workout System**: Exercises, workouts, sets, personal records
- **Nutrition System**: Foods, recipes, food logs, nutrition goals
- **Social Features**: Communities, members, events, chat
- **Gamification**: Badges, XP, leaderboards
- **Analytics**: Workout analytics, body composition
- **Monetization**: Subscriptions, promo codes

## 🔧 Key Features Implementation

### Authentication Flow
1. User signs up/in with email or Google
2. Profile is automatically created
3. JWT tokens managed by Supabase
4. Protected routes with AuthGuard

### Workout Tracking
1. Browse exercise library with filters
2. Start workout session
3. Log sets with reps, weight, RPE
4. Auto-detect personal records
5. Save workout with analytics

### Food Tracking
1. Search food database
2. Add foods to daily log
3. Track macros against goals
4. Categorize by meal type
5. Visualize progress

### Analytics
1. Real-time data aggregation
2. Interactive charts and graphs
3. Time-based filtering
4. Performance insights
5. Progress tracking

### Communities
1. Create/join communities
2. Share workout achievements
3. Real-time chat
4. Leaderboards
5. Privacy controls

## 🎯 Future Enhancements

- **Mobile App**: React Native implementation
- **Barcode Scanner**: Camera integration
- **Recipe Database**: Expanded nutrition features
- **Wearable Integration**: Apple Health, Google Fit
- **Advanced AI**: Machine learning recommendations
- **Video Workouts**: Exercise demonstration videos
- **Social Challenges**: Community competitions
- **Nutrition Coaching**: AI meal planning

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email support@fitnesspro.app or join our Discord community.

---

**Fit Fusion AI** - The most advanced fitness app on the market! 🚀💪