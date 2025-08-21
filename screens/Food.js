import React from 'react';
import { View, Text } from 'react-native';

export default function Food() {
  return (
    <View style={ flex: 1, alignItems: 'center', justifyContent: 'center' }>
      <Text style={ fontSize: 22, fontWeight: 'bold' }>Food Screen</Text>
    </View>
  );
}
