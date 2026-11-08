// src/screens/GameScreen.js
// Beta v1 — 2026-11-07
// Estilo pixel art / retro. Menú: tocadiscos con el planeta Tierra en el
// centro (música mundial), con JUGAR en el centro y Colección y Tienda a los
// lados. La tienda NO usa dinero real: solo monedas del juego, que se ganan
// completando puzzles o con la tarea "Escuchar la radio 15 minutos".
// Persistencia: AsyncStorage (@react-native-async-storage/async-storage).
// IMPORTANTE: después de aplicar el parche hay que correr `npm install`
// (o `npx expo install @react-native-async-storage/async-storage`).
// La colección y las monedas se guardan y sobreviven al cerrar la app.
// Duplicados: un álbum repetido SÍ puede volver a salir y da sus monedas
// de rareza; no bloquea la colección.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ALBUMS, RARITY_CONFIG, POWERUP_DEFS } from '../data/albumesData';
import PuzzleBoard from '../components/PuzzleBoard';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEYS = {
  collection: 'cassette-riders:collection',
  coins: 'cassette-riders:coins',
  powerUps: 'cassette-riders:powerups',
  radioClaim: 'cassette-riders:radio-claim-date',
};

const MAX_LIVES = 3;
const STARTING_COINS = 50;
const RADIO_TASK_COINS = 20;
const HERO_IMAGE = require('../../assets/game/hero-turntable-earth.png');

export default function GameScreen() {
  const [currentTab, setCurrentTab] = useState('MENU');
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentRarity, setCurrentRarity] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [collection, setCollection] = useState([]);
  const [coins, setCoins] = useState(STARTING_COINS);
  const [powerUps, setPowerUps] = useState({ HINT: 1, TIME: 1, FREEZE: 0 });
  const [radioClaimedToday, setRadioClaimedToday] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // --- Cargar progreso guardado ---
  useEffect(() => {
    (async () => {
      try {
        const [savedCollection, savedCoins, savedPowerUps, savedClaim] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.collection),
            AsyncStorage.getItem(STORAGE_KEYS.coins),
            AsyncStorage.getItem(STORAGE_KEYS.powerups),
            AsyncStorage.getItem(STORAGE_KEYS.radioClaim),
          ]);
        if (savedCollection) setCollection(JSON.parse(savedCollection));
        if (savedCoins !== null) setCoins(Number(savedCoins));
        if (savedPowerUps) setPowerUps(JSON.parse(savedPowerUps));
        if (savedClaim === new Date().toDateString()) setRadioClaimedToday(true);
      } catch (e) {
        // Sin persistencia en esta sesión: se juega con el estado en memoria.
        console.log('Cassette Riders: no se pudo cargar el progreso guardado', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // --- Guardar progreso cuando cambia ---
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(collection)).catch(() => {});
  }, [collection, loaded]);
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.coins, String(coins)).catch(() => {});
  }, [coins, loaded]);
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.powerups, JSON.stringify(powerUps)).catch(() => {});
  }, [powerUps, loaded]);

  // Selector Gacha: primero la rareza por dropRate, luego un álbum al azar
  // dentro de esa rareza. Las rarezas altas salen menos (condicionado).
  const startNewGame = useCallback(() => {
    const random = Math.floor(Math.random() * 100) + 1;
    let selectedRarityKey = 'NORMAL';
    if (random <= RARITY_CONFIG.LEGENDARY.dropRate) {
      selectedRarityKey = 'LEGENDARY'; // 5%
    } else if (
      random <=
      RARITY_CONFIG.LEGENDARY.dropRate + RARITY_CONFIG.EPIC.dropRate
    ) {
      selectedRarityKey = 'EPIC'; // 10%
    } else if (
      random <=
      RARITY_CONFIG.LEGENDARY.dropRate +
        RARITY_CONFIG.EPIC.dropRate +
        RARITY_CONFIG.RARE.dropRate
    ) {
      selectedRarityKey = 'RARE'; // 20%
    } else {
      selectedRarityKey = 'NORMAL'; // 65%
    }
    const rarityConfig = RARITY_CONFIG[selectedRarityKey];
    const availableAlbums = ALBUMS.filter(
      (album) => album.rarity === selectedRarityKey
    );
    const albumToPlay =
      availableAlbums.length > 0
        ? availableAlbums[Math.floor(Math.random() * availableAlbums.length)]
        : ALBUMS[Math.floor(Math.random() * ALBUMS.length)];
    setCurrentRarity(rarityConfig);
    setCurrentAlbum(albumToPlay);
    setLives(MAX_LIVES);
    setGameKey((k) => k + 1);
    setCurrentTab('PLAY');
  }, []);

  const handleWin = useCallback(() => {
    if (!currentAlbum || !currentRarity) return;
    const reward = currentRarity.coinsOnWin || 10;
    const isNew = !collection.includes(currentAlbum.id);
    if (isNew) setCollection((prev) => [...prev, currentAlbum.id]);
    setCoins((prev) => prev + reward);
    Alert.alert(
      isNew ? '¡NUEVO DISCO!' : '¡FELICIDADES!',
      isNew
        ? `Completaste "${currentAlbum.title}". ¡Disco guardado en tu colección! +${reward} monedas.`
        : `Completaste "${currentAlbum.title}" otra vez. Disco repetido: +${reward} monedas.`,
      [{ text: 'Aceptar', onPress: () => setCurrentTab('MENU') }]
    );
  }, [currentAlbum, currentRarity, collection]);

  const handleGameOver = useCallback(() => {
    if (!currentRarity) return;
    const remaining = lives - 1;
    setLives(remaining);
    if (remaining > 0) {
      Alert.alert(
        '¡TIEMPO AGOTADO!',
        `Se acabaron los ${currentRarity.timeLimit} segundos. Perdiste una vida, te quedan ${remaining}.`,
        [
          {
            text: 'Reintentar',
            onPress: () => setGameKey((k) => k + 1),
          },
          { text: 'Salir al menú', onPress: () => setCurrentTab('MENU') },
        ]
      );
    } else {
      Alert.alert(
        'SIN VIDAS',
        'Se acabaron tus 3 vidas. La sesión terminó, ¡inténtalo de nuevo!',
        [{ text: 'Aceptar', onPress: () => setCurrentTab('MENU') }]
      );
    }
  }, [currentRarity, lives]);

  const handlePowerUpUsed = useCallback((id) => {
    setPowerUps((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  }, []);

  const buyPowerUp = (id) => {
    const def = POWERUP_DEFS[id];
    if (!def) return;
    if (coins < def.price) {
      Alert.alert('Sin monedas', `Te faltan monedas para ${def.label}. Gana monedas completando puzzles o escuchando la radio.`);
      return;
    }
    setCoins((prev) => prev - def.price);
    setPowerUps((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const claimRadioTask = async () => {
    // Simplificación beta: en esta versión el botón reclama la recompensa
    // de "Escuchar la radio 15 minutos" (una vez al día). El seguimiento
    // real de minutos de reproducción llega después; por ahora se confía
    // en que el jugador escuchó la radio.
    if (radioClaimedToday) return;
    setCoins((prev) => prev + RADIO_TASK_COINS);
    setRadioClaimedToday(true);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.radioClaim,
        new Date().toDateString()
      );
    } catch (e) {
      // No pasa nada: la recompensa ya se dio en esta sesión.
    }
    Alert.alert(
      '¡Tarea completada!',
      `Escuchaste la radio 15 minutos. +${RADIO_TASK_COINS} monedas.`
    );
  };

  const renderCollection = () => (
    <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
      <Text style={styles.retroText}>[ MI COLECCIÓN ]</Text>
      <Text style={styles.subText}>
        {collection.length} / {ALBUMS.length} discos desbloqueados
      </Text>
      {ALBUMS.map((album) => {
        const unlocked = collection.includes(album.id);
        const config = RARITY_CONFIG[album.rarity];
        return (
          <View
            key={album.id}
            style={[styles.collectionRow, !unlocked && styles.collectionRowLocked]}
          >
            <Text style={[styles.collectionDot, { color: config.color }]}>●</Text>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionTitle}>
                {unlocked ? album.title : '???'}
              </Text>
              <Text style={styles.collectionArtist}>
                {unlocked ? album.artist : 'Disco por descubrir'}
              </Text>
            </View>
            <Text style={[styles.collectionRarity, { color: config.color }]}>
              {config.label.toUpperCase()}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderShop = () => (
    <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
      <Text style={styles.retroText}>[ TIENDA ]</Text>
      <Text style={styles.subText}>Sin dinero real: solo monedas del juego.</Text>
      <Text style={styles.coinsText}>🪙 {coins} monedas</Text>
      {Object.values(POWERUP_DEFS).map((def) => (
        <View key={def.id} style={styles.shopRow}>
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionTitle}>
              {def.label} ×{powerUps[def.id] || 0}
            </Text>
            <Text style={styles.collectionArtist}>{def.description}</Text>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, coins < def.price && styles.buyButtonDisabled]}
            onPress={() => buyPowerUp(def.id)}
            disabled={coins < def.price}
          >
            <Text style={styles.buyButtonText}>🪙 {def.price}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.shopRow}>
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionTitle}>Escuchar la radio 15 min</Text>
          <Text style={styles.collectionArtist}>
            Tarea diaria: +{RADIO_TASK_COINS} monedas. En la beta se reclama
            con el botón (el seguimiento real de minutos llega después).
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.buyButton, radioClaimedToday && styles.buyButtonDisabled]}
          onPress={claimRadioTask}
          disabled={radioClaimedToday}
        >
          <Text style={styles.buyButtonText}>
            {radioClaimedToday ? '✓ Hecho' : 'Reclamar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'PLAY':
        return currentAlbum && currentRarity ? (
          <View style={styles.centerContent}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => setCurrentTab('MENU')}
            >
              <Text style={styles.exitButtonText}>✕ Salir (no pierdes vida)</Text>
            </TouchableOpacity>
            <PuzzleBoard
              key={`${currentAlbum.id}-${gameKey}`}
              album={currentAlbum}
              rarityConfig={currentRarity}
              lives={lives}
              powerUps={powerUps}
              onPowerUpUsed={handlePowerUpUsed}
              onWin={handleWin}
              onGameOver={handleGameOver}
            />
          </View>
        ) : null;
      case 'COLLECTION':
        return renderCollection();
      case 'SHOP':
        return renderShop();
      case 'MENU':
      default:
        return (
          <View style={styles.centerContent}>
            <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="contain" />
            <Text style={styles.titleText}>CASSETTE RIDERS</Text>
            <Text style={styles.tagline}>MÚSICA DEL MUNDO • PUZZLE DE PORTADAS</Text>
            <Text style={styles.coinsText}>
              🪙 {coins} monedas • Colección {collection.length}/{ALBUMS.length}
            </Text>
            <View style={styles.menuControls}>
              <TouchableOpacity
                style={styles.sideControl}
                onPress={() => setCurrentTab('COLLECTION')}
              >
                <Image
                  source={require('../../assets/game/Colecciones.png')}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
                <Text style={styles.controlLabel}>COLECCIÓN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bigPlayButton} onPress={startNewGame}>
                <Image
                  source={require('../../assets/game/Play.png')}
                  style={styles.playIcon}
                  resizeMode="contain"
                />
                <Text style={styles.playButtonText}>¡JUGAR!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sideControl}
                onPress={() => setCurrentTab('SHOP')}
              >
                <Image
                  source={require('../../assets/game/Shop.png')}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
                <Text style={styles.controlLabel}>TIENDA</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.menuHint}>
              3 vidas por partida • Completa el puzzle antes de que se acabe el tiempo
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenBody}>{renderContent()}</View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'MENU' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('MENU')}
        >
          <Ionicons name="game-controller" size={22} color="#FFF" />
          <Text style={styles.tabLabel}>Jugar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'COLLECTION' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('COLLECTION')}
        >
          <Ionicons name="albums" size={22} color="#FFF" />
          <Text style={styles.tabLabel}>Colección</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'SHOP' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('SHOP')}
        >
          <Ionicons name="cart" size={22} color="#FFF" />
          <Text style={styles.tabLabel}>Tienda</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0b1a' },
  screenBody: { flex: 1 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  scrollContent: { flex: 1 },
  scrollInner: { alignItems: 'center', padding: 15, paddingBottom: 30 },
  heroImage: { width: '92%', height: 200, borderRadius: 12, marginBottom: 12 },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFBE0B',
    letterSpacing: 2,
    fontFamily: 'monospace',
    textShadowColor: '#e91e63',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  tagline: {
    fontSize: 11,
    color: '#AAA',
    letterSpacing: 1,
    marginTop: 6,
    fontFamily: 'monospace',
  },
  coinsText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFBE0B',
    marginTop: 12,
    fontFamily: 'monospace',
  },
  menuControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  sideControl: {
    alignItems: 'center',
    backgroundColor: '#1a1633',
    borderWidth: 3,
    borderColor: '#e91e63',
    borderRadius: 8,
    padding: 10,
    width: 88,
  },
  controlIcon: { width: 52, height: 52 },
  controlLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  bigPlayButton: {
    alignItems: 'center',
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  playIcon: { width: 56, height: 56 },
  playButtonText: { color: '#FFF', fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' },
  menuHint: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 18,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  retroText: { fontSize: 18, color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace' },
  subText: { fontSize: 14, color: '#AAA', marginTop: 10, textAlign: 'center' },
  exitButton: { alignSelf: 'flex-start', marginBottom: 8 },
  exitButtonText: { color: '#AAA', fontSize: 13, fontWeight: 'bold' },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1a1633',
    borderWidth: 2,
    borderColor: '#e91e63',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  collectionRowLocked: { opacity: 0.55 },
  collectionDot: { fontSize: 16, marginRight: 10 },
  collectionInfo: { flex: 1 },
  collectionTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  collectionArtist: { color: '#AAA', fontSize: 12, marginTop: 2 },
  collectionRarity: { fontSize: 11, fontWeight: 'bold' },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1a1633',
    borderWidth: 2,
    borderColor: '#FFBE0B',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  buyButton: {
    backgroundColor: '#e91e63',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buyButtonDisabled: { opacity: 0.4 },
  buyButtonText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  bottomBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#e91e63',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: { alignItems: 'center', justifyContent: 'center', padding: 5 },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: '#FFBE0B' },
  tabLabel: { color: '#FFF', fontSize: 10, marginTop: 2, fontWeight: 'bold' },
});
