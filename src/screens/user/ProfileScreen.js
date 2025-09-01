import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from '../../api/axiosInstance';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);




  console.log("profile" ,profile);
  
  useEffect(() => {
    axios.get('/auth/me')
      .then(res => setProfile(res.data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/auth/me', profile);
      Alert.alert('Saved', 'Profile updated!');
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
    setSaving(false);
  };

  if (!profile)
    return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <TextInput
        style={styles.inp}
        value={profile.name}
        onChangeText={v => setProfile({ ...profile, name: v })}
        editable={editing}
        placeholder="Name"
      />
      <TextInput
        style={styles.inp}
        value={profile.email}
        editable={false}
        placeholder="Email"
      />
      <TextInput
        style={styles.inp}
        value={profile.phone || ''}
        onChangeText={v => setProfile({ ...profile, phone: v })}
        editable={editing}
        placeholder="Phone"
      />
      <TextInput
        style={styles.inp}
        value={profile.region || ''}
        onChangeText={v => setProfile({ ...profile, region: v })}
        editable={editing}
        placeholder="Region"
      />
      <View style={{ flexDirection: 'row', marginTop: 25 }}>
        {!editing ? (
          <Button title="Edit Profile" onPress={() => setEditing(true)} />
        ) : (
          <>
            <Button title={saving ? "Saving..." : "Save"} onPress={handleSave} disabled={saving} />
            <View style={{ width: 14 }} />
            <Button title="Cancel" color="#ea580c" onPress={() => setEditing(false)} disabled={saving} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  inp: { height: 48, borderWidth: 1, borderRadius: 5, borderColor: '#ccc', marginBottom: 18, paddingHorizontal: 14, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 14 }
});
