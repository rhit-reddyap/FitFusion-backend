import { View, Text, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function CommunityDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Community {id}</Text>
      <Text style={{ marginTop: 10, fontWeight: "bold" }}>Feed</Text>
      <ScrollView style={{ height: 100, marginVertical: 10 }}>
        <Text>User A hit a new PR on Squat!</Text>
        <Text>User B logged 3 workouts this week 🔥</Text>
      </ScrollView>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>Chat</Text>
      <ScrollView style={{ height: 150, marginVertical: 10 }}>
        <Text>User A: Great job today!</Text>
        <Text>User B: Thanks! 💪</Text>
      </ScrollView>
      <TextInput placeholder="Type message..." style={{ borderWidth: 1, padding: 8 }} />
    </View>
  );
}
