import React, { Suspense, lazy } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#10B981" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Lazy load components with error boundaries
export const createLazyComponent = (importFunc: () => Promise<any>, fallback?: React.ComponentType) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload components for better UX
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return importFunc();
};

// Lazy loaded components
export const LazyAdvancedAnalytics = createLazyComponent(
  () => import('../components/AdvancedAnalyticsReal')
);

export const LazyAdvancedMealPlanner = createLazyComponent(
  () => import('../components/AdvancedMealPlanner')
);

export const LazyAdvancedGamification = createLazyComponent(
  () => import('../components/AdvancedGamification')
);

export const LazyAdvancedTeamCommunities = createLazyComponent(
  () => import('../components/AdvancedTeamCommunities')
);

export const LazyAdvancedTeamCommunitiesRevamped = createLazyComponent(
  () => import('../components/AdvancedTeamCommunitiesRevamped')
);

export const LazyRecipesCookbooks = createLazyComponent(
  () => import('../components/RecipesCookbooks')
);

export const LazyUltimateWorkoutTracker = createLazyComponent(
  () => import('../components/UltimateWorkoutTracker')
);

// Preload critical components
export const preloadCriticalComponents = () => {
  Promise.all([
    preloadComponent(() => import('../components/AdvancedDashboard')),
    preloadComponent(() => import('../components/AdvancedFoodTracker')),
    preloadComponent(() => import('../components/UltimateWorkoutTracker')),
  ]);
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#10B981',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
});
