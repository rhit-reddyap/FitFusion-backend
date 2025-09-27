  const handleVideoPress = (exercise: any) => {
    console.log('Video pressed:', exercise.name);
    // Always show video card modal first
    setSelectedVideo(exercise);
    setShowVideoModal(true);
  };

  const getExerciseDescription = (exerciseName: string) => {
    const descriptions: { [key: string]: string } = {
      'Push-ups': 'A classic bodyweight exercise that targets the chest, shoulders, and triceps. Start in a plank position, lower your body until your chest nearly touches the floor, then push back up.',
      'Squats': 'A fundamental lower body exercise that works the quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then return to standing.',
      'Pull-ups': 'An upper body strength exercise that targets the back, biceps, and shoulders. Hang from a bar with palms facing away, pull your body up until your chin clears the bar, then lower with control.',
      'Deadlifts': 'A compound exercise that works the entire posterior chain including hamstrings, glutes, and back. Lift a barbell from the ground to hip level while maintaining a straight back.',
      'Bench Press': 'A chest exercise performed lying on a bench. Lower a barbell to your chest, then press it back up to full arm extension.',
      'Overhead Press': 'A shoulder exercise where you press a weight from shoulder level to overhead. Great for building shoulder strength and stability.',
      'Lunges': 'A single-leg exercise that targets the quadriceps, hamstrings, and glutes. Step forward into a lunge position, lower your back knee toward the ground, then push back to starting position.',
      'Planks': 'An isometric core exercise. Hold a push-up position with your body in a straight line from head to heels, engaging your core muscles.',
      'Bicep Curls': 'An isolation exercise for the biceps. Hold weights with arms at your sides, curl them up toward your shoulders, then lower with control.',
      'Tricep Dips': 'A bodyweight exercise that targets the triceps. Support your body on a bench or chair, lower your body by bending your elbows, then push back up.',
      'Mountain Climbers': 'A dynamic cardio exercise. Start in a plank position, alternate bringing your knees toward your chest in a running motion.',
      'Burpees': 'A full-body exercise combining a squat, push-up, and jump. Start standing, drop to a push-up position, do a push-up, jump feet to hands, then jump up with arms overhead.',
      'Jumping Jacks': 'A cardio exercise. Start standing, jump while spreading your legs and raising your arms overhead, then jump back to starting position.',
      'High Knees': 'A cardio exercise. Run in place while bringing your knees up toward your chest as high as possible.',
      'Butt Kicks': 'A cardio exercise. Run in place while kicking your heels back toward your glutes.',
      'Leg Raises': 'A core exercise. Lie on your back, lift your legs straight up toward the ceiling, then lower them back down without touching the ground.',
      'Russian Twists': 'A core exercise. Sit with knees bent, lean back slightly, and rotate your torso from side to side while holding a weight or with hands clasped.',
      'Wall Sits': 'An isometric leg exercise. Slide your back down a wall until your thighs are parallel to the ground, hold this position.',
      'Calf Raises': 'A lower leg exercise. Stand on the edge of a step, rise up onto your toes, then lower your heels below the step level.',
      'Side Planks': 'A core exercise. Lie on your side, support your body on your forearm, and hold your body in a straight line from head to feet.'
    };
    
    return descriptions[exerciseName] || 'A great exercise to add to your workout routine. Focus on proper form and controlled movements for best results.';
  };

  const toggleFavorite = (workoutId: string) => {
    setFavoritedWorkouts(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(workoutId)) {
        newFavorites.delete(workoutId);
      } else {
        newFavorites.add(workoutId);
        // Save to My Workouts when favorited
        const workout = findWorkoutInLibrary(workoutId);
        if (workout) {
          saveWorkoutToMyWorkouts(workout);
        }
      }
      return newFavorites;
    });
  };

  const findWorkoutInLibrary = (workoutId: string) => {
    // Search through all workout categories
    const allWorkouts = [
      ...workoutLibrary.strength,
      ...workoutLibrary.powerlifting,
      ...workoutLibrary.crossfit,
      ...workoutLibrary.yoga,
      ...workoutLibrary.stretching
    ];
    return allWorkouts.find(w => w.id === workoutId);
  };

  const saveWorkoutToMyWorkouts = (workout: any) => {
    const customWorkout: CustomWorkout = {
      id: `favorite_${workout.id}_${Date.now()}`,
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      exercises: workout.exercises.map((exercise: any) => ({
        exercise: {
          id: exercise.id || `exercise_${Date.now()}`,
          name: exercise.name,
          category: exercise.category || 'General',
          description: exercise.description || '',
          instructions: exercise.instructions || '',
          tips: exercise.tips || '',
          videoUrl: exercise.videoUrl || '',
          imageUrl: exercise.imageUrl || '',
          difficulty: exercise.difficulty || 'Intermediate',
          equipment: exercise.equipment || [],
          targetMuscles: exercise.targetMuscles || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        sets: exercise.sets || [{ reps: 10, weight: 0, completed: false }]
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to local storage
    DataStorage.addCustomWorkout(customWorkout);
    
    // Update local state
    setCustomWorkouts(prev => [...prev, customWorkout]);
    
    Alert.alert('Added to My Workouts', `${workout.name} has been added to your My Workouts library!`);
  };

  const handleVideoCardPress = (workout: any) => {
    if (workout.videoUrl) {
      setSelectedVideoCard(workout);
      setShowVideoCard(true);
    } else {
      // For non-video workouts, show workout preview
      setSelectedLibraryWorkout(workout);
      setShowLibraryWorkoutPreview(true);
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    Linking.openURL(videoUrl).catch(err => {
      console.error('Error opening video:', err);
      Alert.alert('Error', 'Could not open video');
    });
  };

  const handleStartLibraryWorkout = (workout: any) => {
    // Convert library workout to CustomWorkout format
    const customWorkout: CustomWorkout = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      exercises: workout.exercises.map((exercise: any) => ({
        exercise: {
          id: Math.random().toString(),
          name: exercise.name,
          category: workout.category,
          difficulty: workout.difficulty,
          equipment: 'various',
          muscle: workout.category.toLowerCase(),
          instructions: `${exercise.sets} sets of ${exercise.reps} reps`,
        },
        sets: Array.from({ length: exercise.sets }, (_, index) => ({
          reps: parseInt(exercise.reps.split('-')[0]) || 10,
          weight: 0,
          restTime: parseInt(exercise.rest?.replace(/\D/g, '')) || 90,
          completed: false,
        })),
      })),
      createdAt: new Date(),
    };

    setActiveWorkout(customWorkout);
    setShowLibraryWorkoutPreview(false);
    setShowWorkoutLibrary(false);
    setShowWorkoutStartModal(true);
  };

  // Calendar helper functions
  const getTonnageForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.reduce((total, workout) => {
        return total + (workout.totalTonnage || 0);
      }, 0);
    } catch (error) {
      console.error('Error fetching tonnage:', error);
      return 0;
    }
  };

  const getWorkoutCountForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.length;
    } catch (error) {
      console.error('Error fetching workout count:', error);
      return 0;
    }
  };

  const getWorkoutDurationForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.reduce((total, workout) => {
        return total + (workout.duration || 0);
      }, 0);
    } catch (error) {
      console.error('Error fetching workout duration:', error);
      return 0;
    }
  };

  const getWorkoutsForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.map(workout => ({
        name: workout.workoutName,
        description: workout.notes || 'Workout completed',
        duration: workout.duration || 0,
        tonnage: workout.totalTonnage || 0
      }));
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  };

  const loadCalendarData = async (date: Date) => {
    setCalendarLoading(true);
    try {
      const [tonnage, count, duration, workouts] = await Promise.all([
        getTonnageForDate(date),
        getWorkoutCountForDate(date),
        getWorkoutDurationForDate(date),
        getWorkoutsForDate(date)
      ]);
      
      setCalendarTonnage(tonnage);
      setCalendarWorkoutCount(count);
      setCalendarDuration(duration);
      setCalendarWorkouts(workouts);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await DataStorage.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  function renderActiveWorkout() {
    if (!activeWorkout || !workoutData) return null;

    const currentExercise = workoutData.exercises[currentExerciseIndex];

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWorkoutModal}
        onRequestClose={() => setShowEndWorkoutModal(true)}
      >
        <View style={styles.workoutExecutionContainer}>
          {/* Workout Header */}
          <View style={styles.workoutHeader}>
            <TouchableOpacity 
              style={styles.endWorkoutButton}
              onPress={() => setShowEndWorkoutModal(true)}
            >
              <Ionicons name="close" size={24} color="#EF4444" />
            </TouchableOpacity>
            <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
            <View style={styles.workoutTimer}>
              <Text style={styles.timerText}>
                {Math.floor(workoutData.totalTime / 60)}:{(workoutData.totalTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Exercise Navigation */}
          <View style={styles.exerciseNavigation}>
            {workoutData.exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exerciseNavBtn,
                  currentExerciseIndex === index && styles.activeExerciseNavBtn
                ]}
                onPress={() => setCurrentExerciseIndex(index)}
              >
                <Text style={[
                  styles.exerciseNavBtnText,
                  currentExerciseIndex === index && styles.activeExerciseNavBtnText
                ]}>
                  {exercise.exercise?.name || 'Exercise'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{currentExercise?.exercise?.name || 'Exercise'}</Text>
            <Text style={styles.exerciseCategory}>{currentExercise?.exercise?.category || 'General'}</Text>
          </View>

          {/* Set Navigation */}
          <View style={styles.setNavigation}>
            <TouchableOpacity
              style={styles.setNavButton}
              onPress={() => setCurrentSetIndex(Math.max(0, currentSetIndex - 1))}
              disabled={currentSetIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color={currentSetIndex === 0 ? "#6B7280" : "#FFFFFF"} />
            </TouchableOpacity>
            <Text style={styles.setCounter}>
              Set {currentSetIndex + 1} of {currentExercise?.sets?.length || 0}
            </Text>
            <TouchableOpacity
              style={styles.setNavButton}
              onPress={() => setCurrentSetIndex(Math.min((currentExercise?.sets?.length || 1) - 1, currentSetIndex + 1))}
              disabled={currentSetIndex >= (currentExercise?.sets?.length || 1) - 1}
            >
              <Ionicons name="chevron-forward" size={24} color={currentSetIndex >= (currentExercise?.sets?.length || 1) - 1 ? "#6B7280" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>

          {/* Set Input */}
          <View style={styles.setInputContainer}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.weightInput}
                value={getInputValue(currentExerciseIndex, currentSetIndex, 'weight', 0)}
                onChangeText={(text) => setInputValue(currentExerciseIndex, currentSetIndex, 'weight', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.repsInput}
                value={getInputValue(currentExerciseIndex, currentSetIndex, 'reps', 0)}
                onChangeText={(text) => setInputValue(currentExerciseIndex, currentSetIndex, 'reps', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* Set Actions */}
          <View style={styles.setActions}>
            <TouchableOpacity
              style={[
                styles.setButton,
                currentExercise?.sets?.[currentSetIndex]?.isActive && styles.activeSetButton
              ]}
              onPress={() => toggleSetTimer(currentExerciseIndex, currentSetIndex)}
            >
              <Ionicons 
                name={currentExercise?.sets?.[currentSetIndex]?.isActive ? "stop" : "play"} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.setButtonText}>
                {currentExercise?.sets?.[currentSetIndex]?.isActive ? "Stop Set" : "Start Set"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeSetButton}
              onPress={() => completeSet(currentExerciseIndex, currentSetIndex)}
            >
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.completeSetButtonText}>Complete Set</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Summary */}
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Total Time</Text>
              <Text style={styles.progressValue}>
                {Math.floor(workoutData.totalTime / 60)}:{(workoutData.totalTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Tonnage</Text>
              <Text style={styles.progressValue}>{workoutData.totalTonnage.toFixed(0)} lbs</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Sets</Text>
              <Text style={styles.progressValue}>
                {workoutData.exercises.reduce((total, ex) => total + (ex.sets?.filter(s => s.completed).length || 0), 0)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Advanced Training</Text>
            <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowWorkoutCalendar(true)}
            style={styles.calendarButton}
          >
            <Ionicons name="calendar-outline" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10B981"
            />
          }
        >
          {/* Hero Stats Dashboard */}
          <View style={styles.heroStatsContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)', 'rgba(0, 0, 0, 0.3)']}
              style={styles.heroStatsGradient}
            >
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="fitness" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>{userStats?.totalWorkouts || 0}</Text>
                  <Text style={styles.heroStatLabel}>Workouts</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="time" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>
                    {workoutData ? Math.floor(workoutData.totalTime / 60) : (calendarDuration || 0)}
                  </Text>
                  <Text style={styles.heroStatLabel}>Minutes</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="barbell" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>
                    {workoutData ? workoutData.totalTonnage : (calendarTonnage || 0)}
                  </Text>
                  <Text style={styles.heroStatLabel}>Tonnage</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="trophy" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>{userStats?.workoutStreak || 0}</Text>
                  <Text style={styles.heroStatLabel}>Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Start Section */}
          <View style={styles.quickStartContainer}>
            <Text style={styles.quickStartTitle}>Quick Start</Text>
            <View style={styles.quickStartButtons}>
              <TouchableOpacity style={styles.quickStartButton} onPress={() => setShowViewAllWorkouts(true)}>
                <Ionicons name="play" size={24} color="#10B981" style={styles.quickStartButtonIcon} />
                <Text style={styles.quickStartButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowCustomBuilder(true)}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="create" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>Create</Text>
                <Text style={styles.actionCardSubtitle}>Custom Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleAIGenerate}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="sparkles" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>AI Generate</Text>
                <Text style={styles.actionCardSubtitle}>Smart Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowWorkoutLibrary(true)}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="library" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>Workout Library</Text>
                <Text style={styles.actionCardSubtitle}>Pre-made Programs</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('analytics');
              } else {
                Alert.alert('Navigation', 'Analytics page navigation not available in this context');
              }
            }}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="analytics" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>Analytics</Text>
                <Text style={styles.actionCardSubtitle}>Progress Tracking</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* My Workouts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Workouts</Text>
              {((customWorkouts || []).length > 0) ? (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setShowViewAllWorkouts(true)}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#10B981" />
                </TouchableOpacity>
              ) : null}
            </View>

            {((customWorkouts || []).length === 0) ? (
              <View style={styles.emptyStateContainer}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.05)', 'rgba(0, 0, 0, 0.3)']}
                  style={styles.emptyStateGradient}
                >
                  <Ionicons name="fitness-outline" size={60} color="#10B981" />
                  <Text style={styles.emptyStateText}>No Workouts Yet</Text>
                  <Text style={styles.emptyStateDescription}>
                    Create your first custom workout or use AI to generate one
                  </Text>
                  <TouchableOpacity style={styles.emptyStateButton} onPress={() => setShowCustomBuilder(true)}>
                    <Text style={styles.emptyStateButtonText}>Create Workout</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              customWorkouts.slice(0, 4).map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutCard}
                  onPress={() => handlePreviewWorkout(workout)}
                >
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.08)', 'rgba(0, 0, 0, 0.4)']}
                    style={styles.workoutCardGradient}
                  >
                    <View style={styles.workoutCardHeader}>
                      <View style={styles.workoutCardInfo}>
                        <Text style={styles.workoutCardTitle}>{workout.name}</Text>
                        <Text style={styles.workoutCardDescription}>{workout.description}</Text>
                      </View>
                      <View style={styles.workoutCardActions}>
                        <Ionicons name="chevron-forward" size={20} color="#10B981" />
                      </View>
                    </View>
                    <View style={styles.workoutCardStats}>
                      <View style={styles.workoutStat}>
                        <Ionicons name="list" size={16} color="#10B981" />
                        <Text style={styles.workoutStatText}>{workout.exercises.length} exercises</Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <Ionicons name="repeat" size={16} color="#10B981" />
                        <Text style={styles.workoutStatText}>{workout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)} sets</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Exercise Videos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercise Videos</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowExerciseLibrary(true)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseScrollView}>
              {exerciseVideos.map((exercise) => (
                <TouchableOpacity key={exercise.id} style={styles.exerciseCard} onPress={() => handleVideoPress(exercise)}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                    style={styles.exerciseCardGradient}
                  >
                    <View style={styles.exerciseThumbnail}>
                      <Ionicons name="play" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                    <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                    <View style={styles.exerciseDifficulty}>
                      <Text style={styles.exerciseDifficultyText}>{exercise.difficulty}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Modals */}
        {renderActiveWorkout()}
        <CustomWorkoutBuilder
          visible={showCustomBuilder}
          onClose={() => setShowCustomBuilder(false)}
          onWorkoutCreated={handleWorkoutCreated}
        />
        
        {/* Workout Start Confirmation Modal */}
        <Modal visible={showWorkoutStartModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.workoutStartModal}>
              <Text style={styles.workoutStartTitle}>Start {activeWorkout?.name}?</Text>
              <Text style={styles.workoutStartDescription}>
                Ready to begin your workout? Make sure you're warmed up and have your equipment ready.
              </Text>
              <View style={styles.workoutStartActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowWorkoutStartModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={confirmStartWorkout}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* End Workout Modal */}
        <Modal visible={showEndWorkoutModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.endWorkoutModal}>
              <Text style={styles.endWorkoutModalTitle}>End Workout?</Text>
              <Text style={styles.endWorkoutModalText}>
                What would you like to do with this workout?
              </Text>
              
              <View style={styles.endWorkoutActions}>
                <TouchableOpacity 
                  style={styles.endWorkoutActionButton}
                  onPress={cancelWorkout}
                >
                  <Text style={styles.endWorkoutActionText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.endWorkoutActionButton, styles.deleteButton]}
                  onPress={deleteWorkout}
                >
                  <Text style={[styles.endWorkoutActionText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.endWorkoutActionButton, styles.saveButton]}
                  onPress={endWorkout}
                >
                  <Text style={[styles.endWorkoutActionText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Workout Summary Modal */}
        <Modal visible={showWorkoutSummary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.workoutSummaryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutSummaryHeader}>
                <Text style={styles.workoutSummaryTitle}>Workout Complete!</Text>
                <Text style={styles.workoutSummarySubtitle}>{activeWorkout?.name}</Text>
              </View>
              
              <ScrollView style={styles.workoutSummaryContent}>
                {workoutData ? (
                  <>
                    {/* Time Summary */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Time Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Time</Text>
                        <Text style={styles.summaryValue}>{formatTime(workoutData.totalTime)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Time Spent Lifting</Text>
                        <Text style={styles.summaryValue}>{formatTime(workoutData.timeSpentLifting)}</Text>
                      </View>
                    </View>

                    {/* Tonnage Summary */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Tonnage Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Tonnage</Text>
                        <Text style={styles.summaryValue}>{workoutData.totalTonnage.toLocaleString()} lbs</Text>
                      </View>
                    </View>

                    {/* Muscle Group Breakdown */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Tonnage by Muscle Group</Text>
                      {Object.entries(workoutData.tonnagePerMuscleGroup).map(([muscle, tonnage]) => (
                        <View key={muscle} style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>{muscle}</Text>
                          <Text style={styles.summaryValue}>{tonnage.toLocaleString()} lbs</Text>
                        </View>
                      ))}
                    </View>

                    {/* Exercise Breakdown */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Exercise Breakdown</Text>
                      {workoutData.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseSummary}>
                          <Text style={styles.exerciseSummaryName}>{exercise.exercise.name}</Text>
                          <Text style={styles.exerciseSummarySets}>
                            {exercise.sets.filter(s => s.completed).length} / {exercise.sets.length} sets completed
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </ScrollView>
              
              <View style={styles.workoutSummaryActions}>
                <TouchableOpacity 
                  style={styles.saveWorkoutButton}
                  onPress={saveWorkout}
                >
                  <Text style={styles.saveWorkoutButtonText}>Exit & Save</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>

        {/* AI Workout Generator Modal */}
        <AIWorkoutGenerator
          visible={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onSaveWorkout={(workout) => {
            setCustomWorkouts(prev => [...prev, workout]);
            setShowAIGenerator(false);
          }}
        />

      </LinearGradient>
    </View>
  );
}


