import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SocialButtons() {
  const openURL = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contactanos:</Text>
      <View style={styles.buttonsContainer}>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#25D366' }]}
          onPress={() => openURL('https://wa.me/5218332476207')}
        >
          <Ionicons name="logo-whatsapp" size={30} color="#fff" />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#f7f2f2ff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});