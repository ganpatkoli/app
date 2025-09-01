import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { Ionicons } from "@expo/vector-icons"; // Or react-native-vector-icons
import TripListScreen from "../screens/user/TripListScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";
import PlanListScreen from "../screens/packages/PlanListScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import SettingsScreen from "../screens/user/SettingsScreen";
import TripsDetails from "../screens/user/TripsDetails";
import CreateBookingScreen from "../screens/user/CreateBookingScreen";
import ViewBokingInfo from "../screens/user/ViewBokingInfo";

import PurchasePackageScreen from "../screens/packages/PurchasePackageScreen";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function MainTabNavigator() {

  // Trips flow
  function TripsStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="AllTrips"
          component={TripListScreen}
          options={{ title: "Trips" }}
        />
        <Stack.Screen
          name="TripDetails"
          component={TripsDetails}
          options={{ title: "Trip Details" }}
        />
        <Stack.Screen
          name="CreateBooking"
          component={CreateBookingScreen}
          options={{ title: "Edit Trip" }}
        />
      </Stack.Navigator>
    );
  }

  // Trips flow
  function BookingStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="AllBookings"
          component={MyBookingsScreen}
          options={{ title: "Bookings" }}
        />

        <Stack.Screen
          name="ViewBookingInfo"
          component={ViewBokingInfo}
          options={{ title: "Booking Details" }}
        />
      </Stack.Navigator>
    );
  }



  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === "Trips") icon = "bus";
          else if (route.name === "Bookings") icon = "ticket";
          else if (route.name === "Plans") icon = "pricetag";
          else if (route.name === "Profile") icon = "person";
          else if (route.name === "Settings") icon = "settings";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Trips" component={TripsStack} />
      <Tab.Screen name="Bookings" component={BookingStack} />
      <Tab.Screen name="Plans" component={PlanListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
