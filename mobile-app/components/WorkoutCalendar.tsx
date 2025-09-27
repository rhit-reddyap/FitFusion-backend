import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

const { width } = Dimensions.get('window');

interface WorkoutLog {
  id: string;
  workoutName: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
  caloriesBurned: number;
  timestamp: string;
}

interface WorkoutCalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string, workouts: WorkoutLog[]) => void;
}

export default function WorkoutCalendar({ visible, onClose, onDateSelect }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workoutData, setWorkoutData] = useState<{[key: string]: WorkoutLog[]}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadWorkoutData();
    }
  }, [visible]);

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      const logs = await DataStorage.getWorkoutLogs();
      setWorkoutData(logs);
    } catch (error) {
      console.error('Error loading workout data:', error);
      Alert.alert('Error', 'Failed to load workout history');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return workoutData[dateKey] || [];
  };

  const hasWorkoutsOnDate = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    return workouts.length > 0;
  };

  const getTotalCaloriesForDate = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    return workouts.reduce((total, workout) => total + (workout.caloriesBurned || 0), 0);
  };

  const getTotalDurationForDate = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    return workouts.reduce((total, workout) => total + (workout.duration || 0), 0);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return formatDateKey(date) === selectedDate;
  };

  const handleDatePress = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(date);
    const workouts = getWorkoutsForDate(date);
    
    setSelectedDate(dateKey);
    onDateSelect(dateKey, workouts);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.calendarContainer}>
        {/* Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.monthYearContainer}>
            <Text style={styles.monthYearText}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Day names */}
        <View style={styles.dayNamesContainer}>
          {dayNames.map(day => (
            <Text key={day} style={styles.dayNameText}>{day}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={index} style={styles.emptyDay} />;
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const hasWorkouts = hasWorkoutsOnDate(date);
            const isCurrentDay = isToday(date);
            const isSelectedDay = isSelected(date);
            const calories = getTotalCaloriesForDate(date);
            const duration = getTotalDurationForDate(date);

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isCurrentDay && styles.todayCell,
                  isSelectedDay && styles.selectedCell,
                  hasWorkouts && styles.hasWorkoutsCell
                ]}
                onPress={() => handleDatePress(day)}
              >
                <Text style={[
                  styles.dayText,
                  isCurrentDay && styles.todayText,
                  isSelectedDay && styles.selectedText,
                  hasWorkouts && styles.hasWorkoutsText
                ]}>
                  {day}
                </Text>
                
                {hasWorkouts && (
                  <View style={styles.workoutIndicators}>
                    <View style={styles.calorieIndicator}>
                      <Text style={styles.indicatorText}>{calories}</Text>
                    </View>
                    <View style={styles.durationIndicator}>
                      <Text style={styles.indicatorText}>{formatDuration(duration)}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderWorkoutSummary = () => {
    if (!selectedDate) return null;

    const workouts = workoutData[selectedDate] || [];
    const totalCalories = workouts.reduce((total, workout) => total + (workout.caloriesBurned || 0), 0);
    const totalDuration = workouts.reduce((total, workout) => total + (workout.duration || 0), 0);
    const totalExercises = workouts.reduce((total, workout) => total + workout.exercises.length, 0);

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Ionicons name="flame" size={24} color="#EF4444" />
            <Text style={styles.summaryStatValue}>{totalCalories}</Text>
            <Text style={styles.summaryStatLabel}>Calories</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Ionicons name="time" size={24} color="#10B981" />
            <Text style={styles.summaryStatValue}>{formatDuration(totalDuration)}</Text>
            <Text style={styles.summaryStatLabel}>Duration</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Ionicons name="fitness" size={24} color="#F59E0B" />
            <Text style={styles.summaryStatValue}>{totalExercises}</Text>
            <Text style={styles.summaryStatLabel}>Exercises</Text>
          </View>
        </View>

        <ScrollView style={styles.workoutsList}>
          {workouts.map((workout, index) => (
            <View key={workout.id} style={styles.workoutItem}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.workoutName}</Text>
                <Text style={styles.workoutTime}>
                  {new Date(workout.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              
              <View style={styles.workoutDetails}>
                <Text style={styles.workoutDetail}>
                  {formatDuration(workout.duration)} • {workout.caloriesBurned} cal
                </Text>
                <Text style={styles.workoutDetail}>
                  {workout.exercises.length} exercises
                </Text>
              </View>

              <View style={styles.exercisesList}>
                {workout.exercises.map((exercise, exIndex) => (
                  <View key={exIndex} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}lbs
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Workout History</Text>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCalendar()}
          {renderWorkoutSummary()}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  todayButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayNameText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: width / 7 - 4,
    height: 60,
    margin: 2,
  },
  dayCell: {
    width: width / 7 - 4,
    height: 60,
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#10B98120',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  selectedCell: {
    backgroundColor: '#F59E0B20',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  hasWorkoutsCell: {
    backgroundColor: '#8B5CF620',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  todayText: {
    color: '#10B981',
  },
  selectedText: {
    color: '#F59E0B',
  },
  hasWorkoutsText: {
    color: '#8B5CF6',
  },
  workoutIndicators: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieIndicator: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  durationIndicator: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  indicatorText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  workoutsList: {
    maxHeight: 300,
  },
  workoutItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  workoutTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  workoutDetails: {
    marginBottom: 12,
  },
  workoutDetail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  exercisesList: {
    gap: 8,
  },
  exerciseItem: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
});









