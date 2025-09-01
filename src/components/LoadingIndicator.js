import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingIndicator({ size='large', color='#007bff', overlay }) {
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:'rgba(255,255,255,0.6)',
    justifyContent:'center', alignItems:'center', zIndex:200
  }
});
