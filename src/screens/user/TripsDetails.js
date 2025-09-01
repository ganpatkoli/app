import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL_IMAGE } from "../../api/axiosInstance";

const { width } = Dimensions.get("window");

export default function TripDetails({ route, navigation }) {
  const { tripData } = route.params;

  // Images URL sanitize
  const formattedImages = (tripData.images || []).map((img) =>
    img.startsWith("http") ? img : `${BASE_URL_IMAGE}/${img.replace(/\\/g, "/")}`
  );

  const priceSingle = tripData.price?.single ?? tripData.pricePerPerson ?? 0;
  const priceCouple = tripData.price?.couple ?? null;
  const priceGroup = tripData.price?.group ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Hero Image with Gradient */}
      {formattedImages.length > 0 && (
        <View>
          <Image source={{ uri: formattedImages[0] }} style={styles.heroImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{tripData.title?.en || tripData.title || ""}</Text>
            <Text style={styles.heroRoute}>
              {tripData.route?.from || ""} → {tripData.route?.to || ""}
            </Text>
          </View>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* White Details Card */}
        <View style={styles.detailsCard}>
          {/* Price + Rating */}
          <View style={styles.row}>
            <View>
              <Text style={styles.priceLabel}>Price Per Person</Text>
              <Text style={styles.price}>Single: ₹{priceSingle}</Text>
              {priceCouple !== null && <Text style={styles.price}>Couple: ₹{priceCouple}</Text>}
              {priceGroup !== null && <Text style={styles.price}>Group: ₹{priceGroup}</Text>}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View>
          </View>

          {/* Trip Info */}
          <Text style={styles.sectionTitle}>Trip Info</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="calendar" size={16} color="#2563eb" />
              <Text style={styles.badgeText}>
                {tripData.startDate ? new Date(tripData.startDate).toDateString() : ""} →{" "}
                {tripData.endDate ? new Date(tripData.endDate).toDateString() : ""}
              </Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="people" size={16} color="#2563eb" />
              <Text style={styles.badgeText}>
                {tripData.availableSeats ?? 0}/{tripData.totalSeats ?? 0} Seats
              </Text>
            </View>
          </View>

          {/* Inclusions */}
          {(tripData.inclusions || []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Inclusions</Text>
              {tripData.inclusions.map((item, index) => (
                <View key={index} style={styles.listRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {/* Route Stops */}
          {(tripData.route?.stops || []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Route Stops</Text>
              {tripData.route.stops.map((stop, index) => (
                <View key={index} style={styles.listRow}>
                  <Ionicons name="location" size={18} color="#ef4444" />
                  <Text style={styles.listText}>{stop}</Text>
                </View>
              ))}
            </>
          )}

          {/* Gallery */}
          {formattedImages.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                horizontal
                data={formattedImages.slice(1)}
                keyExtractor={(_, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.galleryImage} />
                )}
              />
            </>
          )}

          {/* Agent Info */}
          <Text style={styles.sectionTitle}>Provided By</Text>
          <View style={styles.agentRow}>
            <Image
              source={{
                uri:
                  tripData.agentId?.avatar ||
                  `https://dummyimage.com/100x100/2563eb/fff.png&text=${
                    tripData.agentId?.name?.charAt(0).toUpperCase() || "A"
                  }`,
              }}
              style={styles.agentAvatar}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.agentName}>{tripData.agentId?.name || "Agent"}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                <Text style={styles.agentDesc}> Verified Agent</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("CreateBooking", { tripData })}
        >
          <LinearGradient
            colors={["#4f46e5", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookBtn}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width,
    height: 280,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  heroOverlay: {
    position: "absolute",
    width,
    height: 280,
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
  },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "#fff" },
  heroRoute: { fontSize: 16, color: "#f1f5f9", marginTop: 4 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  detailsCard: {
    marginTop: -20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  priceLabel: { fontSize: 14, fontWeight: "600", color: "#2563eb", marginBottom: 4 },
  price: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 5, fontSize: 14, color: "#555" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 24,
    marginBottom: 10,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: { marginLeft: 6, fontSize: 14, color: "#1e40af" },
  listRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  listText: { marginLeft: 8, fontSize: 15, color: "#444" },
  galleryImage: {
    width: 120,
    height: 100,
    borderRadius: 14,
    marginRight: 12,
  },
  agentRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  agentAvatar: { width: 45, height: 45, borderRadius: 25 },
  agentName: { fontSize: 16, fontWeight: "600", color: "#111" },
  agentDesc: { fontSize: 14, color: "#555", marginLeft: 5 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  bookBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
