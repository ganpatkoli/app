import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation", "Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert("Login Failed", err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const fillSuperAdmin = () => {
    setEmail("superadmin@gmail.com");
    setPassword("superadmin@123");
  };

  const fillAdmin = () => {
    setEmail("ganu@gmail.com");
    setPassword("agent123");
  };

  const fillUser = () => {
    setEmail("userGanu@gmail.com");
    setPassword("123456789");
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ fontSize: 20 }}>←</Text>
      </TouchableOpacity>

      {/* App Logo */}
      <Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/5968/5968776.png", // random logo (replace with your logo)
        }}
        style={styles.logo}
      />

      <Text style={styles.title}>Sign in now</Text>
      <Text style={styles.subtitle}>Please sign in to continue our app</Text>

      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: "#e74c3c" }]}
          onPress={fillSuperAdmin}
        >
          <Text style={styles.testButtonText}>Superadmin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: "#27ae60" }]}
          onPress={fillAdmin}
        >
          <Text style={styles.testButtonText}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: "#2980b9" }]}
          onPress={fillUser}
        >
          <Text style={styles.testButtonText}>User</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotText}>Forget Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate("Signup")}
        >
          Sign up
        </Text>
      </Text>

      <Text style={styles.orText}>Or connect</Text>

      {/* Social Icons */}
      <View style={styles.socialRow}>
        <TouchableOpacity>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/145/145802.png",
            }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
            }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
            }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#007bff",
    fontWeight: "500",
  },
  button: {
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  signupText: {
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  signupLink: {
    color: "#007bff",
    fontWeight: "600",
  },
  orText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#888",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialIcon: {
    width: 45,
    height: 45,
  },
  testButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  testButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
