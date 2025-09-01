import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import instance, { BASE_URL_IMAGE } from "../../api/axiosInstance";
import { AuthContext , trip } from "../../contexts/AuthContext";
import { TripsContext } from "../../contexts/TripsContext";

export default function AgentTripsScreen({ navigation }) {




  const { getId } = useContext(AuthContext);
  // const { tripsData } = useContext(TripsContext);


  // console.log("dfdf" ,tripsData);
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter State ---
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("all"); // all | draft | published
  const [filterItems, setFilterItems] = useState([
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await instance.get(`/trips/agent/${getId}`);

      // console.log("Fetched tripsData:", res.data.trips);

      setTrips(res.data.trips);
    } catch (err) {

      console.log("err0 , ", err);

      alert(err.response?.data?.message || "Failed to fetch agent trips");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await instance.delete(`/trips/${id}`);
      setTrips(trips.filter((t) => t._id !== id));
      alert("Trip deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete trip");
    }
  };

  const renderItem = ({ item }) => {
    if (filterValue !== "all" && item.status !== filterValue) return null;

    const firstImage =
      item.images && item.images.length > 0
        ? `${BASE_URL_IMAGE}/${item.images[0].replace(/\\/g, "/")}`
        : null;

    return (
      <View style={styles.tripCard}>
        {firstImage && (
          <Image
            source={{ uri: firstImage }}
            style={styles.tripImage}
            resizeMode="cover"
          />
        )}

          <View
        style={[
          styles.statusBadge,
          { backgroundColor: item.status === "published" ? "#10B981" : "#FBBF24" },
        ]}
      >
        <Text style={styles.statusText}>
          {item.status === "published" ? "Published" : "Draft"}
        </Text>
      </View>


        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title.en || item.title}</Text>
            <Text style={styles.price}>₹{item.pricePerPerson}/person</Text>
          </View>

          <Text style={styles.route}>
            {item.route.from} → {item.route.to}
          </Text>
          <Text style={styles.date}>
            {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4f46e5" }]}
              onPress={() =>
                navigation.navigate("TripDetails", { tripData: item })
              }
            >
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10B981" }]}
              onPress={() =>
                navigation.navigate("TripEdit", { tripData: item })
              }
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

<TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10B981" }]}
              onPress={() =>
                navigation.navigate("BookingDetails", { tripData: item })
              }
            >
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#e0e7ff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Trips</Text>
      </View>

      {/* Filter */}
      <View style={{ paddingHorizontal: 16, marginTop: 12, zIndex: 5000 }}>
        <DropDownPicker
          open={filterOpen}
          value={filterValue}
          items={filterItems}
          setOpen={setFilterOpen}
          setValue={setFilterValue}
          setItems={setFilterItems}
          containerStyle={{ marginBottom: 10 }}
          style={styles.filterDropdown}
          dropDownContainerStyle={styles.filterDropDownContainer}
        />
      </View>

      {/* Trip List */}
      {trips.filter(t => filterValue === "all" || t.status === filterValue).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No trips found.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tripImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#e2e8f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6200EE",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    paddingTop: 60,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginRight: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    marginTop: 50,
  },
  emptyText: { fontSize: 16, color: "#718096" },
  listContainer: { padding: 16, paddingBottom: 30 },
  tripCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: { marginTop: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1a202c" },
  route: { fontSize: 14, color: "#4a5568", marginBottom: 4 },
  price: { fontSize: 14, color: "#6B46C1", fontWeight: "600" },
  date: { fontSize: 12, color: "#718096", marginBottom: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  filterDropdown: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  filterDropDownContainer: {
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  statusBadge: {
  position: "absolute",
  top: 12,
  right: 12,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 12,
  zIndex: 10,
},
statusText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 12,
},

});
