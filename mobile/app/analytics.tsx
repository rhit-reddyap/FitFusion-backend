import { useState } from "react";
import { View, Text, Button } from "react-native";

export default function Analytics() {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");

  const convertWeight = (w: number) => unit === "kg" ? w : w * 2.20462;
  const calc1RM = (weight: number, reps: number) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Analytics (Mobile)</Text>
      <Button title={`Switch to ${unit === "kg" ? "lb" : "kg"}`} onPress={() => setUnit(unit === "kg" ? "lb" : "kg")} />

      <Text style={{ marginTop: 20 }}>Example Weight Log: {convertWeight(80).toFixed(1)} {unit}</Text>
      <Text>Example Burn Log: 500 kcal</Text>

      <Text style={{ marginTop: 20 }}>Estimated 1RM Calculator:</Text>
      <Text>100kg x 5 reps ≈ {calc1RM(100, 5)}kg</Text>

      <Text style={{ marginTop: 20 }}>Streaks & Badges (Coming soon)</Text>
    </View>
  );
}
