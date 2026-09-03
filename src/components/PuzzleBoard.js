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
const BOARD_SIZE = SCREEN_WIDTH * 0.85;

export default function PuzzleBoard({ album, rarityConfig, onWin, onGameOver }) {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [timeLeft, setTimeLeft] = useState(rarityConfig.timeLimit || 60);

  const rows = rarityConfig.gridSize.rows;
  const cols = rarityConfig.gridSize.cols;
  const totalPieces = rows * cols;

  const pieceWidth = BOARD_SIZE / cols;
  const pieceHeight = BOARD_SIZE / rows;

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

  // Soporta requre local (ImageSource) o URL
  const imageSource = typeof album.pixelCover === 'string'
    ? { uri: album.pixelCover }
    : album.pixelCover;

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
          {rarityConfig.label.toUpperCase()} ({totalPieces} Piezas)
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

      <View
        style={[
          styles.boardContainer,
          { width: BOARD_SIZE, height: BOARD_SIZE },
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
                  width: pieceWidth,
                  height: pieceHeight,
                  borderColor: isSelected ? '#FFBE0B' : '#121212',
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View
                style={{
                  width: pieceWidth,
                  height: pieceHeight,
                  overflow: 'hidden',
                }}
              >
                {imageSource && (
                  <Image
                    source={imageSource}
                    style={{
                      width: BOARD_SIZE,
                      height: BOARD_SIZE,
                      marginLeft: -originalCol * pieceWidth,
                      marginTop: -originalRow * pieceHeight,
                    }}
                    resizeMode="stretch"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

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
    width: BOARD_SIZE,
    marginBottom: 15,
  },
  rarityLabel: { fontSize: 16, fontWeight: 'bold' },
  timerText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  timerDanger: { color: '#FF0055' },
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
  albumMeta: { marginTop: 15, alignItems: 'center' },
  albumTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  artistName: { color: '#AAA', fontSize: 14 },
});