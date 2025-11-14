import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import SocialButtons from '../components/SocialButtons';
import axios from 'axios';

export default function PlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState({ song: 'Mixtape FM', listeners: 0 });
  const playbackState = usePlaybackState();

  // Inicializar TrackPlayer
useEffect(() => {
  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      
      // 🔥 CONFIGURAR CONTROLES NATIVOS
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: 'ContinuePlayback',
        },
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_STOP,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
        ],
      });

      await TrackPlayer.add({
        id: 'livestream',
        url: 'https://radio.mixtapefm.xyz/radio/8000/radio.acc+',
        title: 'Mixtape FM',
        artist: 'En Vivo',
        artwork: require('../../assets/images/logo.png'),
        isLiveStream: true,
      });
    } catch (e) {
      console.log('Player ya inicializado:', e);
    }
  };
  setupPlayer();
}, []);

  // 🔧 FIX: Sincronizar estado del reproductor
  useEffect(() => {
    // Soporte para ambas versiones de react-native-track-player
    const currentState = playbackState?.state ?? playbackState;
    setIsPlaying(currentState === State.Playing);
  }, [playbackState]);

  async function togglePlayback() {
    try {
      setIsLoading(true);
      const state = await TrackPlayer.getState();
      
      if (state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error al reproducir:', error);
      alert('No se pudo conectar con la radio');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.radioName}>Mixtape FM</Text>
      <Text style={styles.tagline}>De los cassette al streaming</Text>

      <Text style={styles.status}>
        {isPlaying ? '🔴 EN VIVO' : '⚫ Detenido'}
      </Text>

      <View style={styles.metadataContainer}>
  <Text style={styles.songText}>
    {isPlaying ? metadata.song : 'Mixtape FM'}
  </Text>
</View>

      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={60}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      <SocialButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23058fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 170,
    height: 170,
  },
  radioName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffffff',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fff',
  },
  metadataContainer: {
  alignItems: 'center',
  marginBottom: 15,
  height: 50, // ← ALTURA FIJA para que no se mueva
  justifyContent: 'center',
  },
  songText: {
  fontSize: 16,
  color: '#fff',
  textAlign: 'center',
  paddingHorizontal: 20, // ← Para que no se salga
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0c0000ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: '#e91010ff',
  },
});