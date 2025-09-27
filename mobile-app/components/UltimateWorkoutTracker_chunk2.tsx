  // Comprehensive Workout Library Data
  const premadeWorkouts = [
    {
      id: 'push-day',
      name: 'Push Day',
      category: 'Strength',
      description: 'Upper body pushing movements focusing on chest, shoulders, and triceps',
      duration: 45,
      calories: 350,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '1', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Chest' }, sets: [{ reps: 8, weight: 135, restTime: 120, completed: false, actualReps: 8, actualWeight: 135, isActive: false }] },
        { exercise: { id: '2', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Shoulders' }, sets: [{ reps: 8, weight: 95, restTime: 120, completed: false, actualReps: 8, actualWeight: 95, isActive: false }] },
        { exercise: { id: '3', name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbells', muscle: 'Chest' }, sets: [{ reps: 10, weight: 60, restTime: 90, completed: false, actualReps: 10, actualWeight: 60, isActive: false }] },
        { exercise: { id: '4', name: 'Dips', category: 'Triceps', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Triceps' }, sets: [{ reps: 12, weight: 0, restTime: 90, completed: false, actualReps: 12, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'pull-day',
      name: 'Pull Day',
      category: 'Strength',
      description: 'Upper body pulling movements focusing on back and biceps',
      duration: 50,
      calories: 380,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '5', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 8, weight: 0, restTime: 120, completed: false, actualReps: 8, actualWeight: 0, isActive: false }] },
        { exercise: { id: '6', name: 'Barbell Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Back' }, sets: [{ reps: 8, weight: 115, restTime: 120, completed: false, actualReps: 8, actualWeight: 115, isActive: false }] },
        { exercise: { id: '7', name: 'Lat Pulldowns', category: 'Back', difficulty: 'Beginner', equipment: 'Cable', muscle: 'Back' }, sets: [{ reps: 10, weight: 100, restTime: 90, completed: false, actualReps: 10, actualWeight: 100, isActive: false }] },
        { exercise: { id: '8', name: 'Barbell Curls', category: 'Biceps', difficulty: 'Beginner', equipment: 'Barbell', muscle: 'Biceps' }, sets: [{ reps: 12, weight: 65, restTime: 90, completed: false, actualReps: 12, actualWeight: 65, isActive: false }] }
      ]
    },
    {
      id: 'leg-day',
      name: 'Leg Day',
      category: 'Strength',
      description: 'Lower body workout focusing on quads, hamstrings, and glutes',
      duration: 55,
      calories: 420,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '9', name: 'Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Quadriceps' }, sets: [{ reps: 8, weight: 185, restTime: 180, completed: false, actualReps: 8, actualWeight: 185, isActive: false }] },
        { exercise: { id: '10', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Hamstrings' }, sets: [{ reps: 8, weight: 155, restTime: 150, completed: false, actualReps: 8, actualWeight: 155, isActive: false }] },
        { exercise: { id: '11', name: 'Bulgarian Split Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Dumbbells', muscle: 'Quadriceps' }, sets: [{ reps: 10, weight: 40, restTime: 90, completed: false, actualReps: 10, actualWeight: 40, isActive: false }] },
        { exercise: { id: '12', name: 'Calf Raises', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Calves' }, sets: [{ reps: 15, weight: 0, restTime: 60, completed: false, actualReps: 15, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'upper-body',
      name: 'Upper Body Day',
      category: 'Strength',
      description: 'Complete upper body workout for chest, back, shoulders, and arms',
      duration: 50,
      calories: 400,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '13', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Chest' }, sets: [{ reps: 8, weight: 135, restTime: 120, completed: false, actualReps: 8, actualWeight: 135, isActive: false }] },
        { exercise: { id: '14', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 8, weight: 0, restTime: 120, completed: false, actualReps: 8, actualWeight: 0, isActive: false }] },
        { exercise: { id: '15', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Shoulders' }, sets: [{ reps: 8, weight: 95, restTime: 120, completed: false, actualReps: 8, actualWeight: 95, isActive: false }] },
        { exercise: { id: '16', name: 'Barbell Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Back' }, sets: [{ reps: 8, weight: 115, restTime: 120, completed: false, actualReps: 8, actualWeight: 115, isActive: false }] }
      ]
    },
    {
      id: 'lower-body',
      name: 'Lower Body Day',
      category: 'Strength',
      description: 'Complete lower body workout for legs and glutes',
      duration: 45,
      calories: 380,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '17', name: 'Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Quadriceps' }, sets: [{ reps: 8, weight: 185, restTime: 180, completed: false, actualReps: 8, actualWeight: 185, isActive: false }] },
        { exercise: { id: '18', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Hamstrings' }, sets: [{ reps: 8, weight: 155, restTime: 150, completed: false, actualReps: 8, actualWeight: 155, isActive: false }] },
        { exercise: { id: '19', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Quadriceps' }, sets: [{ reps: 12, weight: 30, restTime: 90, completed: false, actualReps: 12, actualWeight: 30, isActive: false }] },
        { exercise: { id: '20', name: 'Hip Thrusts', category: 'Glutes', difficulty: 'Beginner', equipment: 'Barbell', muscle: 'Glutes' }, sets: [{ reps: 12, weight: 95, restTime: 90, completed: false, actualReps: 12, actualWeight: 95, isActive: false }] }
      ]
    },
    {
      id: 'full-body',
      name: 'Full Body Day',
      category: 'Strength',
      description: 'Complete full body workout hitting all major muscle groups',
      duration: 60,
      calories: 450,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '21', name: 'Deadlifts', category: 'Full Body', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Full Body' }, sets: [{ reps: 5, weight: 225, restTime: 180, completed: false, actualReps: 5, actualWeight: 225, isActive: false }] },
        { exercise: { id: '22', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Chest' }, sets: [{ reps: 15, weight: 0, restTime: 60, completed: false, actualReps: 15, actualWeight: 0, isActive: false }] },
        { exercise: { id: '23', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 8, weight: 0, restTime: 120, completed: false, actualReps: 8, actualWeight: 0, isActive: false }] },
        { exercise: { id: '24', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Legs' }, sets: [{ reps: 12, weight: 0, restTime: 90, completed: false, actualReps: 12, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'yoga-morning',
      name: 'Morning Yoga Flow',
      category: 'Yoga',
      description: 'Gentle morning yoga sequence to start your day',
      duration: 30,
      calories: 150,
      difficulty: 'Beginner',
      exercises: [
        { exercise: { id: '25', name: 'Sun Salutation', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Full Body' }, sets: [{ reps: 5, weight: 0, restTime: 0, completed: false, actualReps: 5, actualWeight: 0, isActive: false }] },
        { exercise: { id: '26', name: 'Warrior Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Legs' }, sets: [{ reps: 3, weight: 0, restTime: 0, completed: false, actualReps: 3, actualWeight: 0, isActive: false }] },
        { exercise: { id: '27', name: 'Downward Dog', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Full Body' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '28', name: 'Child\'s Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Back' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'yoga-evening',
      name: 'Evening Yoga Flow',
      category: 'Yoga',
      description: 'Relaxing evening yoga sequence for stress relief',
      duration: 40,
      calories: 200,
      difficulty: 'Beginner',
      exercises: [
        { exercise: { id: '29', name: 'Cat-Cow Stretch', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Back' }, sets: [{ reps: 10, weight: 0, restTime: 0, completed: false, actualReps: 10, actualWeight: 0, isActive: false }] },
        { exercise: { id: '30', name: 'Seated Forward Fold', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Hamstrings' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '31', name: 'Legs Up the Wall', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Legs' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '32', name: 'Corpse Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Full Body' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'stretching-basic',
      name: 'Basic Stretching',
      category: 'Stretching',
      description: 'Basic stretching routine for flexibility and recovery',
      duration: 20,
      calories: 100,
      difficulty: 'Beginner',
      exercises: [
        { exercise: { id: '33', name: 'Neck Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Neck' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '34', name: 'Shoulder Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Shoulders' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '35', name: 'Hip Flexor Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Hip Flexors' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '36', name: 'Hamstring Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Hamstrings' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'stretching-advanced',
      name: 'Advanced Stretching',
      category: 'Stretching',
      description: 'Advanced stretching routine for improved flexibility',
      duration: 30,
      calories: 150,
      difficulty: 'Advanced',
      exercises: [
        { exercise: { id: '37', name: 'Pigeon Pose', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Hip Flexors' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '38', name: 'Frog Pose', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Hip Flexors' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '39', name: 'Splits', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Hamstrings' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '40', name: 'Backbend', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Spine' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'powerlifting',
      name: 'Powerlifting Training',
      category: 'Powerlifting',
      description: 'Heavy compound movements for strength and power',
      duration: 90,
      calories: 500,
      difficulty: 'Advanced',
      exercises: [
        { exercise: { id: '41', name: 'Squat', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Quadriceps' }, sets: [{ reps: 5, weight: 315, restTime: 300, completed: false, actualReps: 5, actualWeight: 315, isActive: false }] },
        { exercise: { id: '42', name: 'Bench Press', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Chest' }, sets: [{ reps: 5, weight: 225, restTime: 300, completed: false, actualReps: 5, actualWeight: 225, isActive: false }] },
        { exercise: { id: '43', name: 'Deadlift', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Full Body' }, sets: [{ reps: 5, weight: 405, restTime: 300, completed: false, actualReps: 5, actualWeight: 405, isActive: false }] },
        { exercise: { id: '44', name: 'Overhead Press', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Shoulders' }, sets: [{ reps: 5, weight: 135, restTime: 180, completed: false, actualReps: 5, actualWeight: 135, isActive: false }] }
      ]
    },
    {
      id: 'crossfit-wod',
      name: 'CrossFit WOD',
      category: 'CrossFit',
      description: 'High-intensity CrossFit workout of the day',
      duration: 25,
      calories: 400,
      difficulty: 'Advanced',
      exercises: [
        { exercise: { id: '45', name: 'Burpees', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Bodyweight', muscle: 'Full Body' }, sets: [{ reps: 20, weight: 0, restTime: 0, completed: false, actualReps: 20, actualWeight: 0, isActive: false }] },
        { exercise: { id: '46', name: 'Thrusters', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Full Body' }, sets: [{ reps: 15, weight: 95, restTime: 0, completed: false, actualReps: 15, actualWeight: 95, isActive: false }] },
        { exercise: { id: '47', name: 'Pull-ups', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 10, weight: 0, restTime: 0, completed: false, actualReps: 10, actualWeight: 0, isActive: false }] },
        { exercise: { id: '48', name: 'Box Jumps', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Box', muscle: 'Legs' }, sets: [{ reps: 15, weight: 0, restTime: 0, completed: false, actualReps: 15, actualWeight: 0, isActive: false }] }
      ]
    }
  ];

  // Get exercises from user's custom workouts
  const getUserExercises = () => {
    const exercises: any[] = [];
    customWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exercises.find(ex => ex.name === exercise.name)) {
          exercises.push({
            id: exercise.id || Math.random().toString(),
            name: exercise.name,
            category: exercise.category || 'General',
            difficulty: exercise.difficulty || 'Intermediate',
            videoUrl: exercise.videoUrl || 'https://www.youtube.com/watch?v=example'
          });
        }
      });
    });
    return exercises;
  };

  // Predefined exercise videos (60 total)
  const exerciseVideos = [
    { id: '1', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
    { id: '2', name: 'Squats', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
    { id: '3', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
    { id: '4', name: 'Deadlifts', category: 'Back', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
    { id: '5', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
    { id: '6', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=QAJK64eMqB0' },
    { id: '7', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=3XDriUn0udo' },
    { id: '8', name: 'Planks', category: 'Core', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
    { id: '9', name: 'Bicep Curls', category: 'Arms', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
    { id: '10', name: 'Tricep Dips', category: 'Arms', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=6kALZikBxLc' },
    { id: '11', name: 'Incline Bench Press', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=8iPEnov-lmU' },
    { id: '12', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
    { id: '13', name: 'Lat Pulldowns', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Lu78' },
    { id: '14', name: 'Shoulder Press', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=QAJK64eMqB0' },
    { id: '15', name: 'Leg Press', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ' },
    { id: '16', name: 'Chest Flyes', category: 'Chest', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0' },
    { id: '17', name: 'Bent Over Rows', category: 'Back', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=paCfxQrQxU8' },
    { id: '18', name: 'Lateral Raises', category: 'Shoulders', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '19', name: 'Hammer Curls', category: 'Arms', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=TwD-YGVP4Bk' },
    { id: '20', name: 'Close Grip Bench Press', category: 'Arms', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94' },
    { id: '21', name: 'Bulgarian Split Squats', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
    { id: '22', name: 'Cable Rows', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
    { id: '23', name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=8iPEnov-lmU' },
    { id: '24', name: 'Front Squats', category: 'Legs', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=uYumuLmkVz8' },
    { id: '25', name: 'Face Pulls', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk' },
    { id: '26', name: 'Dumbbell Rows', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo' },
    { id: '27', name: 'Hip Thrusts', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=uYumuLmkVz8' },
    { id: '28', name: 'Arnold Press', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw' },
    { id: '29', name: 'Calf Raises', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '30', name: 'Russian Twists', category: 'Core', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI' },
    { id: '31', name: 'Mountain Climbers', category: 'Core', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM' },
    { id: '32', name: 'Burpees', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=TU8QYVW0gDU' },
    { id: '33', name: 'Jump Squats', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '34', name: 'Diamond Push-ups', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=jaxbEHLC4qU' },
    { id: '35', name: 'Chin-ups', category: 'Back', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=brhRXlOeR4s' },
    { id: '36', name: 'Pike Push-ups', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '37', name: 'Single Leg Deadlifts', category: 'Legs', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=Q4gMV4uXzxQ' },
    { id: '38', name: 'Inverted Rows', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=FXo0iD4kIhI' },
    { id: '39', name: 'Decline Push-ups', category: 'Chest', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=SKPab2YC8BE' },
    { id: '40', name: 'Wall Sits', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=YQVlZo6tcvA' },
    { id: '41', name: 'Superman', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=ccMXLH6lcWU' },
    { id: '42', name: 'Side Planks', category: 'Core', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g' },
    { id: '43', name: 'Hindu Push-ups', category: 'Chest', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=4f3Oy5Jnj44' },
    { id: '44', name: 'Glute Bridges', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8' },
    { id: '45', name: 'Reverse Flyes', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=paCfxQrQxU8' },
    { id: '46', name: 'Pistol Squats', category: 'Legs', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
    { id: '47', name: 'Handstand Push-ups', category: 'Shoulders', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '48', name: 'L-sits', category: 'Core', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=Wx3gVTHHdBY' },
    { id: '49', name: 'Muscle-ups', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=4f3Oy5Jnj44' },
    { id: '50', name: 'Turkish Get-ups', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=0bWRPC49-KI' },
    { id: '51', name: 'Kettlebell Swings', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8' },
    { id: '52', name: 'Box Jumps', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '53', name: 'Battle Ropes', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '54', name: 'Farmer\'s Walk', category: 'Full Body', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=Fkzk_RqlYig' },
    { id: '55', name: 'Sled Push', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '56', name: 'Rope Climbing', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=4f3Oy5Jnj44' },
    { id: '57', name: 'Tire Flips', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '58', name: 'Sandbag Carries', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=Fkzk_RqlYig' },
    { id: '59', name: 'Sledgehammer Swings', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '60', name: 'Atlas Stone Lifts', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' }
  ];

  // Organize workouts by category
  const organizedWorkouts = {
    strength: premadeWorkouts.filter(workout => workout.category === 'Strength'),
    powerlifting: premadeWorkouts.filter(workout => workout.category === 'Powerlifting'),
    crossfit: premadeWorkouts.filter(workout => workout.category === 'CrossFit'),
    yoga: premadeWorkouts.filter(workout => workout.category === 'Yoga'),
    stretching: premadeWorkouts.filter(workout => workout.category === 'Stretching')
  };

  module.exports = { premadeWorkouts: organizedWorkouts, exerciseVideos };
