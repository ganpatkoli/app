import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";                                 
import { AuthContext } from "../../contexts/AuthContext";
import instance from "../../api/axiosInstance";

export default function ProfileScreen({ navigation }) {
  const { getId, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instance.get(`/auth/me/${getId}`);
        setUser(res.data);
      } catch (e) {
        console.log("Error:", e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };

    if (getId) fetchProfile();
  }, [getId]);



    const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Failed to load profile
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 , paddingTop: 60  }}>
        {/* Gradient Header */}
        <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.headerName}>{user.name}</Text>
          <Text style={styles.headerEmail}>{user.email}</Text>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.card}>
          <InfoRow icon="call-outline" label={user.phone || "Not Provided"} />
          <InfoRow icon="location-outline" label={user.region || "Not Provided"} />
          <InfoRow
            icon="shield-checkmark-outline"
            label={`Verified: ${user.verified ? "Yes" : "No"}`}
          />
         {/* // <InfoRow icon="briefcase-outline" label={`Role: ${user.role}`} /> */}
          <InfoRow icon="key-outline" label={`KYC: ${user.kyc?.status}`} />
        </View>

        {/* Packages */}
        <Text style={styles.sectionTitle}>My Packages</Text>
        {user.packageHistory?.map((pkg) => (
          <View key={pkg._id} style={styles.packageCard}>
            <LinearGradient
              colors={["#f0f4ff", "#ffffff"]}
              style={styles.pkgGradient}
            >
              <View style={styles.pkgHeader}>
                <Text style={styles.pkgName}>{pkg.name}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: pkg.packagestatus === "active" ? "#22c55e" : "#ef4444" },
                  ]}
                >
                  <Text style={styles.badgeText}>{pkg.packagestatus}</Text>
                </View>
              </View>
              <Text style={styles.pkgPrice}>₹{pkg.price}</Text>
              <Text style={styles.pkgStatus}>
                Valid till: {new Date(pkg.validTill).toLocaleDateString()}
              </Text>
              <Text style={styles.subHeading}>Features:</Text>
              {pkg.features.map((f, i) => (
                <Text key={i} style={styles.feature}>
                  • {f}
                </Text>
              ))}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color="#4f46e5" />
      <Text style={styles.detail}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0e7ff" },

  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 66,
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  topBtn: {
    backgroundColor: "#4f46e5",
    padding: 8,
    borderRadius: 20,
  },

  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#2563eb" },
  headerName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerEmail: { fontSize: 14, color: "#e0e7ff" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  detail: { marginLeft: 10, fontSize: 15, color: "#1e293b" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 16,
    marginBottom: 10,
  },

  packageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  pkgGradient: {
    padding: 16,
    borderRadius: 18,
  },
  pkgHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pkgName: { fontSize: 17, fontWeight: "700", color: "#2563eb" },
  pkgPrice: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  pkgStatus: { fontSize: 14, color: "#6b7280", marginBottom: 6 },
  subHeading: { fontWeight: "600", marginTop: 6, marginBottom: 4, color: "#374151" },
  feature: { fontSize: 14, color: "#4b5563" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, color: "#fff", fontWeight: "600" },
});
