import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";
import axios from "../../api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const STATUS_OPTIONS = ["all", "active", "ongoing", "upcoming", "completed", "cancelled"];
const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Last 1 day", value: "1day" },
  { label: "Last 3 days", value: "3days" },
  { label: "Last 1 week", value: "1week" },
  { label: "Last 1 month", value: "1month" },
];

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter Modal state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState(statusFilter);
  const [filterSortBy, setFilterSortBy] = useState("latest");

  const limit = 5;

  const fetchBookings = async (pageNum = 1, status = "all", sortBy = "latest", append = false) => {
    if (pageNum > totalPages) return;
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      let url = `/bookings/my?page=${pageNum}&limit=${limit}`;
      if (status !== "all") url += `&status=${status}`;
      if (sortBy && sortBy !== "latest") url += `&dateSort=${sortBy}`;
      const res = await axios.get(url);

      if (append) setBookings(prev => [...prev, ...res.data.bookings]);
      else setBookings(res.data.bookings);

      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = () => {
    setStatusFilter(filterStatus);
    setPage(1);
    setBookings([]);
    setFilterModalVisible(false);
  };

  useEffect(() => {
    fetchBookings(1, statusFilter, filterSortBy, false);
  }, [statusFilter, filterSortBy]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchBookings(page + 1, statusFilter, filterSortBy, true);
    }
  };

  const renderStatus = (status) => {
    let bg = "#d1d5db"; let color = "#333";
    if (status === "active") { bg = "#dcfce7"; color = "#15803d"; }
    else if (status === "pending") { bg = "#fef9c3"; color = "#ca8a04"; }
    else if (status === "cancelled") { bg = "#fee2e2"; color = "#dc2626"; }
    else if (status === "ongoing") { bg = "#dbeafe"; color = "#2563eb"; }
    else if (status === "completed") { bg = "#d1fae5"; color = "#059669"; }
    else if (status === "upcoming") { bg = "#fef3c7"; color = "#d97706"; }
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={{ color, fontWeight: "700" }}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  const renderPaymentStatus = (paymentStatus) => {
    let bg = "#e5e7eb"; let color = "#333";
    if (paymentStatus === "completed") { bg = "#dcfce7"; color = "#15803d"; }
    else if (paymentStatus === "pending") { bg = "#fef9c3"; color = "#ca8a04"; }
    else if (paymentStatus === "failed" || paymentStatus === "cancelled") { bg = "#fee2e2"; color = "#dc2626"; }
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={{ color, fontWeight: "700" }}>{paymentStatus.toUpperCase()}</Text>
      </View>
    );
  };

  const openQrModal = (qrCodeId) => {
    if (!qrCodeId) return;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrCodeId)}`;
    setSelectedQr(qrCodeUrl);
    setQrModalVisible(true);
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.trip}>{item?.tripId.title?.en || "Trip"}</Text>
          {renderStatus(item.status)}
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={18} color="#555" />
          <Text style={styles.value}> {item.seatsBooked} Seats</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={18} color="#2563eb" />
          <Text style={[styles.value, { color: "#2563eb", fontWeight: "bold" }]}>₹{item.pricePaid}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={18} color="#555" />
          {renderPaymentStatus(item.paymentStatus)}
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#555" />
          <Text style={styles.value}>{item.createdAt?.slice(0, 10)}</Text>
        </View>
        <View style={styles.actionRow}>
          {item.qrCodeData && (
            <TouchableOpacity style={[styles.chipBtn, { backgroundColor: "#EDE9FE" }]} onPress={() => openQrModal(item.qrCodeData)}>
              <Ionicons name="qr-code-outline" size={18} color="#6D28D9" />
              <Text style={[styles.chipText, { color: "#6D28D9" }]}>QR</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.chipBtn, { backgroundColor: "#DBEAFE" }]} onPress={() => navigation.navigate("ViewBookingInfo", { booking: item })}>
            <Ionicons name="eye-outline" size={18} color="#2563eb" />
            <Text style={[styles.chipText, { color: "#2563eb" }]}>View</Text>
          </TouchableOpacity>
          {item.status === "active" && (
            <TouchableOpacity style={[styles.chipBtn, { backgroundColor: "#FEE2E2" }]} onPress={async () => {
              try {
                await axios.put(`/bookings/${item._id}/cancel`);
                alert("Booking cancelled!");
                setBookings(prev => prev.map(b => b._id === item._id ? { ...b, status: "cancelled" } : b));
              } catch (err) { alert("Failed to cancel booking"); }
            }}>
              <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
              <Text style={[styles.chipText, { color: "#DC2626" }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading && page === 1)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f4ff" }}>
      <LinearGradient colors={["#6200EE", "#9333ea"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={{ paddingHorizontal: 16 }}>
          <Ionicons name="filter" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBooking}
        contentContainerStyle={bookings.length === 0 ? { flexGrow: 1, justifyContent: "center", alignItems: "center" } : { padding: 16 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.emptyText}>No bookings found.</Text>
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} /> : null}
      />

      <Modal isVisible={qrModalVisible} onBackdropPress={() => setQrModalVisible(false)} onBackButtonPress={() => setQrModalVisible(false)} style={styles.bottomModal}>
        <View style={styles.modalContent}>
          {selectedQr ? (
            <>
              <Image source={{ uri: selectedQr }} style={styles.qrLarge} resizeMode="contain" />
              <TouchableOpacity onPress={() => setQrModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : <Text>No QR code available.</Text>}
        </View>
      </Modal>

      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Booking Type</Text>
            <View style={styles.optionsContainer}>
              {STATUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionItem, filterStatus === opt && styles.optionItemActive]}
                  onPress={() => setFilterStatus(opt)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, filterStatus === opt && { borderColor: "#6200EE" }]}>
                    {filterStatus === opt && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.radioLabel, filterStatus === opt && { color: "#6200EE", fontWeight: "700" }]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalTitle}>Sort by Date </Text>

            <View style={styles.optionsContainer}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionItem, filterSortBy === opt.value && styles.optionItemActive]}
                  onPress={() => setFilterSortBy(opt.value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, filterSortBy === opt.value && { borderColor: "#6200EE" }]}>
                    {filterSortBy === opt.value && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.radioLabel, filterSortBy === opt.value && { color: "#6200EE", fontWeight: "700" }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters} activeOpacity={0.85}>
              <Text style={styles.applyText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    paddingTop: 60,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginRight: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
    flexWrap: "wrap",
  },
  chipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  trip: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginRight: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  value: {
    fontWeight: "500",
    color: "#111827",
    marginLeft: 6,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: "#f0f4ff",
  },
  filterBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#e5e7eb",
    marginRight: 10,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtnActive: {
    backgroundColor: "#6200EE",
    shadowRadius: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  filterTextActive: {
    color: "#fff",
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  qrLarge: {
    width: 280,
    height: 280,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#6200EE",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    paddingBottom: 32,
    minHeight: 420,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#151515",
    marginVertical: 15,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#BBB",
    backgroundColor: "#fff",
    marginRight: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6200EE",
  },
  radioLabel: {
    fontSize: 15,
    color: "#555",
  },
  applyBtn: {
    marginTop: 32,
    backgroundColor: "#6200EE",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionItem: {
    width: "50%",            // roughly two per row with space between
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
});
