import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL_IMAGE } from "../../api/axiosInstance";

const { width } = Dimensions.get("window");

export default function TripDetails({ route, navigation }) {
  const { tripData } = route.params;

  const formattedImages = (tripData.images || []).map((img) =>
    img.startsWith("http")
      ? img
      : `${BASE_URL_IMAGE}/${img.replace(/\\/g, "/")}`
  );

  const priceSingle = tripData.price?.single || 0;
  const priceCouple = tripData.price?.couple || 0;
  const priceGroup = tripData.price?.group || 0;

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      {formattedImages.length > 0 && (
        <Image source={{ uri: formattedImages[0] }} style={styles.heroImage} />
      )}

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 30 }} 
      >
        {/* Title */}
        <Text style={styles.title}>
          {(tripData.title && (tripData.title.en || tripData.title)) || ""}
        </Text>
        <Text style={styles.route}>
          {tripData.route?.from} → {tripData.route?.to}
        </Text>

        {/* Price Card */}
        <LinearGradient
          colors={["#4f46e5", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceCard}
        >
          <Ionicons name="pricetag" size={22} color="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.priceTitle}>Price Per Person</Text>

            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Single</Text>
                <Text style={styles.priceValue}>₹{priceSingle}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Couple</Text>
                <Text style={styles.priceValue}>₹{priceCouple}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Group</Text>
                <Text style={styles.priceValue}>₹{priceGroup}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Date & Seats */}
<View style={styles.infoRow}>
  {/* Date */}
  <View style={styles.infoCard}>
    <Ionicons name="calendar" size={20} color="#2563eb" />
    <View style={{ marginLeft: 8 }}>
      <Text style={styles.infoLabel}>Travel Dates</Text>
      <Text style={styles.infoValue}>
        {new Date(tripData.startDate).toLocaleDateString()} -{" "}
        {new Date(tripData.endDate).toLocaleDateString()}
      </Text>
    </View>
  </View>

  {/* Seats */}
  <View style={styles.infoCard}>
    <Ionicons name="people" size={20} color="#16a34a" />
    <View style={{ marginLeft: 8 }}>
      <Text style={styles.infoLabel}>Available Seats</Text>
      <Text style={styles.infoValue}>
        {tripData.availableSeats} / {tripData.totalSeats}
      </Text>
    </View>
  </View>
</View>


        {/* Inclusions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>✨ Inclusions</Text>
          {(tripData.inclusions || []).map((inc, i) => (
            <Text key={i} style={styles.listItem}>
              • {inc}
            </Text>
          ))}
        </View>

        {/* Stops */}
        {tripData.route?.stops?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🛑 Stops</Text>
            {tripData.route.stops.map((stop, i) => (
              <Text key={i} style={styles.listItem}>
                • {stop}
              </Text>
            ))}
          </View>
        )}

        {/* Pickup Points */}
        {tripData.pickupPoints?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📍 Pickup Points</Text>
            {tripData.pickupPoints.map((point, i) => (
              <Text key={i} style={styles.listItem}>
                • {point}
              </Text>
            ))}
          </View>
        )}

        {/* Drop Points */}
        {tripData.dropPoints?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📍 Drop Points</Text>
            {tripData.dropPoints.map((point, i) => (
              <Text key={i} style={styles.listItem}>
                • {point}
              </Text>
            ))}
          </View>
        )}

        {/* Guide */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👨‍💼 Guide Available</Text>
          <Text style={styles.listItem}>
            {tripData.guideAvailable ? "Yes" : "No"}
          </Text>
        </View>

        {/* Cancellation Policy */}
        {tripData.cancellationPolicy && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>❌ Cancellation Policy</Text>
            <Text style={styles.listItem}>{tripData.cancellationPolicy}</Text>
          </View>
        )}

        {/* Gallery */}
        {formattedImages.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📸 Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {formattedImages.slice(1).map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>

      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContainer: { padding: 16, paddingBottom: 0 },

  heroImage: {
    width,
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    padding: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 12,
  },
  route: { fontSize: 16, color: "#64748b", marginBottom: 16 },

  // Price Card
  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  priceTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  priceBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 90,
    alignItems: "center",
  },
  priceLabel: {
    color: "#e0e7ff",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  priceValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // Info
infoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 15,
},
infoCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f9fafb",
  padding: 12,
  borderRadius: 12,
  flex: 1,
  marginRight: 10,
  elevation: 2,
},
infoLabel: {
  fontSize: 13,
  color: "#6b7280",
},
infoValue: {
  fontSize: 15,
  fontWeight: "600",
  color: "#111827",
},

  // Card
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 8,
  },
  listItem: { fontSize: 14, color: "#475569", marginBottom: 4 },

  image: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginBottom: 8,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  galleryImage: {
  width: 140,
  height: 100,
  borderRadius: 12,
  marginRight: 12,
},

});
