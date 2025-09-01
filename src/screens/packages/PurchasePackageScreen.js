import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import axios from "../../api/axiosInstance";

export default function PurchasePackageScreen({ route, navigation }) {
  const { packageId } = route.params || {};
  const [loading, setLoading] = useState(false);

  if (!packageId) {
    return (
      <View style={styles.container}>
        <Text>No package selected for purchase.</Text>
      </View>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Backend route jo package assign karta hai user ko
      await axios.post("/packages/assign", { packageId });
      Alert.alert("Success", "Package purchased successfully!");
      navigation.goBack(); // Ya navigation.navigate('Plans') bhi kar sakte hain
    } catch (error) {
      Alert.alert(
        "Purchase Failed",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Package Purchase</Text>
      <Button
        title={loading ? "Purchasing..." : "Purchase Package"}
        onPress={handlePurchase}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 18,
    textAlign: "center",
  },
});
