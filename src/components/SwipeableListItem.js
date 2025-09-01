import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const SwipeableListItem = ({ children, onSwipeLeft, onSwipeRight }) => {
  const renderLeftActions = () => (
    <TouchableOpacity
      style={[styles.actionButton, styles.leftAction]}
      onPress={onSwipeLeft}
    >
      <Text style={styles.actionText}>Approve</Text>
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.actionButton, styles.rightAction]}
      onPress={onSwipeRight}
    >
      <Text style={styles.actionText}>Reject</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  leftAction: { backgroundColor: "#22c55e" },
  rightAction: { backgroundColor: "#ef4444" },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SwipeableListItem;
