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
// Forzamos un tamaño de tablero exacto y cuadrado
const BOARD_SIZE = Math.floor(SCREEN_WIDTH * 0.82);

export default function PuzzleBoard({ album, rarityConfig, onWin, onGameOver }) {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [timeLeft, setTimeLeft] = useState(rarityConfig.timeLimit || 60);

  const rows = rarityConfig.gridSize.rows;
  const cols = rarityConfig.gridSize.cols;
  const totalPieces = rows * cols;

  // Calculamos el tamaño exacto e idéntico para cada celda cuadrada
  const tileSize = Math.floor(BOARD_SIZE / cols);
  const actualBoardSize = tileSize * cols; // Ajuste milimétrico sin decimales

  useEffect(() => {
    initBoard();
  }, [album]);

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

  const initBoard = () => {
    let initialPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      initialPieces.push({
        id: i,
        correctIndex: i,
      });
    }

    let shuffled = [...initialPieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setPieces(shuffled);
    setSelectedPiece(null);
  };

  const handlePiecePress = (index) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else if (selectedPiece === index) {
      setSelectedPiece(null);
    } else {
      let updatedPieces = [...pieces];
      const temp = updatedPieces[selectedPiece];
      updatedPieces[selectedPiece] = updatedPieces[index];
      updatedPieces[index] = temp;

      setPieces(updatedPieces);
      setSelectedPiece(null);

      checkVictory(updatedPieces);
    }
  };

  const checkVictory = (currentPieces) => {
    const isCompleted = currentPieces.every(
      (piece, index) => piece.correctIndex === index
    );
    if (isCompleted) {
      onWin && onWin();
    }
  };

  const imageSource = typeof album.pixelCover === 'string'
    ? { uri: album.pixelCover }
    : album.pixelCover;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.headerInfo, { width: actualBoardSize }]}>
        <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
          {rarityConfig.label.toUpperCase()} ({totalPieces} Pzs)
        </Text>
        <Text style={[styles.timerText, timeLeft <= 10 && styles.timerDanger]}>
          Tiempo: {timeLeft}s
        </Text>
      </View>

      {/* CONTENEDOR DEL TABLERO CUADRADO PERFECTO */}
      <View
        style={[
          styles.boardContainer,
          { width: actualBoardSize, height: actualBoardSize },
        ]}
      >
        {pieces.map((piece, currentIndex) => {
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
                  width: tileSize,
                  height: tileSize,
                },
              ]}
            >
              {/* MÁSCARA CROP CON DIMENSIONES EXACTAS */}
              <View style={styles.cropWindow}>
                {imageSource && (
                  <Image
                    source={imageSource}
                    style={{
                      width: actualBoardSize,
                      height: actualBoardSize,
                      transform: [
                        { translateX: -originalCol * tileSize },
                        { translateY: -originalRow * tileSize },
                      ],
                    }}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* OVERLAY NEÓN AL SELECCIONAR */}
              {isSelected && <View style={styles.selectedOverlay} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* METADATA */}
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
    marginBottom: 10,
  },
  rarityLabel: { fontSize: 14, fontWeight: 'bold' },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  timerDanger: { color: '#FF0055' },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  pieceBox: {
    backgroundColor: '#111',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.4)',
    overflow: 'hidden',
    position: 'relative',
  },
  cropWindow: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 190, 11, 0.35)',
    borderWidth: 2,
    borderColor: '#FFBE0B',
  },
  albumMeta: { marginTop: 12, alignItems: 'center' },
  albumTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  artistName: { color: '#AAA', fontSize: 13 },
});