import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import axios from "../../api/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";

export default function SignupScreen({ navigation }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    region: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, val) => setForm({ ...form, [key]: val });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.phone || !form.region) {
      alert("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/auth/signup", form);
      alert("Registration successful!");
      navigation.navigate("Login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    alert("Google Sign-In triggered (connect your auth logic)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ✅ Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={26} color="#19202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={{ width: 26 }} /> 
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.subHeading}>Please fill the details below</Text>

        <View style={styles.formGap} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.name}
          autoCapitalize="words"
          onChangeText={(val) => handleChange("name", val)}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(val) => handleChange("email", val)}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(val) => handleChange("phone", val)}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Region"
          autoCapitalize="words"
          value={form.region}
          onChangeText={(val) => handleChange("region", val)}
          placeholderTextColor="#aaa"
        />
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            secureTextEntry={!showPass}
            value={form.password}
            onChangeText={(val) => handleChange("password", val)}
            placeholderTextColor="#aaa"
            maxLength={32}
          />
          <TouchableOpacity
            onPress={() => setShowPass((p) => !p)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showPass ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.passNote}>Password must be 8 characters</Text>

        {/* Sign Up Button with Gradient */}
        <LinearGradient
          colors={["#4f46e5", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.signUpBtn}
        >
          <TouchableOpacity
            style={styles.signUpBtnInner}
            onPress={handleRegister}
            activeOpacity={0.84}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.alreadyText}>
          Already have an account?{" "}
          <Text
            style={styles.signInLink}
            onPress={() => navigation.navigate("Login")}
          >
            Sign in
          </Text>
        </Text>

        <Text style={styles.orConnect}>Or connect</Text>

        <TouchableOpacity style={styles.socialGoogleBtn} onPress={handleGoogleSignIn}>
          <FontAwesome name="google" size={26} color="rgba(226, 138, 66, 1)" />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#181c29",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    paddingBottom: 30,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#181c29",
    textAlign: "center",
    marginBottom: 7,
    marginTop: 15,
  },
  subHeading: {
    color: "#7b809c",
    fontSize: 15.5,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 18,
  },
  formGap: { height: 7 },
  input: {
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15.7,
    color: "#232838",
    marginBottom: 13,
    borderWidth: 0,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    marginBottom: 2,
    borderWidth: 0,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingLeft: 14,
    backgroundColor: "transparent",
  },
  passNote: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
    marginTop: 2,
    marginLeft: 2,
  },
  signUpBtn: {
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 20,
  },
  signUpBtnInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  alreadyText: {
    textAlign: "center",
    color: "#949bb1",
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
  },
  signInLink: {
    color: "#2170ff",
    fontWeight: "700",
  },
  orConnect: {
    color: "#949bb1",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  socialGoogleBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#c6daf6",
    shadowOpacity: 0.09,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    paddingVertical: 11,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 6,
    borderWidth: 1.2,
    borderColor: "#eee",
    marginTop: 3,
  },
  googleBtnText: {
    fontWeight: "700",
    color: "#202124",
    marginLeft: 12,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
