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
const MAX_BOARD_WIDTH = SCREEN_WIDTH * 0.85; // Ancho máximo del área de juego

export default function PuzzleBoard({ album, rarityConfig, onWin, onGameOver }) {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [timeLeft, setTimeLeft] = useState(rarityConfig.timeLimit || 60);

  const rows = rarityConfig.gridSize.rows;
  const cols = rarityConfig.gridSize.cols;
  const totalPieces = rows * cols;

  // Calculamos el tamaño exacto por celda para mantener la grilla perfecta
  const pieceWidth = MAX_BOARD_WIDTH / cols;
  const pieceHeight = MAX_BOARD_WIDTH / rows;

  // Dimensiones totales del contenedor según la grilla
  const boardWidth = pieceWidth * cols;
  const boardHeight = pieceHeight * rows;

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
      // Primera selección: ilumina la pieza
      setSelectedPiece(index);
    } else if (selectedPiece === index) {
      // Si toca la misma pieza, la deselecciona
      setSelectedPiece(null);
    } else {
      // Segunda selección: hace el intercambio
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
      {/* HEADER DE INFORMACIÓN */}
      <View style={[styles.headerInfo, { width: boardWidth }]}>
        <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
          {rarityConfig.label.toUpperCase()} ({totalPieces} Pzs)
        </Text>
        <Text
          style={[
            styles.timerText,
            timeLeft <= 10 && styles.timerDanger,
          ]}
        >
          Tiempo: {timeLeft}s
        </Text>
      </View>

      {/* TABLERO DE PIEZAS */}
      <View
        style={[
          styles.boardContainer,
          { width: boardWidth, height: boardHeight },
        ]}
      >
        {pieces.map((piece, currentIndex) => {
          const originalRow = Math.floor(piece.correctIndex / cols);
          const originalCol = piece.correctIndex % cols;
          const isSelected = selectedPiece === currentIndex;

          return (
            <TouchableOpacity
              key={currentIndex}
              activeOpacity={0.7}
              onPress={() => handlePiecePress(currentIndex)}
              style={[
                styles.pieceBox,
                {
                  width: pieceWidth,
                  height: pieceHeight,
                  borderColor: isSelected ? '#FFBE0B' : '#000',
                  borderWidth: isSelected ? 3 : 1,
                  zIndex: isSelected ? 10 : 1,
                },
              ]}
            >
              <View
                style={{
                  width: pieceWidth,
                  height: pieceHeight,
                  overflow: 'hidden',
                  opacity: isSelected ? 0.65 : 1, // Feedback visual de opacidad
                }}
              >
                {imageSource && (
                  <Image
                    source={imageSource}
                    style={{
                      width: boardWidth,
                      height: boardHeight,
                      marginLeft: -originalCol * pieceWidth,
                      marginTop: -originalRow * pieceHeight,
                    }}
                    resizeMode="stretch"
                  />
                )}
              </View>

              {/* INDICADOR VISUAL DORADO CUANDO ESTÁ SELECCIONADA */}
              {isSelected && <View style={styles.selectedOverlay} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* METADATA DEL ÁLBUM */}
      <View style={styles.albumMeta}>
        <Text style={styles.albumTitle}>{album.title}</Text>
        <Text style={styles.artistName}>{album.artist}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rarityLabel: { fontSize: 15, fontWeight: 'bold' },
  timerText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  timerDanger: { color: '#FF0055' },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pieceBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    position: 'relative',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 190, 11, 0.3)', // Resplandor amarillo/dorado
    borderWidth: 2,
    borderColor: '#FFBE0B',
  },
  albumMeta: { marginTop: 12, alignItems: 'center' },
  albumTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  artistName: { color: '#AAA', fontSize: 13 },
});