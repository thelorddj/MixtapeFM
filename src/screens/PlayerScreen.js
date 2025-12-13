import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  AppState,
} from 'react-native';
import TrackPlayer, { State, usePlaybackState, Capability } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import SocialButtons from '../components/SocialButtons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function PlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState({ song: 'Mixtape FM' });
  const playbackState = usePlaybackState();
  const appState = useRef(AppState.currentState);
  const playerReady = useRef(false); // 🔥 Bandera para saber si el player está listo

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
          duration: 0,
        });

        await TrackPlayer.updateOptions({
          progressUpdateEventInterval: 0,
          android: {
            appKilledPlaybackBehavior: 'PausePlayback',
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

        playerReady.current = true; // 🔥 Player listo

      } catch (e) {
        console.log('Player ya inicializado:', e);
        playerReady.current = true; // 🔥 Asumimos que ya estaba listo
      }
    };
    setupPlayer();

    return () => {
      playerReady.current = false;
      TrackPlayer.stop();
      TrackPlayer.reset();
    };
  }, []);

  // KILL PLAYER AL CERRAR APP - 🔥 CON VALIDACIÓN
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState === 'background' &&
        playerReady.current // 🔥 Solo actúa si el player está listo
      ) {
        try {
          const state = await TrackPlayer.getState();
          if (state === State.Playing) {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
          }
        } catch (error) {
          console.log('Error al detener player:', error);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // METADATA - Solo canción, sin listeners
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get('https://radio.mixtapefm.xyz/api/nowplaying/1', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          timeout: 5000,
        });
        const data = response.data;
        
        const newSong = data.now_playing?.song?.text || 'Mixtape FM';
        
        setMetadata(prev => {
          if (prev.song !== newSong) {
            return { song: newSong };
          }
          return prev;
        });
      } catch (error) {
        console.log('Error metadata:', error.message);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sincronizar estado del reproductor
  useEffect(() => {
    const currentState = playbackState?.state ?? playbackState;
    setIsPlaying(currentState === State.Playing);
  }, [playbackState]);

  // BUFFER FLUSH - Stop completo y reconexión
  async function togglePlayback() {
    try {
      setIsLoading(true);
      const state = await TrackPlayer.getState();
      
      if (state === State.Playing) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      } else {
        await TrackPlayer.reset();
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
      <Text style={styles.tagline}>De los cassettes al streaming</Text>

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
            size={isTablet ? 70 : 50}
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
    paddingVertical: isTablet ? 60 : 40,
    paddingHorizontal: isTablet ? 40 : 20,
  },
  logoContainer: {
    marginBottom: isTablet ? 25 : 15,
    marginTop: isTablet ? 30 : 20,
  },
  logo: {
    width: isTablet ? 200 : 140,
    height: isTablet ? 200 : 140,
  },
  radioName: {
    fontSize: isTablet ? 48 : 32,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: isTablet ? 12 : 8,
  },
  tagline: {
    fontSize: isTablet ? 22 : 16,
    color: '#ffffffff',
    marginBottom: isTablet ? 35 : 25,
  },
  metadataContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 30 : 20,
    minHeight: isTablet ? 80 : 60,
    justifyContent: 'center',
    paddingHorizontal: isTablet ? 50 : 30,
  },
  songText: {
    fontSize: isTablet ? 20 : 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  playButton: {
    width: isTablet ? 140 : 100,
    height: isTablet ? 140 : 100,
    borderRadius: isTablet ? 70 : 50,
    backgroundColor: '#0c0000ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isTablet ? 70 : 50,
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: '#e91010ff',
  },
});