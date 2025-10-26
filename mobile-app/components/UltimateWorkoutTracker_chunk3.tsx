  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sample data for demonstration
  const sampleWorkouts: CustomWorkout[] = [
    {
      id: '1',
      name: 'Push Day',
      description: 'Upper body strength training',
      createdAt: new Date(),
      exercises: [
        {
          exercise: {
            id: '1',
            name: 'Bench Press',
            category: 'Chest',
            difficulty: 'Intermediate',
            equipment: 'Barbell',
            muscle: 'Chest, Shoulders, Triceps',
            instructions: 'Lie on bench, lower bar to chest, press up',
            videoUrl: 'https://www.youtube.com/watch?v=example1'
          },
          sets: [
            { reps: 10, weight: 135, restTime: 90, completed: false, actualReps: 10, actualWeight: 135, isActive: false },
            { reps: 8, weight: 155, restTime: 90, completed: false, actualReps: 8, actualWeight: 155, isActive: false },
            { reps: 6, weight: 175, restTime: 120, completed: false, actualReps: 6, actualWeight: 175, isActive: false }
          ]
        },
        {
          exercise: {
            id: '2',
            name: 'Overhead Press',
            category: 'Shoulders',
            difficulty: 'Intermediate',
            equipment: 'Barbell',
            muscle: 'Shoulders, Triceps',
            instructions: 'Press barbell overhead from shoulder level',
            videoUrl: 'https://www.youtube.com/watch?v=example2'
          },
          sets: [
            { reps: 12, weight: 95, restTime: 60, completed: false, actualReps: 12, actualWeight: 95, isActive: false },
            { reps: 10, weight: 105, restTime: 60, completed: false, actualReps: 10, actualWeight: 105, isActive: false },
            { reps: 8, weight: 115, restTime: 90, completed: false, actualReps: 8, actualWeight: 115, isActive: false }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Pull Day',
      description: 'Back and bicep focused workout',
      createdAt: new Date(),
      exercises: [
        {
          exercise: {
            id: '3',
            name: 'Deadlift',
            category: 'Back',
            difficulty: 'Advanced',
            equipment: 'Barbell',
            muscle: 'Back, Glutes, Hamstrings',
            instructions: 'Lift barbell from floor to hip level',
            videoUrl: 'https://www.youtube.com/watch?v=example3'
          },
          sets: [
            { reps: 8, weight: 225, restTime: 120, completed: false, actualReps: 8, actualWeight: 225, isActive: false },
            { reps: 6, weight: 245, restTime: 120, completed: false, actualReps: 6, actualWeight: 245, isActive: false },
            { reps: 4, weight: 275, restTime: 120, completed: false, actualReps: 4, actualWeight: 275, isActive: false }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    loadUserData();
    loadCustomWorkouts();
    initializeOfflineManager();
  }, []);

  // Timer effect for workout
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (showWorkoutModal && isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showWorkoutModal, isTimerRunning]);

  useEffect(() => {
    if (showWorkoutCalendar) {
      loadCalendarData(selectedDate);
    }
  }, [showWorkoutCalendar]);

  // Load today's data for dashboard
  useEffect(() => {
    loadCalendarData(new Date());
    loadWeeklyTonnage();
  }, []);

  const loadWeeklyTonnage = async () => {
    try {
      const weekly = await DataStorage.calculateWeeklyTonnage();
      setWeeklyTonnage(weekly);
    } catch (error) {
      console.error('Error loading weekly tonnage:', error);
    }
  };

  const initializeOfflineManager = async () => {
    try {
      if (OfflineManager) {
        const offlineManager = OfflineManager.getInstance();
        const isOnline = offlineManager.getIsOnline();
        setIsOffline(!isOnline);
        
        offlineManager.addListener((online) => {
          setIsOffline(!online);
        });
      }
    } catch (error) {
      console.error('Error initializing offline manager:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const logs = await DataStorage.getWorkoutLogs();
      const stats = await DataStorage.getUserStats();
      setWorkoutLogs(logs);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomWorkouts = async () => {
    try {
      const workouts = await DataStorage.getCustomWorkouts();
      setCustomWorkouts(workouts.length > 0 ? workouts : sampleWorkouts);
    } catch (error) {
      console.error('Error loading custom workouts:', error);
      setCustomWorkouts(sampleWorkouts);
    }
  };

  const handleWorkoutCreated = (newWorkout: CustomWorkout) => {
    setCustomWorkouts(prev => [...prev, newWorkout]);
    setShowCustomBuilder(false);
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const finishWorkout = async () => {
    if (!workoutData || !activeWorkout) return;
    
    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - workoutData.startTime.getTime()) / 1000);
    
    const updatedWorkoutData = {
      ...workoutData,
      endTime,
      totalTime
    };
    
    setWorkoutData(updatedWorkoutData);
    setShowWorkoutSummary(true);
    setShowWorkoutModal(false);
    setIsTimerRunning(false);
  };

  const calculateCaloriesBurned = (durationInSeconds: number, tonnage: number) => {
    const caloriesFromDuration = durationInSeconds / 60 * 5;
    const caloriesFromTonnage = tonnage / 1000 * 2;
    return Math.round(caloriesFromDuration + caloriesFromTonnage);
  };

  const calculateCompletionRate = (exercises: any[]) => {
    if (!exercises || exercises.length === 0) return 0;
    
    let totalSets = 0;
    let completedSets = 0;
    
    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach(set => {
          totalSets++;
          if (set.completed) {
            completedSets++;
          }
        });
      }
    });
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const handleStartWorkout = (workout: CustomWorkout) => {
    // Start workout directly
    setActiveWorkout(workout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setWorkoutStartTime(new Date());
    setWorkoutTimer(0);
    setShowWorkoutModal(true);
    
    // Initialize workout data
    const initialWorkoutData = {
      startTime: new Date(),
      endTime: null,
      totalTime: 0,
      timeSpentLifting: 0,
      totalTonnage: 0,
      tonnagePerMuscleGroup: {},
      restTimer: 0,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: Array.isArray(ex.sets) ? ex.sets.map(set => ({ 
          ...set, 
          completed: false, 
          actualReps: set.reps, 
          actualWeight: set.weight,
          isActive: false
        })) : []
      }))
    };
    setWorkoutData(initialWorkoutData);
    
    // Start the workout timer
    startTimer();
  };

  const handlePreviewWorkout = (workout: CustomWorkout) => {
    setPreviewWorkout(workout);
    setShowWorkoutPreview(true);
  };

  const getInputKey = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight') => {
    return `${exerciseIndex}-${setIndex}-${field}`;
  };

  const getInputValue = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', defaultValue: number) => {
    const key = getInputKey(exerciseIndex, setIndex, field);
    if (inputValues[key] !== undefined) {
      return inputValues[key];
    }
    // Only return default value if the field has never been touched
    return '';
  };

  const setInputValue = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const key = getInputKey(exerciseIndex, setIndex, field);
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const updateSetData = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    if (exercise && exercise.sets && exercise.sets[setIndex]) {
      const set = exercise.sets[setIndex];
      if (field === 'reps') {
        set.actualReps = value;
      } else if (field === 'weight') {
        set.actualWeight = value;
      }
      
      // Recalculate total tonnage when values change
      let totalTonnage = 0;
      let tonnagePerMuscleGroup: {[key: string]: number} = {};
      
      updatedWorkoutData.exercises.forEach((ex: any) => {
        if (ex.sets && Array.isArray(ex.sets)) {
          ex.sets.forEach((s: any) => {
            if (s.completed && s.actualReps > 0 && s.actualWeight > 0) {
              const tonnage = s.actualReps * s.actualWeight;
              totalTonnage += tonnage;
              
              // Add to muscle group tonnage
              if (ex.exercise && ex.exercise.targetMuscles) {
                ex.exercise.targetMuscles.forEach((muscle: string) => {
                  tonnagePerMuscleGroup[muscle] = (tonnagePerMuscleGroup[muscle] || 0) + tonnage;
                });
              }
            }
          });
        }
      });
      updatedWorkoutData.totalTonnage = totalTonnage;
      updatedWorkoutData.tonnagePerMuscleGroup = tonnagePerMuscleGroup;
      
      setWorkoutData(updatedWorkoutData);
    }
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    if (!exercise || !exercise.sets || !exercise.sets[setIndex]) return;
    
    const set = exercise.sets[setIndex];
    
    // Get current input values and update the set
    const weightKey = getInputKey(exerciseIndex, setIndex, 'weight');
    const repsKey = getInputKey(exerciseIndex, setIndex, 'reps');
    const currentWeight = inputValues[weightKey] !== undefined && inputValues[weightKey] !== '' 
      ? parseInt(inputValues[weightKey]) || 0 
      : set.actualWeight || 0;
    const currentReps = inputValues[repsKey] !== undefined && inputValues[repsKey] !== '' 
      ? parseInt(inputValues[repsKey]) || 0 
      : set.actualReps || 0;
    
    set.actualWeight = currentWeight;
    set.actualReps = currentReps;
    set.completed = true;
    
    // Recalculate total tonnage from all completed sets
    let totalTonnage = 0;
    let tonnagePerMuscleGroup: {[key: string]: number} = {};
    
    updatedWorkoutData.exercises.forEach((ex: any) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((s: any) => {
          if (s.completed && s.actualReps > 0 && s.actualWeight > 0) {
            const tonnage = s.actualReps * s.actualWeight;
            totalTonnage += tonnage;
            
            // Add to muscle group tonnage
            if (ex.exercise && ex.exercise.targetMuscles) {
              ex.exercise.targetMuscles.forEach((muscle: string) => {
                tonnagePerMuscleGroup[muscle] = (tonnagePerMuscleGroup[muscle] || 0) + tonnage;
              });
            }
          }
        });
      }
    });
    
    updatedWorkoutData.totalTonnage = totalTonnage;
    updatedWorkoutData.tonnagePerMuscleGroup = tonnagePerMuscleGroup;
    
    setWorkoutData(updatedWorkoutData);
    
    // Move to next set or exercise
    const currentExercise = updatedWorkoutData.exercises[exerciseIndex];
    if (setIndex < (currentExercise.sets || []).length - 1) {
      setCurrentSetIndex(setIndex + 1);
    } else if (exerciseIndex < updatedWorkoutData.exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  const navigateToExercise = (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSetIndex(0);
  };

  const navigateToSet = (exerciseIndex: number, setIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSetIndex(setIndex);
  };

  const toggleSetTimer = (exerciseIndex: number, setIndex: number) => {
    if (!workoutData) return;
    
    setWorkoutData(prev => {
      if (!prev) return prev;
      
      const updatedWorkoutData = { ...prev };
      const exercise = updatedWorkoutData.exercises[exerciseIndex];
      if (!exercise || !exercise.sets || !exercise.sets[setIndex]) return prev;
      const set = exercise.sets[setIndex];
      
      // Ensure properties exist with safe defaults
      if (typeof set.isActive !== 'boolean') set.isActive = false;
      if (typeof set.completed !== 'boolean') set.completed = false;
      if (typeof set.actualReps !== 'number') set.actualReps = set.reps || 0;
      if (typeof set.actualWeight !== 'number') set.actualWeight = set.weight || 0;
      
      if (set.isActive) {
        // Stop the set
        set.isActive = false;
        set.completed = true;
        
        // Get current input values and update the set
        const weightKey = getInputKey(exerciseIndex, setIndex, 'weight');
        const repsKey = getInputKey(exerciseIndex, setIndex, 'reps');
        const currentWeight = inputValues[weightKey] !== undefined && inputValues[weightKey] !== '' 
          ? parseInt(inputValues[weightKey]) || 0 
          : set.actualWeight || 0;
        const currentReps = inputValues[repsKey] !== undefined && inputValues[repsKey] !== '' 
          ? parseInt(inputValues[repsKey]) || 0 
          : set.actualReps || 0;
        
        set.actualWeight = currentWeight;
        set.actualReps = currentReps;
        
        // Recalculate total tonnage from all completed sets
        let totalTonnage = 0;
        let tonnagePerMuscleGroup: {[key: string]: number} = {};
        
        updatedWorkoutData.exercises.forEach((ex: any) => {
          if (ex.sets && Array.isArray(ex.sets)) {
            ex.sets.forEach((s: any) => {
              if (s.completed && s.actualReps > 0 && s.actualWeight > 0) {
                const tonnage = s.actualReps * s.actualWeight;
                totalTonnage += tonnage;
                
                // Add to muscle group tonnage
                if (ex.exercise && ex.exercise.targetMuscles) {
                  ex.exercise.targetMuscles.forEach((muscle: string) => {
                    tonnagePerMuscleGroup[muscle] = (tonnagePerMuscleGroup[muscle] || 0) + tonnage;
                  });
                }
              }
            });
          }
        });
        
        updatedWorkoutData.totalTonnage = totalTonnage;
        updatedWorkoutData.tonnagePerMuscleGroup = tonnagePerMuscleGroup;
        
        // Start rest timer
        updatedWorkoutData.restTimer = set.restTime || 90;
        startRestTimer();
      } else {
        // Start the set
        set.isActive = true;
        // Stop any other active sets
        updatedWorkoutData.exercises.forEach((ex, exIndex) => {
          ex.sets.forEach((s, sIndex) => {
            if (exIndex !== exerciseIndex || sIndex !== setIndex) {
              s.isActive = false;
            }
          });
        });
      }
      
      return updatedWorkoutData;
    });
  };

  const addNewSet = (exerciseIndex: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    
    const newSet = {
      reps: 10,
      weight: 135,
      restTime: 90,
      completed: false,
      actualReps: 10,
      actualWeight: 135,
      isActive: false
    };
    
    exercise.sets.push(newSet);
    setWorkoutData(updatedWorkoutData);
  };

  const skipRest = () => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    updatedWorkoutData.restTimer = 0;
    setWorkoutData(updatedWorkoutData);
    stopRestTimer();
  };

  const startRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setWorkoutData(prev => {
        if (!prev || !prev.restTimer) return prev;
        
        const newRestTimer = prev.restTimer - 1;
        if (newRestTimer <= 0) {
          clearInterval(timerRef.current!);
          return { ...prev, restTimer: 0 };
        }
        
        return { ...prev, restTimer: newRestTimer };
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endWorkout = () => {
    if (!workoutData || !workoutStartTime) return;
    
    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
    
    const finalWorkoutData = {
      ...workoutData,
      endTime,
      totalTime,
      timeSpentLifting: totalTime * 0.7 // Estimate 70% of time spent lifting
    };
    
    setWorkoutData(finalWorkoutData);
    
    // Create workout summary
    const summary = {
      id: `workout_${Date.now()}`,
      workout: activeWorkout,
      date: new Date().toISOString(),
      duration: Math.floor(finalWorkoutData.totalTime / 60), // Convert to minutes
      totalTonnage: finalWorkoutData.totalTonnage,
      completionRate: calculateCompletionRate(finalWorkoutData.exercises),
      caloriesBurned: calculateCaloriesBurned(finalWorkoutData.totalTime, finalWorkoutData.totalTonnage),
      exercises: finalWorkoutData.exercises,
      tonnagePerMuscleGroup: finalWorkoutData.tonnagePerMuscleGroup
    };
    
    setWorkoutSummary(summary);
    setShowWorkoutSummary(true);
    setShowWorkoutModal(false);
  };

  const saveWorkout = async () => {
    if (!workoutData) return;
    
    // Save workout log
    const workoutLog = {
      id: `workout_${Date.now()}`,
      workoutId: activeWorkout?.id,
      workoutName: activeWorkout?.name,
      date: new Date().toISOString(),
      duration: Math.floor(workoutData.totalTime / 60), // Convert seconds to minutes
      totalTonnage: workoutData.totalTonnage,
      exercises: workoutData.exercises,
      tonnagePerMuscleGroup: workoutData.tonnagePerMuscleGroup
    };
    
    try {
      // Save workout log
      await DataStorage.addWorkoutLog(new Date().toISOString().split('T')[0], workoutLog);
      
      // Update tonnage stats
      if (workoutData.totalTonnage > 0) {
        await DataStorage.updateTonnageStats(workoutData.totalTonnage);
      }
      
      // Update workout streak
      await DataStorage.updateWorkoutStreak();
      
      // Check for PRs and show notifications
      await checkForPRs(workoutData.exercises);
      
      // Create workout summary for the second modal
      const summary = {
        id: workoutLog.id,
        workout: activeWorkout,
        date: workoutLog.date,
        duration: workoutLog.duration,
        totalTonnage: workoutLog.totalTonnage,
        completionRate: calculateCompletionRate(workoutData.exercises),
        caloriesBurned: calculateCaloriesBurned(workoutData.totalTime, workoutData.totalTonnage),
        exercises: workoutData.exercises,
        tonnagePerMuscleGroup: workoutData.tonnagePerMuscleGroup
      };
      
      setWorkoutSummary(summary);
      setShowWorkoutSummary(false); // Hide the first modal
      setShowWorkoutSummaryFinal(true); // Show the second modal
      setShowEndWorkoutModal(false);
      
      // Reload weekly tonnage, calendar data, and user stats
      loadWeeklyTonnage();
      loadCalendarData(new Date());
      loadUserStats();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };




