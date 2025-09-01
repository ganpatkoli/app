import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  Platform,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import instance from "../../api/axiosInstance";
import DropDownPicker from "react-native-dropdown-picker";

export default function CreateTripScreen({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [form, setForm] = useState({
    title_en: "",
    description_en: "",
    route_from: "",
    route_to: "",
    route_stops: "",
    inclusions: "",
    price_single: "",
    price_couple: "",
    price_group: "",
    startDate: new Date(),
    endDate: new Date(),
    totalSeats: "",
    availableSeats: "",
    location_lon: "",
    location_lat: "",
    status: "draft",
    pickupPointsText: "",
    dropPointsText: "",
    guideAvailable: false,
    cancellationPolicy: "",
  });

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("draft");
  const [filterItems, setFilterItems] = useState([
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ]);

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // ---------- Place Autocomplete Fetch ----------
  const fetchPlaces = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
          )}&key=AIzaSyAABC7LvOM6oEW1P03lNxBoms_C_7cuwRg&location=${
            region.latitude
          },${region.longitude}&radius=2000`
        );
        const json = await res.json();
        setSuggestions(json.predictions || []);
      } catch (e) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Select a place from suggestions and update map & form
  const selectPlace = async (placeId, description) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyAABC7LvOM6oEW1P03lNxBoms_C_7cuwRg`
      );
      const json = await res.json();
      const loc = json.result.geometry.location;

      setRegion({
        ...region,
        latitude: loc.lat,
        longitude: loc.lng,
      });
      setQuery(description);
      setSuggestions([]);

      // Update location fields in form for submission
      handleChange("location_lat", String(loc.lat));
      handleChange("location_lon", String(loc.lng));
    } catch (e) {
      Alert.alert("Error", "Failed to fetch place details");
    }
  };

  // ---------- Image Picker ----------
  const pickImage = async () => {
    try {
      setImgLoading(true);
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        alert("Permission to access media library is required!");
        setImgLoading(false);
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!pickerResult.canceled) {
        const newImages = pickerResult.assets
          ? pickerResult.assets.map((a) => a.uri)
          : [pickerResult.uri];
        setImages((prev) => [...prev, ...newImages]);
      }
    } finally {
      setImgLoading(false);
    }
  };
  const removeImage = (uri) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  // ---------- Date/Time helpers ----------
  const showDateTimePicker = (field) => {
    setActiveField(field);
    setShowPicker(true);
  };

  const onChangeDateTime = (event, selected) => {
    if (!selected) {
      // Picker dismissed without selection
      setShowPicker(false);
      return;
    }
    handleChange(activeField, selected);
    setShowPicker(false);
  };

  // ---------- Submit ----------
  const splitAndTrim = (str) =>
    (str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    try {
      if (!form.title_en || !form.route_from || !form.route_to) {
        Alert.alert(
          "Fill Required Fields",
          "Please fill Title (English), Route From and Route To."
        );
        return;
      }
      if (new Date(form.endDate) < new Date(form.startDate)) {
        Alert.alert("Invalid Dates", "End date/time must be after start date/time.");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      // Title & Description
      formData.append(
        "title",
        JSON.stringify({
          en: form.title_en,
          hi: form.title_hi || "",
          es: form.title_es || "",
        })
      );
      formData.append(
        "description",
        JSON.stringify({
          en: form.description_en,
          hi: form.description_hi || "",
          es: form.description_es || "",
        })
      );

      // Route
      formData.append(
        "route",
        JSON.stringify({
          from: form.route_from,
          to: form.route_to,
          stops: splitAndTrim(form.route_stops),
        })
      );

      // Other Fields
      formData.append("inclusions", JSON.stringify(splitAndTrim(form.inclusions)));

      // Price Object
      formData.append(
        "price",
        JSON.stringify({
          single: form.price_single || 0,
          couple: form.price_couple || 0,
          group: form.price_group || 0,
        })
      );

      formData.append("totalSeats", String(form.totalSeats || ""));
      formData.append("availableSeats", String(form.availableSeats || form.totalSeats || ""));
      formData.append("startDate", new Date(form.startDate).toISOString());
      formData.append("endDate", new Date(form.endDate).toISOString());
      formData.append("status", selectedFilter || "draft");

      // Location
      formData.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [
            parseFloat(form.location_lon) || 0,
            parseFloat(form.location_lat) || 0,
          ],
        })
      );

      // Pickup/Drop points arrays
      formData.append("pickupPoints", JSON.stringify(splitAndTrim(form.pickupPointsText)));
      formData.append("dropPoints", JSON.stringify(splitAndTrim(form.dropPointsText)));

      // Guide Available boolean
      formData.append("guideAvailable", String(form.guideAvailable));

      // Cancellation Policy
      formData.append("cancellationPolicy", form.cancellationPolicy || "");

      // Images Upload
      images.forEach((uri) => {
        const filename = uri.split("/").pop() || `img_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("images", { uri, name: filename, type });
      });

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const response = await instance.post("/trips", formData, config);

      Alert.alert("Success", "Trip created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to create trip"
      );
    } finally {
      setLoading(false);
    }
  };

  // Formatters for date and time display
  const fmtDateTime = (d) =>
    new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Trip</Text>
        <View style={{ width: 22 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          { label: "Title (English) *", key: "title_en", ph: "Title (English)" },
          {
            label: "Description (English)",
            key: "description_en",
            ph: "Description (English)",
            multiline: true,
          },
          { label: "Route From *", key: "route_from", ph: "Route From" },
          { label: "Route To *", key: "route_to", ph: "Route To" },
          { label: "Route Stops", key: "route_stops", ph: "Stop1, Stop2" },
          { label: "Inclusions", key: "inclusions", ph: "Breakfast, Guide" },
          {
            label: "Price for Single",
            key: "price_single",
            type: Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric",
            ph: "Amount",
          },
          {
            label: "Price for Couple",
            key: "price_couple",
            type: Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric",
            ph: "Amount",
          },
          {
            label: "Price for Group (more then 5+)",
            key: "price_group",
            type: Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric",
            ph: "Amount per person",
          },
          { label: "Total Seats *", key: "totalSeats", type: "numeric", ph: "Total Seats" },
          {
            label: "Available Seats",
            key: "availableSeats",
            type: "numeric",
            ph: "Leave blank to default",
          },
          {
            label: "Pickup Points (comma separated)",
            key: "pickupPointsText",
            ph: "e.g. Station A, Central Park",
          },
          {
            label: "Drop Points (comma separated)",
            key: "dropPointsText",
            ph: "e.g. Station B, City Center",
          },
          {
            label: "Cancellation Policy",
            key: "cancellationPolicy",
            ph: "Describe cancellation policy",
            multiline: true,
          },
          { label: "Longitude *", key: "location_lon", type: "numeric", ph: "Longitude" },
          { label: "Latitude *", key: "location_lat", type: "numeric", ph: "Latitude" },
        ].map((field, idx) => (
          <View key={idx} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && { height: 90, textAlignVertical: "top" }]}
              value={String(form[field.key] ?? "")}
              onChangeText={(val) => handleChange(field.key, val)}
              placeholder={field.ph}
              placeholderTextColor="#9ca3af"
              keyboardType={field.type || "default"}
              multiline={field.multiline}
            />
          </View>
        ))}

        {/* Guide toggle */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: "#374151" }}>
            Guide Available
          </Text>
          <TouchableOpacity
            onPress={() => handleChange("guideAvailable", !form.guideAvailable)}
            style={{
              width: 50,
              height: 30,
              borderRadius: 15,
              backgroundColor: form.guideAvailable ? "#2563eb" : "#d1d5db",
              justifyContent: "center",
              padding: 3,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#fff",
                alignSelf: form.guideAvailable ? "flex-end" : "flex-start",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Place Search */}
        <View style={styles.searchContainer}>
          <TextInput
            value={query}
            onChangeText={fetchPlaces}
            placeholder="Search location..."
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectPlace(item.place_id, item.description)}
                  style={styles.suggestion}
                >
                  <Text>{item.description}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 140 }}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={(r) => {
              setRegion(r);
              handleChange("location_lat", String(r.latitude));
              handleChange("location_lon", String(r.longitude));
            }}
          >
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          </MapView>
        </View>

        {/* Start Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date & Time *</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => showDateTimePicker("startDate")}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={16} color="#374151" />
            <Text style={styles.dateText}>{fmtDateTime(form.startDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* End Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date & Time *</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => showDateTimePicker("endDate")}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={16} color="#374151" />
            <Text style={styles.dateText}>{fmtDateTime(form.endDate)}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={form[activeField] || new Date()}
            mode="datetime"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDateTime}
            style={Platform.OS === "ios" ? { backgroundColor: "#f5e5e5ff" } : undefined}
          />
        )}

        {/* Images */}
        <View style={styles.imagesSection}>
          <Text style={styles.label}>Images</Text>
          <View style={styles.imagesGrid}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageBox}>
                <TouchableOpacity onPress={() => setPreviewImg(img)}>
                  <Image source={{ uri: img }} style={styles.imgThumb} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(img)}>
                  <Ionicons name="close-circle" size={20} color="#f87171" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 8 && (
              <TouchableOpacity style={styles.addImgBtn} onPress={pickImage} activeOpacity={0.85}>
                {imgLoading ? (
                  <ActivityIndicator color="#aaa" />
                ) : (
                  <FontAwesome name="plus" size={20} color="#555" />
                )}
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageHint}>
            Tap + to add, max 8 images · Tap image to preview · Cross to remove
          </Text>
        </View>

        {/* Filter Dropdown */}
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

        {/* Preview modal */}
        <Modal visible={!!previewImg} transparent animationType="fade">
          <View style={styles.modalBg}>
            <Image source={{ uri: previewImg }} style={styles.fullImg} />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPreviewImg(null)}>
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Submit Button */}
        <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.button}>
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Trip</Text>}
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles (as you provided, unchanged)

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e0e7ff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  backBtn: { padding: 6, borderRadius: 20, backgroundColor: "#1e40af" },
  container: { padding: 20, paddingBottom: 40 },
  searchContainer: {
    position: "relative",
    marginBottom: 10,
    zIndex: 999,
    borderColor: "#d1d5db",
  },
  suggestion: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  mapContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  map: {
    flex: 1,
  },
  inputGroup: { marginBottom: 14 },
  label: { fontWeight: "600", marginBottom: 5, color: "#374151", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: { fontSize: 16, color: "#111827" },
  imagesSection: { marginVertical: 16 },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 11,
  },
  imageBox: { position: "relative", marginRight: 11, marginBottom: 11 },
  imgThumb: {
    width: 85,
    height: 85,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 0.5,
    elevation: 3,
  },
  addImgBtn: {
    width: 85,
    height: 85,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f3f4f6",
    marginRight: 11,
    marginBottom: 11,
  },
  imageHint: { fontSize: 13, color: "#888", marginTop: 6, marginBottom: 6 },
  button: { height: 52, borderRadius: 10, overflow: "hidden", marginTop: 25 },
  buttonInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImg: {
    width: 440,
    height: 440,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  closeModalBtn: { position: "absolute", top: 42, right: 32 },
});
