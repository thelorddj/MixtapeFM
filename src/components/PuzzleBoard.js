// src/components/PuzzleBoard.js
// Beta v1 — 2026-11-07
// Fases: PREVIEW (se muestra la portada completa 3 s, el temporizador NO corre)
// y luego PLAY (tablero revuelto y temporizador en marcha).
// Mecánica original: tocar dos piezas las intercambia. La mezcla nunca queda
// ya resuelta. Potenciadores (los compra el jugador en la tienda, con monedas
// del juego): Pista, +15 s y Congelar 10 s.
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BOARD_SIZE = Math.floor(SCREEN_WIDTH * 0.82);
export const PREVIEW_SECONDS = 3;

export default function PuzzleBoard({
  album,
  rarityConfig,
  lives,
  powerUps,
  onPowerUpUsed,
  onWin,
  onGameOver,
}) {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [phase, setPhase] = useState('PREVIEW');
  const [previewLeft, setPreviewLeft] = useState(PREVIEW_SECONDS);
  const [timeLeft, setTimeLeft] = useState(rarityConfig.timeLimit || 60);
  const [frozenLeft, setFrozenLeft] = useState(0);
  const finishedRef = useRef(false);

  const rows = rarityConfig.gridSize.rows;
  const cols = rarityConfig.gridSize.cols;
  const totalPieces = rows * cols;

  const tileSize = Math.floor(MAX_BOARD_SIZE / cols);
  const boardWidth = tileSize * cols;
  const boardHeight = tileSize * rows;

  // Al cambiar de álbum: reiniciar todo y empezar en PREVIEW.
  useEffect(() => {
    finishedRef.current = false;
    setSelectedPiece(null);
    setFrozenLeft(0);
    setTimeLeft(rarityConfig.timeLimit || 60);
    setPhase('PREVIEW');
    setPreviewLeft(PREVIEW_SECONDS);
    initBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album]);

  // Cuenta atrás de la vista previa. Cuando llega a 0, empieza el juego.
  useEffect(() => {
    if (phase !== 'PREVIEW') return undefined;
    if (previewLeft <= 0) {
      setPhase('PLAY');
      return undefined;
    }
    const timer = setTimeout(() => setPreviewLeft((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, previewLeft]);

  // Temporizador del juego: solo corre en PLAY y solo si no está congelado.
  useEffect(() => {
    if (phase !== 'PLAY' || finishedRef.current) return undefined;
    const timer = setInterval(() => {
      if (frozenLeft > 0) {
        setFrozenLeft((f) => f - 1);
        return;
      }
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, frozenLeft]);

  // Tiempo agotado: se avisa una sola vez.
  useEffect(() => {
    if (phase === 'PLAY' && timeLeft <= 0 && !finishedRef.current) {
      finishedRef.current = true;
      onGameOver && onGameOver();
    }
  }, [phase, timeLeft, onGameOver]);

  const shufflePieces = () => {
    const initial = [];
    for (let i = 0; i < totalPieces; i++) initial.push({ id: i, correctIndex: i });
    // Mezclar hasta que NO quede ya resuelto.
    let shuffled = [...initial];
    let solved = true;
    while (solved) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      solved = shuffled.every((piece, index) => piece.correctIndex === index);
    }
    return shuffled;
  };

  const initBoard = () => {
    setPieces(shufflePieces());
    setSelectedPiece(null);
  };

  const handlePiecePress = (index) => {
    if (phase !== 'PLAY' || finishedRef.current) return;
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else if (selectedPiece === index) {
      setSelectedPiece(null);
    } else {
      const updatedPieces = [...pieces];
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
    if (isCompleted && !finishedRef.current) {
      finishedRef.current = true;
      onWin && onWin();
    }
  };

  // --- Potenciadores (se descuentan en GameScreen) ---
  const usePowerUp = (id) => {
    if (phase !== 'PLAY' || finishedRef.current) return;
    if (!powerUps || (powerUps[id] || 0) <= 0) return;
    if (id === 'HINT') {
      // Coloca una pieza incorrecta en su lugar correcto.
      const wrongIndex = pieces.findIndex(
        (piece, index) => piece.correctIndex !== index
      );
      if (wrongIndex === -1) return;
      const targetIndex = pieces.findIndex(
        (piece) => piece.correctIndex === wrongIndex
      );
      const updatedPieces = [...pieces];
      const temp = updatedPieces[wrongIndex];
      updatedPieces[wrongIndex] = updatedPieces[targetIndex];
      updatedPieces[targetIndex] = temp;
      setPieces(updatedPieces);
      setSelectedPiece(null);
      onPowerUpUsed && onPowerUpUsed(id);
      checkVictory(updatedPieces);
    } else if (id === 'TIME') {
      setTimeLeft((t) => t + 15);
      onPowerUpUsed && onPowerUpUsed(id);
    } else if (id === 'FREEZE') {
      setFrozenLeft(10);
      onPowerUpUsed && onPowerUpUsed(id);
    }
  };

  const imageSource =
    typeof album.pixelCover === 'string'
      ? { uri: album.pixelCover }
      : album.pixelCover;

  const renderGridRows = () => {
    const gridRows = [];
    for (let r = 0; r < rows; r++) {
      const rowPieces = [];
      for (let c = 0; c < cols; c++) {
        const currentIndex = r * cols + c;
        const piece = pieces[currentIndex];
        if (!piece) continue;
        const originalRow = Math.floor(piece.correctIndex / cols);
        const originalCol = piece.correctIndex % cols;
        const isSelected = selectedPiece === currentIndex;
        rowPieces.push(
          <TouchableOpacity
            key={currentIndex}
            activeOpacity={0.8}
            onPress={() => handlePiecePress(currentIndex)}
            style={[styles.pieceBox, { width: tileSize, height: tileSize }]}
          >
            <View style={{ width: tileSize, height: tileSize, overflow: 'hidden' }}>
              {imageSource && (
                <Image
                  source={imageSource}
                  style={{
                    width: boardWidth,
                    height: boardHeight,
                    position: 'absolute',
                    top: -originalRow * tileSize,
                    left: -originalCol * tileSize,
                  }}
                  resizeMode="stretch"
                />
              )}
            </View>
            {isSelected && <View style={styles.selectedOverlay} />}
          </TouchableOpacity>
        );
      }
      gridRows.push(
        <View key={r} style={[styles.gridRow, { height: tileSize }]}>
          {rowPieces}
        </View>
      );
    }
    return gridRows;
  };

  const powerUpButton = (id, label, icon) => {
    const count = powerUps ? powerUps[id] || 0 : 0;
    return (
      <TouchableOpacity
        key={id}
        style={[styles.powerButton, count <= 0 && styles.powerButtonEmpty]}
        onPress={() => usePowerUp(id)}
        disabled={phase !== 'PLAY' || count <= 0}
      >
        <Text style={styles.powerButtonText}>
          {icon} {label} ×{count}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.headerInfo, { width: boardWidth }]}>
        <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
          {rarityConfig.label.toUpperCase()} ({totalPieces} Pzs)
        </Text>
        <Text style={styles.livesText}>❤ ×{lives}</Text>
        <Text style={[styles.timerText, timeLeft <= 10 && styles.timerDanger]}>
          {frozenLeft > 0 ? `❄ ${frozenLeft}s` : `Tiempo: ${timeLeft}s`}
        </Text>
      </View>

      {phase === 'PREVIEW' ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>MEMORIZA LA PORTADA</Text>
          {imageSource && (
            <Image
              source={imageSource}
              style={{ width: boardWidth, height: boardWidth, borderRadius: 8 }}
              resizeMode="stretch"
            />
          )}
          <Text style={styles.previewCountdown}>{previewLeft}</Text>
          <Text style={styles.previewHint}>
            El puzzle se revuelve en {previewLeft} s…
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.boardWrapper,
            { width: boardWidth + 4, height: boardHeight + 4 },
          ]}
        >
          {renderGridRows()}
        </View>
      )}

      {/* POTENCIADORES */}
      <View style={[styles.powerRow, { width: boardWidth }]}>
        {powerUpButton('HINT', 'Pista', '💡')}
        {powerUpButton('TIME', '+15 s', '⏱')}
        {powerUpButton('FREEZE', 'Congelar', '❄')}
      </View>

      {/* METADATA */}
      <View style={styles.albumMeta}>
        <Text style={styles.albumTitle}>{album.title}</Text>
        <Text style={styles.artistName}>{album.artist}</Text>
        {album.curiosity ? (
          <Text style={styles.curiosityText}>{album.curiosity}</Text>
        ) : null}
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
  rarityLabel: { fontSize: 14, fontWeight: 'bold' },
  livesText: { fontSize: 14, fontWeight: 'bold', color: '#FF5C8A' },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  timerDanger: { color: '#FF0055' },
  boardWrapper: {
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  gridRow: { flexDirection: 'row', width: '100%' },
  pieceBox: {
    backgroundColor: '#111',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    position: 'relative',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 190, 11, 0.35)',
    borderWidth: 2,
    borderColor: '#FFBE0B',
  },
  previewBox: { alignItems: 'center' },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFBE0B',
    letterSpacing: 2,
    marginBottom: 10,
  },
  previewCountdown: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  previewHint: { fontSize: 13, color: '#AAA', marginTop: 4 },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  powerButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#FFBE0B',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  powerButtonEmpty: { opacity: 0.4 },
  powerButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  albumMeta: { marginTop: 12, alignItems: 'center', paddingHorizontal: 10 },
  albumTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  artistName: { color: '#AAA', fontSize: 13 },
  curiosityText: {
    color: '#AAA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
