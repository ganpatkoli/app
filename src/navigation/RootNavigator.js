import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../contexts/AuthContext";
import AdminTabNavigator from "./AdminTabNavigator";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignUpScreen";
import SplashScreen from "../screens/misc/SplashScreen";
import UserStack from "./UserStack";
import { jwtDecode } from "jwt-decode";
import MainTabNavigator from "./MainTabNavigator";
import PurchasePackageScreen from "../screens/packages/PurchasePackageScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { userToken } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userToken) {
      try {
        const decoded = jwtDecode(userToken);
        // console.log("Decoded token:", decoded);
        setRole(decoded?.role || "user");
      } catch (error) {
        console.warn("Token decode failed", error);
        setRole("user");
      }
    } else {
      setRole(null);
    }
    setLoading(false);
  }, [userToken]);

  if (loading) {
    return <SplashScreen />;
  }

  if (!userToken) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  // if (role === "admin" || role === "superadmin") {
  //   return <AdminTabNavigator role={role} />;
  // }

  if (role === "admin" || role === "superadmin") {
    return <AdminTabNavigator role={role} />;
  } else if (role === "user") {
    return <MainTabNavigator />;
  } else {
    return <UserStack />;
  }

  return <UserStack />;
}
