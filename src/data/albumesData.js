// src/data/albumesData.js

// 1. Configuración de reglas según la rareza
export const RARITY_CONFIG = {
  NORMAL: {
    label: 'Normal',
    color: '#A0A0A0',       // Gris / Plata
    dropRate: 65,           // 60% de probabilidad
    gridSize: { rows: 4, cols: 5 }, // 20 piezas
    timeLimit: 60,          // Segundos
  },
  RARE: {
    label: 'Raro',
    color: '#3A86FF',       // Azul Neón
    dropRate: 20,           // 25% de probabilidad
    gridSize: { rows: 5, cols: 5 }, // 25 piezas
    timeLimit: 60,
  },
  EPIC: {
    label: 'Épico',
    color: '#8338EC',       // Morado Retro
    dropRate: 10,           // 10% de probabilidad
    gridSize: { rows: 5, cols: 6 }, // 30 piezas
    timeLimit: 60,
  },
  LEGENDARY: {
    label: 'Leyenda',
    color: '#FFBE0B',       // Dorado / Amarillo Neón
    dropRate: 5,            // 5% de probabilidad
    gridSize: { rows: 6, cols: 5 }, // 30 piezas
    timeLimit: 60,
  },
};

// 2. Lista de Álbumes (Agrega o modifica los que quieras)
export const ALBUMS = [
  {
    id: 'album_01',
    title: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    rarity: 'LEGENDARY',
    // La imagen 16-bit la cargamos de forma local (puedes ajustar la ruta)
    pixelCover: require('../../assets/albums/pixel_darkside.png'),
    // URL de la portada oficial HD en Spotify / Web
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b273ea70a05a27203c4571e937f0',
    curiosity: 'Permaneció en las listas de éxitos durante 937 semanas (más de 18 años).',
  },
  {
    id: 'album_02',
    title: 'Thriller',
    artist: 'Michael Jackson',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/pixel_thriller.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526288b79d',
    curiosity: 'Es el álbum más vendido de todos los tiempos con más de 70 millones de copias.',
  },
  {
    id: 'album_03',
    title: 'Discovery',
    artist: 'Daft Punk',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/pixel_discovery.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b273e2b368aee80005273187a552',
    curiosity: 'Sirvió como banda sonora completa para la película animada Interstella 5555.',
  },
  {
    id: 'album_04',
    title: 'Master of Puppets',
    artist: 'Metallica',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/pixel_master.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b27373f1d82f71881517724a87a7',
    curiosity: 'Fue el primer álbum de thrash metal en ser preservado en la Biblioteca del Congreso de EE. UU.',
  },
];