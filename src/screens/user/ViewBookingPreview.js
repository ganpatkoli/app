import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import instance, { BASE_URL_IMAGE } from "../../api/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
// import RazorpayCheckout from "react-native-razorpay";

export default function PreviewBookingScreen({ route, navigation }) {
  const { tripData, categoryValue, travellers, totalPrice } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const payload = {
        tripId: tripData._id,
        seatType: categoryValue,
        seatsBooked: travellers.length,
        pricePaid: totalPrice,
        travellers: travellers.map((t) => ({
          name: t.name,
          age: t.age,
          gender: t.gender,
        })),
      };

      const response = await instance.post("/bookings", payload);

      if (response.status === 201) {
        const { orderId, amount, currency, booking } = response.data;

        // const options = {
        //   description: `Payment for trip ${tripData.title.en}`,
        //   image: "https://logoipsum.com/artwork/401",
        //   currency: currency,
        //   key: "rzp_test_RAQZ1RT3AvDZK1",
        //   amount: amount,
        //   order_id: orderId,
        //   name: "Your Company Name",
        //   prefill: {
        //     email: "", // user email if available
        //     contact: "", // user phone if available
        //     name: "", // user name if available
        //   },
        //   theme: { color: "#2563eb" },
        // };

        // RazorpayCheckout.open(options)
        //   .then(async (paymentResult) => {
        //     try {
        //       await instance.patch(`/bookings/${booking._id}/payment-status`, {
        //         paymentStatus: "completed",
        //         paymentRef: paymentResult.razorpay_payment_id,
        //       });
        //       Alert.alert("✅ Success", "Payment completed and booking confirmed!");
        //       navigation.popToTop();
        //     } catch (err) {
        //       Alert.alert(
        //         "⚠️ Update Failed",
        //         "Payment succeeded but failed to update booking status."
        //       );
        //     }
        //   })
        //   .catch(() => {
        //     Alert.alert("❌ Payment Failed", "Payment was cancelled or failed.");
          // });
      } else {
        Alert.alert("⚠️ Booking Failed", "Failed to create booking.");
      }
    } catch (err) {
      Alert.alert("⚠️ Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Include your previous UI components here (header, trip info, summary, etc.) */}

      <ScrollView>
        {/* Booking summary and other UI */}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="close" size={18} color="#374151" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.confirmText}>Confirm & Pay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  confirmButton: {
    backgroundColor: "#2563eb",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
