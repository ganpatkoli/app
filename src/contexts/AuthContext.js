import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, registerAgentApi } from "../api/auth";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [getId, setGetId] = useState(null);
  // On app load, fetch any saved token
  // App load पर token और id निकालो
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const id = await AsyncStorage.getItem("id");

        if (token) setUserToken(token);
        if (id) setGetId(id);
      } catch (e) {
        console.error("Error loading auth data", e);
      }
    };

    loadAuthData();
  }, []);

  // Login & save token
  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const token = response.data.token;
    const decodedToken = jwtDecode(token);

    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("id", decodedToken?.id);
    await AsyncStorage.setItem("role", decodedToken?.role);

    setGetId(decodedToken?.id);
     setUserToken(token);
  };

  // Agent Registration (returns response object)
  const registerAgent = async (data) => {
    return registerAgentApi(data);
  };

  // Logout & clear token
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("role");
    setGetId(null);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ getId, userToken, login, logout, registerAgent }}
    >
      {children}
    </AuthContext.Provider>
  );
}
