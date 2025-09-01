import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import axios from "../../api/axiosInstance";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function QRVerifyScreen({ navigation }) {
  const [qrCode, setQrCode] = useState("");
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleVerify = async (code) => {
    setLoading(true);
    try {
      const res = await axios.post("/bookings/verify-qr", {
        qrCode: code || qrCode,
      });

      Alert.alert(
        "✅ Success",
        res.data.message || "Booking verified!",
        [
          {
            text: "OK",
            onPress: () => {
              setQrCode("");
              setScanned(false);
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        "❌ Verification Failed",
        err.response?.data?.message || err.message,
        [
          {
            text: "OK",
            onPress: () => {
              setQrCode("");
              setScanned(false);
            },
          },
        ]
      );
    }
    setLoading(false);
  };


  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setQrCode(data);
      handleVerify(data);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Verification</Text>
          <View style={{ width: 22 }} />
        </LinearGradient>

        <View style={styles.centerContent}>
          <Text style={{ marginBottom: 12 }}>
            We need camera access to scan QR
          </Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient colors={["#4f46e5", "#2563eb"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Verification</Text>
        <View style={{ width: 22 }} />
      </LinearGradient>

      <View style={{ padding: 10, flex: 1 }}>
        {/* Camera QR Scanner */}
        {!scanned && (
          <View style={styles.card}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarCodeScanned}
            />
          </View>
        )}
        {scanned && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.scanAnotherBtn]}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="scan" size={18} color="#2563eb" />
            <Text style={styles.scanAnotherText}> Scan Another</Text>
          </TouchableOpacity>
        )}

        {/* Manual Input */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="qr-code-outline"
            size={18}
            color="#555"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Paste or enter QR code"
            value={qrCode}
            onChangeText={setQrCode}
            autoCapitalize="none"
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.verifyBtn, loading && { opacity: 0.7 }]}
          onPress={() => handleVerify()}
          disabled={loading || !qrCode}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Verify QR</Text>
          )}
        </TouchableOpacity>
      </View>
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
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#1e40af",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  camera: { height: 340, width: "100%" },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
    height: 50,
  },
  input: { flex: 1, fontSize: 15, color: "#111" },

  actionBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
  },
  verifyBtn: { backgroundColor: "#2563eb" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  scanAnotherBtn: {
    borderColor: "#2563eb",
    borderWidth: 1.4,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  scanAnotherText: { color: "#2563eb", fontWeight: "600", fontSize: 15 },
});
