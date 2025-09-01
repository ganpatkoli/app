// import React from "react";
// import { createStackNavigator } from "@react-navigation/stack";

// // Importing all admin related screens
// import QRVerifyScreen from "../screens/admin/QRVerifyScreen";
// import PendingAgentsScreen from "../screens/admin/PendingAgentsScreen";
// import TripBookingsScreen from "../screens/admin/TripBookingsScreen";
// import MonthlyStatsScreen from "../screens/analytics/MonthlyStatsScreen";
// import AgentLeaderboardScreen from "../screens/analytics/AgentLeaderboardScreen";
// import BookingsByPackageScreen from "../screens/analytics/BookingsByPackageScreen";
// import PurchasePackageScreen from "../screens/packages/PurchasePackageScreen";

// const Stack = createStackNavigator();

// export default function AdminStack() {
//   return (
//     <Stack.Navigator
//       initialRouteName="QRVerify"
//       screenOptions={{ headerShown: true }}
//     >
//       <Stack.Screen
//         name="QRVerify"
//         component={QRVerifyScreen}
//         options={{ title: "QR Code Verification" }}
//       />
//       <Stack.Screen
//         name="PendingAgents"
//         component={PendingAgentsScreen}
//         options={{ title: "Pending Agents" }}
//       />
//       <Stack.Screen
//         name="TripBookings"
//         component={TripBookingsScreen}
//         options={{ title: "Trip Bookings" }}
//       />
//       <Stack.Screen
//         name="MonthlyStats"
//         component={MonthlyStatsScreen}
//         options={{ title: "Monthly Stats" }}
//       />
//       <Stack.Screen
//         name="AgentLeaderboard"
//         component={AgentLeaderboardScreen}
//         options={{ title: "Agent Leaderboard" }}
//       />
//       <Stack.Screen
//         name="BookingsByPackage"
//         component={BookingsByPackageScreen}
//         options={{ title: "Bookings by Package" }}
//       />
//       <Stack.Screen
//         name="Settings"
//         component={SettingsScreen}
//         options={{ title: "Settings" }}
//       />
//       <Stack.Screen
//         name="PurchasePackage"
//         component={PurchasePackageScreen}
//         options={{ title: "PurchasePackage" }}
//       />
//     </Stack.Navigator>
//   );
// }
