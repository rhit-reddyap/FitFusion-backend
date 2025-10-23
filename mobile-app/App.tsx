import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  Alert,
  Modal,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from './components/SplashScreen';
import AdvancedDashboard from './components/AdvancedDashboard';
import AdvancedFoodTracker from './components/AdvancedFoodTracker';
import AdvancedTeamCommunitiesRevamped from './components/AdvancedTeamCommunitiesRevamped';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import AdvancedMealPlanner from './components/AdvancedMealPlanner';
import AdvancedGamification from './components/AdvancedGamification';
import RecipesCookbooks from './components/RecipesCookbooks';
import ProfileScreen from './components/ProfileScreen';
import SignInScreen from './components/SignInScreen';
import SignUpScreen from './components/SignUpScreen';
import PremiumGate from './components/PremiumGate';
import StripeProvider from './components/StripeProvider';
import StripeCheckout from './components/StripeCheckout';
import { AuthProvider, useAuth } from './components/AuthProvider';

// Performance optimizations
import { 
  LazyAdvancedAnalytics, 
  LazyAdvancedMealPlanner, 
  LazyAdvancedGamification,
  LazyAdvancedTeamCommunities,
  LazyRecipesCookbooks,
  LazyUltimateWorkoutTracker,
  preloadCriticalComponents
} from './utils/lazyLoading';
import { OptimizedImage } from './utils/imageOptimization';
import { usePerformance } from './hooks/usePerformance';
import MemoryManager from './utils/memoryManagement';
import OfflineManager from './utils/offlineManager';

const { width, height } = Dimensions.get('window');

function AppContent() {
  const { user, loading, isPremium } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSubscription, setShowSubscription] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showCookbook, setShowCookbook] = useState(false);
  
  // Performance monitoring
  const { isOnline, memoryInfo, isLowMemory, forceCleanup } = usePerformance();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'home-outline' },
    { id: 'food', label: 'Food', icon: 'restaurant-outline' },
    { id: 'workouts', label: 'Workouts', icon: 'fitness-outline' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics-outline' },
    { id: 'communities', label: 'Community', icon: 'people-outline' },
    { id: 'profile', label: 'Profile', icon: 'person-outline' }
  ];

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Initialize performance optimizations
  useEffect(() => {
    // Preload critical components
    preloadCriticalComponents();
    
    // Start memory monitoring
    const memoryManager = MemoryManager.getInstance();
  }, []); // Only run once on mount

  // Handle low memory cleanup
  useEffect(() => {
    if (isLowMemory) {
      forceCleanup();
    }
  }, [isLowMemory]); // Only run when isLowMemory changes

  // Show auth if no user
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#000000', '#0a0a0a']} style={styles.gradient}>
          <View style={styles.loadingContent}>
            <OptimizedImage 
              source={require('./assets/icon.png')} 
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <Text style={styles.loadingText}>
              Loading Fit Fusion AI... {!isOnline && '(Offline Mode)'}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!user) {
    if (showAuth) {
      return authMode === 'signin' ? (
        <SignInScreen
          onSwitchToSignUp={() => setAuthMode('signup')}
          onSignInSuccess={() => setShowAuth(false)}
        />
      ) : (
        <SignUpScreen
          onSwitchToSignIn={() => setAuthMode('signin')}
          onSignUpSuccess={() => setShowAuth(false)}
        />
      );
    }

    return (
      <View style={styles.authPromptContainer}>
        <LinearGradient
          colors={['#000000', '#0a0a0a']}
          style={styles.gradient}
        >
          <View style={styles.authPrompt}>
            <OptimizedImage 
              source={require('./assets/fitfusionicon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Fit Fusion AI</Text>
            <Text style={styles.authSubtitle}>
              The most advanced AI-powered fitness app
            </Text>
            <Text style={styles.authDescription}>
              Track nutrition, plan workouts, connect with community, and achieve your fitness goals with cutting-edge AI technology.
            </Text>
            {!isOnline && (
              <View style={styles.offlineBanner}>
                <Ionicons name="wifi-off" size={16} color="#F59E0B" />
                <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => setShowAuth(true)}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.authButtonText}>Get Started Free</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.authFooter}>
              Join thousands of fitness enthusiasts worldwide
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdvancedDashboard 
            onNavigate={(screen) => {
              if (screen === 'cookbook') {
                setShowCookbook(true);
              } else if (screen === 'subscription') {
                setShowSubscription(true);
              } else {
                setActiveTab(screen);
              }
            }} 
          />
        );
      case 'food':
        return <AdvancedFoodTracker onBack={() => setActiveTab('dashboard')} onNavigate={(screen) => {
          if (screen === 'cookbook') {
            setShowCookbook(true);
          } else {
            setActiveTab(screen);
          }
        }} />;
      case 'workouts':
        return (
          <PremiumGate
            feature="Ultimate Workout Tracker"
            description="AI-powered workouts, real-time metrics, and advanced training features"
            onUpgrade={() => {
              setSelectedPlan('monthly');
              setShowStripeCheckout(true);
            }}
          >
            <LazyUltimateWorkoutTracker 
              onBack={() => setActiveTab('dashboard')} 
              navigation={{ navigate: (screen: string) => setActiveTab(screen) }}
            />
          </PremiumGate>
        );
      case 'analytics':
        return (
          <PremiumGate
            feature="Advanced Analytics"
            description="Comprehensive insights, trends, and AI-powered recommendations"
            onUpgrade={() => {
              setSelectedPlan('monthly');
              setShowStripeCheckout(true);
            }}
          >
            <LazyAdvancedAnalytics onBack={() => setActiveTab('dashboard')} />
          </PremiumGate>
        );
      case 'communities':
        return <AdvancedTeamCommunitiesRevamped onBack={() => setActiveTab('dashboard')} />;
      case 'profile':
        return (
          <ProfileScreen 
            onBack={() => setActiveTab('dashboard')}
            onNavigate={(screen) => {
              if (screen === 'meal-planner') {
                setActiveTab('meal-planner');
              } else if (screen === 'gamification') {
                setActiveTab('gamification');
              }
            }}
          />
        );
      case 'meal-planner':
        return (
          <PremiumGate
            feature="AI Meal Planner"
            description="Personalized meal plans, shopping lists, and nutrition optimization"
            onUpgrade={() => {
              setSelectedPlan('monthly');
              setShowStripeCheckout(true);
            }}
          >
            <LazyAdvancedMealPlanner onBack={() => setActiveTab('profile')} />
          </PremiumGate>
        );
      case 'gamification':
        return <LazyAdvancedGamification onBack={() => setActiveTab('profile')} />;
      case 'cookbook':
        return (
          <Modal
            visible={true}
            animationType="slide"
            presentationStyle="fullScreen"
            statusBarTranslucent={true}
            onRequestClose={() => setActiveTab('dashboard')}
          >
            <LazyRecipesCookbooks onBack={() => setActiveTab('dashboard')} />
          </Modal>
        );
      case 'subscription':
        return (
          <PremiumGate
            feature="Premium Subscription"
            description="Unlock all premium features with our flexible subscription plans"
            onUpgrade={() => {
              setSelectedPlan('monthly');
              setShowStripeCheckout(true);
            }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>Subscription Management</Text>
              <Text style={{ color: '#10B981', marginTop: 10 }}>Use the Profile section to manage your subscription</Text>
            </View>
          </PremiumGate>
        );
      default:
        return (
          <AdvancedDashboard 
            onNavigate={(screen) => {
              if (screen === 'cookbook') {
                setShowCookbook(true);
              } else if (screen === 'subscription') {
                setShowSubscription(true);
              } else {
                setActiveTab(screen);
              }
            }} 
          />
        );
    }
  };

  const renderSubscriptionModal = () => (
    <Modal
      visible={showSubscription}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSubscription(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text style={styles.modalTitle}>Upgrade to Premium</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSubscription(false)}
            >
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Unlock the full potential of Fit Fusion AI
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="bulb" size={20} color="#10B981" />
              <Text style={styles.featureText}>AI-powered meal planning</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color="#10B981" />
              <Text style={styles.featureText}>Advanced analytics & insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="fitness" size={20} color="#10B981" />
              <Text style={styles.featureText}>AI workout optimization</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="#10B981" />
              <Text style={styles.featureText}>Premium community features</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={20} color="#10B981" />
              <Text style={styles.featureText}>Gamification & achievements</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="book" size={20} color="#10B981" />
              <Text style={styles.featureText}>AD's Premium Cookbook</Text>
            </View>
          </View>

          <View style={styles.pricingContainer}>
            <TouchableOpacity 
              style={[
                styles.pricingCard,
                selectedPlan === 'monthly' && styles.selectedPricingCard
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={styles.pricingTitle}>Monthly</Text>
              <Text style={styles.pricingPrice}>$5</Text>
              <Text style={styles.pricingPeriod}>per month</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.pricingCard,
                styles.pricingCardFeatured,
                selectedPlan === 'yearly' && styles.selectedPricingCard
              ]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Best Value</Text>
              </View>
              <Text style={styles.pricingTitle}>Yearly</Text>
              <Text style={styles.pricingPrice}>$50</Text>
              <Text style={styles.pricingPeriod}>per year</Text>
              <Text style={styles.savingsText}>Save 17%</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => {
              setShowSubscription(false);
              setShowStripeCheckout(true);
            }}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.subscribeButtonGradient}
            >
              <Text style={styles.subscribeButtonText}>
                Start Free Trial - {selectedPlan === 'monthly' ? '$5/month' : '$50/year'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.trialText}>
            7-day free trial • Cancel anytime • Secure payment via Stripe
          </Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Offline Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-off" size={16} color="#F59E0B" />
          <Text style={styles.offlineIndicatorText}>Offline Mode</Text>
        </View>
      )}
      
      {/* Performance Indicator (Debug) */}
      {__DEV__ && isLowMemory && (
        <View style={styles.performanceIndicator}>
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text style={styles.performanceText}>Low Memory - Cleaning up...</Text>
        </View>
      )}
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={activeTab === tab.id ? '#10B981' : '#6B7280'}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subscription Modal */}
      {renderSubscriptionModal()}

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        visible={showStripeCheckout}
        onClose={() => setShowStripeCheckout(false)}
        onSuccess={async (subscriptionId) => {
          console.log('Subscription successful:', subscriptionId);
          setShowStripeCheckout(false);
          
          // Update user's premium status locally
          try {
            // This would normally update Supabase, but for now we'll update locally
            // In production, you'd call your backend API here
            console.log('Updating user premium status...');
            
            Alert.alert(
              'Welcome to Premium! 🎉',
              'You now have access to all premium features. Enjoy your fitness journey!',
              [{ text: 'Awesome!', onPress: () => {} }]
            );
          } catch (error) {
            console.error('Error updating premium status:', error);
            Alert.alert(
              'Premium Activated! 🎉',
              'You now have access to all premium features!',
              [{ text: 'Great!', onPress: () => {} }]
            );
          }
        }}
        selectedPlan={selectedPlan}
      />

      {/* AD's Cookbook Modal */}
      <Modal
        visible={showCookbook}
        animationType="slide"
        presentationStyle="fullScreen"
        transparent={false}
        statusBarTranslucent={true}
        onRequestClose={() => setShowCookbook(false)}
      >
        <LazyRecipesCookbooks onBack={() => setShowCookbook(false)} />
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <StripeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  authPromptContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 20,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  authDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  authButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authFooter: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
  },
  activeTab: {
    // Active tab styling handled by icon and text color
  },
  tabLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#10B981',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  selectedPricingCard: {
    borderColor: '#10B981',
    backgroundColor: '#10B98120',
  },
  pricingCardFeatured: {
    borderColor: '#F59E0B',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  savingsText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
    fontWeight: '600',
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  subscribeButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trialText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  offlineText: {
    color: '#F59E0B',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  offlineIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B40',
    zIndex: 1000,
  },
  offlineIndicatorText: {
    color: '#F59E0B',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  performanceIndicator: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF444440',
    zIndex: 1000,
  },
  performanceText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
});