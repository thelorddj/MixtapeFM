// src/screens/GameScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';

import { ALBUMS_CATALOG, RARITIES } from '../data/albumesData';
import PuzzleBoard from '../components/PuzzleBoard';

// Ajusta las rutas según el nombre exacto de tus imágenes de íconos en assets
import iconPlay from '../../assets/game/icon_play.png';
import iconCollection from '../../assets/game/icon_collection.png';
import iconShop from '../../assets/game/icon_shop.png';

export default function GameScreen() {
  const [currentTab, setCurrentTab] = useState('MENU'); // 'MENU', 'PLAY', 'COLLECTION', 'SHOP'
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentRarity, setCurrentRarity] = useState(null);

  // Función Gacha: Selecciona rareza según probabilidades y elige un álbum al azar
  const startNewGame = () => {
    const random = Math.floor(Math.random() * 100) + 1; // Número entre 1 y 100
    let selectedRarityKey = 'NORMAL';

    if (random <= RARITIES.LEYENDA.dropChance) {
      selectedRarityKey = 'LEYENDA'; // 5%
    } else if (random <= RARITIES.LEYENDA.dropChance + RARITIES.EPICO.dropChance) {
      selectedRarityKey = 'EPICO'; // 10%
    } else if (
      random <=
      RARITIES.LEYENDA.dropChance + RARITIES.EPICO.dropChance + RARITIES.RARO.dropChance
    ) {
      selectedRarityKey = 'RARO'; // 25%
    } else {
      selectedRarityKey = 'NORMAL'; // 60%
    }

    const rarityConfig = RARITIES[selectedRarityKey];
    
    // Filtrar catálogo por la rareza obtenida
    const availableAlbums = ALBUMS_CATALOG.filter(
      (album) => album.rarity === rarityConfig.id
    );

    // Si no hay álbumes en esa rareza, tomamos uno al azar del catálogo completo como respaldo
    const albumToPlay =
      availableAlbums.length > 0
        ? availableAlbums[Math.floor(Math.random() * availableAlbums.length)]
        : ALBUMS_CATALOG[Math.floor(Math.random() * ALBUMS_CATALOG.length)];

    setCurrentRarity(rarityConfig);
    setCurrentAlbum(albumToPlay);
    setCurrentTab('PLAY');
  };

  // Manejadores del resultado de la partida
  const handleWin = () => {
    Alert.alert(
      '¡FELICIDADES!',
      `Has completado el puzzle de "${currentAlbum.title}". ¡Disco añadido a tu colección!`,
      [{ text: 'Aceptar', onPress: () => setCurrentTab('MENU') }]
    );
  };

  const handleGameOver = () => {
    Alert.alert(
      '¡TIEMPO AGOTADO!',
      'Se acabó el tiempo de 60 segundos. ¡Inténtalo de nuevo!',
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
            <Text style={styles.subText}>Aquí aparecerán tus discos desbloqueados</Text>
          </View>
        );

      case 'SHOP':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.retroText}>[ TIENDA DE ITEMS ]</Text>
            <Text style={styles.subText}>Próximamente: Rebobinadores de tiempo</Text>
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

      {/* BARRA INFERIOR INTERNA DEL JUEGO */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'MENU' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('MENU')}
        >
          <Image source={iconPlay} style={styles.iconStyle} />
          <Text style={styles.tabLabel}>Jugar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'COLLECTION' && styles.tabButtonActive,
          ]}
          onPress={() => setCurrentTab('COLLECTION')}
        >
          <Image source={iconCollection} style={styles.iconStyle} />
          <Text style={styles.tabLabel}>Colección</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'SHOP' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('SHOP')}
        >
          <Image source={iconShop} style={styles.iconStyle} />
          <Text style={styles.tabLabel}>Tienda</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  screenBody: {
    flex: 1,
  },
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
  retroText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 10,
  },
  bigPlayButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    height: 65,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#e91e63',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFBE0B',
  },
  iconStyle: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  tabLabel: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: 'bold',
  },
});