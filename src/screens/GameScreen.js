// src/screens/GameScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

// IMPORTANTE: Asegúrate de tener estas imágenes en tu carpeta assets/game/
// Cambia las rutas según el nombre y formato de tus archivos reales
import iconPlay from '../../assets/game/Play.png';
import iconCollection from '../../assets/game/Colecciones.png';
import iconShop from '../../assets/game/Shop.png';

export default function GameScreen() {
  // Estado para saber en qué sección interna del juego estamos
  // Valores posibles: 'MENU', 'PLAY', 'COLLECTION', 'SHOP'
  const [currentTab, setCurrentTab] = useState('MENU');

  // Renders dinámicos según la pestaña activa
  const renderContent = () => {
    switch (currentTab) {
      case 'PLAY':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.retroText}>[ TABLERO DE JUEGO ]</Text>
            {/* Aquí montaremos el componente PuzzleBoard.js */}
          </View>
        );
      case 'COLLECTION':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.retroText}>[ MI COLECCIÓN ]</Text>
            {/* Aquí montaremos el componente CollectionView.js */}
          </View>
        );
      case 'SHOP':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.retroText}>[ TIENDA DE ITEMS ]</Text>
            {/* Aquí montaremos la tienda de comodines */}
          </View>
        );
      case 'MENU':
      default:
        return (
          <View style={styles.centerContent}>
            <Text style={styles.titleText}>PUZZLE BEAT 16-BIT</Text>
            <TouchableOpacity
              style={styles.bigPlayButton}
              onPress={() => setCurrentTab('PLAY')}
            >
              <Text style={styles.playButtonText}>¡JUGAR!</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Área donde se carga la vista seleccionada */}
      <View style={styles.screenBody}>{renderContent()}</View>

      {/* BARRA INFERIOR INTERNA DEL JUEGO */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'MENU' && styles.tabButtonActive,
          ]}
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
          style={[
            styles.tabButton,
            currentTab === 'SHOP' && styles.tabButtonActive,
          ]}
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
    backgroundColor: '#121212', // Fondo oscuro retro
  },
  screenBody: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  /* ESTILOS DE LA BARRA INFERIOR INTERNA */
  bottomBar: {
    flexDirection: 'row',
    height: 70,
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
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  tabLabel: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: 'bold',
  },
});