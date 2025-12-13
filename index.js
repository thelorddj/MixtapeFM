import TrackPlayer from 'react-native-track-player';
import App from './App';

// Registrar servicio de reproducción
TrackPlayer.registerPlaybackService(() => require('./src/services/PlaybackService'));

registerRootComponent(App);