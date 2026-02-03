import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import TrackPlayer, { State, usePlaybackState, Capability } from 'react-native-track-player';
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
      
      await TrackPlayer.add({
        id: 'livestream',
        url: 'https://radio.mixtapefm.xyz/radio/8000/radio.acc+',
        title: 'Mixtape FM',
        artist: 'En Vivo',
        artwork: require('../../assets/images/logo.png'),
        isLiveStream: true,
        duration: 0, // 🔥 NUEVO - Sin duración = sin barra
      });

      await TrackPlayer.updateOptions({
        progressUpdateEventInterval: 0, // 🔥 NUEVO - Quita barra de progreso
        android: {
          appKilledPlaybackBehavior: 'ContinuePlayback',
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
      });

    } catch (e) {
      console.log('Player ya inicializado:', e);
    }
  };
  setupPlayer();
}, []);

  // Actualizar metadata cada 10 segundos
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get('https://radio.mixtapefm.xyz/api/nowplaying/1');
        const data = response.data;
        setMetadata({
          song: data.now_playing?.song?.text || 'Mixtape FM',
          listeners: data.listeners?.current || 0
        });
      } catch (error) {
        console.log('Error metadata:', error);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sincronizar estado del reproductor
  useEffect(() => {
    const currentState = playbackState?.state ?? playbackState;
    setIsPlaying(currentState === State.Playing);
  }, [playbackState]);

  async function togglePlayback() {
  try {
    setIsLoading(true);
    const state = await TrackPlayer.getState();
    
    if (state === State.Playing) {
      // 🔥 MATA TODO - No solo pausa
      await TrackPlayer.reset(); 
      setIsPlaying(false);
    } else {
      // 🔥 RECONECTA FRESH
      await TrackPlayer.reset(); // Limpia cualquier buffer residual
      
      await TrackPlayer.add({
        id: 'livestream',
        url: 'https://radio.mixtapefm.xyz/radio/8000/radio.acc+',
        title: 'Mixtape FM',
        artist: 'En Vivo',
        artwork: require('../../assets/images/logo.png'),
        isLiveStream: true,
        duration: 0,
      });
      
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

      {/* Metadata reemplaza al status */}
      <View style={styles.metadataContainer}>
        <Text style={styles.songText}>
          {isPlaying ? metadata.song : 'Presiona Play para escuchar'}
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
            size={50}
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
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 15,
    marginTop: 20,
  },
  logo: {
    width: 140,
    height: 140,
  },
  radioName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffffff',
    marginBottom: 25,
  },
  metadataContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  songText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0c0000ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: '#e91010ff',
  },
});