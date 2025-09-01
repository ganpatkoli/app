import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "../../api/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";

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
      alert("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get("/packages");
      setPackages(res.data.data || res.data);
    } catch (err) {
      alert("Failed to fetch packages");
    }
  };

  const assignPackage = async (adminId) => {
    const packageId = selectedPackages[adminId];
    if (!packageId) return alert("Select a package first");
    setAssigning(true);
    try {
      await axios.post(`/packages/assign`, { userId: adminId, packageId });
      alert("Package assigned successfully");
      fetchAdmins();
    } catch (err) {
      alert("Failed to assign package");
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

    const initials = item.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <LinearGradient
        colors={["#fff", "#fff"]}
        style={[styles.card, { zIndex: 1000 - index }]}
      >
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
      </LinearGradient>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Packages</Text>
      </LinearGradient>

      {/* Filter */}
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
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginTop: 50 }}>
            No Admins Found
          </Text>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0e7ff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    padding: 4,
    backgroundColor: "#3730a3",
    borderRadius: 20,

  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  filterRow: {
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 35,
  },
  filterDropdown: {
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 8,
  },
  filterDropDownContainer: {
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,

  },

  card: {
    backgroundColor: "#fff",
    // marginTop: 35,
    paddingHorizontal: 8,

    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    flexDirection: "column",
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 35,
    height: 35,
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
  packagePrice: {
    fontWeight: "500",
    color: "#1e40af",
    fontSize: 11,
    marginLeft: 4,
  },

  assignBtn: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  assignBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
