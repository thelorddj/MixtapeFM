// src/components/PuzzleBoard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_SIZE = SCREEN_WIDTH * 0.85; // Ancho del tablero dinámico (85% de la pantalla)

export default function PuzzleBoard({ album, rarityConfig, onWin, onGameOver }) {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos base

  const rows = rarityConfig.gridRows;
  const cols = rarityConfig.gridCols;
  const totalPieces = rarityConfig.totalPieces;

  // Ancho y alto de cada pieza individual en px
  const pieceWidth = BOARD_SIZE / cols;
  const pieceHeight = BOARD_SIZE / rows;

  // 1. Inicializar y mezclar el tablero
  useEffect(() => {
    initBoard();
  }, [album]);

  // 2. Temporizador de 60 segundos
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameOver && onGameOver();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Función para crear las piezas ordenadas y luego desordenarlas
  const initBoard = () => {
    let initialPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      initialPieces.push({
        id: i,
        correctIndex: i, // Posición correcta que le corresponde en la imagen completa
      });
    }

    // Mezcla aleatoria (Fisher-Yates Shuffle)
    let shuffled = [...initialPieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setPieces(shuffled);
    setSelectedPiece(null);
  };

  // Lógica para seleccionar y realizar el intercambio (Swap)
  const handlePiecePress = (index) => {
    if (selectedPiece === null) {
      // Primera pieza seleccionada
      setSelectedPiece(index);
    } else {
      // Segunda pieza seleccionada: realizamos el intercambio
      let updatedPieces = [...pieces];
      const temp = updatedPieces[selectedPiece];
      updatedPieces[selectedPiece] = updatedPieces[index];
      updatedPieces[index] = temp;

      setPieces(updatedPieces);
      setSelectedPiece(null);

      // Verificar si el jugador ya completó el rompecabezas
      checkVictory(updatedPieces);
    }
  };

  // Comprobar si cada pieza está en su índice correcto
  const checkVictory = (currentPieces) => {
    const isCompleted = currentPieces.every(
      (piece, index) => piece.correctIndex === index
    );
    if (isCompleted) {
      onWin && onWin();
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER DE INFORMACIÓN DEL JUEGO */}
      <View style={styles.headerInfo}>
        <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
          {rarityConfig.label.toUpperCase()} ({totalPieces} Piezas)
        </Text>
        <Text
          style={[
            styles.timerText,
            timeLeft <= 10 && styles.timerDanger, // Color rojo si quedan menos de 10 seg
          ]}
        >
          Tiempo: {timeLeft}s
        </Text>
      </View>

      {/* TABLERO DE PIEZAS GRID */}
      <View
        style={[
          styles.boardContainer,
          { width: BOARD_SIZE, height: BOARD_SIZE },
        ]}
      >
        {pieces.map((piece, currentIndex) => {
          // Calculamos las coordenadas originales de esta pieza para el recálculo visual
          const originalRow = Math.floor(piece.correctIndex / cols);
          const originalCol = piece.correctIndex % cols;

          const isSelected = selectedPiece === currentIndex;

          return (
            <TouchableOpacity
              key={currentIndex}
              activeOpacity={0.8}
              onPress={() => handlePiecePress(currentIndex)}
              style={[
                styles.pieceBox,
                {
                  width: pieceWidth,
                  height: pieceHeight,
                  borderColor: isSelected ? '#FFBE0B' : '#121212',
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {/* Recorte preciso de la imagen mediante posicionamiento dinámico */}
              <View
                style={{
                  width: pieceWidth,
                  height: pieceHeight,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri: album.pixelImage }}
                  style={{
                    width: BOARD_SIZE,
                    height: BOARD_SIZE,
                    marginLeft: -originalCol * pieceWidth,
                    marginTop: -originalRow * pieceHeight,
                  }}
                  resizeMode="stretch"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TITULO Y ARTISTA EN PARTIDA */}
      <View style={styles.albumMeta}>
        <Text style={styles.albumTitle}>{album.title}</Text>
        <Text style={styles.artistName}>{album.artist}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: BOARD_SIZE,
    marginBottom: 15,
  },
  rarityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timerDanger: {
    color: '#FF0055',
  },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  pieceBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  albumMeta: {
    marginTop: 15,
    alignItems: 'center',
  },
  albumTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#AAA',
    fontSize: 14,
  },
});