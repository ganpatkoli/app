import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from '../../api/axiosInstance';

export default function AgentLeaderboardScreen() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/analytics/agent-leaderboard')
      .then(res => setAgents(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex:1 }} />;

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={styles.header}>Agent Leaderboard</Text>
      <FlatList
        data={agents}
        keyExtractor={item => item.agentId}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={{ width:32 }}>{index+1}.</Text>
            <Text style={{ flex:1 }}>{item.name}</Text>
            <Text style={{ width:60 }}>{item.bookings}👥</Text>
            <Text style={{ width:90 }}>₹{item.revenue}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No agent stats found.</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize:18, fontWeight:'bold', marginBottom:8 },
  row: { flexDirection:'row', alignItems:'center', paddingVertical:7, borderBottomWidth:0.6, borderColor:'#ddd' }
});
