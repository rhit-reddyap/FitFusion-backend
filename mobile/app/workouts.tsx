import { useState } from "react";
import { View, Text, TextInput, Button, FlatList, Picker } from "react-native";

type WorkoutEntry = {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
};

const exerciseLibrary = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull Ups",
  "Bicep Curls",
  "Tricep Extensions"
];

export default function Workouts() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [exercise, setExercise] = useState("Bench Press");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const addWorkout = () => {
    if (!exercise || !sets || !reps || !weight) return;
    const s = Number(sets), r = Number(reps), w = Number(weight);
    const entry: WorkoutEntry = {
      exercise,
      sets: s,
      reps: r,
      weight: w,
      volume: s * r * w
    };
    setWorkouts([...workouts, entry]);
    setSets(""); setReps(""); setWeight("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Workout Tracker (Mobile)</Text>

      <Text>Exercise:</Text>
      {/* Using TextInput for simplicity, ideally use a Picker */}
      <TextInput
        value={exercise}
        onChangeText={setExercise}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput placeholder="Sets" value={sets} onChangeText={setSets} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <TextInput placeholder="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <TextInput placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <Button title="Add Workout" onPress={addWorkout} />

      <FlatList
        data={workouts}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Text>{item.exercise} - {item.sets}x{item.reps} @ {item.weight}kg → {item.volume}kg</Text>
        )}
      />
    </View>
  );
}
