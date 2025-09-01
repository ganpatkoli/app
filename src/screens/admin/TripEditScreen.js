import React, { useEffect, useState } from "react";
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
import instance, { BASE_URL_IMAGE } from "../../api/axiosInstance";
import DropDownPicker from "react-native-dropdown-picker";

export default function UpdateTripScreen({ route, navigation }) {
  const { tripData } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Form fields
  const [titleEn, setTitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [routeStops, setRouteStops] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [priceSingle, setPriceSingle] = useState("");
  const [priceCouple, setPriceCouple] = useState("");
  const [priceGroup, setPriceGroup] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLon, setLocationLon] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  // const [selectedFilter, setSelectedFilter] = useState("draft");
  const [pickupPointsText, setPickupPointsText] = useState("");
  const [dropPointsText, setDropPointsText] = useState("");
  const [guideAvailable, setGuideAvailable] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [images, setImages] = useState([]);
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


  // console.log("Selected Filter:", selectedFilter);

  useEffect(() => {
    if (!tripData) return;

    setTitleEn(tripData.title?.en || "");
    setDescriptionEn(tripData.description?.en || "");
    setRouteFrom(tripData.route?.from || "");
    setRouteTo(tripData.route?.to || "");
    setRouteStops(tripData.route?.stops?.join(", ") || "");
    setInclusions(tripData.inclusions?.join(", ") || "");
    setPriceSingle(tripData.price?.single?.toString() || "");
    setPriceCouple(tripData.price?.couple?.toString() || "");
    setPriceGroup(tripData.price?.group?.toString() || "");
    setTotalSeats(tripData.totalSeats?.toString() || "");
    setAvailableSeats(tripData.availableSeats?.toString() || "");
    setLocationLat(tripData.location?.coordinates?.[1]?.toString() || "");
    setLocationLon(tripData.location?.coordinates?.[0]?.toString() || "");
    setStartDate(new Date(tripData.startDate));
    setEndDate(new Date(tripData.endDate));
    setSelectedFilter(tripData.status || "draft");
    setPickupPointsText((tripData.pickupPoints || []).join(", "));
    setDropPointsText((tripData.dropPoints || []).join(", "));
    setGuideAvailable(tripData.guideAvailable || false);
    setCancellationPolicy(tripData.cancellationPolicy || "");

    setImages(
      (tripData.images || []).map((img) =>
        img.startsWith("http") ? img : `${BASE_URL_IMAGE}/${img.replace(/\\/g, "/")}`
      )
    );

    if (tripData.location?.coordinates) {
      setRegion({
        latitude: tripData.location.coordinates[1],
        longitude: tripData.location.coordinates[0],
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }

    setLoading(false);
  }, [tripData]);

  // Sync region change to lat/lon state
  const onRegionChangeComplete = (r) => {
    setRegion(r);
    setLocationLat(r.latitude.toString());
    setLocationLon(r.longitude.toString());
  };

  const handleChange = (key, val) => {
    switch (key) {
      case "location_lat":
        setLocationLat(val);
        setRegion((r) => ({
          ...r,
          latitude: parseFloat(val) || r.latitude,
        }));
        break;
      case "location_lon":
        setLocationLon(val);
        setRegion((r) => ({
          ...r,
          longitude: parseFloat(val) || r.longitude,
        }));
        break;
      default:
        break;
    }
    setForm((p) => ({ ...p, [key]: val }));
  };

  // Image picker
  const pickImage = async () => {
    try {
      setImgLoading(true);
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        alert("Permission to access media library is required!");
        setImgLoading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsMultipleSelection: true,
      });
      if (!result.canceled) {
        const newImgs = result.assets ? result.assets.map((a) => a.uri) : [result.uri];
        setImages((prev) => [...prev, ...newImgs]);
      }
    } finally {
      setImgLoading(false);
    }
  };

  const removeImage = (uri) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  // DateTime picker show/hide
  const showDateTimePicker = (field) => {
    setActiveField(field);
    setShowPicker(true);
  };

  const onChangeDateTime = (event, selected) => {
    if (!selected) {
      setShowPicker(false);
      return;
    }
    if (activeField === "startDate") setStartDate(selected);
    else if (activeField === "endDate") setEndDate(selected);
    setShowPicker(false);
  };

  const splitAndTrim = (str) =>
    (str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleUpdate = async () => {
    if (!titleEn || !descriptionEn) {
      Alert.alert("Error", "Title और Description आवश्यक हैं");
      return;
    }

    setSaving(true);

    const formData = new FormData();

    formData.append("title", JSON.stringify({ en: titleEn }));
    formData.append("description", JSON.stringify({ en: descriptionEn }));
    formData.append(
      "route",
      JSON.stringify({
        from: routeFrom,
        to: routeTo,
        stops: splitAndTrim(routeStops),
      })
    );
    formData.append("inclusions", JSON.stringify(splitAndTrim(inclusions)));
    formData.append(
      "price",
      JSON.stringify({
        single: priceSingle || 0,
        couple: priceCouple || 0,
        group: priceGroup || 0,
      })
    );
    formData.append("totalSeats", totalSeats);
    formData.append("availableSeats", availableSeats);
    // formData.append(
    //   "location",
    //   JSON.stringify([parseFloat(locationLon) || 0, parseFloat(locationLat) || 0])
    // );
    formData.append("startDate", startDate.toISOString());
    formData.append("endDate", endDate.toISOString());
    formData.append("status", selectedFilter);
    formData.append("pickupPoints", JSON.stringify(splitAndTrim(pickupPointsText)));
    formData.append("dropPoints", JSON.stringify(splitAndTrim(dropPointsText)));
    formData.append("guideAvailable", String(guideAvailable));
    formData.append("cancellationPolicy", cancellationPolicy);

    formData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [parseFloat(locationLon) || 0, parseFloat(locationLat) || 0],
      })
    );

    // Append existing images as array JSON
    const oldImages = images.filter(img => !img.startsWith("file://"));
    formData.append("existingImages", JSON.stringify(oldImages));

    // Append new images as files
    images.forEach((img, idx) => {
      if (img.startsWith("file://")) {
        formData.append("images", {
          uri: img,
          type: "image/jpeg",
          name: `trip_${idx}.jpg`,
        });
      }
    });


    try {
      const response = await instance.put(`/trips/${tripData._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Trip updated successfully");

      if (route.params?.onTripUpdate) {
        route.params.onTripUpdate(response.data);
      }
      navigation.goBack();

    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert("Error", "Trip update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Trip</Text>
        <View style={{ width: 22 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Text Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title (English) *</Text>
          <TextInput
            value={titleEn}
            onChangeText={setTitleEn}
            style={styles.input}
            placeholder="Title (English)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (English)</Text>
          <TextInput
            value={descriptionEn}
            onChangeText={setDescriptionEn}
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Description (English)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Repeat for other input fields like routeFrom, routeTo, routeStops, inclusions */}

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price Per Person (Single)</Text>
          <TextInput
            value={priceSingle}
            onChangeText={setPriceSingle}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
            style={styles.input}
            placeholder="Price for single person"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price For Couple</Text>
          <TextInput
            value={priceCouple}
            onChangeText={setPriceCouple}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
            style={styles.input}
            placeholder="Couple price"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price Per Person (Group)</Text>
          <TextInput
            value={priceGroup}
            onChangeText={setPriceGroup}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
            style={styles.input}
            placeholder="Group person price"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Pickup Points */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Points (comma separated)</Text>
          <TextInput
            value={pickupPointsText}
            onChangeText={setPickupPointsText}
            style={styles.input}
            placeholder="Station A, Central Park, etc."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Drop Points */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Drop Points (comma separated)</Text>
          <TextInput
            value={dropPointsText}
            onChangeText={setDropPointsText}
            style={styles.input}
            placeholder="Station B, City Center, etc."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Guide Available Toggle */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ flex: 1, fontWeight: "600", fontSize: 16, color: "#374151" }}>
            Guide Available
          </Text>
          <TouchableOpacity
            onPress={() => setGuideAvailable(!guideAvailable)}
            style={{
              width: 50,
              height: 30,
              borderRadius: 15,
              backgroundColor: guideAvailable ? "#2563eb" : "#d1d5db",
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
                alignSelf: guideAvailable ? "flex-end" : "flex-start",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cancellation Policy</Text>
          <TextInput
            value={cancellationPolicy}
            onChangeText={setCancellationPolicy}
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            multiline
            placeholder="Describe your cancellation policy"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            value={locationLat}
            onChangeText={(val) => {
              setLocationLat(val);
              setRegion((prev) => ({ ...prev, latitude: parseFloat(val) || prev.latitude }));
            }}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Enter latitude"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            value={locationLon}
            onChangeText={(val) => {
              setLocationLon(val);
              setRegion((prev) => ({ ...prev, longitude: parseFloat(val) || prev.longitude }));
            }}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Enter longitude"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={onRegionChangeComplete}
          >
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          </MapView>
        </View>

        {/* Dates */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date & Time *</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => {
              setActiveField("startDate");
              setShowPicker(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={16} color="#374151" />
            <Text style={styles.dateText}>{startDate.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date & Time *</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => {
              setActiveField("endDate");
              setShowPicker(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={16} color="#374151" />
            <Text style={styles.dateText}>{endDate.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={activeField === "startDate" ? startDate : endDate}
            mode="datetime"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDateTime}
            style={Platform.OS === "ios" ? { backgroundColor: "#fff" } : undefined}
          />
        )}

        {/* Images */}
        <View style={styles.imagesSection}>
          <Text style={styles.label}>Images</Text>
          <View style={styles.imagesGrid}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageBox}>
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

        {/* Preview Modal */}
        <Modal visible={!!previewImg} transparent animationType="fade">
          <View style={styles.modalBg}>
            <Image source={{ uri: previewImg }} style={styles.fullImg} />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPreviewImg(null)}>
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>

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

        {/* Submit Button */}
        <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.button}>
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.9}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Trip</Text>}
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  button: { height: 52, borderRadius: 10, overflow: "hidden", marginTop: 15 },
  buttonInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    position: "relative",
    marginBottom: 10,
    zIndex: 999,
  },
  suggestion: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
