import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export default function Input({ 
  value, onChangeText, placeholder, secureTextEntry=false, keyboardType='default', error, style, ...rest 
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, style, error && styles.error]}
        {...rest}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height:48, borderWidth:1, borderColor:'#ccc',
    borderRadius:5, paddingHorizontal:14, backgroundColor:'#fff'
  },
  error: { borderColor:'#fb7185' },
  errorText: { color:'#fb7185', fontSize:13, marginTop:2 }
});
