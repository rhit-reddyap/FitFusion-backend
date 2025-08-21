import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Fit Fusion AI (Mobile)</Text>
      <Link href="/dashboard">Go to Dashboard</Link>
    </View>
  );
}
