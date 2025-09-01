import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from '../../api/axiosInstance';

export default function BookingsByPackageScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/analytics/bookings-by-package')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex:1 }} />;

  return (
    <View style={{ flex:1, padding:14 }}>
      <Text style={styles.header}>Bookings by Package</Text>
      <FlatList
        data={data}
        keyExtractor={(item,i) => `${item.packageName}_${i}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex:1 }}>{item.packageName}</Text>
            <Text>{item.bookingCount} bookings</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No package stats found.</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize:17, fontWeight:'bold', marginBottom:10 },
  row: { flexDirection:'row', paddingVertical:6, borderBottomWidth:0.5, borderColor:'#ececec' }
});
