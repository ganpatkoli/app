import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import instance from "../../api/axiosInstance";

export default function BookingScreen({ route, navigation }) {
  const { tripData } = route.params;

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState('single');
  const [categoryItems, setCategoryItems] = useState([
    { label: "Select Booking Category", value: null, disabled: true },
    { label: "Single", value: "single" },
    { label: "Couple", value: "couple" },
    { label: "Group", value: "group" },
  ]);

  const [travellers, setTravellers] = useState([{ name: "", age: "", gender: "" }]);
  const [groupSeats, setGroupSeats] = useState("5"); // default 5 seats
  const [loading, setLoading] = useState(false);

  const prices = {
    single: tripData?.price.single || 0,
    couple: tripData?.price.couple || 0,
    group: tripData?.price.group || 0,
  };

  // ✅ Seat calculation based on category
  useEffect(() => {
    if (categoryValue === "single") {
      setTravellers([{ name: "", age: "", gender: "" }]);
    } else if (categoryValue === "couple") {
      setTravellers([
        { name: "", age: "", gender: "" },
        { name: "", age: "", gender: "" },
      ]);
    } else if (categoryValue === "group") {
      handleGroupSeatChange(groupSeats);
    }
  }, [categoryValue]);

  const handleGroupSeatChange = (val) => {
    let num = parseInt(val) || 0;

    if (num < 5) {
      Alert.alert("Error", "Minimum 5 seats required");
    } else if (num > tripData.remainingSeats) {
      Alert.alert("Error", `Only ${tripData.remainingSeats} seats left`);
    }

    setGroupSeats(val);

    if (num < 5) num = 5;
    if (num > tripData.remainingSeats) num = tripData.remainingSeats;

    setTravellers(
      Array.from({ length: num }, () => ({ name: "", age: "", gender: "" }))
    );
  };


  const handleTravellerChange = (index, field, value) => {
    const updated = [...travellers];
    updated[index][field] = value;
    setTravellers(updated);
  };

  // ✅ Price Calculation
  let totalPrice = 0;
  if (categoryValue === "single") {
    totalPrice = prices.single * travellers.length;
  } else if (categoryValue === "couple") {
    totalPrice = prices.couple * travellers.length;
  } else if (categoryValue === "group") {
    totalPrice = prices.group * travellers.length;
  }

  const handleBooking = async () => {
    // console.log("dfdfdf");

    if (!categoryValue) {
      Alert.alert("Error", "Please select a booking category.");
      return;
    }

    // ✅ Validate all travellers must have name
    for (let i = 0; i < travellers.length; i++) {
      if (!travellers[i].name.trim()) {
        Alert.alert("Error", `Please enter traveller #${i + 1}'s name.`);
        return;
      }
    }

    if (categoryValue === "group") {
      if (travellers.length < 5) {
        Alert.alert("Error", "Group booking requires minimum 5 seats.");
        return;
      }
      if (travellers.length > tripData.remainingSeats) {
        Alert.alert("Error", `Only ${tripData.remainingSeats} seats left.`);
        return;
      }
    }

    // tripId, seatsBooked, pricePaid, travellers

    console.log("Booking payload:",);

    const payload = {

      seatsBooked: travellers.length,
      travellers: travellers.map((traveller) => ({
        name: traveller.name,
        age: traveller.age,
        gender: traveller.gender,
      })),
      tripId: tripData._id,
      seatType: categoryValue,
      // seatsBooked: travellers.length,
      pricePaid: totalPrice,
    };

    console.log("Booking payload:", payload);

    const response = await instance.post("/bookings", payload);

    console.log("Booking---------------------", response);

    if (response.status === 201) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Success", "Your booking has been placed!");
        navigation.goBack();
      }, 1500);
    } else {
      Alert.alert("Error", "Failed to create booking.");
    }

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <LinearGradient
        colors={["#6200EE", "#9333ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* FlatList */}
      <FlatList
        data={travellers}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.content}
        renderItem={({ item, index }) => (
          <View style={styles.travellerCard}>
            <Text style={styles.travellerHeading}>👤 Traveller #{index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name (required)"
              value={item.name}
              onChangeText={(text) => handleTravellerChange(index, "name", text)}
              placeholderTextColor={"#aaa"}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Age (optional)"
              placeholderTextColor={"#aaa"}

              keyboardType="numeric"
              value={item.age}
              onChangeText={(text) => handleTravellerChange(index, "age", text)}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender (optional)"
              placeholderTextColor={"#aaa"}

              value={item.gender}
              onChangeText={(text) => handleTravellerChange(index, "gender", text)}
              editable={!loading}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>{tripData.title?.en || tripData.title}</Text>

            {/* Route */}
            <View style={styles.infoCard}>
              <Ionicons name="map-outline" size={20} color="#2563eb" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoTitle}>Route</Text>
                <Text style={styles.infoValue}>
                  {tripData.route?.from || "N/A"} → {tripData.route?.to || "N/A"}
                </Text>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoTitle}>Dates</Text>
                <Text style={styles.infoValue}>
                  {new Date(tripData?.startDate).toLocaleDateString()} -{" "}
                  {new Date(tripData?.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Prices */}
            <Text style={styles.sectionTitle}>Prices</Text>
            <View style={styles.priceChipsContainer}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>🧍 Single: ₹{prices.single}/PP</Text>
                
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>👩‍❤️‍👨 Couple: ₹{prices.couple}/PP</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>👥 Group: ₹{prices.group}/PP</Text>
              </View>
            </View>

            {/* Category Picker */}
            <Text style={styles.label}>Booking Category</Text>
            <View style={{ zIndex: 3000, elevation: 3000 }}>   {/* Wrapper with high zIndex */}
              <DropDownPicker
                open={categoryOpen}
                value={categoryValue}
                items={categoryItems}
                setOpen={setCategoryOpen}
                setValue={setCategoryValue}
                setItems={setCategoryItems}
                disabled={loading}
                style={styles.dropdown}
                dropDownContainerStyle={{
                  ...styles.dropdownContainer,
                  zIndex: 4000,       // dropdown aur bhi upar
                  elevation: 4000,
                  paddingBottom: 10,
                }}
                listMode="SCROLLVIEW"
              />
            </View>


            {/* Group Seats Input */}
            {categoryValue === "group" && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.label}>Number of Seats (Min 5, Max {tripData.remainingSeats})</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={groupSeats}
                  onChangeText={handleGroupSeatChange}
                  editable={!loading}
                />
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <>
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>Total Price</Text>
              <Text style={styles.priceValue}>₹{totalPrice}</Text>
            </View>

            <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.button}>
              <TouchableOpacity
                style={styles.btnInner}
                onPress={handleBooking}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Book Now</Text>}
              </TouchableOpacity>
            </LinearGradient>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 15,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    color: "#111827",
  },
  pricesLine: {
    fontSize: 14,
    color: "#374151",
    // marginBottom: 15,
    marginVertical: 15,

  },

  priceChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    // gap: 3, // 
    marginVertical: 2,
    display: "flex"
  },

  chip: {
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 7,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2, // Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },


  label: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#111827", },
  dropdown: {
    borderColor: "#ccc", backgroundColor: "#fff",
    marginVertical: 15,
    paddingBottom: 10,
  }, dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingBottom: 10,
  },
  // 
  travellerCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,   // 👈 low rakha
    zIndex: -1,      // 👈 card hamesha neeche
  },


  travellerHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  priceBox: {
    backgroundColor: "#e0e7ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  priceText: {
    fontSize: 16,
    color: "#374151",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  button: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 50,
  },
  btnInner: {
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
