// src/screens/GameScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

import { ALBUMS, RARITY_CONFIG } from '../data/albumesData';
import PuzzleBoard from '../components/PuzzleBoard';
import { Ionicons } from '@expo/vector-icons';

export default function GameScreen() {
  const [currentTab, setCurrentTab] = useState('MENU');
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentRarity, setCurrentRarity] = useState(null);

  // Selector Gacha basado en tus claves (LEGENDARY, EPIC, RARE, NORMAL)
  const startNewGame = () => {
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

    // Filtrar catálogo usando 'selectedRarityKey'
    const availableAlbums = ALBUMS.filter(
      (album) => album.rarity === selectedRarityKey
    );

    const albumToPlay =
      availableAlbums.length > 0
        ? availableAlbums[Math.floor(Math.random() * availableAlbums.length)]
        : ALBUMS[Math.floor(Math.random() * ALBUMS.length)];

    setCurrentRarity(rarityConfig);
    setCurrentAlbum(albumToPlay);
    setCurrentTab('PLAY');
  };

  const handleWin = () => {
    Alert.alert(
      '¡FELICIDADES!',
      `Completaste "${currentAlbum.title}". ¡Disco guardado!`,
      [{ text: 'Aceptar', onPress: () => setCurrentTab('MENU') }]
    );
  };

  const handleGameOver = () => {
    Alert.alert(
      '¡TIEMPO AGOTADO!',
      'Se acabaron los 60 segundos. ¡Inténtalo de nuevo!',
      [{ text: 'Aceptar', onPress: () => setCurrentTab('MENU') }]
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'PLAY':
        return currentAlbum && currentRarity ? (
          <View style={styles.centerContent}>
            <PuzzleBoard
              album={currentAlbum}
              rarityConfig={currentRarity}
              onWin={handleWin}
              onGameOver={handleGameOver}
            />
          </View>
        ) : null;

      case 'COLLECTION':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.retroText}>[ MI COLECCIÓN ]</Text>
            <Text style={styles.subText}>Discos desbloqueados</Text>
          </View>
        );

      case 'SHOP':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.retroText}>[ TIENDA DE ITEMS ]</Text>
            <Text style={styles.subText}>Próximamente: Items y boosts</Text>
          </View>
        );

      case 'MENU':
      default:
        return (
          <View style={styles.centerContent}>
            <Text style={styles.titleText}>CASSETTE RIDERS</Text>
            <TouchableOpacity style={styles.bigPlayButton} onPress={startNewGame}>
              <Text style={styles.playButtonText}>¡JUGAR!</Text>
            </TouchableOpacity>
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
          style={[
            styles.tabButton,
            currentTab === 'COLLECTION' && styles.tabButtonActive,
          ]}
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
  container: { flex: 1, backgroundColor: '#121212' },
  screenBody: { flex: 1 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFBE0B',
    marginBottom: 30,
    letterSpacing: 2,
  },
  retroText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
  subText: { fontSize: 14, color: '#AAA', marginTop: 10 },
  bigPlayButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  playButtonText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
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