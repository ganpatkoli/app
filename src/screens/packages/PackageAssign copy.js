import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "../../api/axiosInstance";

export default function AdminPackageAssignScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [packages, setPackages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedPackages, setSelectedPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterItems, setFilterItems] = useState([
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]);

  useEffect(() => {
    fetchAdmins();
    fetchPackages();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("/admin/agents");
      setAdmins(res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get("/packages");
      setPackages(res.data.data || res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch packages");
    }
  };

  const assignPackage = async (adminId) => {
    const packageId = selectedPackages[adminId];
    if (!packageId) {
      Alert.alert("Validation", "Please select a package.");
      return;
    }
    const selectedPkg = packages.find((p) => p._id === packageId);
    if (!selectedPkg) {
      Alert.alert("Error", "Selected package not found.");
      return;
    }

    setAssigning(true);
    try {
      await axios.post(`/packages/assign`, { userId: adminId, packageId });
      Alert.alert("Success", `Package assigned to ${selectedPkg.name}`);
      fetchAdmins();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to assign");
    }
    setAssigning(false);
  };

  const filteredAdmins = admins.filter((a) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active") return a.isActive;
    if (selectedFilter === "inactive") return !a.isActive;
    return true;
  });

  const renderAdmin = ({ item, index }) => {
    const selectedPkgId = selectedPackages[item._id];
    const selectedPkg =
      packages && selectedPkgId
        ? packages.find((p) => p._id === selectedPkgId)
        : null;

    const getInitials = (name) => {
      const words = name?.trim().split(" ") || [];
      return words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : words[0]?.[0]?.toUpperCase() || "";
    };

    const initials = getInitials(item.name);

    return (
      <View style={[styles.card, { zIndex: 1000 - index }]}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>

        <DropDownPicker
          open={dropdownOpen[item._id] || false}
          value={selectedPackages[item._id] || null}
          items={packages.map((pkg) => ({
            label: `${pkg.name} • ₹${pkg.price} • ${pkg.durationDays}D`,
            value: pkg._id,
          }))}
          setOpen={(open) =>
            setDropdownOpen({ ...dropdownOpen, [item._id]: open })
          }
          setValue={(val) =>
            setSelectedPackages({ ...selectedPackages, [item._id]: val() })
          }
          style={styles.dropdown}
          containerStyle={[styles.dropdownContainer, { zIndex: 1000 - index }]}
          dropDownContainerStyle={[
            styles.dropDownContainer,
            { zIndex: 2000 - index },
          ]}
          placeholder="Select Package"
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
        />

        {selectedPkg && (
          <View style={styles.packageInfo}>
            <Text style={styles.packageName}>{selectedPkg.name}</Text>
            <Text style={styles.packagePrice}>₹{selectedPkg.price}</Text>
          </View>
        )}

        <TouchableOpacity
          disabled={assigning}
          onPress={() => assignPackage(item._id)}
          activeOpacity={0.8}
          style={styles.assignBtn}
        >
          {assigning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.assignBtnText}>Assign Package</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Assign</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <DropDownPicker
          open={filterOpen}
          value={selectedFilter}
          items={filterItems}
          setOpen={setFilterOpen}
          setValue={setSelectedFilter}
          setItems={setFilterItems}
          style={styles.filterDropdown}
          containerStyle={{ flex: 1, zIndex: 3000 }}
          dropDownContainerStyle={styles.filterDropDownContainer}
        />
      </View>

      <FlatList
        data={filteredAdmins}
        keyExtractor={(item) => item._id}
        renderItem={renderAdmin}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Admins Found</Text>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },

  filterRow: {
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 50,
  },
  filterDropdown: {
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  filterDropDownContainer: {
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  container: { paddingHorizontal: 10, paddingBottom: 0 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  userEmail: { fontSize: 12, color: "#6b7280", marginTop: 1 },

  dropdownContainer: { marginBottom: 6 },
  dropdown: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderColor: "#e5e7eb",
    fontSize: 13,
    paddingVertical: 6,
    minHeight: 36,
  },
  dropDownContainer: {
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  packageInfo: {
    backgroundColor: "#eef2ff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  packageName: { fontWeight: "600", color: "#1e3a8a", fontSize: 12 },
  packagePrice: { fontWeight: "500", color: "#1e40af", fontSize: 11, marginLeft: 4 },

  assignBtn: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  assignBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 30,
    textAlign: "center",
  },
});
