import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "../../api/axiosInstance";

// Function to get initials
const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export default function PendingAgentsScreen({ navigation }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPending = () => {
    setLoading(true);
    axios
      .get("/auth/pending-agents")
      .then((res) => setAgents(res.data))
      .catch((err) =>
        Alert.alert("Error", err.response?.data?.message || err.message)
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Animated Button
  const AnimatedButton = ({ onPress, style, children, disabled }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    };

    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={disabled}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const confirmAction = (id, action, name) => {
    Alert.alert(
      "Confirmation Required",
      `Do you really want to ${action === "approve" ? "Approve" : "Reject"} the agent "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => handleAction(id, action) },
      ],
      { cancelable: true }
    );
  };

  const handleAction = async (id, action) => {
    setActionLoadingId(id);
    try {
      await axios.put(`/auth/approve-agent/${id}`, { action });
      Alert.alert("Success", `Agent ${action}d successfully.`);
      fetchPending();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    }
    setActionLoadingId(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const renderAgent = ({ item }) => {
    const initials = getInitials(item.name);
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>{item.email}</Text>
          <Text style={styles.detail}>{item.region || "N/A"}</Text>
        </View>
        <View style={styles.actions}>
          <AnimatedButton
            style={[styles.actionBtn, { backgroundColor: "#22c55e" }]}
            onPress={() => confirmAction(item._id, "approve", item.name)}
            disabled={actionLoadingId === item._id}
          >
            {actionLoadingId === item._id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark" size={18} color="#fff" />
            )}
          </AnimatedButton>

          <AnimatedButton
            style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
            onPress={() => confirmAction(item._id, "reject", item.name)}
            disabled={actionLoadingId === item._id}
          >
            {actionLoadingId === item._id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="close" size={18} color="#fff" />
            )}
          </AnimatedButton>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Agents</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search agents..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Agent List */}
      <FlatList
        data={agents.filter(
          (a) =>
            a.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.email?.toLowerCase().includes(search.toLowerCase()) ||
            a.region?.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item._id}
        renderItem={renderAgent}
        contentContainerStyle={agents.length === 0 && styles.centered}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending agents right now.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#2563eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
        borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#1e40af",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    marginLeft: 6,
    fontSize: 14,
    color: "#111",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "700", color: "#111" },
  detail: { fontSize: 13, color: "#64748b" },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#64748b",
    fontSize: 16,
  },
});
