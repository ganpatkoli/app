import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import axios from "../../api/axiosInstance";

export default function PurchasePackageScreen({ route, navigation }) {
  const { packageId } = route.params || {};
  const [loading, setLoading] = useState(false);

  if (!packageId) return <Text>No package selected.</Text>;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Normally: Payment checkout first, then assign package
      await axios.post("/packages/assign", { packageId });
      Alert.alert("Package Purchased!", "Your package is now active.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Purchase Failed", e.response?.data?.message || e.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Purchase?</Text>
      <Button
        title={loading ? "Processing..." : "Purchase Package"}
        disabled={loading}
        onPress={handlePurchase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
});
