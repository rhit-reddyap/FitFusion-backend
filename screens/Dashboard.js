import React from 'react';
import { View, Text } from 'react-native';

export default function Dashboard() {
  return (
    <View style={ flex: 1, alignItems: 'center', justifyContent: 'center' }>
      <Text style={ fontSize: 22, fontWeight: 'bold' }>Dashboard Screen</Text>
    </View>
  );
}
