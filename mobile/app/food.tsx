import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";

type FoodEntry = {
  name: string;
  grams: number;
  calories: number;
  protein: number;
};

export default function Food() {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("");

  useEffect(() => {
    // TODO: Replace with Supabase fetch
  }, []);

  const addFood = () => {
    if (!name || !grams) return;
    const g = Number(grams);
    const entry: FoodEntry = {
      name,
      grams: g,
      calories: Math.round(g * 2),
      protein: Math.round(g * 0.1)
    };
    setFoods([...foods, entry]);
    setName("");
    setGrams("");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Food Tracker (Mobile)</Text>

      <TextInput
        placeholder="Food name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Grams"
        value={grams}
        onChangeText={setGrams}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button title="Add Food" onPress={addFood} />

      <FlatList
        data={foods}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Text>{item.name} - {item.grams}g | {item.calories} cal, {item.protein}g protein</Text>
        )}
      />
    </View>
  );
}
