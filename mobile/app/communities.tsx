import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Communities() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Communities</Text>
      <Link href="/communities/1" asChild>
        <Button title="Go to Community 1" />
      </Link>
      <Link href="/communities/2" asChild>
        <Button title="Go to Community 2" />
      </Link>
      <Button title="Create Community" onPress={() => {}} />
    </View>
  );
}
