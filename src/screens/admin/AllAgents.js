import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "../../api/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminPackageAssignScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/agents");
      setAdmins(res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch agents");
    }
    setLoading(false);
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesText =
      admin.name.toLowerCase().includes(searchText.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === ""
        ? true
        : statusFilter === "active"
        ? !admin.blocked
        : admin.blocked;
    return matchesText && matchesStatus;
  });

  const toggleBlockAdmin = (admin) => {
    const action = admin.blocked ? "Unblock" : "Block";
    Alert.alert(
      `${action} Agent`,
      `Are you sure you want to ${action.toLowerCase()} ${admin.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: admin.blocked ? "default" : "destructive",
          onPress: () => handleBlockUnblock(admin._id, !admin.blocked),
        },
      ]
    );
  };

  const handleBlockUnblock = async (adminId, block) => {
    setBlockingId(adminId);
    try {
      await axios.patch(`/admin/agents/${adminId}/block`, { block });
      Alert.alert(
        "Success",
        `Agent ${block ? "blocked" : "unblocked"} successfully`
      );
      fetchAdmins();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update agent"
      );
    }
    setBlockingId(null);
  };

  const confirmDeleteAdmin = (admin) => {
    Alert.alert(
      "Delete Agent",
      `Are you sure you want to delete ${admin.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteAdmin(admin._id),
        },
      ]
    );
  };

  const handleDeleteAdmin = async (adminId) => {
    setDeletingId(adminId);
    try {
      await axios.delete(`/admin/delete/${adminId}`);
      Alert.alert("Success", "Agent deleted successfully");
      fetchAdmins();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to delete agent"
      );
    }
    setDeletingId(null);
  };

  const renderItem = ({ item }) => {
    const initials = item.name
      .split(" ")
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join("");

    return (
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
          <View
            style={[
              styles.statusChip,
              item.blocked ? styles.statusBlocked : styles.statusActive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.blocked ? "#ef4444" : "#22c55e" },
              ]}
            >
              {item.blocked ? "Blocked" : "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              item.blocked ? styles.unblockBtn : styles.blockBtn,
              (blockingId === item._id || deletingId === item._id) &&
                styles.disabledBtn,
            ]}
            disabled={blockingId === item._id || deletingId === item._id}
            onPress={() => toggleBlockAdmin(item)}
          >
            {blockingId === item._id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {item.blocked ? "Unblock" : "Block"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.deleteBtn,
              (blockingId === item._id || deletingId === item._id) &&
                styles.disabledBtn,
            ]}
            disabled={blockingId === item._id || deletingId === item._id}
            onPress={() => confirmDeleteAdmin(item)}
          >
            {deletingId === item._id ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text style={[styles.btnText, { color: "#ef4444" }]}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Agents</Text>
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="filter" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={filteredAdmins}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredAdmins.length === 0 && styles.emptyContainer
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No agents found.</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Agents</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                style={styles.input}
                placeholder="Search by Name or Email"
                value={searchText}
                onChangeText={setSearchText}
              />
              <View style={styles.statusRow}>
                {["", "active", "blocked"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusFilterBtn,
                      statusFilter === status && styles.statusSelected,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text>
                      {status === ""
                        ? "All"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[
                    styles.modalBtn,
                    { backgroundColor: "#e5e7eb", marginRight: 10 },
                  ]}
                  onPress={() => {
                    setSearchText("");
                    setStatusFilter("");
                    setFilterVisible(false);
                  }}
                >
                  <Text style={{ color: "#111", fontWeight: "600" }}>
                    Clear Filters
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "#e5e7eb" }]}
                  onPress={() => setFilterVisible(false)}
                >
                  <Text>Close</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f1f5f9" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#1e40af",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  name: { fontWeight: "600", fontSize: 15, color: "#1f2937" },
  email: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusActive: { borderColor: "#22c55e", backgroundColor: "#ecfdf5" },
  statusBlocked: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  statusText: { fontWeight: "600", fontSize: 12 },

  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 80,
    alignItems: "center",
  },
  blockBtn: { backgroundColor: "#ef4444" },
  unblockBtn: { backgroundColor: "#22c55e" },
  deleteBtn: {
    borderColor: "#ef4444",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  btnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  disabledBtn: { opacity: 0.6 },

  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 15, color: "#6b7280" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 6,
  },
  statusFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  statusSelected: { backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
});
