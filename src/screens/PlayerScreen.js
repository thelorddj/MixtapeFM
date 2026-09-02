import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  AppState,
} from 'react-native';
import TrackPlayer, { 
  State, 
  usePlaybackState, 
  Capability,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import SocialButtons from '../components/SocialButtons';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import KeepAwake from 'react-native-keep-awake';

const STREAM_URL = 'https://radio.mixtapefm.xyz/radio/8000/radio.acc+';
const METADATA_URL = 'https://radio.mixtapefm.xyz/api/nowplaying/1';
const KEEPALIVE_INTERVAL = 90000; // 90 segundos
const MAX_RECONNECT_ATTEMPTS = 5;

export default function PlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState({ song: 'Mixtape FM', listeners: 0 });
  const [isConnected, setIsConnected] = useState(true);
  const playbackState = usePlaybackState();
  const reconnectAttempts = useRef(0);
  const keepAliveTimer = useRef(null);
  const lastPlayingCheck = useRef(Date.now());
  const isManualPause = useRef(false);

  // 🔥 Monitor de red
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);
      
      if (connected && isPlaying && !isManualPause.current) {
        // Red volvió y estábamos reproduciendo
        console.log('🌐 Red restaurada, verificando stream...');
        setTimeout(() => verifyAndReconnect(), 1000);
      }
    });

    return () => unsubscribe();
  }, [isPlaying]);

  // 🔥 Listener de errores con auto-reconexión
  useTrackPlayerEvents([Event.PlaybackError], async (event) => {
    console.log('🔴 Error de reproducción:', event);
    if (!isManualPause.current) {
      await handleReconnect('error');
    }
  });

  // 🔥 Monitor de estado de playback
  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    console.log('📊 Estado cambiado:', event.state);
    
    // Si se detuvo inesperadamente y no fue pausa manual
    if (event.state === State.Stopped && isPlaying && !isManualPause.current) {
      console.log('⚠️ Stream detenido inesperadamente');
      await handleReconnect('stopped');
    }
  });

  // 🔥 KeepAlive - Mantiene conexión viva
  useEffect(() => {
    if (isPlaying && !isManualPause.current) {
      keepAliveTimer.current = setInterval(async () => {
        try {
          const state = await TrackPlayer.getState();
          const now = Date.now();
          
          // Si lleva más de 2 minutos sin verificar y está "playing"
          if (state === State.Playing && (now - lastPlayingCheck.current) > 120000) {
            console.log('🔄 KeepAlive: Refrescando buffer...');
            // Micro-reset del buffer sin pausar
            await TrackPlayer.seekTo(0);
            lastPlayingCheck.current = now;
          }
          
          // Verifica que realmente esté sonando
          if (state !== State.Playing && state !== State.Buffering) {
            console.log('⚠️ KeepAlive: Stream no está reproduciendo');
            await handleReconnect('keepalive');
          } else {
            lastPlayingCheck.current = now;
          }
        } catch (error) {
          console.error('Error en KeepAlive:', error);
        }
      }, KEEPALIVE_INTERVAL);
    } else {
      if (keepAliveTimer.current) {
        clearInterval(keepAliveTimer.current);
        keepAliveTimer.current = null;
      }
    }

    return () => {
      if (keepAliveTimer.current) {
        clearInterval(keepAliveTimer.current);
      }
    };
  }, [isPlaying]);

  // 🔥 Manejo de app en background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && isPlaying && !isManualPause.current) {
        console.log('📱 App volvió al frente, verificando stream...');
        setTimeout(() => verifyAndReconnect(), 500);
      }
    });

    return () => subscription.remove();
  }, [isPlaying]);

  // 🔥 Verificar y reconectar si es necesario
  const verifyAndReconnect = async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state !== State.Playing && state !== State.Buffering && !isManualPause.current) {
        console.log('🔄 Stream no está activo, reconectando...');
        await handleReconnect('verify');
      }
    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  };

  // 🔥 Manejo inteligente de reconexión
  const handleReconnect = async (reason) => {
    try {
      // Prevenir reconexiones múltiples simultáneas
      if (isLoading) {
        console.log('⏳ Reconexión ya en progreso...');
        return;
      }

      // Límite de intentos
      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        console.log('❌ Máximo de intentos alcanzado');
        setIsPlaying(false);
        isManualPause.current = true;
        alert('No se pudo mantener la conexión. Por favor, verifica tu señal de internet e intenta de nuevo.');
        reconnectAttempts.current = 0;
        return;
      }

      reconnectAttempts.current++;
      console.log(`🔄 Intento de reconexión ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS} (razón: ${reason})`);

      setIsLoading(true);
      
      // Espera progresiva entre intentos
      const delay = Math.min(reconnectAttempts.current * 1000, 5000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Reset completo
      await TrackPlayer.reset();
      
      // Agregar track con headers de keepalive
      await TrackPlayer.add({
        id: 'livestream',
        url: STREAM_URL,
        title: 'Mixtape FM',
        artist: 'En Vivo',
        artwork: require('../../assets/images/logo.png'),
        isLiveStream: true,
        duration: 0,
        headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'User-Agent': 'MixtapeFM/1.0.3',
        },
      });
      
      await TrackPlayer.play();
      
      // Reset contador en reconexión exitosa
      setTimeout(() => {
        reconnectAttempts.current = 0;
      }, 5000);
      
      lastPlayingCheck.current = Date.now();
      console.log('✅ Reconectado exitosamente');
      
    } catch (error) {
      console.error('Error en reconexión:', error);
      setIsLoading(false);
      
      // Reintenta después de delay
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => handleReconnect(reason), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar TrackPlayer
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        
        await TrackPlayer.add({
          id: 'livestream',
          url: STREAM_URL,
          title: 'Mixtape FM',
          artist: 'En Vivo',
          artwork: require('../../assets/images/logo.png'),
          isLiveStream: true,
          duration: 0,
          headers: {
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'User-Agent': 'MixtapeFM/1.0.3',
          },
        });

        await TrackPlayer.updateOptions({
          progressUpdateEventInterval: 0,
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
        const response = await axios.get(METADATA_URL);
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
    const playing = currentState === State.Playing;
    setIsPlaying(playing);
    
    if (playing) {
      lastPlayingCheck.current = Date.now();
    }
  }, [playbackState]);

  // 🔥 Toggle con manejo de pausa manual
  async function togglePlayback() {
    try {
      setIsLoading(true);
      const state = await TrackPlayer.getState();
      
      if (state === State.Playing) {
        // Pausa manual
        isManualPause.current = true;
        await TrackPlayer.reset(); 
        setIsPlaying(false);
        reconnectAttempts.current = 0;
        console.log('⏸️ Pausado manualmente');
      } else {
        // Play manual
        isManualPause.current = false;
        reconnectAttempts.current = 0;
        
        await TrackPlayer.reset();
        
        await TrackPlayer.add({
          id: 'livestream',
          url: STREAM_URL,
          title: 'Mixtape FM',
          artist: 'En Vivo',
          artwork: require('../../assets/images/logo.png'),
          isLiveStream: true,
          duration: 0,
          headers: {
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'User-Agent': 'MixtapeFM/1.0.3',
          },
        });
        
        await TrackPlayer.play();
        lastPlayingCheck.current = Date.now();
        console.log('▶️ Reproduciendo');
      }
    } catch (error) {
      console.error('Error al reproducir:', error);
      alert('No se pudo conectar con la radio. Verifica tu conexión a internet.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* KeepAwake cuando está reproduciendo */}
      {isPlaying && <KeepAwake />}
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.radioName}>Mixtape FM</Text>
      <Text style={styles.tagline}>De los cassette al streaming</Text>

      {/* Indicador de conexión */}
      {!isConnected && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={16} color="#ff9800" />
          <Text style={styles.warningText}>Sin conexión a internet</Text>
        </View>
      )}

      <View style={styles.metadataContainer}>
        <Text style={styles.songText}>
          {isPlaying ? metadata.song : 'Presiona Play para escuchar'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={togglePlayback}
        disabled={isLoading || !isConnected}
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
    justifyContent: 'space-between',
    paddingVertical: 12,       // ← Reducido ligeramente para evitar desbordes
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 5,
    marginTop: 10,             // ← Ajustado para no empujar hacia abajo
  },
  logo: {
    width: 120,                // ← Reducido de 140 a 120 para ganar espacio vertical
    height: 120,
  },
  radioName: {
    fontSize: 28,              // ← Reducido de 32 a 28
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 15,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
    gap: 6,
  },
  warningText: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: '600',
  },
  metadataContainer: {
    alignItems: 'center',
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  songText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  playButton: {
    width: 90,                  // ← Ligeramente más compacto
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0c0000ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,           // ← Cambiado de 50 a 15 para dejar respirar a SocialButtons
    elevation: 5,
  },
  playButtonActive: {
    backgroundColor: '#e91010ff',
  },
});