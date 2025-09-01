import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "../../api/axiosInstance";
import { useNavigation } from "@react-navigation/native";

export default function PlanListScreen() {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/packages")
      .then((res) => setPlans(res.data.data || res.data)) // handle API response shape
      .catch((error) => {
        console.error("Failed to fetch plans:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderPlan = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>
        ₹{item.price} / {item.durationDays} days
      </Text>
      <Text style={styles.featuresLabel}>Features:</Text>
      <Text style={styles.featuresText}>
        {item.features?.length ? item.features.join(", ") : "N/A"}
      </Text>

      <TouchableOpacity
        style={styles.buyBtn}
        onPress={() =>
          navigation.navigate("PurchasePackage", { packageId: item._id })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.buyBtnText}>Purchase</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!plans.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noDataText}>No packages available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item._id}
        renderItem={renderPlan}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1eaff",
    // paddingHorizontal: 16,
    // paddingTop: 60,
    marginTop: 60, // No margin top to avoid extra gap
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0, // No top padding here
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
    marginTop: 0, // No margin top to avoid extra gap
    // Shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    // Elevation for Android
    elevation: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 10,
  },
  featuresLabel: {
    fontWeight: "700",
    fontSize: 14,
    color: "#334155",
  },
  featuresText: {
    marginTop: 2,
    fontSize: 14,
    color: "#475569",
    marginBottom: 14,
  },
  buyBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    // subtle shadow for button
    ...Platform.select({
      ios: {
        shadowColor: "#2563eb",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buyBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f5ff",
  },
  noDataText: {
    fontSize: 18,
    color: "#64748b",
  },
});
