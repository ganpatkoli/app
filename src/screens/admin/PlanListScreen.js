import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from '../../api/axiosInstance';

export default function PlanListScreen({ navigation }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/packages')
      .then(res => setPlans(res.data))
      .finally(() => setLoading(false));
  }, []);

  const renderPlan = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>₹{item.price} / {item.durationDays} days</Text>
      <Text style={{ marginBottom: 6 }}>Features: {item.features?.join(', ')}</Text>
      <TouchableOpacity
        style={styles.buyBtn}
        onPress={() => navigation.navigate('PurchasePackage', { packageId: item._id })}
      >
        <Text style={{ color:'#fff', fontWeight:'bold' }}>Purchase</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex:1 }} />;

  return (
    <View style={{ flex:1 }}>
      <FlatList
        data={plans}
        keyExtractor={item => item._id}
        renderItem={renderPlan}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>No packages available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:'#f8f8f8', borderRadius:8, padding:16, marginBottom:18, elevation:1 },
  name: { fontSize:17, fontWeight:'bold', marginBottom:3 },
  buyBtn: { marginTop:8, backgroundColor:'#007bff', borderRadius:5, padding:10, alignItems:'center' }
});
