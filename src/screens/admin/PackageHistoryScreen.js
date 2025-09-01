import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import axios from "../../api/axiosInstance";

export default function PackageHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = ""; // AuthContext se ya token decode kar ke lagaye

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/packages/${userId}/history`)
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [userId]);

  const renderEntry = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.packageName}</Text>
      <Text>
        Price: ₹{item.price} | Valid till: {item.validTill?.slice(0, 10)}
      </Text>
      <Text>Status: {item.status}</Text>
      <TouchableOpacity
        style={styles.invoiceBtn}
        onPress={() =>
          Linking.openURL(
            `http://localhost:5000/api/packages/${userId}/invoice/${item._id}`
          )
        }
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Invoice PDF</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={renderEntry}
        contentContainerStyle={{ padding: 14 }}
        ListEmptyComponent={<Text>No packages found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 14,
    marginBottom: 13,
  },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 3 },
  invoiceBtn: {
    marginTop: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    padding: 8,
    alignItems: "center",
  },
});
