import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Screens
import QRVerifyScreen from "../screens/admin/QRVerifyScreen";
import PendingAgentsScreen from "../screens/admin/PendingAgentsScreen";
import TripBookingsScreen from "../screens/admin/TripBookingsScreen";
import MonthlyStatsScreen from "../screens/analytics/MonthlyStatsScreen";
import SettingsScreen from "../screens/user/SettingsScreen";
import PlanListScreen from "../screens/packages/PlanListScreen";
import PurchasePackageScreen from "../screens/packages/PurchasePackageScreen";
import CreatePackages from "../screens/packages/PackageCrud";
import AssignPackage from "../screens/packages/PackageAssign";
import AllAgents from "../screens/admin/AllAgents";
import AllTrips from "../screens/admin/AllTrips";
import TripDetails from "../screens/admin/TripDetails";
import TripEditScreen from "../screens/admin/TripEditScreen";
import UserTripBookingDetails from "../screens/admin/UserTripBookingDetails";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* ----------------- STACKS ------------------ */

// Plans flow
function PlansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="PlanList"
        component={PlanListScreen}
        options={{ title: "Plans" }}
      />
      <Stack.Screen
        name="PurchasePackage"
        component={PurchasePackageScreen}
        options={{ title: "Purchase Package" }}
      />
    </Stack.Navigator>
  );
}

// Trips flow
function TripsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AllTrips"
        component={AllTrips}
        options={{ title: "All Trips" }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetails}
        options={{ title: "Trip Details" }}
      />
      <Stack.Screen
        name="TripEdit"
        component={TripEditScreen}
        options={{ title: "Edit Trip" }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={UserTripBookingDetails}
        options={{ title: "Booking Details" }}
      />
    </Stack.Navigator>
  );
}

/* ----------------- MAIN TABS ------------------ */

export default function AdminTabNavigator({ role }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "QRVerify":
              iconName = "qr-code-outline";
              break;
            case "PendingAgents":
              iconName = "hourglass-outline";
              break;
            case "TripBookings":
              iconName = "bus";
              break;
            case "TripsStack":
              iconName = "bus";
              break;
            case "Stats":
              iconName = "stats-chart";
              break;
            case "PlansStack":
              iconName = "pricetag";
              break;
            case "CreatePackage":
              iconName = "cube-outline";
              break;
            case "AssignPackage":
              iconName = "git-compare-outline";
              break;
            case "AllAgents":
              iconName = "people-outline";
              break;
            case "Settings":
              iconName = "settings";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* SUPERADMIN ROUTES */}
      {role?.toLowerCase() === "superadmin" && (
        <>
          <Tab.Screen
            name="PendingAgents"
            component={PendingAgentsScreen}
            options={{ title: "Pending Agents" }}
          />
          <Tab.Screen
            name="CreatePackage"
            component={CreatePackages}
            options={{ title: "Manage Packages" }}
          />
          <Tab.Screen
            name="AllAgents"
            component={AllAgents}
            options={{ title: "All Agents" }}
          />
          <Tab.Screen
            name="AssignPackage"
            component={AssignPackage}
            options={{ title: "Assign Package" }}
          />
        </>
      )}

      {/* ADMIN ROUTES */}
      {role?.toLowerCase() === "admin" && (
        <>
          <Tab.Screen
            name="QRVerify"
            component={QRVerifyScreen}
            options={{ title: "QR Verify" }}
          />
          <Tab.Screen
            name="TripBookings"
            component={TripBookingsScreen}
            options={{ title: "Create Trip" }}
          />
          <Tab.Screen
            name="TripsStack"
            component={TripsStack}
            options={{ title: "All Trips" }}
          />
          <Tab.Screen
            name="Stats"
            component={MonthlyStatsScreen}
            options={{ title: "Analytics" }}
          />
          <Tab.Screen
            name="PlansStack"
            component={PlansStack}
            options={{ title: "Plans" }}
          />
        </>
      )}

      {/* COMMON SETTINGS ROUTE */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
}
