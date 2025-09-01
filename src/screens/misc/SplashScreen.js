import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* <Image source={require('../../assets/logo.png')} style={{ width:100, height:100, marginBottom:20 }} /> */}
      <Text style={styles.title}>Travel Platform</Text>
      <ActivityIndicator size="large" color="#007bff" style={{ marginTop:24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  title: { fontSize:25, fontWeight:'bold', color:'#0061b6', marginBottom:7 }
});
