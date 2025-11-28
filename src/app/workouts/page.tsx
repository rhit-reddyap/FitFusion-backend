"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Dumbbell, 
  Play, 
  Plus, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle,
  X,
  ChevronRight,
  Star,
  Zap,
  Award,
  BarChart3,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  tips: string;
  video_url?: string;
}

interface Workout {
  id: string;
  name: string;
  duration: number;
  exercises: Exercise[];
  date: string;
  calories_burned: number;
  total_volume: number;
  rpe_avg: number;
  notes?: string;
  tags: string[];
  program_id?: string;
  is_template: boolean;
}

interface WorkoutSet {
  id: string;
  exercise_id: string;
  reps: number;
  weight: number;
  rpe: number;
  rest_time: number;
  notes?: string;
  completed: boolean;
}

interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  workouts: Workout[];
}

interface PersonalRecord {
  id: string;
  exercise_id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  date: string;
  estimated_1rm: number;
  is_all_time: boolean;
}

function WorkoutTrackerContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'log' | 'history' | 'programs' | 'analytics'>('library');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [currentSet, setCurrentSet] = useState<WorkoutSet | null>(null);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [workoutGoal, setWorkoutGoal] = useState('');
  const [availableTime, setAvailableTime] = useState(60);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);

  // Comprehensive exercise database for bodybuilders and powerlifters
  const exercises: Exercise[] = [
    // CHEST EXERCISES
    {
      id: '1',
      name: 'Barbell Bench Press',
      category: 'Strength',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
      equipment: ['Barbell', 'Bench'],
      difficulty: 'intermediate',
      instructions: 'Lie on bench with feet flat. Grip bar slightly wider than shoulders. Lower to chest, pause, then press up.',
      tips: 'Keep shoulder blades retracted. Don\'t bounce off chest. Use full range of motion.',
      video_url: 'https://www.youtube.com/embed/rT7DgCr-3pg'
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      category: 'Strength',
      muscle_groups: ['Upper Chest', 'Shoulders', 'Triceps'],
      equipment: ['Dumbbells', 'Incline Bench'],
      difficulty: 'intermediate',
      instructions: 'Set bench to 30-45° incline. Press dumbbells from chest to full extension, then lower with control.',
      tips: 'Focus on upper chest contraction. Don\'t let weights drift too wide.',
      video_url: 'https://www.youtube.com/embed/8iPEnov-lmU'
    },
    {
      id: '3',
      name: 'Dumbbell Flyes',
      category: 'Strength',
      muscle_groups: ['Chest'],
      equipment: ['Dumbbells', 'Bench'],
      difficulty: 'beginner',
      instructions: 'Lie on bench holding dumbbells. Start with arms extended, lower in wide arc until chest stretch, then squeeze back up.',
      tips: 'Keep slight bend in elbows. Focus on chest stretch and squeeze.',
      video_url: 'https://www.youtube.com/embed/eozdVDA78K0'
    },
    {
      id: '4',
      name: 'Dips',
      category: 'Bodyweight',
      muscle_groups: ['Chest', 'Triceps', 'Shoulders'],
      equipment: ['Dip Bars'],
      difficulty: 'intermediate',
      instructions: 'Support body on dip bars. Lower until shoulders below elbows, then press up to full extension.',
      tips: 'Lean forward slightly to target chest. Keep core tight throughout.',
      video_url: 'https://www.youtube.com/embed/2g8LvJf0eFQ'
    },
    {
      id: '5',
      name: 'Push-ups',
      category: 'Bodyweight',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
      equipment: ['None'],
      difficulty: 'beginner',
      instructions: 'Start in plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches floor, then push back up.',
      tips: 'Keep your core tight and body straight. Breathe out on the way up.',
      video_url: 'https://www.youtube.com/embed/IODxDxX7oi4'
    },

    // BACK EXERCISES
    {
      id: '6',
      name: 'Deadlift',
      category: 'Powerlifting',
      muscle_groups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps', 'Lats'],
      equipment: ['Barbell', 'Plates'],
      difficulty: 'advanced',
      instructions: 'Stand with feet hip-width apart, bar over mid-foot. Hinge at hips, grab bar, then drive hips forward to stand tall.',
      tips: 'Keep bar close to body. Maintain neutral spine. Drive through heels.',
      video_url: 'https://www.youtube.com/embed/op9kVnSso6Q'
    },
    {
      id: '7',
      name: 'Pull-ups',
      category: 'Bodyweight',
      muscle_groups: ['Lats', 'Rhomboids', 'Biceps'],
      equipment: ['Pull-up Bar'],
      difficulty: 'intermediate',
      instructions: 'Hang from bar with overhand grip. Pull body up until chin clears bar, then lower with control.',
      tips: 'Engage lats by pulling elbows down. Don\'t swing or kip.',
      video_url: 'https://www.youtube.com/embed/eGo4IYlbE5g'
    },
    {
      id: '8',
      name: 'Bent-Over Barbell Row',
      category: 'Strength',
      muscle_groups: ['Lats', 'Rhomboids', 'Middle Traps', 'Biceps'],
      equipment: ['Barbell'],
      difficulty: 'intermediate',
      instructions: 'Hinge at hips, keep back straight. Pull bar to lower chest, squeeze shoulder blades, then lower with control.',
      tips: 'Keep core tight. Don\'t use momentum. Focus on pulling with back.',
      video_url: 'https://www.youtube.com/embed/paHf6n02tl0'
    },
    {
      id: '9',
      name: 'Lat Pulldown',
      category: 'Strength',
      muscle_groups: ['Lats', 'Rhomboids', 'Biceps'],
      equipment: ['Cable Machine'],
      difficulty: 'beginner',
      instructions: 'Sit at lat pulldown machine. Pull bar to upper chest, squeeze shoulder blades, then return to start.',
      tips: 'Lean back slightly. Focus on pulling with lats, not just arms.',
      video_url: 'https://www.youtube.com/embed/CAwf7n6Luuc'
    },
    {
      id: '10',
      name: 'T-Bar Row',
      category: 'Strength',
      muscle_groups: ['Lats', 'Rhomboids', 'Middle Traps'],
      equipment: ['T-Bar Row Machine', 'Plates'],
      difficulty: 'intermediate',
      instructions: 'Straddle T-bar, hinge at hips. Pull handle to chest, squeeze shoulder blades, then lower with control.',
      tips: 'Keep chest up. Don\'t round back. Focus on squeezing shoulder blades.',
      video_url: 'https://www.youtube.com/embed/jVd_0HjQhx4'
    },

    // LEG EXERCISES
    {
      id: '11',
      name: 'Back Squat',
      category: 'Powerlifting',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      equipment: ['Barbell', 'Squat Rack'],
      difficulty: 'intermediate',
      instructions: 'Position bar on upper back. Descend until hips below knees, then drive up through heels.',
      tips: 'Keep chest up, knees tracking over toes. Full depth for maximum benefit.',
      video_url: 'https://www.youtube.com/embed/gsNoPYwWXeM'
    },
    {
      id: '12',
      name: 'Front Squat',
      category: 'Powerlifting',
      muscle_groups: ['Quadriceps', 'Glutes', 'Core', 'Upper Back'],
      equipment: ['Barbell', 'Squat Rack'],
      difficulty: 'advanced',
      instructions: 'Rest bar on front of shoulders. Squat down until hips below knees, then drive up.',
      tips: 'Keep elbows high. Maintain upright torso. Great for quad development.',
      video_url: 'https://www.youtube.com/embed/v-mQm_droHg'
    },
    {
      id: '13',
      name: 'Romanian Deadlift',
      category: 'Strength',
      muscle_groups: ['Hamstrings', 'Glutes', 'Lower Back'],
      equipment: ['Barbell'],
      difficulty: 'intermediate',
      instructions: 'Hold bar with overhand grip. Hinge at hips, keeping legs straighter, until you feel hamstring stretch.',
      tips: 'Keep bar close to body. Feel stretch in hamstrings. Don\'t round back.',
      video_url: 'https://www.youtube.com/embed/1ED09ZVp2lQ'
    },
    {
      id: '14',
      name: 'Bulgarian Split Squats',
      category: 'Strength',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      equipment: ['None', 'Bench'],
      difficulty: 'intermediate',
      instructions: 'Place rear foot on bench. Lower into lunge position, then drive up through front leg.',
      tips: 'Keep front knee over ankle. Focus on front leg doing the work.',
      video_url: 'https://www.youtube.com/embed/2C-uNgKwPLE'
    },
    {
      id: '15',
      name: 'Leg Press',
      category: 'Strength',
      muscle_groups: ['Quadriceps', 'Glutes'],
      equipment: ['Leg Press Machine'],
      difficulty: 'beginner',
      instructions: 'Sit in leg press machine. Place feet shoulder-width apart. Lower until knees at 90°, then press up.',
      tips: 'Don\'t lock knees. Keep feet flat. Control the weight down.',
      video_url: 'https://www.youtube.com/embed/IZxyjW7MPJQ'
    },
    {
      id: '16',
      name: 'Walking Lunges',
      category: 'Strength',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      equipment: ['None'],
      difficulty: 'beginner',
      instructions: 'Step forward into lunge, then step through to next lunge. Continue alternating legs.',
      tips: 'Keep torso upright. Don\'t let front knee go past toes.',
      video_url: 'https://www.youtube.com/embed/3XDriUn0udo'
    },

    // SHOULDER EXERCISES
    {
      id: '17',
      name: 'Overhead Press',
      category: 'Strength',
      muscle_groups: ['Shoulders', 'Triceps', 'Core'],
      equipment: ['Barbell'],
      difficulty: 'intermediate',
      instructions: 'Start with bar at shoulder level. Press straight up until arms fully extended, then lower with control.',
      tips: 'Keep core tight. Don\'t arch back excessively. Press straight up.',
      video_url: 'https://www.youtube.com/embed/QAy8Xy6W1bI'
    },
    {
      id: '18',
      name: 'Lateral Raises',
      category: 'Strength',
      muscle_groups: ['Side Delts'],
      equipment: ['Dumbbells'],
      difficulty: 'beginner',
      instructions: 'Hold dumbbells at sides. Raise arms out to sides until parallel to floor, then lower with control.',
      tips: 'Keep slight bend in elbows. Don\'t swing. Focus on side delts.',
      video_url: 'https://www.youtube.com/embed/3VcKXr1xZ9k'
    },
    {
      id: '19',
      name: 'Rear Delt Flyes',
      category: 'Strength',
      muscle_groups: ['Rear Delts', 'Rhomboids'],
      equipment: ['Dumbbells'],
      difficulty: 'beginner',
      instructions: 'Bend forward, hold dumbbells. Raise arms out to sides, squeezing shoulder blades together.',
      tips: 'Keep slight bend in elbows. Focus on rear delts. Don\'t use momentum.',
      video_url: 'https://www.youtube.com/embed/rep-qVOkqgk'
    },
    {
      id: '20',
      name: 'Face Pulls',
      category: 'Strength',
      muscle_groups: ['Rear Delts', 'Rhomboids', 'Middle Traps'],
      equipment: ['Cable Machine'],
      difficulty: 'beginner',
      instructions: 'Set cable at face height. Pull rope to face, separating hands, then return with control.',
      tips: 'Keep elbows high. Focus on external rotation. Great for posture.',
      video_url: 'https://www.youtube.com/embed/rep-qVOkqgk'
    },

    // ARM EXERCISES
    {
      id: '21',
      name: 'Barbell Bicep Curls',
      category: 'Strength',
      muscle_groups: ['Biceps'],
      equipment: ['Barbell'],
      difficulty: 'beginner',
      instructions: 'Hold bar with underhand grip. Curl bar up to shoulders, squeeze biceps, then lower with control.',
      tips: 'Keep elbows at sides. Don\'t swing. Full range of motion.',
      video_url: 'https://www.youtube.com/embed/ykJmrZ5v0Oo'
    },
    {
      id: '22',
      name: 'Hammer Curls',
      category: 'Strength',
      muscle_groups: ['Biceps', 'Forearms'],
      equipment: ['Dumbbells'],
      difficulty: 'beginner',
      instructions: 'Hold dumbbells with neutral grip. Curl up to shoulders, then lower with control.',
      tips: 'Keep wrists neutral. Great for bicep peak and forearms.',
      video_url: 'https://www.youtube.com/embed/zC3nLlEfu4k'
    },
    {
      id: '23',
      name: 'Close-Grip Bench Press',
      category: 'Strength',
      muscle_groups: ['Triceps', 'Chest'],
      equipment: ['Barbell', 'Bench'],
      difficulty: 'intermediate',
      instructions: 'Lie on bench, grip bar with hands closer than shoulders. Lower to chest, then press up.',
      tips: 'Keep elbows close to body. Focus on tricep contraction.',
      video_url: 'https://www.youtube.com/embed/nEF0kv2dk6I'
    },
    {
      id: '24',
      name: 'Tricep Dips',
      category: 'Bodyweight',
      muscle_groups: ['Triceps', 'Chest'],
      equipment: ['Dip Bars', 'Bench'],
      difficulty: 'intermediate',
      instructions: 'Support body on dip bars. Lower until shoulders below elbows, then press up.',
      tips: 'Keep body upright for triceps. Lean forward slightly for chest.',
      video_url: 'https://www.youtube.com/embed/2g8LvJf0eFQ'
    },
    {
      id: '25',
      name: 'Overhead Tricep Extension',
      category: 'Strength',
      muscle_groups: ['Triceps'],
      equipment: ['Dumbbell'],
      difficulty: 'beginner',
      instructions: 'Hold dumbbell overhead. Lower behind head, then extend back to start position.',
      tips: 'Keep elbows close to head. Don\'t let elbows flare out.',
      video_url: 'https://www.youtube.com/embed/6SS6K3lAwZ8'
    },

    // CORE EXERCISES
    {
      id: '26',
      name: 'Plank',
      category: 'Bodyweight',
      muscle_groups: ['Core', 'Shoulders'],
      equipment: ['None'],
      difficulty: 'beginner',
      instructions: 'Start in push-up position, but rest on forearms. Hold your body in a straight line from head to heels.',
      tips: 'Engage your core and breathe normally. Don\'t let hips sag or pike up.',
      video_url: 'https://www.youtube.com/embed/pSHjTRCQxIw'
    },
    {
      id: '27',
      name: 'Dead Bug',
      category: 'Bodyweight',
      muscle_groups: ['Core'],
      equipment: ['None'],
      difficulty: 'beginner',
      instructions: 'Lie on back, arms up, knees at 90°. Extend opposite arm and leg, then return to start.',
      tips: 'Keep lower back pressed to floor. Move slowly and controlled.',
      video_url: 'https://www.youtube.com/embed/g_BYB0R-4Ws'
    },
    {
      id: '28',
      name: 'Hanging Leg Raises',
      category: 'Bodyweight',
      muscle_groups: ['Lower Abs', 'Hip Flexors'],
      equipment: ['Pull-up Bar'],
      difficulty: 'intermediate',
      instructions: 'Hang from bar. Raise legs up to 90°, then lower with control.',
      tips: 'Don\'t swing. Focus on lower abs. Keep legs straight.',
      video_url: 'https://www.youtube.com/embed/JB2oyawG9KI'
    },
    {
      id: '29',
      name: 'Russian Twists',
      category: 'Bodyweight',
      muscle_groups: ['Obliques', 'Core'],
      equipment: ['None'],
      difficulty: 'beginner',
      instructions: 'Sit with knees bent, lean back slightly. Rotate torso side to side, touching ground each side.',
      tips: 'Keep feet off ground for more difficulty. Don\'t round back.',
      video_url: 'https://www.youtube.com/embed/wkD8rjkodUI'
    },

    // CARDIO & CONDITIONING
    {
      id: '30',
      name: 'Mountain Climbers',
      category: 'Cardio',
      muscle_groups: ['Core', 'Shoulders', 'Legs'],
      equipment: ['None'],
      difficulty: 'intermediate',
      instructions: 'Start in plank position. Bring one knee to chest, then quickly switch legs, alternating rapidly.',
      tips: 'Keep your core tight and maintain plank position. Move at a controlled pace.',
      video_url: 'https://www.youtube.com/embed/cnyTQDSE884'
    },
    {
      id: '31',
      name: 'Burpees',
      category: 'Cardio',
      muscle_groups: ['Full Body'],
      equipment: ['None'],
      difficulty: 'intermediate',
      instructions: 'Start standing, drop to squat, place hands on floor, jump feet back to plank, do push-up, jump feet to squat, jump up with arms overhead.',
      tips: 'Maintain good form throughout. Start slow and build speed.',
      video_url: 'https://www.youtube.com/embed/TU8QYVW0gDU'
    },
    {
      id: '32',
      name: 'Battle Ropes',
      category: 'Cardio',
      muscle_groups: ['Shoulders', 'Core', 'Arms'],
      equipment: ['Battle Ropes'],
      difficulty: 'intermediate',
      instructions: 'Hold rope ends, create waves by moving arms up and down rapidly.',
      tips: 'Keep core engaged. Vary wave patterns for different intensity.',
      video_url: 'https://www.youtube.com/embed/7j4V5q3kq-s'
    },

    // POWERLIFTING SPECIFIC
    {
      id: '33',
      name: 'Squat',
      category: 'Powerlifting',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      equipment: ['Barbell', 'Squat Rack'],
      difficulty: 'advanced',
      instructions: 'Position bar on upper back. Descend until hips below knees, then drive up through heels.',
      tips: 'Keep chest up, knees tracking over toes. Full depth for maximum benefit.',
      video_url: 'https://www.youtube.com/embed/gsNoPYwWXeM'
    },
    {
      id: '34',
      name: 'Bench Press',
      category: 'Powerlifting',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
      equipment: ['Barbell', 'Bench'],
      difficulty: 'advanced',
      instructions: 'Lie on bench with feet flat. Grip bar slightly wider than shoulders. Lower to chest, pause, then press up.',
      tips: 'Keep shoulder blades retracted. Don\'t bounce off chest. Use full range of motion.',
      video_url: 'https://www.youtube.com/embed/rT7DgCr-3pg'
    },
    {
      id: '35',
      name: 'Pause Squat',
      category: 'Powerlifting',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      equipment: ['Barbell', 'Squat Rack'],
      difficulty: 'advanced',
      instructions: 'Perform squat but pause for 2-3 seconds at the bottom before driving up.',
      tips: 'Builds strength out of the hole. Maintain tightness during pause.',
      video_url: 'https://www.youtube.com/embed/gsNoPYwWXeM'
    },

    // ACCESSORY EXERCISES
    {
      id: '36',
      name: 'Calf Raises',
      category: 'Strength',
      muscle_groups: ['Calves'],
      equipment: ['None', 'Calf Raise Machine'],
      difficulty: 'beginner',
      instructions: 'Stand on edge of step or use calf raise machine. Rise up on toes, then lower with control.',
      tips: 'Full range of motion. Pause at top for maximum contraction.',
      video_url: 'https://www.youtube.com/embed/3VcKXr1xZ9k'
    },
    {
      id: '37',
      name: 'Shrugs',
      category: 'Strength',
      muscle_groups: ['Traps'],
      equipment: ['Barbell', 'Dumbbells'],
      difficulty: 'beginner',
      instructions: 'Hold weight at sides. Shrug shoulders up toward ears, then lower with control.',
      tips: 'Don\'t roll shoulders. Straight up and down movement.',
      video_url: 'https://www.youtube.com/embed/nJgRu6GjPV8'
    },
    {
      id: '38',
      name: 'Wrist Curls',
      category: 'Strength',
      muscle_groups: ['Forearms'],
      equipment: ['Dumbbells', 'Barbell'],
      difficulty: 'beginner',
      instructions: 'Rest forearms on bench, hold weight. Curl wrists up, then lower with control.',
      tips: 'Keep forearms stationary. Full range of motion.',
      video_url: 'https://www.youtube.com/embed/qmGgqjqjqjq'
    }
  ];

  // Sample workout history with advanced data
  const workoutHistory: Workout[] = [
    {
      id: '1',
      name: 'Push Day - Upper Body',
      duration: 75,
      exercises: exercises.slice(0, 6),
      date: '2024-01-15',
      calories_burned: 420,
      total_volume: 12500,
      rpe_avg: 8.2,
      notes: 'Great session, felt strong on bench press',
      tags: ['Push', 'Upper Body', 'Strength'],
      is_template: false
    },
    {
      id: '2',
      name: 'Pull Day - Back & Biceps',
      duration: 65,
      exercises: exercises.slice(6, 12),
      date: '2024-01-14',
      calories_burned: 380,
      total_volume: 11200,
      rpe_avg: 7.8,
      notes: 'Deadlifts felt heavy but form was good',
      tags: ['Pull', 'Back', 'Biceps'],
      is_template: false
    },
    {
      id: '3',
      name: 'Leg Day - Quads & Glutes',
      duration: 90,
      exercises: exercises.slice(12, 18),
      date: '2024-01-13',
      calories_burned: 520,
      total_volume: 15800,
      rpe_avg: 8.5,
      notes: 'Squats were challenging, need to work on depth',
      tags: ['Legs', 'Squat', 'Strength'],
      is_template: false
    }
  ];

  // Sample personal records
  const samplePersonalRecords: PersonalRecord[] = [
    {
      id: '1',
      exercise_id: '1',
      exercise_name: 'Barbell Bench Press',
      weight: 225,
      reps: 5,
      date: '2024-01-15',
      estimated_1rm: 253,
      is_all_time: true
    },
    {
      id: '2',
      exercise_id: '6',
      exercise_name: 'Deadlift',
      weight: 315,
      reps: 3,
      date: '2024-01-14',
      estimated_1rm: 335,
      is_all_time: true
    },
    {
      id: '3',
      exercise_id: '11',
      exercise_name: 'Back Squat',
      weight: 275,
      reps: 4,
      date: '2024-01-13',
      estimated_1rm: 305,
      is_all_time: true
    }
  ];

  // Sample workout programs
  const samplePrograms: WorkoutProgram[] = [
    {
      id: '1',
      name: 'Push/Pull/Legs Split',
      description: 'Classic 6-day split for maximum muscle growth and strength gains',
      duration_weeks: 12,
      difficulty: 'intermediate',
      focus: ['Muscle Growth', 'Strength', 'Hypertrophy'],
      workouts: []
    },
    {
      id: '2',
      name: '5/3/1 Powerlifting Program',
      description: 'Proven powerlifting program focusing on the big three lifts',
      duration_weeks: 16,
      difficulty: 'advanced',
      focus: ['Powerlifting', 'Strength', '1RM'],
      workouts: []
    },
    {
      id: '3',
      name: 'Upper/Lower Split',
      description: '4-day split perfect for intermediate lifters',
      duration_weeks: 8,
      difficulty: 'intermediate',
      focus: ['Muscle Growth', 'Strength', 'Recovery'],
      workouts: []
    }
  ];

  const categories = ['all', 'Bodyweight', 'Strength', 'Powerlifting', 'Cardio', 'Accessory'];
  const muscleGroups = ['all', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Hamstrings', 'Quadriceps', 'Triceps', 'Biceps', 'Lats', 'Traps'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  
  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscle_groups.some(mg => 
      mg.toLowerCase().includes(selectedMuscleGroup.toLowerCase()) ||
      (selectedMuscleGroup === 'Arms' && (mg.toLowerCase().includes('biceps') || mg.toLowerCase().includes('triceps'))) ||
      (selectedMuscleGroup === 'Legs' && (mg.toLowerCase().includes('quadriceps') || mg.toLowerCase().includes('hamstrings') || mg.toLowerCase().includes('glutes'))) ||
      (selectedMuscleGroup === 'Back' && (mg.toLowerCase().includes('lats') || mg.toLowerCase().includes('traps') || mg.toLowerCase().includes('rhomboids')))
    );
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesMuscleGroup && matchesDifficulty;
  });

  const startWorkout = () => {
    setCurrentWorkout({
      id: Date.now().toString(),
      name: 'New Workout',
      duration: 0,
      exercises: [],
      date: new Date().toISOString().split('T')[0],
      calories_burned: 0,
      total_volume: 0,
      rpe_avg: 0,
      tags: [],
      is_template: false
    });
    setActiveTab('log');
  };

  // Advanced utility functions
  const calculate1RM = (weight: number, reps: number): number => {
    // Epley formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30));
  };

  const calculateVolume = (sets: WorkoutSet[]): number => {
    return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
  };

  const getRPEColor = (rpe: number): string => {
    if (rpe <= 6) return 'text-green-400';
    if (rpe <= 8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setIsResting(true);
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          setIsResting(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateAIWorkout = () => {
    // AI workout generation logic
    const filteredExercises = exercises.filter(exercise => {
      const hasEquipment = selectedEquipment.length === 0 || 
        exercise.equipment.some(eq => selectedEquipment.includes(eq));
      return hasEquipment;
    });

    const workoutExercises = filteredExercises
      .filter(ex => ex.difficulty === selectedDifficulty || selectedDifficulty === 'all')
      .slice(0, Math.min(8, Math.floor(availableTime / 10)));

    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: `AI Generated - ${workoutGoal}`,
      duration: 0,
      exercises: workoutExercises,
      date: new Date().toISOString().split('T')[0],
      calories_burned: 0,
      total_volume: 0,
      rpe_avg: 0,
      tags: [workoutGoal, 'AI Generated'],
      is_template: false
    };

    setCurrentWorkout(newWorkout);
    setShowAIBuilder(false);
    setActiveTab('log');
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (currentWorkout) {
      setCurrentWorkout({
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, exercise]
      });
    }
  };

  const logSet = (exerciseId: string, weight: number, reps: number, rpe: number) => {
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      exercise_id: exerciseId,
      reps,
      weight,
      rpe,
      rest_time: 0,
      completed: true
    };

    // Check for personal record
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
      const estimated1RM = calculate1RM(weight, reps);
      const existingPR = personalRecords.find(pr => 
        pr.exercise_id === exerciseId && pr.is_all_time
      );

      if (!existingPR || estimated1RM > existingPR.estimated_1rm) {
        const newPR: PersonalRecord = {
          id: Date.now().toString(),
          exercise_id: exerciseId,
          exercise_name: exercise.name,
          weight,
          reps,
          date: new Date().toISOString().split('T')[0],
          estimated_1rm: estimated1RM,
          is_all_time: true
        };
        setPersonalRecords(prev => [...prev, newPR]);
      }
    }

    // Start rest timer
    const restTime = rpe >= 8 ? 180 : rpe >= 6 ? 120 : 90; // 3min, 2min, 1.5min
    startRestTimer(restTime);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <Sidebar activePage="workout-tracker" />

        <div className="flex-1">
          <div className="main-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Advanced Workout Tracker</h1>
            <p className="text-gray-400 text-lg">AI-powered training, advanced analytics, personal records</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIBuilder(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Star className="w-5 h-5" />
              AI Builder
            </button>
            <button
              onClick={startWorkout}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Start Workout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Dumbbell className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">This Week</span>
            </div>
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-sm text-gray-500">workouts completed</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Total Time</span>
            </div>
            <div className="text-2xl font-bold text-white">2h 15m</div>
            <div className="text-sm text-gray-500">this week</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Calories</span>
            </div>
            <div className="text-2xl font-bold text-white">1,200</div>
            <div className="text-sm text-gray-500">burned this week</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-400">Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">7</div>
            <div className="text-sm text-gray-500">days in a row</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'library', label: 'Exercise Library', icon: Dumbbell },
            { id: 'log', label: 'Log Workout', icon: Plus },
            { id: 'programs', label: 'Programs', icon: Target },
            { id: 'history', label: 'History', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Exercise Library */}
        {activeTab === 'library' && (
          <div>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search exercises, muscle groups, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                />
              </div>
              
              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedMuscleGroup}
                  onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle} className="capitalize">
                      {muscle}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty} className="capitalize">
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 mr-2">Quick filters:</span>
                {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map(muscle => (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscleGroup(muscle)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedMuscleGroup === muscle
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedMuscleGroup('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedMuscleGroup === 'all'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
              </div>
              
              {/* Results Count */}
              <div className="text-sm text-gray-400">
                Showing {filteredExercises.length} of {exercises.length} exercises
              </div>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map(exercise => (
                <div key={exercise.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {exercise.muscle_groups.map(muscle => (
                          <span key={muscle} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[exercise.difficulty]}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{exercise.instructions}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Equipment: {exercise.equipment.join(', ')}</span>
                    </div>
                    <div className="flex gap-2">
                      {exercise.video_url && (
                        <button
                          onClick={() => {
                            setSelectedExercise(exercise);
                            setShowVideoModal(true);
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => addExerciseToWorkout(exercise)}
                        className="p-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log Workout */}
        {activeTab === 'log' && (
          <div>
            {currentWorkout ? (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Current Workout</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                      Pause
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Finish
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">0:00</div>
                    <div className="text-gray-400">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{currentWorkout.exercises.length}</div>
                    <div className="text-gray-400">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-gray-400">Calories</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentWorkout.exercises.length === 0 ? (
                    <div className="text-center py-12">
                      <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-400 mb-2">No exercises added yet</h4>
                      <p className="text-gray-500 mb-4">Add exercises from the library to start your workout</p>
                      <button
                        onClick={() => setActiveTab('library')}
                        className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
                      >
                        Browse Exercises
                      </button>
                    </div>
                  ) : (
                    currentWorkout.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{exercise.name}</h4>
                          <p className="text-sm text-gray-400">{exercise.muscle_groups.join(', ')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const weight = prompt('Weight (lbs):') || '0';
                              const reps = prompt('Reps:') || '0';
                              const rpe = prompt('RPE (1-10):') || '5';
                              logSet(exercise.id, Number(weight), Number(reps), Number(rpe));
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Log Set
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Ready to start your workout?</h3>
                <p className="text-gray-400 mb-8">Choose from our exercise library or create a custom workout</p>
                <button
                  onClick={startWorkout}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                >
                  Start New Workout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Workout Programs */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Training Programs</h2>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors">
                Create Program
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {samplePrograms.map(program => (
                <div key={program.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{program.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{program.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      program.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      program.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {program.difficulty}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{program.duration_weeks} weeks</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {program.focus.map((focus, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-2 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-300">
                    Start Program
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Workout History</h2>
              <div className="flex gap-2">
                <button className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors">
                  Export
                </button>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors">
                  Create Template
                </button>
              </div>
            </div>
            
            {workoutHistory.map(workout => (
              <div key={workout.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{workout.name}</h3>
                    <p className="text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{workout.duration}m</div>
                    <div className="text-sm text-gray-400">duration</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{workout.exercises.length}</div>
                    <div className="text-sm text-gray-400">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{workout.calories_burned}</div>
                    <div className="text-sm text-gray-400">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{workout.total_volume.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Volume</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getRPEColor(workout.rpe_avg)}`}>
                      {workout.rpe_avg}
                    </div>
                    <div className="text-sm text-gray-400">Avg RPE</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {workout.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {workout.exercises.map((exercise, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg">
                      {exercise.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Workout Analytics</h2>
            
            {/* Personal Records */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Personal Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {samplePersonalRecords.map(pr => (
                  <div key={pr.id} className="bg-gray-800 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">{pr.exercise_name}</h4>
                    <div className="text-2xl font-bold text-teal-400 mb-1">{pr.weight} lbs</div>
                    <div className="text-sm text-gray-400 mb-2">{pr.reps} reps</div>
                    <div className="text-xs text-gray-500">Est. 1RM: {pr.estimated_1rm} lbs</div>
                    <div className="text-xs text-gray-500">{new Date(pr.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Trends */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Volume Trends</h3>
              <div className="h-64 bg-gray-800 rounded-xl flex items-center justify-center">
                <p className="text-gray-400">Volume chart would go here</p>
              </div>
            </div>

            {/* Strength Progression */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Strength Progression</h3>
              <div className="h-64 bg-gray-800 rounded-xl flex items-center justify-center">
                <p className="text-gray-400">Strength progression chart would go here</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Builder Modal */}
        {showAIBuilder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">AI Workout Builder</h3>
                  <button
                    onClick={() => setShowAIBuilder(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Workout Goal</label>
                    <select
                      value={workoutGoal}
                      onChange={(e) => setWorkoutGoal(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="">Select goal...</option>
                      <option value="Muscle Growth">Muscle Growth</option>
                      <option value="Strength">Strength</option>
                      <option value="Powerlifting">Powerlifting</option>
                      <option value="Endurance">Endurance</option>
                      <option value="Fat Loss">Fat Loss</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Available Time (minutes)</label>
                    <input
                      type="number"
                      value={availableTime}
                      onChange={(e) => setAvailableTime(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      min="15"
                      max="180"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Equipment Available</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Barbell', 'Dumbbells', 'Bench', 'Squat Rack', 'Cable Machine', 'Pull-up Bar'].map(equipment => (
                        <label key={equipment} className="flex items-center gap-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedEquipment.includes(equipment)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEquipment(prev => [...prev, equipment]);
                              } else {
                                setSelectedEquipment(prev => prev.filter(eq => eq !== equipment));
                              }
                            }}
                            className="rounded"
                          />
                          {equipment}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={generateAIWorkout}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Generate Workout
                    </button>
                    <button
                      onClick={() => setShowAIBuilder(false)}
                      className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest Timer */}
        {isResting && (
          <div className="fixed bottom-6 right-6 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{formatTime(restTimer)}</div>
              <div className="text-sm text-gray-400 mb-4">Rest Time</div>
              <button
                onClick={() => setIsResting(false)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedExercise && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">{selectedExercise.name}</h3>
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {selectedExercise.video_url && (
                  <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                    <iframe
                      src={selectedExercise.video_url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Instructions</h4>
                    <p className="text-gray-300 leading-relaxed">{selectedExercise.instructions}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Tips</h4>
                    <p className="text-gray-300 leading-relaxed">{selectedExercise.tips}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => {
                      addExerciseToWorkout(selectedExercise);
                      setShowVideoModal(false);
                    }}
                    className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Add to Workout
                  </button>
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutTracker() {
  return (
    <AuthGuard>
      <WorkoutTrackerContent />
    </AuthGuard>
  );
}