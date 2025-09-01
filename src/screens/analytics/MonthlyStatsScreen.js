import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit'; // Install if you want chart visuals
import axios from '../../api/axiosInstance';

export default function MonthlyStatsScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/analytics/monthly-stats')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex:1 }} />;

  if (!data?.length) return <Text style={{ margin:16 }}>No stats found.</Text>;

  // For a visual, assume API returns array of { month, year, bookings, revenue }
  const labels = data.map(e => `${e.month}/${String(e.year).slice(-2)}`);
  const bookings = data.map(e => e.bookings);
  const revenue = data.map(e => e.revenue);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Monthly Booking Stats</Text>
      <LineChart
        data={{
          labels,
          datasets: [
            { data: bookings, color: () => '#2563eb', strokeWidth:2 },
            { data: revenue, color: () => '#22c55e', strokeWidth:2 }
          ],
          legend: ['Bookings', 'Revenue']
        }}
        width={340}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: opacity => `rgba(0,0,0,${opacity})`,
          labelColor: opacity => `rgba(0,0,0,${opacity})`
        }}
        bezier
        style={{ marginVertical:16, borderRadius:8 }}
      />
      {/* Simple Table fallback */}
      <View style={{ marginTop:18 }}>
        {data.map((row,i) => (
          <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:5 }}>
            <Text>{row.month}/{row.year}</Text>
            <Text>{row.bookings} bookings</Text>
            <Text>₹{row.revenue}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems:'center', padding:16 },
  header: { fontSize:19, fontWeight:'bold', marginBottom:12 },
});
