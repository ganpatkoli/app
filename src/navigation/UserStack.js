import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TripListScreen from "../screens/user/TripListScreen";
import CreateBookingScreen from "../screens/user/CreateBookingScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import SettingsScreen from "../screens/user/SettingsScreen";

const Stack = createStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Trips" component={TripListScreen} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      
    </Stack.Navigator>
  );
}
