import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import instance from "../../api/axiosInstance";

export default function AdminTripsList() {
  const [trips, setTrips] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;

  const fetchTrips = async (pg = 1) => {
    if (pg > totalPages) return;
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await instance.get(
        `/bookings/trips-booking-users?page=${pg}&limit=${limit}`
      );
      const data = res.data;

      if (pg === 1) {
        setTrips(data.trips);
      } else {
        setTrips((prev) => [...prev, ...data.trips]);
      }
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError("Failed to load trips");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTrips(1);
  }, []);

  const loadMoreTrips = () => {
    if (page < totalPages && !loadingMore && !loading) {
      fetchTrips(page + 1);
    }
  };

  if (loading && page === 1)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );

  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => fetchTrips(1)} style={styles.reloadBtn}>
          <Text style={styles.reloadText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  const renderUser = (user) => {
    const paymentStatusColor =
      user.paymentStatus === "Paid" ? "#16a34a" : "#dc2626";
    const qrStatusColor = user.qrCodeVerified ? "#2563eb" : "#f59e0b";

    return (
      <View key={user.userId.toString()} style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name || "Unknown User"}
          </Text>
          <Text style={styles.userPhone}>{user.phone || "-"}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.detailText}>Seat: {user.seatType || "-"}</Text>
          <Text style={[styles.detailText, { color: paymentStatusColor }]}>
            {user.paymentStatus || "Pending"}
          </Text>
          <Text style={[styles.detailText, { color: qrStatusColor }]}>
            {user.qrCodeVerified ? "QR Verified" : "QR Pending"}
          </Text>
          <Text style={styles.detailText}>Qty: {user.seatsBooked || 1}</Text>
        </View>
      </View>
    );
  };

  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripTitle} numberOfLines={1}>
          {item.title.en}
        </Text>
        <Text style={styles.tripSubTitle}>
          Seats Booked: {item.totalSeatsBooked} / {item.totalSeats}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{item.availableSeats}</Text>
          <Text style={styles.statLabel}>Available Seats</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{item.totalBookings}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Users Booked</Text>
      {item.users.length === 0 ? (
        <Text style={styles.emptyText}>No users booked this trip.</Text>
      ) : (
        item.users.map(renderUser)
      )}
    </View>
  );

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.tripId.toString()}
      renderItem={renderTripItem}
      contentContainerStyle={styles.listContentContainer}
      onEndReached={loadMoreTrips}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator size="small" color="#3b82f6" /> : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  error: { color: "#ef4444", fontSize: 16, marginBottom: 12, fontWeight: "600" },
  reloadBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 30,
    elevation: 6,
  },
  reloadText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  listContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 48,
  },

  tripCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  tripHeader: {
    marginBottom: 14,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e40af",
  },
  tripSubTitle: {
    fontSize: 16,
    color: "#475569",
    marginTop: 4,
    fontWeight: "600",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  statBox: {
    backgroundColor: "#eff6ff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2563eb",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 16,
    color: "#2563eb",
    borderBottomColor: "#93c5fd",
    borderBottomWidth: 2,
    paddingBottom: 6,
  },

  userCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  userPhone: {
    marginTop: 4,
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
  },

  userDetails: {
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingLeft: 14,
    minWidth: 110,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },

  emptyText: {
    fontStyle: "italic",
    color: "#6b7280",
    fontSize: 15,
    paddingVertical: 14,
    textAlign: "center",
  },
});
