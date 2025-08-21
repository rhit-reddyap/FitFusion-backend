
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function GamificationScreen() {
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{user: string, xp: number}[]>([]);

  useEffect(() => {
    setXp(1200);
    setBadges(['Consistency King', 'Iron Master']);
    setLeaderboard([
      { user: 'Aditya', xp: 1200 },
      { user: 'Ron', xp: 950 },
      { user: 'Sam', xp: 800 },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Gamification</Text>
      <Text style={styles.subtitle}>Your XP: {xp}</Text>
      <Text style={styles.subtitle}>Badges:</Text>
      {badges.map((b, i) => <Text key={i} style={styles.badge}>{b}</Text>)}
      <Text style={styles.subtitle}>Leaderboard:</Text>
      <FlatList
        data={leaderboard}
        renderItem={({item}) => <Text>{item.user} — {item.xp} XP</Text>}
        keyExtractor={(item, idx) => idx.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 18, marginTop: 10 },
  badge: { fontSize: 16, marginLeft: 10 }
});
