// src/data/albumesData.js
// Beta v1 — 2026-11-07
// Spec de Damián: 30 álbumes (11 NORMAL, 8 RARE, 6 EPIC, 5 LEGENDARY).
// La rareza NO se elige: el juego sortea primero la rareza con dropRate
// (NORMAL 65%, RARE 20%, EPIC 10%, LEGENDARY 5%) y luego un álbum al azar
// dentro de esa rareza. Las canciones de mejor calidad son "raras", así que
// su aparición está condicionada por ese peso, no es uniforme.
// Las portadas son imágenes genéricas por rareza (assets/albums/*.png).
// Los IDs de Spotify NO se inventan aquí: hdCoverUrl es null salvo en los
// 4 álbumes originales, y se resolverá con GET /v1/search?type=album&market=MX
// cuando existan las credenciales de desarrollador de Spotify.

// 1. Configuración de reglas según la rareza
export const RARITY_CONFIG = {
  NORMAL: {
    label: 'Normal',
    color: '#A0A0A0', // Gris / Plata
    dropRate: 65, // % de probabilidad de que salga esta rareza
    gridSize: { rows: 4, cols: 5 }, // 20 piezas
    timeLimit: 60, // Segundos
    coinsOnWin: 10, // Monedas al completar el puzzle
  },
  RARE: {
    label: 'Raro',
    color: '#3A86FF', // Azul Neón
    dropRate: 20,
    gridSize: { rows: 5, cols: 6 }, // 30 piezas
    timeLimit: 60,
    coinsOnWin: 25,
  },
  EPIC: {
    label: 'Épico',
    color: '#8338EC', // Morado Retro
    dropRate: 10,
    gridSize: { rows: 5, cols: 7 }, // 35 piezas
    timeLimit: 45,
    coinsOnWin: 50,
  },
  LEGENDARY: {
    label: 'Leyenda',
    color: '#FFBE0B', // Dorado / Amarillo Neón
    dropRate: 5,
    gridSize: { rows: 5, cols: 8 }, // 40 piezas
    timeLimit: 30,
    coinsOnWin: 100,
  },
};

// Precios de la tienda (monedas del juego, NUNCA dinero real).
export const POWERUP_DEFS = {
  HINT: { id: 'HINT', label: 'Pista', price: 30, description: 'Coloca una pieza en su lugar correcto.' },
  TIME: { id: 'TIME', label: '+15 s', price: 40, description: 'Suma 15 segundos al temporizador.' },
  FREEZE: { id: 'FREEZE', label: 'Congelar 10 s', price: 50, description: 'Pausa el temporizador por 10 segundos.' },
};

// 2. Lista de Álbumes (30)
export const ALBUMS = [
  // --- LEGENDARY (5) ---
  {
    id: 'album_01',
    title: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    rarity: 'LEGENDARY',
    pixelCover: require('../../assets/albums/Leyenda.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b273ea70a05a27203c4571e937f0',
    curiosity: 'Permaneció en las listas de éxitos durante 937 semanas (más de 18 años).',
  },
  {
    id: 'album_05',
    title: 'Abbey Road',
    artist: 'The Beatles',
    rarity: 'LEGENDARY',
    pixelCover: require('../../assets/albums/Leyenda.png'),
    hdCoverUrl: null,
    curiosity: 'La portada del cruce de Abbey Road es de las más reconocidas del mundo.',
  },
  {
    id: 'album_06',
    title: 'Purple Rain',
    artist: 'Prince & The Revolution',
    rarity: 'LEGENDARY',
    pixelCover: require('../../assets/albums/Leyenda.png'),
    hdCoverUrl: null,
    curiosity: 'N.º 4 en la lista Apple Music 100 Best Albums.',
  },
  {
    id: 'album_07',
    title: 'Nevermind',
    artist: 'Nirvana',
    rarity: 'LEGENDARY',
    pixelCover: require('../../assets/albums/Leyenda.png'),
    hdCoverUrl: null,
    curiosity: 'Definió el sonido de los 90.',
  },
  {
    id: 'album_08',
    title: 'Re',
    artist: 'Café Tacvba',
    rarity: 'LEGENDARY',
    pixelCover: require('../../assets/albums/Leyenda.png'),
    hdCoverUrl: null,
    curiosity: 'N.º 1 de los 50 mejores álbumes del rock latinoamericano según Rolling Stone.',
  },
  // --- EPIC (6) ---
  {
    id: 'album_02',
    title: 'Thriller',
    artist: 'Michael Jackson',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/Epico.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526288b79d',
    curiosity: 'Es el álbum más vendido de todos los tiempos con más de 70 millones de copias.',
  },
  {
    id: 'album_09',
    title: "Sgt. Pepper's Lonely Hearts Club Band",
    artist: 'The Beatles',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/Epico.png'),
    hdCoverUrl: null,
    curiosity: 'Portada-collage legendaria; un clásico de todos los tiempos.',
  },
  {
    id: 'album_10',
    title: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/Epico.png'),
    hdCoverUrl: null,
    curiosity: "Incluye 'Stairway to Heaven'.",
  },
  {
    id: 'album_11',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/Epico.png'),
    hdCoverUrl: null,
    curiosity: 'Uno de los álbumes más vendidos de la historia.',
  },
  {
    id: 'album_12',
    title: 'The Wall',
    artist: 'Pink Floyd',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/Epico.png'),
    hdCoverUrl: null,
    curiosity: 'Obra conceptual icónica; portada minimalista blanca.',
  },
  {
    id: 'album_13',
    title: 'Back in Black',
    artist: 'AC/DC',
    rarity: 'EPIC',
    pixelCover: require('../../assets/albums/Epico.png'),
    hdCoverUrl: null,
    curiosity: 'Uno de los más vendidos de la historia; portada negra total.',
  },
  // --- RARE (8) ---
  {
    id: 'album_03',
    title: 'Discovery',
    artist: 'Daft Punk',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b273e2b368aee80005273187a552',
    curiosity: 'Sirvió como banda sonora completa para la película animada Interstella 5555.',
  },
  {
    id: 'album_14',
    title: 'Hotel California',
    artist: 'Eagles',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity: 'Clásico de rock de los 70, portada nocturna muy reconocible.',
  },
  {
    id: 'album_15',
    title: 'Bad',
    artist: 'Michael Jackson',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity: 'Sucesor de Thriller; portada en blanco y negro.',
  },
  {
    id: 'album_16',
    title: 'Canción Animal',
    artist: 'Soda Stereo',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity: "Hito del rock en español; 'De música ligera'.",
  },
  {
    id: 'album_17',
    title: 'El Silencio',
    artist: 'Caifanes',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity: 'Clásico del rock mexicano.',
  },
  {
    id: 'album_18',
    title: 'OK Computer',
    artist: 'Radiohead',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity: 'Disco definitorio de los 90; portada-collage.',
  },
  {
    id: 'album_19',
    title: '¿Dónde jugarán las niñas?',
    artist: 'Molotov',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity:
      'Debut de Molotov; n.º 25 en la lista de Rolling Stone de rock latinoamericano. Nota beta: la portada original fue polémica; en la beta se usa la imagen genérica de rareza, pendiente la decisión de Damián.',
  },
  {
    id: 'album_20',
    title: 'Amor prohibido',
    artist: 'Selena',
    rarity: 'RARE',
    pixelCover: require('../../assets/albums/Raro.png'),
    hdCoverUrl: null,
    curiosity: 'El álbum latino más emblemático de los 90; 5 sencillos n.º 1 en Hot Latin Tracks.',
  },
  // --- NORMAL (11) ---
  {
    id: 'album_04',
    title: 'Master of Puppets',
    artist: 'Metallica',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: 'https://i.scdn.co/image/ab67616d0000b27373f1d82f71881517724a87a7',
    curiosity: 'Fue el primer álbum de thrash metal en ser preservado en la Biblioteca del Congreso de EE. UU.',
  },
  {
    id: 'album_21',
    title: '21',
    artist: 'Adele',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Uno de los álbumes más vendidos del siglo.',
  },
  {
    id: 'album_22',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Portada plateada con los cascos; muy reconocible.',
  },
  {
    id: 'album_23',
    title: 'Born to Die',
    artist: 'Lana Del Rey',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Portada-retrato icónica del pop de los 2010.',
  },
  {
    id: 'album_24',
    title: '÷ (Divide)',
    artist: 'Ed Sheeran',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Álbum masivo en streaming.',
  },
  {
    id: 'album_25',
    title: 'After Hours',
    artist: 'The Weeknd',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Portada roja con el personaje de traje; muy visual.',
  },
  {
    id: 'album_26',
    title: 'Motomami',
    artist: 'Rosalía',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Disco definitorio del pop en español reciente.',
  },
  {
    id: 'album_27',
    title: 'Un Verano Sin Ti',
    artist: 'Bad Bunny',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'El álbum latino más escuchado de la década.',
  },
  {
    id: 'album_28',
    title: 'Appetite for Destruction',
    artist: "Guns N' Roses",
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: "Álbum debut de Guns N' Roses (1987).",
  },
  {
    id: 'album_29',
    title: 'Hybrid Theory',
    artist: 'Linkin Park',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Álbum debut de Linkin Park (2000).',
  },
  {
    id: 'album_30',
    title: 'Future Nostalgia',
    artist: 'Dua Lipa',
    rarity: 'NORMAL',
    pixelCover: require('../../assets/albums/Normal.png'),
    hdCoverUrl: null,
    curiosity: 'Disco pop de Dua Lipa (2020).',
  },
];
