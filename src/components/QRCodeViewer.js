import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function QRCodeViewer({ uri, caption }) {
  if (!uri) return null;
  return (
    <View style={styles.wrap}>
      <Image source={{ uri }} style={styles.qr} />
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems:'center', marginVertical:8 },
  qr: { width:160, height:160, borderRadius:7, backgroundColor:'#fff', marginBottom:6 },
  caption: { fontSize:14, color:'#222', marginTop:2 }
});
