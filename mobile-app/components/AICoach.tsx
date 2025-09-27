import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AIWorkoutGenerator, WorkoutPreferences, GeneratedWorkout } from '../lib/aiWorkoutGenerator';

const { width, height } = Dimensions.get('window');

interface AICoachProps {
  visible: boolean;
  onClose: () => void;
  onStartWorkout: (workout: any) => void;
}

export default function AICoach({ visible, onClose, onStartWorkout }: AICoachProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userGoals, setUserGoals] = useState([]);
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [targetMuscles, setTargetMuscles] = useState([]);
  const [workoutType, setWorkoutType] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const steps = [
    {
      title: 'What are your fitness goals?',
      type: 'goals',
      options: [
        { id: 'weight_loss', name: 'Weight Loss', icon: 'flame', color: '#EF4444' },
        { id: 'muscle_gain', name: 'Muscle Gain', icon: 'fitness', color: '#10B981' },
        { id: 'strength', name: 'Strength', icon: 'barbell', color: '#3B82F6' },
        { id: 'endurance', name: 'Endurance', icon: 'heart', color: '#8B5CF6' },
        { id: 'flexibility', name: 'Flexibility', icon: 'body', color: '#F59E0B' },
        { id: 'general', name: 'General Fitness', icon: 'star', color: '#6B7280' }
      ]
    },
    {
      title: 'What\'s your fitness level?',
      type: 'level',
      options: [
        { id: 'beginner', name: 'Beginner', description: 'New to working out', icon: 'leaf', color: '#10B981' },
        { id: 'intermediate', name: 'Intermediate', description: 'Some experience', icon: 'trending-up', color: '#3B82F6' },
        { id: 'advanced', name: 'Advanced', description: 'Very experienced', icon: 'trophy', color: '#8B5CF6' },
        { id: 'expert', name: 'Expert', description: 'Professional level', icon: 'diamond', color: '#EF4444' }
      ]
    },
    {
      title: 'What equipment do you have?',
      type: 'equipment',
      options: [
        { id: 'bodyweight', name: 'Bodyweight Only', icon: 'person', color: '#6B7280' },
        { id: 'dumbbells', name: 'Dumbbells', icon: 'fitness', color: '#10B981' },
        { id: 'barbell', name: 'Barbell & Plates', icon: 'barbell', color: '#3B82F6' },
        { id: 'gym', name: 'Full Gym Access', icon: 'business', color: '#8B5CF6' },
        { id: 'home_gym', name: 'Home Gym', icon: 'home', color: '#F59E0B' },
        { id: 'minimal', name: 'Minimal Equipment', icon: 'ellipsis-horizontal', color: '#6B7280' }
      ]
    },
    {
      title: 'How long do you want to work out?',
      type: 'duration',
      options: [
        { id: 15, name: '15 minutes', description: 'Quick session', icon: 'time', color: '#10B981' },
        { id: 30, name: '30 minutes', description: 'Standard session', icon: 'time', color: '#3B82F6' },
        { id: 45, name: '45 minutes', description: 'Full session', icon: 'time', color: '#8B5CF6' },
        { id: 60, name: '60+ minutes', description: 'Extended session', icon: 'time', color: '#EF4444' }
      ]
    },
    {
      title: 'What muscle groups do you want to focus on?',
      type: 'muscles',
      options: [
        { id: 'full_body', name: 'Full Body', icon: 'body', color: '#10B981' },
        { id: 'upper_body', name: 'Upper Body', icon: 'fitness', color: '#3B82F6' },
        { id: 'lower_body', name: 'Lower Body', icon: 'walk', color: '#8B5CF6' },
        { id: 'core', name: 'Core', icon: 'ellipse', color: '#F59E0B' },
        { id: 'push', name: 'Push Muscles', icon: 'arrow-up', color: '#EF4444' },
        { id: 'pull', name: 'Pull Muscles', icon: 'arrow-down', color: '#6B7280' }
      ]
    },
    {
      title: 'What type of workout do you prefer?',
      type: 'type',
      options: [
        { id: 'strength', name: 'Strength Training', description: 'Heavy weights, low reps', icon: 'barbell', color: '#3B82F6' },
        { id: 'hypertrophy', name: 'Muscle Building', description: 'Moderate weights, moderate reps', icon: 'fitness', color: '#10B981' },
        { id: 'hiit', name: 'HIIT', description: 'High intensity intervals', icon: 'flash', color: '#EF4444' },
        { id: 'cardio', name: 'Cardio', description: 'Endurance training', icon: 'heart', color: '#8B5CF6' },
        { id: 'functional', name: 'Functional', description: 'Real-world movements', icon: 'body', color: '#F59E0B' },
        { id: 'mixed', name: 'Mixed', description: 'Combination of styles', icon: 'shuffle', color: '#6B7280' }
      ]
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [visible]);

  const handleOptionSelect = (option: any) => {
    const currentStepData = steps[currentStep];
    console.log('Option selected:', option, 'Step type:', currentStepData.type);
    
    switch (currentStepData.type) {
      case 'goals':
        setUserGoals(prev => {
          const newGoals = prev.includes(option.id) 
            ? prev.filter(id => id !== option.id)
            : [...prev, option.id];
          console.log('Updated goals:', newGoals);
          return newGoals;
        });
        break;
      case 'level':
        console.log('Setting fitness level:', option.id);
        setFitnessLevel(option.id);
        break;
      case 'equipment':
        setAvailableEquipment(prev => {
          const newEquipment = prev.includes(option.id) 
            ? prev.filter(id => id !== option.id)
            : [...prev, option.id];
          console.log('Updated equipment:', newEquipment);
          return newEquipment;
        });
        break;
      case 'duration':
        console.log('Setting duration:', option.id);
        setWorkoutDuration(Number(option.id));
        break;
      case 'muscles':
        setTargetMuscles(prev => {
          const newMuscles = prev.includes(option.id) 
            ? prev.filter(id => id !== option.id)
            : [...prev, option.id];
          console.log('Updated muscles:', newMuscles);
          return newMuscles;
        });
        break;
      case 'type':
        console.log('Setting workout type:', option.id);
        setWorkoutType(option.id);
        break;
    }
  };

  const nextStep = () => {
    console.log('Next step clicked. Current step:', currentStep, 'Total steps:', steps.length);
    console.log('Can proceed:', canProceed());
    
    if (currentStep < steps.length - 1) {
      if (canProceed()) {
        setCurrentStep(prev => prev + 1);
      } else {
        console.log('Cannot proceed - missing required selections');
        Alert.alert(
          'Missing Information',
          'Please make a selection before proceeding to the next step.',
          [{ text: 'OK' }]
        );
      }
    } else {
      if (canProceed()) {
        generateWorkout();
      } else {
        console.log('Cannot generate workout - missing required selections');
        Alert.alert(
          'Missing Information',
          'Please complete all steps before generating your workout.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateWorkout = async () => {
    console.log('Starting workout generation...');
    console.log('User preferences:', {
      goals: userGoals,
      fitnessLevel: fitnessLevel,
      equipment: availableEquipment,
      duration: workoutDuration,
      targetMuscles: targetMuscles,
      workoutType: workoutType
    });
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const preferences: WorkoutPreferences = {
      goals: userGoals,
      fitnessLevel: fitnessLevel,
      equipment: availableEquipment,
      duration: workoutDuration,
      targetMuscles: targetMuscles,
      workoutType: workoutType
    };
    
    console.log('Generating workout with preferences:', preferences);
    
    try {
      const generatedWorkout = AIWorkoutGenerator.generateWorkout(preferences);
      console.log('Generated workout:', generatedWorkout);
    
      // Convert to the format expected by the UI
      const workout = {
        id: generatedWorkout.id,
        name: generatedWorkout.name,
        description: generatedWorkout.description,
        difficulty: generatedWorkout.difficulty,
        duration: generatedWorkout.duration,
        type: generatedWorkout.type,
        goals: generatedWorkout.goals,
        equipment: generatedWorkout.equipment,
        muscles: generatedWorkout.muscles,
        exercises: generatedWorkout.exercises.map(ex => ({
          exercise: {
            id: ex.id,
            name: ex.name,
            muscle: ex.muscle,
            primaryMuscles: ex.primaryMuscles,
            secondaryMuscles: ex.secondaryMuscles,
            equipment: ex.equipment,
            difficulty: ex.difficulty,
            instructions: ex.instructions,
            formTips: ex.formTips,
            commonMistakes: ex.commonMistakes,
            caloriesPerMinute: 5
          },
          sets: Array(ex.sets).fill(0).map(() => ({
            reps: ex.reps,
            weight: ex.weight || 0,
            restTime: ex.restTime,
            completed: false
          }))
        })),
        calories: generatedWorkout.calories,
        aiGenerated: true,
        confidence: generatedWorkout.confidence,
        warmup: generatedWorkout.warmup,
        cooldown: generatedWorkout.cooldown
      };
      
      console.log('Converted workout:', workout);
      setAiRecommendations([workout]);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error generating workout:', error);
      setIsAnalyzing(false);
      Alert.alert(
        'Error', 
        'There was an error generating your workout. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };


  const startRecommendedWorkout = (workout: any) => {
    onStartWorkout(workout);
    onClose();
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    if (isAnalyzing) {
      return (
        <View style={styles.analyzingContainer}>
          <Animated.View style={[styles.analyzingIcon, { transform: [{ rotate: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
          }) }] }]}>
            <Ionicons name="sparkles" size={64} color="#10B981" />
          </Animated.View>
          <Text style={styles.analyzingTitle}>AI is analyzing your preferences...</Text>
          <Text style={styles.analyzingSubtitle}>
            Creating the perfect workout for you
          </Text>
        </View>
      );
    }

    if (aiRecommendations.length > 0) {
      return (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Your AI Workout is Ready!</Text>
          <Text style={styles.recommendationsSubtitle}>
            Based on your preferences, here's your personalized workout
          </Text>
          
          {aiRecommendations.map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recommendationCard}
              onPress={() => startRecommendedWorkout(workout)}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.recommendationGradient}
              >
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationName}>{workout.name}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {Math.round(workout.confidence * 100)}% Match
                    </Text>
                  </View>
                </View>
                <Text style={styles.recommendationDescription}>
                  {workout.description}
                </Text>
                <View style={styles.recommendationStats}>
                  <View style={styles.recommendationStat}>
                    <Ionicons name="time" size={16} color="#fff" />
                    <Text style={styles.recommendationStatText}>{workout.duration} min</Text>
                  </View>
                  <View style={styles.recommendationStat}>
                    <Ionicons name="flame" size={16} color="#fff" />
                    <Text style={styles.recommendationStatText}>{workout.calories} cal</Text>
                  </View>
                  <View style={styles.recommendationStat}>
                    <Ionicons name="fitness" size={16} color="#fff" />
                    <Text style={styles.recommendationStatText}>{workout.exercises.length} exercises</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        {step.type === 'level' && (
          <Text style={styles.stepSubtitle}>This helps us recommend the right intensity</Text>
        )}
        
        <View style={styles.optionsContainer}>
          {step.options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                getOptionSelected(option.id) && styles.optionCardSelected
              ]}
              onPress={() => handleOptionSelect(option)}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  {option.description && (
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  )}
                </View>
                {getOptionSelected(option.id) && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const getOptionSelected = (optionId: string) => {
    const step = steps[currentStep];
    
    switch (step.type) {
      case 'goals':
        return userGoals.includes(optionId);
      case 'level':
        return fitnessLevel === optionId;
      case 'equipment':
        return availableEquipment.includes(optionId);
      case 'duration':
        return workoutDuration === Number(optionId);
      case 'muscles':
        return targetMuscles.includes(optionId);
      case 'type':
        return workoutType === optionId;
      default:
        return false;
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    
    switch (step.type) {
      case 'goals':
        return userGoals.length > 0;
      case 'level':
        return fitnessLevel !== '';
      case 'equipment':
        return availableEquipment.length > 0;
      case 'duration':
        return workoutDuration > 0;
      case 'muscles':
        return targetMuscles.length > 0;
      case 'type':
        return workoutType !== '';
      default:
        return false;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Workout Coach</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentStep + 1} of {steps.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {!isAnalyzing && aiRecommendations.length === 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, !canProceed() && styles.buttonDisabled]}
              onPress={nextStep}
              disabled={!canProceed()}
            >
              <Text style={styles.buttonText}>
                {currentStep === steps.length - 1 ? 'Generate Workout' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
            
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B98120',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  analyzingIcon: {
    marginBottom: 32,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  recommendationsContainer: {
    paddingVertical: 20,
  },
  recommendationsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  recommendationsSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  recommendationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recommendationGradient: {
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendationStats: {
    flexDirection: 'row',
    gap: 20,
  },
  recommendationStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendationStatText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
