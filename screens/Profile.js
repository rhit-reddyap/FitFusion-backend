import React from 'react';
import { View, Text } from 'react-native';

export default function Profile() {
  return (
    <View style={ flex: 1, alignItems: 'center', justifyContent: 'center' }>
      <Text style={ fontSize: 22, fontWeight: 'bold' }>Profile Screen</Text>
    </View>
  );
}
