import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

const { width } = Dimensions.get('window');

interface WaterTrackerProps {
  selectedDate: Date;
}

export default function WaterTracker({ selectedDate }: WaterTrackerProps) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [animationValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<'glasses' | 'fl_oz' | 'ml'>('glasses');
  const [customAmount, setCustomAmount] = useState('');

  const dailyGoal = 8; // 8 glasses of water (8 oz each = 64 oz total)
  const glassSize = 8; // 8 oz per glass

  // Unit conversion functions
  const convertToOunces = (amount: number, unit: string) => {
    switch (unit) {
      case 'glasses':
        return amount * glassSize;
      case 'fl_oz':
        return amount;
      case 'ml':
        return amount * 0.033814; // 1 ml = 0.033814 fl oz
      default:
        return amount * glassSize;
    }
  };

  const convertFromOunces = (ounces: number, unit: string) => {
    switch (unit) {
      case 'glasses':
        return ounces / glassSize;
      case 'fl_oz':
        return ounces;
      case 'ml':
        return ounces / 0.033814;
      default:
        return ounces / glassSize;
    }
  };

  const getDisplayAmount = () => {
    const ounces = convertToOunces(waterIntake, 'glasses');
    return parseFloat(convertFromOunces(ounces, selectedUnit).toFixed(2));
  };

  const getDisplayGoal = () => {
    const ounces = convertToOunces(dailyGoal, 'glasses');
    return parseFloat(convertFromOunces(ounces, selectedUnit).toFixed(2));
  };

  const getUnitLabel = () => {
    switch (selectedUnit) {
      case 'glasses':
        return 'glasses';
      case 'fl_oz':
        return 'fl oz';
      case 'ml':
        return 'ml';
      default:
        return 'glasses';
    }
  };

  useEffect(() => {
    loadWaterData();
  }, [selectedDate]);

  const loadWaterData = async () => {
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const storedData = await DataStorage.getData(`water_intake_${dateKey}`);
      setWaterIntake(storedData || 0);
    } catch (error) {
      console.error('Error loading water data:', error);
    }
  };

  const saveWaterData = async (amount: number) => {
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      await DataStorage.saveData(`water_intake_${dateKey}`, amount);
    } catch (error) {
      console.error('Error saving water data:', error);
    }
  };

  const addWater = async (amount: number) => {
    // Convert the amount to glasses for storage
    const glassesAmount = convertFromOunces(convertToOunces(amount, selectedUnit), 'glasses');
    const newAmount = waterIntake + glassesAmount;
    setWaterIntake(newAmount);
    await saveWaterData(newAmount);
    animateWater();
  };

  const removeWater = async (amount: number) => {
    // Convert the amount to glasses for storage
    const glassesAmount = convertFromOunces(convertToOunces(amount, selectedUnit), 'glasses');
    const newAmount = Math.max(0, waterIntake - glassesAmount);
    setWaterIntake(newAmount);
    await saveWaterData(newAmount);
    animateWater();
  };

  const handleCustomAmount = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number');
      return;
    }
    await addWater(amount);
    setCustomAmount('');
  };

  const animateWater = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const getProgressPercentage = () => {
    return Math.min((waterIntake / dailyGoal) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage < 50) return ['#EF4444', '#DC2626']; // Red
    if (percentage < 75) return ['#F59E0B', '#D97706']; // Orange
    if (percentage < 90) return ['#10B981', '#059669']; // Green
    return ['#3B82F6', '#2563EB']; // Blue
  };

  const getMotivationalMessage = () => {
    const percentage = getProgressPercentage();
    if (percentage === 0) return "Start your hydration journey! 💧";
    if (percentage < 25) return "Every drop counts! Keep going! 🌊";
    if (percentage < 50) return "You're making progress! Stay hydrated! 💪";
    if (percentage < 75) return "Great job! Almost there! 🎯";
    if (percentage < 90) return "Excellent! You're so close! ⭐";
    if (percentage < 100) return "Amazing! Just a bit more! 🏆";
    return "Perfect! You've reached your goal! 🎉";
  };

  const scaleInterpolate = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.title}>Water Tracker</Text>
          </View>
          <Text style={styles.subtitle}>Stay hydrated throughout the day</Text>
        </View>

        {/* Progress Section */}
        <Animated.View style={[styles.progressContainer, { transform: [{ scale: scaleInterpolate }] }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Hydration</Text>
            <Text style={styles.progressSubtitle}>
              {Math.round(getDisplayAmount() * 10) / 10} / {Math.round(getDisplayGoal() * 10) / 10} {getUnitLabel()}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={getProgressColor()}
                style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {getProgressPercentage().toFixed(2)}%
            </Text>
          </View>

          {/* Motivational Message */}
          <Text style={styles.motivationalMessage}>
            {getMotivationalMessage()}
          </Text>
        </Animated.View>

        {/* Unit Selector */}
        <View style={styles.unitSelectorContainer}>
          <Text style={styles.unitSelectorTitle}>Unit</Text>
          <View style={styles.unitSelector}>
            {(['glasses', 'fl_oz', 'ml'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  selectedUnit === unit && styles.selectedUnitButton
                ]}
                onPress={() => setSelectedUnit(unit)}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnit === unit && styles.selectedUnitButtonText
                ]}>
                  {unit === 'fl_oz' ? 'fl oz' : unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddContainer}>
          <Text style={styles.quickAddTitle}>Quick Add</Text>
          <View style={styles.quickAddButtons}>
            {selectedUnit === 'glasses' && (
              <>
                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(1)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+1 Glass</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(2)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+2 Glasses</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(4)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+4 Glasses</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedUnit === 'fl_oz' && (
              <>
                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(8)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+8 fl oz</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(16)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+16 fl oz</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(32)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+32 fl oz</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedUnit === 'ml' && (
              <>
                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(250)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+250ml</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(500)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+500ml</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAddButton}
                  onPress={() => addWater(1000)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickAddButtonText}>+1L</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Custom Amount Input */}
        <View style={styles.customAmountContainer}>
          <Text style={styles.customAmountTitle}>Custom Amount</Text>
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder={`Enter amount in ${getUnitLabel()}`}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleCustomAmount}
            />
            <TouchableOpacity
              style={styles.addCustomButton}
              onPress={handleCustomAmount}
              disabled={!customAmount.trim()}
            >
              <Ionicons 
                name="add" 
                size={20} 
                color={customAmount.trim() ? "#FFFFFF" : "#6B7280"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(waterIntake * glassSize).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Ounces</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {((waterIntake * glassSize) / 33.814).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Liters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {((waterIntake * glassSize) / 8).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Cups</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'right',
  },
  motivationalMessage: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  unitSelectorContainer: {
    marginBottom: 20,
  },
  unitSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedUnitButton: {
    backgroundColor: '#10B981',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  selectedUnitButtonText: {
    color: '#FFFFFF',
  },
  quickAddContainer: {
    marginBottom: 20,
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickAddButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  customAmountContainer: {
    marginBottom: 20,
  },
  customAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  customInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  addCustomButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
