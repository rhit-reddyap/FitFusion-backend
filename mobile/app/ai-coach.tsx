import { useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";

type AIPlan = {
  type: string;
  details: string;
  premium: boolean;
};

export default function AICoach() {
  const [plans, setPlans] = useState<AIPlan[]>([]);
  const [type, setType] = useState("Workout");
  const [details, setDetails] = useState("");

  const addPlan = () => {
    if (!details) return;
    const premium = type === "Diet";
    const plan: AIPlan = { type, details, premium };
    setPlans([...plans, plan]);
    setDetails("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>AI Coach</Text>
      <Text>Type: {type}</Text>
      <TextInput
        placeholder="Enter plan details"
        value={details}
        onChangeText={setDetails}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button title="Add Plan" onPress={addPlan} />
      <FlatList
        data={plans}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.type}: {item.details} {item.premium ? "(Premium)" : ""}
          </Text>
        )}
      />
    </View>
  );
}
