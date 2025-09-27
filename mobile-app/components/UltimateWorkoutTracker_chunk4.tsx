  const checkForPRs = async (exercises: any[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workoutLogs = await DataStorage.getWorkoutLogs();
      
      for (const exercise of exercises) {
        if (!exercise.exercise || !exercise.sets) continue;
        
        const exerciseName = exercise.exercise.name;
        const completedSets = exercise.sets.filter((set: any) => set.completed && set.actualWeight > 0);
        
        for (const set of completedSets) {
          const currentWeight = set.actualWeight;
          const currentReps = set.actualReps;
          
          // Check for 1RM PR
          if (currentReps === 1) {
            const isPR = await checkIfPR(exerciseName, currentWeight, 1, workoutLogs, today);
            if (isPR) {
              Alert.alert(
                '🏆 New PR!',
                `${exerciseName}: ${currentWeight} lbs for 1 rep!\nNew personal record!`,
                [{ text: 'Awesome!', style: 'default' }]
              );
              
              // Notify team members about the PR
              await notifyTeamMembersOfPR(exerciseName, currentWeight, currentReps, '1RM PR');
            }
          }
          
          // Check for rep PRs (same weight, more reps)
          const isRepPR = await checkIfRepPR(exerciseName, currentWeight, currentReps, workoutLogs, today);
          if (isRepPR) {
            Alert.alert(
              '💪 Rep PR!',
              `${exerciseName}: ${currentWeight} lbs for ${currentReps} reps!\nNew rep record!`,
              [{ text: 'Great job!', style: 'default' }]
            );
            
            // Notify team members about the PR
            await notifyTeamMembersOfPR(exerciseName, currentWeight, currentReps, 'Rep PR');
          }
        }
      }
    } catch (error) {
      console.error('Error checking for PRs:', error);
    }
  };

  const notifyTeamMembersOfPR = async (exerciseName: string, weight: number, reps: number, prType: string) => {
    try {
      if (!user) return;
      
      // Get user's teams
      const myTeams = await TeamService.getMyTeams(user.id);
      
      for (const team of myTeams) {
        // Create team activity for the PR
        const prActivity = {
          team_id: team.id,
          user_id: user.id,
          activity_type: 'pr_achievement',
          activity_data: {
            exercise: exerciseName,
            weight: weight,
            reps: reps,
            prType: prType,
            timestamp: new Date().toISOString(),
            user_name: user.email?.split('@')[0] || 'Anonymous'
          }
        };
        
        // Add the PR activity to the team
        await TeamService.addTeamActivityWithData(prActivity);
        
        console.log(`PR notification sent to team: ${team.name}`);
      }
    } catch (error) {
      console.error('Error notifying team members of PR:', error);
    }
  };

  const checkIfPR = async (exerciseName: string, weight: number, reps: number, workoutLogs: any[], today: string) => {
    try {
      // Get all previous workout logs except today
      const previousLogs = Object.values(workoutLogs).flat().filter((log: any) => {
        if (!log.date) return false;
        const logDate = typeof log.date === 'string' ? log.date : log.date.toISOString();
        return logDate.split('T')[0] !== today;
      });
      
      for (const log of previousLogs) {
        if (!log.exercises) continue;
        
        for (const exercise of log.exercises) {
          if (exercise.exercise?.name === exerciseName && exercise.sets) {
            for (const set of exercise.sets) {
              if (set.completed && set.actualWeight >= weight && set.actualReps >= reps) {
                return false; // Found a previous record that's equal or better
              }
            }
          }
        }
      }
      return true; // No previous record found, this is a PR
    } catch (error) {
      console.error('Error checking PR:', error);
      return false;
    }
  };

  const checkIfRepPR = async (exerciseName: string, weight: number, reps: number, workoutLogs: any[], today: string) => {
    try {
      // Get all previous workout logs except today
      const previousLogs = Object.values(workoutLogs).flat().filter((log: any) => {
        if (!log.date) return false;
        const logDate = typeof log.date === 'string' ? log.date : log.date.toISOString();
        return logDate.split('T')[0] !== today;
      });
      
      for (const log of previousLogs) {
        if (!log.exercises) continue;
        
        for (const exercise of log.exercises) {
          if (exercise.exercise?.name === exerciseName && exercise.sets) {
            for (const set of exercise.sets) {
              if (set.completed && set.actualWeight === weight && set.actualReps > reps) {
                return false; // Found a previous record with same weight but more reps
              }
            }
          }
        }
      }
      return true; // No previous record found with same weight and more reps
    } catch (error) {
      console.error('Error checking rep PR:', error);
      return false;
    }
  };

  const cancelWorkout = () => {
    setShowEndWorkoutModal(false);
  };

  const deleteWorkout = () => {
    setShowEndWorkoutModal(false);
    setShowWorkoutModal(false);
    setActiveWorkout(null);
    setWorkoutData(null);
    Alert.alert('Workout Cancelled', 'Workout has been cancelled and not saved.');
  };

  const confirmStartWorkout = () => {
    if (!activeWorkout) return;
    setShowWorkoutModal(true);
    setShowWorkoutStartModal(false);
    startTimer();
    if (activeWorkout.exercises.length > 0 && 
        activeWorkout.exercises[0] && 
        activeWorkout.exercises[0].sets && 
        activeWorkout.exercises[0].sets.length > 0) {
      const firstExercise = activeWorkout.exercises[0];
      const firstSet = firstExercise.sets[0];
      setActiveSet({
        exerciseIndex: 0,
        setIndex: 0,
        reps: firstSet.reps || 0,
        weight: firstSet.weight || 0,
        restTime: firstSet.restTime || 0,
        isResting: false,
        timeRemaining: 0,
      });
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataStorage.deleteCustomWorkout(workoutId);
              loadCustomWorkouts();
              Alert.alert('Success', 'Workout deleted successfully');
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await loadCustomWorkouts();
    setRefreshing(false);
  };

  const handleAIGenerate = () => {
    setShowAIGenerator(true);
  };

  const handleAIPremade = () => {
    Alert.alert(
      'AI Premade Plans',
      'Choose a workout plan based on your goals and fitness level.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Beginner Plan', onPress: () => generateAIPlan('beginner') },
        { text: 'Intermediate Plan', onPress: () => generateAIPlan('intermediate') },
        { text: 'Advanced Plan', onPress: () => generateAIPlan('advanced') }
      ]
    );
  };

  const generateAIPlan = (level: string) => {
    const aiWorkouts = {
      beginner: [
        {
          name: 'Beginner Full Body',
          description: 'Perfect for those starting their fitness journey',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 8, weight: 0, category: 'Chest' },
            { name: 'Bodyweight Squats', sets: 3, reps: 12, weight: 0, category: 'Legs' },
            { name: 'Planks', sets: 3, reps: 30, weight: 0, category: 'Core' },
            { name: 'Lunges', sets: 3, reps: 10, weight: 0, category: 'Legs' }
          ]
        },
        {
          name: 'Beginner Upper Body',
          description: 'Focus on building upper body strength',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 10, weight: 0, category: 'Chest' },
            { name: 'Diamond Push-ups', sets: 2, reps: 5, weight: 0, category: 'Chest' },
            { name: 'Planks', sets: 3, reps: 45, weight: 0, category: 'Core' },
            { name: 'Superman', sets: 3, reps: 12, weight: 0, category: 'Back' }
          ]
        }
      ],
      intermediate: [
        {
          name: 'Intermediate Strength',
          description: 'Build serious strength with compound movements',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: 8, weight: 135, category: 'Chest' },
            { name: 'Squats', sets: 4, reps: 10, weight: 185, category: 'Legs' },
            { name: 'Deadlifts', sets: 3, reps: 6, weight: 225, category: 'Back' },
            { name: 'Overhead Press', sets: 3, reps: 8, weight: 95, category: 'Shoulders' }
          ]
        },
        {
          name: 'Intermediate HIIT',
          description: 'High intensity interval training for fat loss',
          exercises: [
            { name: 'Burpees', sets: 4, reps: 15, weight: 0, category: 'Full Body' },
            { name: 'Mountain Climbers', sets: 4, reps: 30, weight: 0, category: 'Core' },
            { name: 'Jump Squats', sets: 4, reps: 20, weight: 0, category: 'Legs' },
            { name: 'Battle Ropes', sets: 4, reps: 30, weight: 0, category: 'Full Body' }
          ]
        }
      ],
      advanced: [
        {
          name: 'Advanced Powerlifting',
          description: 'Heavy compound movements for maximum strength',
          exercises: [
            { name: 'Squats', sets: 5, reps: 5, weight: 315, category: 'Legs' },
            { name: 'Bench Press', sets: 5, reps: 5, weight: 225, category: 'Chest' },
            { name: 'Deadlifts', sets: 5, reps: 3, weight: 405, category: 'Back' },
            { name: 'Overhead Press', sets: 4, reps: 6, weight: 135, category: 'Shoulders' }
          ]
        },
        {
          name: 'Advanced Calisthenics',
          description: 'Bodyweight mastery and advanced movements',
          exercises: [
            { name: 'Muscle-ups', sets: 3, reps: 5, weight: 0, category: 'Full Body' },
            { name: 'Handstand Push-ups', sets: 3, reps: 8, weight: 0, category: 'Shoulders' },
            { name: 'Pistol Squats', sets: 3, reps: 10, weight: 0, category: 'Legs' },
            { name: 'L-sits', sets: 3, reps: 30, weight: 0, category: 'Core' }
          ]
        }
      ]
    };

    const plans = aiWorkouts[level as keyof typeof aiWorkouts];
    const randomPlan = plans[Math.floor(Math.random() * plans.length)];
    
    // Convert to CustomWorkout format
    const aiWorkout: CustomWorkout = {
      id: `ai-${Date.now()}`,
      name: randomPlan.name,
      description: randomPlan.description,
      exercises: randomPlan.exercises.map((ex, index) => ({
        id: `ex-${index}`,
        exercise: {
          id: `ex-${index}`,
          name: ex.name,
          category: ex.category,
          difficulty: level.charAt(0).toUpperCase() + level.slice(1),
          videoUrl: `https://www.youtube.com/watch?v=example${index}`
        },
        sets: Array(ex.sets || 3).fill(0).map((_, setIndex) => ({
          id: `set-${setIndex}`,
          reps: ex.reps,
          weight: ex.weight,
          restTime: 90,
          completed: false
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to custom workouts
    setCustomWorkouts(prev => [...prev, aiWorkout]);
    Alert.alert('AI Plan Generated!', `${randomPlan.name} has been added to your workouts.`);
  };

  // Complex AI Workout Generator
  const generatePersonalizedWorkout = () => {
    setShowAIGenerator(true);
  };

  const createPersonalizedWorkout = async () => {
    // Complex AI algorithm for personalized workout generation
    const exerciseDatabase = {
      chest: [
        { name: 'Push-ups', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Bench Press', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 12 },
        { name: 'Incline Dumbbell Press', difficulty: 'intermediate', equipment: 'dumbbells', timePerSet: 3, calories: 10 },
        { name: 'Diamond Push-ups', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 2, calories: 10 },
        { name: 'Chest Flyes', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 8 }
      ],
      back: [
        { name: 'Pull-ups', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 3, calories: 12 },
        { name: 'Deadlifts', difficulty: 'advanced', equipment: 'barbell', timePerSet: 4, calories: 15 },
        { name: 'Bent Over Rows', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 10 },
        { name: 'Lat Pulldowns', difficulty: 'beginner', equipment: 'machine', timePerSet: 2, calories: 8 },
        { name: 'Face Pulls', difficulty: 'beginner', equipment: 'cable', timePerSet: 2, calories: 6 }
      ],
      legs: [
        { name: 'Squats', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 3, calories: 12 },
        { name: 'Bulgarian Split Squats', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 3, calories: 10 },
        { name: 'Lunges', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Romanian Deadlifts', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 10 },
        { name: 'Calf Raises', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 1, calories: 4 }
      ],
      shoulders: [
        { name: 'Overhead Press', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 10 },
        { name: 'Lateral Raises', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 6 },
        { name: 'Pike Push-ups', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Arnold Press', difficulty: 'intermediate', equipment: 'dumbbells', timePerSet: 3, calories: 8 },
        { name: 'Face Pulls', difficulty: 'beginner', equipment: 'cable', timePerSet: 2, calories: 6 }
      ],
      arms: [
        { name: 'Bicep Curls', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 6 },
        { name: 'Tricep Dips', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Hammer Curls', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 6 },
        { name: 'Close Grip Bench Press', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 8 },
        { name: 'Preacher Curls', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 2, calories: 6 }
      ],
      core: [
        { name: 'Planks', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 1, calories: 4 },
        { name: 'Russian Twists', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 1, calories: 6 },
        { name: 'Mountain Climbers', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 1, calories: 8 },
        { name: 'L-sits', difficulty: 'advanced', equipment: 'bodyweight', timePerSet: 1, calories: 10 },
        { name: 'Side Planks', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 1, calories: 6 }
      ]
    };

    // AI Algorithm Logic
    let selectedExercises = [];
    let totalTime = 0;
    let totalCalories = 0;
    
    // Determine workout focus based on goals
    const primaryMuscles = targetMuscles.length > 0 ? targetMuscles : ['chest', 'back', 'legs'];
    const secondaryMuscles = ['shoulders', 'arms', 'core'];
    
    // Calculate exercises per muscle group based on duration
    const exercisesPerMuscle = Math.max(1, Math.floor(workoutDuration / 15));
    const totalExercises = Math.min(8, Math.floor(workoutDuration / 6));
    
    // Select primary muscle exercises
    for (const muscle of primaryMuscles.slice(0, 2)) {
      if (selectedExercises.length >= totalExercises) break;
      
      const muscleExercises = exerciseDatabase[muscle as keyof typeof exerciseDatabase] || [];
      const availableExercises = muscleExercises.filter(ex => 
        equipmentAvailable.includes(ex.equipment) || equipmentAvailable.includes('all')
      );
      
      if (availableExercises.length > 0) {
        const exercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
        const sets = fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'intermediate' ? 4 : 5;
        const reps = fitnessLevel === 'beginner' ? 12 : fitnessLevel === 'intermediate' ? 10 : 8;
        
        selectedExercises.push({
          ...exercise,
          sets,
          reps,
          weight: exercise.equipment === 'bodyweight' ? 0 : 
                 fitnessLevel === 'beginner' ? 20 : 
                 fitnessLevel === 'intermediate' ? 40 : 60
        });
        
        totalTime += exercise.timePerSet * sets;
        totalCalories += exercise.calories * sets;
      }
    }
    
    // Fill remaining slots with secondary muscles
    for (const muscle of secondaryMuscles) {
      if (selectedExercises.length >= totalExercises) break;
      
      const muscleExercises = exerciseDatabase[muscle as keyof typeof exerciseDatabase] || [];
      const availableExercises = muscleExercises.filter(ex => 
        equipmentAvailable.includes(ex.equipment) || equipmentAvailable.includes('all')
      );
      
      if (availableExercises.length > 0) {
        const exercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
        const sets = fitnessLevel === 'beginner' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
        const reps = fitnessLevel === 'beginner' ? 15 : fitnessLevel === 'intermediate' ? 12 : 10;
        
        selectedExercises.push({
          ...exercise,
          sets,
          reps,
          weight: exercise.equipment === 'bodyweight' ? 0 : 
                 fitnessLevel === 'beginner' ? 15 : 
                 fitnessLevel === 'intermediate' ? 30 : 45
        });
        
        totalTime += exercise.timePerSet * sets;
        totalCalories += exercise.calories * sets;
      }
    }
    
    // Generate workout name based on goals and focus
    let workoutName = '';
    if (userGoals.includes('strength')) {
      workoutName = 'AI Strength Builder';
    } else if (userGoals.includes('muscle')) {
      workoutName = 'AI Muscle Growth';
    } else if (userGoals.includes('endurance')) {
      workoutName = 'AI Endurance Challenge';
    } else if (userGoals.includes('fat_loss')) {
      workoutName = 'AI Fat Burner';
    } else {
      workoutName = 'AI Personalized Workout';
    }
    
    // Create workout description
    const description = `AI-generated ${fitnessLevel} workout targeting ${primaryMuscles.join(', ')}. Estimated ${totalTime} minutes, ${totalCalories} calories burned.`;
    
    // Convert to CustomWorkout format
    const aiWorkout: CustomWorkout = {
      id: `ai-personalized-${Date.now()}`,
      name: workoutName,
      description: description,
      exercises: selectedExercises.map((ex, index) => ({
        id: `ex-${index}`,
        exercise: {
          id: `ex-${index}`,
          name: ex.name,
          category: ex.name.includes('Chest') || ex.name.includes('Push') ? 'Chest' :
                   ex.name.includes('Back') || ex.name.includes('Pull') ? 'Back' :
                   ex.name.includes('Leg') || ex.name.includes('Squat') ? 'Legs' :
                   ex.name.includes('Shoulder') || ex.name.includes('Press') ? 'Shoulders' :
                   ex.name.includes('Bicep') || ex.name.includes('Tricep') ? 'Arms' : 'Core',
          difficulty: ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1),
          videoUrl: `https://www.youtube.com/watch?v=example${index}`
        },
        sets: Array(ex.sets || 3).fill(0).map((_, setIndex) => ({
          id: `set-${setIndex}`,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.difficulty === 'beginner' ? 60 : ex.difficulty === 'intermediate' ? 90 : 120,
          completed: false
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to custom workouts
    setCustomWorkouts(prev => [...prev, aiWorkout]);
    setShowAIGenerator(false);
    
    // Save to DataStorage
    try {
      await DataStorage.saveCustomWorkout(aiWorkout);
      Alert.alert('AI Workout Generated!', `${workoutName} has been created and saved to your workouts!`);
    } catch (error) {
      console.error('Error saving AI workout:', error);
      Alert.alert('AI Workout Generated!', `${workoutName} has been created based on your preferences!`);
    }
  };


