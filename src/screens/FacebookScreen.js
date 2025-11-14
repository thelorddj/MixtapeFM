import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function FacebookScreen() {
  // 🔴 CAMBIA ESTO por tu página de Facebook
  const facebookPageURL = 'https://www.facebook.com/Mixtapefmoficial';

  return (
    <WebView
      source={{ uri: facebookPageURL }}
      style={styles.container}
      startInLoadingState={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});