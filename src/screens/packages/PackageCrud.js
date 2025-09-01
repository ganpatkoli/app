import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import axios from "../../api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function PackageCrudScreen({ navigation }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    durationDays: "",
    features: "",
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/packages");
      setPackages(res.data.data || res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch packages");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openForm = (pkg = null) => {
    setEditId(pkg?._id || "");
    setForm({
      name: pkg?.name || "",
      price: pkg?.price?.toString() || "",
      durationDays: pkg?.durationDays?.toString() || "",
      features: pkg?.features?.join(", ") || "",
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.durationDays) {
      Alert.alert("Validation", "Name, Price and Duration are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        features: form.features ? form.features.split(",").map((f) => f.trim()) : [],
      };
      if (editId) {
        await axios.put(`/packages/${editId}`, payload);
        Alert.alert("Success", "Package updated");
      } else {
        await axios.post("/packages", payload);
        Alert.alert("Success", "Package created");
      }
      setModalVisible(false);
      fetchPackages();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Action failed");
    }
    setLoading(false);
  };

  const handleDeactivate = async (id) => {
    Alert.alert("Confirm", "Deactivate this package?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await axios.delete(`/packages/${id}`);
            Alert.alert("Success", "Package deactivated");
            fetchPackages();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Failed to deactivate");
          }
          setLoading(false);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <LinearGradient
      colors={["#f0f4ff", "#ffffff"]}
      style={styles.card}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>₹{item.price} / {item.durationDays} days</Text>
        <Text style={styles.features}>
          Features: {item.features?.length ? item.features.join(", ") : "N/A"}
        </Text>
      </View>
      <View style={styles.actionCol}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openForm(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeactivate(item._id)}>
          <Text style={styles.actionText}>Deactivate</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Packages</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openForm(null)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 30 }} />}

      {!loading && (
        <FlatList
          data={packages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 50 }}>
              No Packages found
            </Text>
          }
        />
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? "Edit" : "Add"} Package</Text>
            <TextInput
              placeholder="Name"
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
              style={styles.input}
            />
            <TextInput
              placeholder="Price"
              value={form.price}
              keyboardType="number-pad"
              onChangeText={(val) => setForm({ ...form, price: val })}
              style={styles.input}
            />
            <TextInput
              placeholder="Duration Days"
              value={form.durationDays}
              keyboardType="number-pad"
              onChangeText={(val) => setForm({ ...form, durationDays: val })}
              style={styles.input}
            />
            <TextInput
              placeholder="Features (comma separated)"
              value={form.features}
              onChangeText={(val) => setForm({ ...form, features: val })}
              style={styles.input}
              multiline
            />
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#64748b" }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#2563eb" }]} onPress={handleSubmit}>
                <Text style={styles.modalBtnText}> {editId ? "Update" : "Create"} </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0e7ff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    padding: 6,
    backgroundColor: "#3730a3",
    borderRadius: 20,
  },
  addBtn: {
    padding: 6,
    backgroundColor: "#3730a3",
    borderRadius: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  features: { color: "#4b5563", fontSize: 13 },

  actionCol: { flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", marginLeft: 12 },
  editBtn: { backgroundColor: "#fbbf24", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginBottom: 6 },
  deleteBtn: { backgroundColor: "#e11d48", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  modalWrap: { flex: 1, justifyContent: "center", backgroundColor: "#0003", padding: 16 },
  modalContent: { backgroundColor: "#fff", borderRadius: 14, padding: 20, elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#f8fafc",
  },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
