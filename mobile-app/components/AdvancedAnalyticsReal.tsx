import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AnalyticsService from '../services/analyticsService';
import CalorieTargetService from '../services/calorieTargetService';
import { DataStorage } from '../utils/dataStorage';
import BodyFatTracker from './BodyFatTracker';

interface AdvancedAnalyticsRealProps {
  onBack: () => void;
}

const screenWidth = Dimensions.get('window').width;

export default function AdvancedAnalyticsReal({ onBack }: AdvancedAnalyticsRealProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [calorieTarget, setCalorieTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBodyFatTracker, setShowBodyFatTracker] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [weightGraphTimeframe, setWeightGraphTimeframe] = useState<'week' | 'month'>('week');
  const [weeklyMetabolismData, setWeeklyMetabolismData] = useState<any>(null);
  const [currentMetabolismEstimate, setCurrentMetabolismEstimate] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  useEffect(() => {
    loadAnalytics();
    loadWeightLogs();
  }, [selectedTimeframe]);

  const loadWeightLogs = async () => {
    try {
      const logs = await DataStorage.getBodyCompositionLogs();
      console.log('=== WEIGHT LOGS DEBUG ===');
      console.log('Total logs loaded:', logs.length);
      console.log('All logs:', logs);
      
      // Filter and show only weight entries
      const weightEntries = logs.filter(log => log.weight && log.weight > 0);
      console.log('Weight entries:', weightEntries);
      
      setWeightLogs(logs);
    } catch (error) {
      console.error('Error loading weight logs:', error);
    }
  };

  const saveWeightLog = async () => {
    if (!currentWeight || isNaN(parseFloat(currentWeight))) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    try {
      // Convert to lbs if input is in kg
      let weightInLbs = parseFloat(currentWeight);
      if (weightUnit === 'kg') {
        weightInLbs = parseFloat(currentWeight) * 2.20462; // Convert kg to lbs
      }

      const weightEntry = {
        id: `weight_${Date.now()}`,
        date: new Date().toISOString(),
        weight: weightInLbs,
        bodyFat: null,
        muscleMass: null,
        notes: `Weight logged from analytics (input: ${currentWeight} ${weightUnit})`
      };

      await DataStorage.addBodyCompositionLog(weightEntry);
      setCurrentWeight('');
      setShowWeightModal(false);
      loadWeightLogs();
      Alert.alert('Success', `Weight logged successfully! (${weightInLbs.toFixed(1)} lbs)`);
    } catch (error) {
      console.error('Error saving weight log:', error);
      Alert.alert('Error', 'Failed to save weight log');
    }
  };

  const getTodaysWeight = () => {
    const today = new Date().toISOString().split('T')[0];
    return weightLogs.find(log => log.date.split('T')[0] === today);
  };

  const getWeeklyAverageWeight = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyLogs = weightLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    });

    if (weeklyLogs.length === 0) return 0;
    
    const totalWeight = weeklyLogs.reduce((sum, log) => sum + log.weight, 0);
    return totalWeight / weeklyLogs.length;
  };

  const getWeeklyTonnageData = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      // Get tonnage for this specific day from analytics weeklyProgress
      const dayTonnage = analytics?.weeklyProgress?.find((week: any) => {
        const weekDate = new Date(week.week);
        return weekDate.toDateString() === day.toDateString();
      })?.tonnage || 0;
      
      days.push({
        date: day,
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        tonnage: dayTonnage
      });
    }
    return days;
  };

  const getMonthlyTonnageData = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weeks = [];
    
    // Get 4-5 weeks in the month
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(startOfMonth);
      weekStart.setDate(startOfMonth.getDate() + (i * 7));
      
      if (weekStart.getMonth() !== now.getMonth()) break;
      
      // Calculate weekly tonnage for this week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekTonnage = analytics?.weeklyProgress?.filter((week: any) => {
        const weekDate = new Date(week.week);
        return weekDate >= weekStart && weekDate <= weekEnd;
      }).reduce((sum: number, week: any) => sum + (week.tonnage || 0), 0) || 0;
      
      weeks.push({
        week: i + 1,
        label: `Week ${i + 1}`,
        tonnage: weekTonnage
      });
    }
    return weeks;
  };

  const getWeeklyWeightData = () => {
    console.log('=== WEEKLY DATA DEBUG ===');
    console.log('Current weightLogs:', weightLogs);
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    console.log('Start of week (Sunday):', startOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      // Find the closest weight log for this day (within 24 hours)
      const dayLog = weightLogs.find(log => {
        const logDate = new Date(log.date);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        
        const isMatch = logDate >= dayStart && logDate <= dayEnd;
        if (isMatch) {
          console.log(`Found match for ${day.toLocaleDateString()}:`, log);
        }
        
        return isMatch;
      });
      
      const dayData = {
        date: day,
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        weight: dayLog ? dayLog.weight : null
      };
      
      console.log(`Day ${i} (${dayData.label}):`, dayData);
      days.push(dayData);
    }
    
    console.log('Final weekly data days:', days);
    return days;
  };

  // Helper function to calculate dynamic Y-axis range for weight data
  const getWeightRange = (data: any[]) => {
    console.log('=== RANGE CALCULATION DEBUG ===');
    console.log('Input data for range calculation:', data);
    
    const weights = data.map(d => d.weight).filter(w => w !== null && w > 0);
    console.log('Filtered weights:', weights);
    
    if (weights.length === 0) {
      console.log('No weights found, using default range');
      return { min: 140, max: 160, range: 20 };
    }
    
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min;
    
    console.log('Raw min/max:', { min, max, range });
    
    // Add padding (25% on each side) and ensure minimum range
    const padding = Math.max(range * 0.25, 20);
    const minWithPadding = min - padding;
    const maxWithPadding = max + padding;
    
    const result = {
      min: Math.round(minWithPadding),
      max: Math.round(maxWithPadding),
      range: maxWithPadding - minWithPadding
    };
    
    console.log('Final calculated range:', result);
    console.log('Padding used:', padding);
    return result;
  };

  const getMonthlyWeightData = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weeks = [];
    
    // Get 4-5 weeks in the month
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(startOfMonth);
      weekStart.setDate(startOfMonth.getDate() + (i * 7));
      
      if (weekStart.getMonth() !== now.getMonth()) break;
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekLogs = weightLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });
      
      const avgWeight = weekLogs.length > 0 
        ? weekLogs.reduce((sum, log) => sum + log.weight, 0) / weekLogs.length
        : null;
      
      weeks.push({
        week: i + 1,
        label: `Week ${i + 1}`,
        weight: avgWeight
      });
    }
    return weeks;
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      console.log('Loading analytics data...');
      const [analyticsData, targetData] = await Promise.all([
        AnalyticsService.getInstance().calculateAnalytics(),
        CalorieTargetService.getInstance().getCurrentCalorieTarget()
      ]);
      
      console.log('Analytics data loaded:', analyticsData);
      console.log('Target data loaded:', targetData);
      
      setAnalytics(analyticsData);
      setCalorieTarget(targetData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default data instead of showing alert
      setAnalytics({
        totalTonnage: 0,
        weeklyTonnage: 0,
        totalWorkouts: 0,
        averageWorkoutDuration: 0,
        totalCaloriesBurned: 0,
        currentBodyFat: 0,
        bodyFatChange: 0,
        averageDailyCalories: 0,
        weeklyProgress: [],
        bodyFatHistory: [],
        muscleGroupFrequency: [],
        recommendations: []
      });
      setCalorieTarget({
        dailyTarget: 2000,
        goal: 'maintain'
      });
      
      // Calculate weekly metabolism estimate
      await calculateWeeklyMetabolismEstimate();
      
      // Calculate current metabolism estimate
      await calculateCurrentMetabolismEstimate();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const calculateWeeklyMetabolismEstimate = async () => {
    try {
      // Get weekly data from analytics
      const weeklyData = analytics?.weeklyProgress;
      if (!weeklyData || weeklyData.length === 0) {
        setWeeklyMetabolismData(null);
        return;
      }

      // Calculate weekly totals
      const weeklyCaloriesConsumed = weeklyData.reduce((sum: number, day: any) => 
        sum + (day.caloriesConsumed || 0), 0
      );
      const weeklyCaloriesBurned = weeklyData.reduce((sum: number, day: any) => 
        sum + (day.caloriesBurned || 0), 0
      );

      // Calculate net calories for the week
      const weeklyNetCalories = weeklyCaloriesConsumed - weeklyCaloriesBurned;

      // Calculate estimated weekly weight change using 3,500 calories per pound rule
      const estimatedWeeklyWeightChange = weeklyNetCalories / 3500;

      // Calculate daily average metabolism estimate
      // Assuming user provides their actual weight change for the week
      // For now, we'll use the estimated weight change as a baseline
      const dailyMetabolismEstimate = weeklyCaloriesConsumed / 7 - (estimatedWeeklyWeightChange * 3500 / 7);

      setWeeklyMetabolismData({
        weeklyCaloriesConsumed,
        weeklyCaloriesBurned,
        weeklyNetCalories,
        estimatedWeeklyWeightChange,
        dailyMetabolismEstimate,
        averageDailyConsumed: weeklyCaloriesConsumed / 7,
        averageDailyBurned: weeklyCaloriesBurned / 7
      });
    } catch (error) {
      console.error('Error calculating weekly metabolism estimate:', error);
    }
  };

  const calculateCurrentMetabolismEstimate = async () => {
    try {
      // Get metabolism data from MetabolismService
      const MetabolismService = (await import('../services/metabolismService')).default;
      const metabolismService = MetabolismService.getInstance();
      const metabolismData = await metabolismService.calculateUserMetabolism();
      
      if (metabolismData) {
        setCurrentMetabolismEstimate({
          bmr: metabolismData.bmr,
          tdee: metabolismData.tdee,
          activityLevel: metabolismData.activityLevel,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error calculating current metabolism estimate:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '#10B981';
    if (percentage >= 75) return '#F59E0B';
    return '#EF4444';
  };

  const prepareTonnageChartData = () => {
    if (!analytics?.weeklyProgress || !Array.isArray(analytics.weeklyProgress) || analytics.weeklyProgress.length === 0) {
      // Return default data for empty state
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [0, 0, 0, 0],
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3
        }]
      };
    }
    
    const data = analytics.weeklyProgress.slice(-8); // Last 8 weeks
    return {
      labels: data.map((week: any) => {
        try {
          const date = new Date(week.week);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        } catch {
          return 'Week';
        }
      }),
      datasets: [{
        data: data.map((week: any) => (week.tonnage || 0) / 1000), // Convert to thousands
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareBodyFatChartData = () => {
    if (!analytics?.bodyFatHistory || !Array.isArray(analytics.bodyFatHistory) || analytics.bodyFatHistory.length === 0) {
      return null;
    }
    
    const data = analytics.bodyFatHistory.slice(-10); // Last 10 entries
    return {
      labels: data.map((entry: any) => {
        try {
          const date = new Date(entry.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        } catch {
          return 'Date';
        }
      }),
      datasets: [{
        data: data.map((entry: any) => entry.percentage || 0),
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareCalorieChartData = () => {
    if (!analytics?.weeklyProgress || !Array.isArray(analytics.weeklyProgress) || analytics.weeklyProgress.length === 0) {
      return null;
    }
    
    const data = analytics.weeklyProgress.slice(-7); // Last 7 weeks
    return {
      labels: data.map((week: any) => {
        try {
          const date = new Date(week.week);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        } catch {
          return 'Week';
        }
      }),
      datasets: [{
        data: data.map((week: any) => (week.calories || 0) / 1000), // Convert to thousands
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareMuscleGroupData = () => {
    if (!analytics?.muscleGroupFrequency || !Array.isArray(analytics.muscleGroupFrequency) || analytics.muscleGroupFrequency.length === 0) {
      return null;
    }
    
    const data = analytics.muscleGroupFrequency.slice(0, 6); // Top 6 muscle groups
    return data.map((muscle: any) => ({
      name: muscle.muscle || 'Unknown',
      population: muscle.count || 0,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      legendFontColor: '#FFFFFF',
      legendFontSize: 12
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Advanced Analytics</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowWeightModal(true)}
          >
            <Ionicons name="scale" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowBodyFatTracker(true)}
          >
            <Ionicons name="fitness" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Timeframe Selector */}
        <View style={styles.timeframeSelector}>
          {(['week', 'month', 'year'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive
              ]}>
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Metabolism Estimate */}
        {currentMetabolismEstimate && (
          <View style={styles.metabolismTracker}>
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.metabolismGradient}
            >
              <View style={styles.metabolismHeader}>
                <Ionicons name="flame" size={24} color="#10B981" />
                <Text style={styles.metabolismTitle}>Current Metabolism</Text>
              </View>
              
              <View style={styles.metabolismStats}>
                <View style={styles.metabolismStatItem}>
                  <Text style={styles.metabolismStatLabel}>BMR</Text>
                  <Text style={styles.metabolismStatValue}>
                    {Math.round(currentMetabolismEstimate.bmr)} cal/day
                  </Text>
                  <Text style={styles.metabolismStatDescription}>Base Metabolic Rate</Text>
                </View>
                
                <View style={styles.metabolismStatItem}>
                  <Text style={styles.metabolismStatLabel}>TDEE</Text>
                  <Text style={styles.metabolismStatValue}>
                    {Math.round(currentMetabolismEstimate.tdee)} cal/day
                  </Text>
                  <Text style={styles.metabolismStatDescription}>Total Daily Energy Expenditure</Text>
                </View>
                
                <View style={styles.metabolismStatItem}>
                  <Text style={styles.metabolismStatLabel}>Activity Level</Text>
                  <Text style={styles.metabolismStatValue}>
                    {currentMetabolismEstimate.activityLevel}
                  </Text>
                  <Text style={styles.metabolismStatDescription}>Current Activity Level</Text>
                </View>
              </View>
              
              <View style={styles.metabolismNote}>
                <Ionicons name="information-circle" size={16} color="#94A3B8" />
                <Text style={styles.metabolismNoteText}>
                  Based on your personal information and activity level
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}


        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Weekly Tonnage</Text>
            <Text style={styles.metricValue}>
              {formatNumber(analytics?.weeklyTonnage || 0)} lbs
            </Text>
            <Text style={styles.metricSubtext}>
              Sunday to Saturday
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Weekly Avg Weight</Text>
            <Text style={styles.metricValue}>
              {getWeeklyAverageWeight().toFixed(1)} lbs
            </Text>
            <Text style={styles.metricSubtext}>
              Sunday to Saturday
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Metabolism</Text>
            <Text style={styles.metricValue}>
              {currentMetabolismEstimate?.bmr ? Math.round(currentMetabolismEstimate.bmr) : 
               currentMetabolismEstimate?.tdee ? Math.round(currentMetabolismEstimate.tdee) : 
               '1632'}
            </Text>
            <Text style={styles.metricSubtext}>
              Calories/day (BMR)
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Body Fat</Text>
            <Text style={styles.metricValue}>
              {analytics?.currentBodyFat?.toFixed(1) || 'N/A'}%
            </Text>
            <Text style={[
              styles.metricSubtext,
              { color: analytics?.bodyFatChange > 0 ? '#EF4444' : '#10B981' }
            ]}>
              {analytics?.bodyFatChange > 0 ? '+' : ''}{analytics?.bodyFatChange?.toFixed(1) || 0}%
            </Text>
          </View>
        </View>

        {/* Tonnage Chart */}
        {prepareTonnageChartData() && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Tonnage (lbs × 1000)</Text>
            <LineChart
              data={prepareTonnageChartData()!}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#1F2937',
                backgroundGradientFrom: '#1F2937',
                backgroundGradientTo: '#1F2937',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#10B981' }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Body Fat Chart */}
        {prepareBodyFatChartData() && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Body Fat Percentage Trend</Text>
            <LineChart
              data={prepareBodyFatChartData()!}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#1F2937',
                backgroundGradientFrom: '#1F2937',
                backgroundGradientTo: '#1F2937',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#8B5CF6' }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Calorie Target Progress */}
        {calorieTarget && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Daily Calorie Target</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Target: {calorieTarget.dailyTarget} cal</Text>
                <Text style={styles.progressLabel}>
                  Today: {analytics?.averageDailyCalories?.toFixed(0) || 0} cal
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min((analytics?.averageDailyCalories || 0) / calorieTarget.dailyTarget * 100, 100)}%`,
                      backgroundColor: getProgressColor(analytics?.averageDailyCalories || 0, calorieTarget.dailyTarget)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressGoal}>
                Goal: {calorieTarget.goal.charAt(0).toUpperCase() + calorieTarget.goal.slice(1)} Weight
              </Text>
            </View>
          </View>
        )}

        {/* Muscle Group Distribution */}
        {prepareMuscleGroupData() && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Muscle Group Training Frequency</Text>
            <PieChart
              data={prepareMuscleGroupData()!}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Weekly Metabolism Estimate Section */}
        {weeklyMetabolismData && (
          <View style={styles.metabolismEstimateContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Weekly Metabolism Analysis</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Based on your weekly calorie data, here's your metabolism estimate and projected weight change.
            </Text>
            
            {/* Weekly Summary */}
            <View style={styles.weeklySummaryContainer}>
              <View style={styles.weeklySummaryItem}>
                <Text style={styles.weeklySummaryLabel}>Weekly Calories Consumed</Text>
                <Text style={styles.weeklySummaryValue}>
                  {weeklyMetabolismData.weeklyCaloriesConsumed.toFixed(0)} cal
                </Text>
              </View>
              <View style={styles.weeklySummaryItem}>
                <Text style={styles.weeklySummaryLabel}>Weekly Calories Burned</Text>
                <Text style={styles.weeklySummaryValue}>
                  {weeklyMetabolismData.weeklyCaloriesBurned.toFixed(0)} cal
                </Text>
              </View>
              <View style={styles.weeklySummaryItem}>
                <Text style={styles.weeklySummaryLabel}>Net Calories</Text>
                <Text style={[
                  styles.weeklySummaryValue,
                  { color: weeklyMetabolismData.weeklyNetCalories >= 0 ? '#EF4444' : '#10B981' }
                ]}>
                  {weeklyMetabolismData.weeklyNetCalories >= 0 ? '+' : ''}{weeklyMetabolismData.weeklyNetCalories.toFixed(0)} cal
                </Text>
              </View>
            </View>

            {/* Estimates */}
            <View style={styles.estimatesContainer}>
              <Text style={styles.estimatesTitle}>Weekly Estimates</Text>
              
              <View style={styles.estimateItem}>
                <View style={styles.estimateHeader}>
                  <Ionicons name="trending-up" size={20} color="#F59E0B" />
                  <Text style={styles.estimateLabel}>Projected Weight Change</Text>
                </View>
                <Text style={[
                  styles.estimateValue,
                  { color: weeklyMetabolismData.estimatedWeeklyWeightChange >= 0 ? '#EF4444' : '#10B981' }
                ]}>
                  {weeklyMetabolismData.estimatedWeeklyWeightChange >= 0 ? '+' : ''}{weeklyMetabolismData.estimatedWeeklyWeightChange.toFixed(2)} lbs/week
                </Text>
                <Text style={styles.estimateDescription}>
                  Based on 3,500 calories = 1 lb of fat
                </Text>
              </View>

              <View style={styles.estimateItem}>
                <View style={styles.estimateHeader}>
                  <Ionicons name="flame" size={20} color="#10B981" />
                  <Text style={styles.estimateLabel}>Daily Metabolism Estimate</Text>
                </View>
                <Text style={styles.estimateValue}>
                  {weeklyMetabolismData.dailyMetabolismEstimate.toFixed(0)} cal/day
                </Text>
                <Text style={styles.estimateDescription}>
                  Estimated daily calorie burn from metabolism
                </Text>
              </View>

              <View style={styles.estimateItem}>
                <View style={styles.estimateHeader}>
                  <Ionicons name="stats-chart" size={20} color="#3B82F6" />
                  <Text style={styles.estimateLabel}>Daily Averages</Text>
                </View>
                <View style={styles.dailyAverages}>
                  <Text style={styles.dailyAverageText}>
                    Consumed: {weeklyMetabolismData.averageDailyConsumed.toFixed(0)} cal/day
                  </Text>
                  <Text style={styles.dailyAverageText}>
                    Burned: {weeklyMetabolismData.averageDailyBurned.toFixed(0)} cal/day
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Weight Progress Graph */}
        {weightLogs.length > 0 && (
          <View style={styles.weightProgressContainer}>
            <View style={styles.graphHeader}>
              <Text style={styles.weightProgressTitle}>Weight Progress</Text>
              <View style={styles.graphToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, weightGraphTimeframe === 'week' && styles.toggleButtonActive]}
                  onPress={() => setWeightGraphTimeframe('week')}
                >
                  <Text style={[styles.toggleButtonText, weightGraphTimeframe === 'week' && styles.toggleButtonTextActive]}>
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, weightGraphTimeframe === 'month' && styles.toggleButtonActive]}
                  onPress={() => setWeightGraphTimeframe('month')}
                >
                  <Text style={[styles.toggleButtonText, weightGraphTimeframe === 'month' && styles.toggleButtonTextActive]}>
                    Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {weightGraphTimeframe === 'week' ? (() => {
              const weeklyData = getWeeklyWeightData();
              const weightsWithData = weeklyData.filter(d => d.weight !== null);
              
              if (weightsWithData.length === 0) {
                return (
                  <View style={styles.graphContainer}>
                    <View style={styles.emptyGraphContainer}>
                      <Text style={styles.emptyGraphText}>No weight data for this week</Text>
                      <Text style={styles.emptyGraphSubtext}>Log your weight to see progress</Text>
                    </View>
                  </View>
                );
              }
              
              // Fixed range for better scaling
              const weights = weightsWithData.map(d => d.weight);
              const minWeight = Math.min(...weights);
              const maxWeight = Math.max(...weights);
              
              // Use fixed range around the data
              const range = Math.max(maxWeight - minWeight, 20); // Minimum 20 lb range
              const center = (minWeight + maxWeight) / 2;
              const fixedMin = center - range / 2;
              const fixedMax = center + range / 2;
              
              console.log('FIXED RANGE:', { minWeight, maxWeight, fixedMin, fixedMax, range });
              
              return (
                <View style={styles.graphContainer}>
                  <View style={styles.yAxis}>
                    <Text style={styles.yAxisLabel}>Weight (lbs)</Text>
                    <View style={styles.yAxisValues}>
                      <Text style={styles.yAxisValue}>{Math.round(fixedMax)}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(fixedMin + (range * 0.75))}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(fixedMin + (range * 0.5))}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(fixedMin + (range * 0.25))}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(fixedMin)}</Text>
                    </View>
                  </View>
                  <View style={styles.graphArea}>
                    <View style={styles.basicGraphContainer}>
                      {weeklyData.map((day, index) => {
                        if (!day.weight) return null;
                        
                        // Basic positioning - no complex calculations
                        const x = 10 + (index * 12); // Spread evenly across 7 days (10% + index * 12% = 10%, 22%, 34%, 46%, 58%, 70%, 82%)
                        const yPercent = ((day.weight - fixedMin) / range) * 80; // Use 80% of height
                        const y = 90 - yPercent; // Invert Y: 90% - calculated position (10% bottom margin)
                        
                        console.log(`${day.label}: ${day.weight}lbs`);
                        console.log(`  Range: ${fixedMin} to ${fixedMax} (${range})`);
                        console.log(`  yPercent: ((${day.weight} - ${fixedMin}) / ${range}) * 80 = ${yPercent}%`);
                        console.log(`  Final Y: 90 - ${yPercent} = ${y}%`);
                        console.log(`  Position: (${x}%, ${y}%)`);
                        
                        return (
                          <View key={index}>
                            <View 
                              style={[
                                styles.basicGraphDot,
                                { 
                                  left: `${x}%`,
                                  top: `${y}%`,
                                  position: 'absolute'
                                }
                              ]} 
                            />
                            <Text style={[styles.basicGraphLabel, { 
                              left: `${x}%`, 
                              top: `${y - 10}%`,
                              position: 'absolute'
                            }]}>
                              {day.weight.toFixed(1)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View style={styles.xAxis}>
                      {weeklyData.map((day, index) => (
                        <Text key={index} style={styles.xAxisLabel}>
                          {day.label}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })() : (() => {
              const monthlyData = getMonthlyWeightData();
              const weightsWithData = monthlyData.filter(d => d.weight !== null);
              
              if (weightsWithData.length === 0) {
                return (
                  <View style={styles.graphContainer}>
                    <View style={styles.emptyGraphContainer}>
                      <Text style={styles.emptyGraphText}>No weight data for this month</Text>
                      <Text style={styles.emptyGraphSubtext}>Log your weight to see progress</Text>
                    </View>
                  </View>
                );
              }
              
              // Simple range calculation for monthly
              const weights = weightsWithData.map(d => d.weight);
              const minWeight = Math.min(...weights);
              const maxWeight = Math.max(...weights);
              const weightRange = maxWeight - minWeight;
              const padding = Math.max(weightRange * 0.2, 10);
              const graphMin = minWeight - padding;
              const graphMax = maxWeight + padding;
              const graphRange = graphMax - graphMin;
              
              return (
                <View style={styles.graphContainer}>
                  <View style={styles.yAxis}>
                    <Text style={styles.yAxisLabel}>Weight (lbs)</Text>
                    <View style={styles.yAxisValues}>
                      <Text style={styles.yAxisValue}>{Math.round(graphMax)}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(graphMin + (graphRange * 0.75))}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(graphMin + (graphRange * 0.5))}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(graphMin + (graphRange * 0.25))}</Text>
                      <Text style={styles.yAxisValue}>{Math.round(graphMin)}</Text>
                    </View>
                  </View>
                  <View style={styles.graphArea}>
                    <View style={styles.simpleGraphContainer}>
                      {monthlyData.map((week, index) => {
                        if (!week.weight) return null;
                        
                        // Simple positioning for monthly
                        const totalWeeks = monthlyData.length;
                        const xPos = totalWeeks > 1 ? (index / (totalWeeks - 1)) * 100 : 50;
                        const yPos = 100 - ((week.weight - graphMin) / graphRange) * 100;
                        
                        return (
                          <View key={index} style={styles.simpleGraphPoint}>
                            <View 
                              style={[
                                styles.simpleGraphDot,
                                { 
                                  left: `${xPos}%`,
                                  top: `${yPos}%`
                                }
                              ]} 
                            />
                            <Text style={[styles.simpleGraphLabel, { left: `${xPos}%`, top: `${yPos - 25}%` }]}>
                              {week.weight.toFixed(1)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View style={styles.xAxis}>
                      {monthlyData.map((week, index) => (
                        <Text key={index} style={styles.xAxisLabel}>{week.label}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })()}
          </View>
        )}


        {/* AI Recommendations */}
        {analytics?.recommendations && analytics.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
            {analytics.recommendations.map((rec: any, index: number) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Ionicons 
                    name={
                      rec.type === 'workout' ? 'fitness' :
                      rec.type === 'nutrition' ? 'restaurant' : 'bed'
                    } 
                    size={20} 
                    color="#10B981" 
                  />
                  <Text style={styles.recommendationType}>
                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                  </Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: rec.priority === 'high' ? '#EF4444' : rec.priority === 'medium' ? '#F59E0B' : '#10B981' }
                  ]}>
                    <Text style={styles.priorityText}>{rec.priority}</Text>
                  </View>
                </View>
                <Text style={styles.recommendationText}>{rec.message}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Body Fat Tracker Modal */}
      <BodyFatTracker
        visible={showBodyFatTracker}
        onClose={() => setShowBodyFatTracker(false)}
      />

      {/* Weight Logging Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWeightModal}
        onRequestClose={() => setShowWeightModal(false)}
      >
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWeightModal(false)} style={styles.modalCloseButton}>
              <Ionicons name="close-circle" size={30} color="#EF4444" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Weight</Text>
          </View>

          <View style={styles.weightInputContainer}>
            <Text style={styles.weightInputDate}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            {getTodaysWeight() && (
              <Text style={styles.weightInputExisting}>
                Already logged: {getTodaysWeight()?.weight.toFixed(1)} lbs
              </Text>
            )}
            <Text style={styles.weightInputLabel}>Current Weight</Text>
            
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.weightInput}
                value={currentWeight}
                onChangeText={setCurrentWeight}
                placeholder="Enter weight"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.weightUnitSelector}>
                <TouchableOpacity
                  style={[
                    styles.weightUnitButton,
                    weightUnit === 'lbs' && styles.weightUnitButtonActive
                  ]}
                  onPress={() => setWeightUnit('lbs')}
                >
                  <Text style={[
                    styles.weightUnitButtonText,
                    weightUnit === 'lbs' && styles.weightUnitButtonTextActive
                  ]}>lbs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.weightUnitButton,
                    weightUnit === 'kg' && styles.weightUnitButtonActive
                  ]}
                  onPress={() => setWeightUnit('kg')}
                >
                  <Text style={[
                    styles.weightUnitButtonText,
                    weightUnit === 'kg' && styles.weightUnitButtonTextActive
                  ]}>kg</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.weightModalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowWeightModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveWeightLog}
            >
              <Text style={styles.saveButtonText}>Save Weight</Text>
            </TouchableOpacity>
          </View>

        </LinearGradient>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111111',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
    marginVertical: 20,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#10B981',
  },
  timeframeButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeframeButtonTextActive: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGoal: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    lineHeight: 20,
  },
  metabolismEstimateContainer: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  weeklySummaryContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  weeklySummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weeklySummaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  weeklySummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  estimatesContainer: {
    marginTop: 16,
  },
  estimatesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  estimateItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  estimateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  estimateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  estimateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  estimateDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dailyAverages: {
    marginTop: 8,
  },
  dailyAverageText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  currentMetabolismContainer: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  metabolismStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12,
  },
  metabolismStatItem: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metabolismStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  metabolismStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 4,
  },
  metabolismStatDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  metabolismNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  metabolismNoteText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  metabolismTracker: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  metabolismGradient: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metabolismHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metabolismTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  metabolismStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metabolismStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metabolismStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    textAlign: 'center',
  },
  metabolismStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
    textAlign: 'center',
  },
  metabolismStatDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  metabolismNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weightInputContainer: {
    padding: 20,
    alignItems: 'center',
  },
  weightInputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  weightInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '80%',
  },
  weightModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  weightGraphContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  weightGraphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  weightGraph: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  weightBar: {
    alignItems: 'center',
    flex: 1,
  },
  weightBarFill: {
    backgroundColor: '#10B981',
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  weightBarLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  weightBarValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  weightProgressContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  weightProgressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  weightProgressGraph: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  weightProgressBar: {
    alignItems: 'center',
    flex: 1,
  },
  weightProgressBarFill: {
    backgroundColor: '#10B981',
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  weightProgressPoint: {
    width: 20,
    height: 100,
    position: 'relative',
    marginBottom: 8,
  },
  weightProgressPointFill: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    left: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  weightProgressBarLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  weightProgressBarValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  weightInputDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  weightInputExisting: {
    fontSize: 14,
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  weightUnitSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  weightUnitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  weightUnitButtonActive: {
    backgroundColor: '#10B981',
  },
  weightUnitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  weightUnitButtonTextActive: {
    color: '#FFFFFF',
  },
  tonnageProgressContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tonnageProgressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  tonnageProgressGraph: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 15,
  },
  tonnageProgressBar: {
    alignItems: 'center',
    flex: 1,
  },
  tonnageProgressBarFill: {
    backgroundColor: '#3B82F6',
    width: 30,
    borderRadius: 15,
    marginBottom: 8,
    minHeight: 20,
  },
  tonnageProgressBarLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  tonnageProgressBarValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  tonnageProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tonnageProgressStat: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    flex: 1,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  graphToggle: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#10B981',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  graphContainer: {
    flexDirection: 'row',
    height: 200,
  },
  yAxis: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    transform: [{ rotate: '-90deg' }],
    marginBottom: 20,
  },
  yAxisValues: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisValue: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  graphArea: {
    flex: 1,
    position: 'relative',
  },
  graphBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    paddingHorizontal: 10,
  },
  graphBar: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  graphBarFill: {
    backgroundColor: '#3B82F6',
    width: 20,
    borderRadius: 10,
    marginBottom: 4,
    minHeight: 10,
  },
  graphBarValue: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
  lineGraphContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  lineGraphPoint: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  lineGraphDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  lineGraphLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#10B981',
    marginTop: -1,
  },
  lineGraphValue: {
    position: 'absolute',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: -15,
    width: 30,
  },
  debugGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 0,
  },
  debugGridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 0,
  },
  simpleGraphContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  simpleGraphPoint: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  simpleGraphDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    marginLeft: -8,
    marginTop: -8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  simpleGraphLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    width: 40,
    marginLeft: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyGraphContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyGraphText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyGraphSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  debugLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 1,
  },
  basicGraphContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  basicGraphDot: {
    width: 14,
    height: 14,
    backgroundColor: '#10B981',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 4,
  },
  basicGraphLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 35,
  },
});



