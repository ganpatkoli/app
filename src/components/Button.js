import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Button({ title, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height:48, backgroundColor:'#007bff', borderRadius:6,
    justifyContent:'center', alignItems:'center', marginVertical:6
  },
  text: { color:'#fff', fontWeight:'bold', fontSize:16 },
  disabled: { backgroundColor:'#b2cced' }
});
