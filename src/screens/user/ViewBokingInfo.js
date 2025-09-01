import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import QRCode from "react-native-qrcode-svg"; // 👈 QR package

export default function BookingDetails({ route, navigation }) {
  const { booking } = route.params;
  const trip = booking.tripId;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header (same style as MyBookingsScreen) */}
      <LinearGradient
        colors={["#6200EE", "#9333ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#fff"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Booking Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Trip Title */}
        <View style={styles.tripHeader}>
          <Ionicons name="bus" size={22} color="#6200ee" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.title}>{trip?.title?.en || "Trip"}</Text>
            <Text style={styles.route}>
              {trip?.route?.from} → {trip?.route?.to}
            </Text>
          </View>
        </View>

        {/* Booking Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📄 Booking Info</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{booking._id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.value,
                { color: booking.status === "Confirmed" ? "green" : "red" },
              ]}
            >
              {booking.status}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Seats Booked</Text>
            <Text style={styles.value}>{booking.seatsBooked}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={styles.value}>₹{booking.pricePaid}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>{booking.paymentStatus}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Booking Date</Text>
            <Text style={styles.value}>
              {moment(booking.bookingDate).format("DD MMM YYYY, hh:mm A")}
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode value={booking._id} size={140} />
            <Text style={styles.qrText}>Scan to Verify Booking</Text>
          </View>
        </View>

        {/* Trip Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🚌 Trip Info</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Start</Text>
            <Text style={styles.value}>
              {moment(trip.startDate).format("DD MMM YYYY, hh:mm A")}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>End</Text>
            <Text style={styles.value}>
              {moment(trip.endDate).format("DD MMM YYYY, hh:mm A")}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Price/Person</Text>
            <Text style={styles.value}>₹{trip.pricePerPerson}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Inclusions</Text>
            <Text style={styles.value}>
              {trip.inclusions?.join(", ") || "N/A"}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    marginRight: 28, // taaki title center me rahe
  },
  container: {
    padding: 16,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
    color: "#111827",
  },
  route: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  value: {
    fontSize: 14,
    color: "#374151",
  },
  qrContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  qrText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
});
