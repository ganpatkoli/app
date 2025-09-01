import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import axios, { BASE_URL, BASE_URL_IMAGE } from "../../api/axiosInstance";

const avatarImages = [
  "https://avatar.iran.li/run/username?username=Scott+Wilson",
  "https://avatar.iran.li/run/username?username=Scott+Wilson",
  "https://avatar.iran.li/run/username?username=Scott+Wilson",
];

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
}

function formatDateToYYYYMMDD(dateInput) {
  const date = new Date(dateInput);
  return date.toISOString().split("T")[0];
}

function getRangeMarkedDates(start, end) {
  let marked = {};
  let current = new Date(start);
  const last = new Date(end);
  current.setDate(current.getDate() + 1);
  while (current < last) {
    const dateStr = current.toISOString().split("T")[0];
    marked[dateStr] = { color: "#D6E4FF", textColor: "#000" };
    current.setDate(current.getDate() + 1);
  }
  return marked;
}

function TripCard({ item, navigation }) {
  const title = item.title?.en || "Untitled";
  const startDate = item.startDate ? new Date(item.startDate) : null;
  const endDate = item.endDate ? new Date(item.endDate) : null;
  const startDisplay = startDate ? startDate.toLocaleDateString() : "";
  const endDisplay = endDate ? endDate.toLocaleDateString() : "";
  const duration = item.duration ?? (startDate && endDate ? daysBetween(startDate, endDate) : 0);
  const joined = item.joinedPersons ?? 0;
  const rating = item.rating ?? 4.5;
  const imageUri =
    item.images && item.images.length > 0
      ? `${BASE_URL_IMAGE}/${item.images[0].replace(/\\/g, "/")}`
      : "https://dummyimage.com/600x400/3b293b/ffffff&text=No+Image";

  const priceSingle = item.price?.single ?? null;
  const priceCouple = item.price?.couple ?? null;
  const priceGroup = item.price?.group ?? null;


  // console.log("item" ,priceSingle);
  
  return (


    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("TripDetails", { tripData: item })}
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.priceBadge}>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {priceSingle !== null ? `₹${priceSingle}` : "N/A"}
          </Text>
        </View>

        <Text style={styles.tripTitle} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#636E72" />
          <Text style={styles.dateText}>{`${startDisplay} - ${endDisplay}`}</Text>
          <Text style={styles.daysText}> | {Math.max(duration, 1)} days</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color="#27AE60" />
          <Text style={[styles.dateText, { color: "#27AE60" }]}>Duration: {duration} day(s)</Text>
        </View>

        <View style={[styles.infoRow, { marginTop: 4 }]}>
          <Ionicons name="star" size={15} color="#FBC531" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <View style={styles.avatarGroup}>
            {avatarImages.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={[styles.avatar, idx !== 0 && { marginLeft: -10 }]} />
            ))}
          </View>
          <Text style={styles.joinedText}>{joined} Person{joined > 1 ? "s" : ""} Joined</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TripList({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  useEffect(() => {
    axios
      .get("/trips")
      .then(({ data }) => {
        const tripsData = (data.trips || []).map((trip) => {
          const sDate = new Date(trip.startDate);
          const eDate = new Date(trip.endDate);
          return {
            ...trip,
            duration: daysBetween(sDate, eDate),
            joinedPersons: trip.joinedPersons ?? 0,
          };
        });
        setTrips(tripsData);
      })
      .catch((error) => {
        console.error("Failed to fetch trips:", error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter trips by selected date or date range
  const filteredTrips = trips.filter((trip) => {
    if (!selectedStartDate) return true;
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const filterStart = new Date(selectedStartDate);
    const filterEnd = selectedEndDate ? new Date(selectedEndDate) : filterStart;

    return tripEnd >= filterStart && tripStart <= filterEnd;
  });

  const formatDateToYYYYMMDD = (date) => date.toISOString().split("T")[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Popular Trips</Text>
      </View>

      <Pressable
        style={styles.calendarToggle}
        onPress={() => setCalendarVisible(true)}
      >
        <Ionicons name="calendar" size={18} color="#2963FF" />
        <Text style={styles.calendarToggleText}>
          {selectedStartDate
            ? selectedEndDate
              ? `Filter: ${selectedStartDate} - ${selectedEndDate}`
              : `Filter: ${selectedStartDate}`
            : "Date/Range Filter"}
        </Text>
      </Pressable>

      <Modal
        visible={calendarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Calendar
              current={selectedStartDate ?? formatDateToYYYYMMDD(new Date())}
              markingType="period"
              markedDates={
                selectedStartDate && selectedEndDate
                  ? {
                      [selectedStartDate]: { startingDay: true, color: "#2963FF", textColor: "#fff" },
                      [selectedEndDate]: { endingDay: true, color: "#2963FF", textColor: "#fff" },
                      ...getRangeMarkedDates(selectedStartDate, selectedEndDate),
                    }
                  : selectedStartDate
                  ? { [selectedStartDate]: { selected: true, selectedColor: "#2963FF" } }
                  : {}
              }
              onDayPress={(day) => {
                if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
                  setSelectedStartDate(day.dateString);
                  setSelectedEndDate(null);
                } else {
                  if (new Date(day.dateString) >= new Date(selectedStartDate)) {
                    setSelectedEndDate(day.dateString);
                  } else {
                    setSelectedStartDate(day.dateString);
                    setSelectedEndDate(null);
                  }
                }
              }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Text style={[styles.modalButtonText, { color: "#2963FF" }]}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSelectedStartDate(null);
                setSelectedEndDate(null);
                setCalendarVisible(false);
              }}>
                <Text style={[styles.modalButtonText, { color: "#999" }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TripCard item={item} navigation={navigation} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane" size={60} color="#bbb" />
            <Text style={styles.emptyText}>No trips available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6200EE",
    paddingVertical: 14,
    paddingTop: 50,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 6,
  },

  backButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25,
  },

  headerTitle: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },

  calendarToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#ECF7FB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 8,
  },

  calendarToggleText: {
    marginLeft: 8,
    color: "#2963FF",
    fontWeight: "600",
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 10,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 4,
    alignItems: "center",
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },

  infoContainer: {
    flex: 1,
    paddingLeft: 12,
  },

  priceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#2963FF",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 1,
  },

  tripTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#27375F",
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  dateText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#636E72",
  },

  daysText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#9981CE",
  },

  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  avatarGroup: {
    flexDirection: "row",
    marginLeft: 8,
  },

  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#eee",
    marginLeft: -10,
  },

  joinedText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7FA",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    fontSize: 16,
    color: "#bbb",
    marginTop: 16,
  },
});
