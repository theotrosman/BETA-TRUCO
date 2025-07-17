// Mazo de 40 cartas del truco argentino
const MAZO_COMPLETO = [
  // Espadas
  { id: '1deespada', nombre: '1 de Espada', valor: 1, palo: 'espada', imagen: 'resources/cartas/1deespada.png' },
  { id: '2deespada', nombre: '2 de Espada', valor: 2, palo: 'espada', imagen: 'resources/cartas/2deespada.png' },
  { id: '3deespada', nombre: '3 de Espada', valor: 3, palo: 'espada', imagen: 'resources/cartas/3deespada.png' },
  { id: '4deespada', nombre: '4 de Espada', valor: 4, palo: 'espada', imagen: null },
  { id: '5deespada', nombre: '5 de Espada', valor: 5, palo: 'espada', imagen: null },
  { id: '6deespada', nombre: '6 de Espada', valor: 6, palo: 'espada', imagen: null },
  { id: '7deespada', nombre: '7 de Espada', valor: 7, palo: 'espada', imagen: 'resources/cartas/7deespada.png' },
  { id: '10deespada', nombre: '10 de Espada', valor: 10, palo: 'espada', imagen: null },
  { id: '11deespada', nombre: '11 de Espada', valor: 11, palo: 'espada', imagen: 'resources/cartas/11deespada.png' },
  { id: '12deespada', nombre: '12 de Espada', valor: 12, palo: 'espada', imagen: 'resources/cartas/12deespada.png' },
  
  // Bastos
  { id: '1debasto', nombre: '1 de Basto', valor: 1, palo: 'basto', imagen: 'resources/cartas/1debasto.png' },
  { id: '2debasto', nombre: '2 de Basto', valor: 2, palo: 'basto', imagen: 'resources/cartas/2debasto.png' },
  { id: '3debasto', nombre: '3 de Basto', valor: 3, palo: 'basto', imagen: 'resources/cartas/3debasto.png' },
  { id: '4debasto', nombre: '4 de Basto', valor: 4, palo: 'basto', imagen: null },
  { id: '5debasto', nombre: '5 de Basto', valor: 5, palo: 'basto', imagen: null },
  { id: '6debasto', nombre: '6 de Basto', valor: 6, palo: 'basto', imagen: null },
  { id: '7debasto', nombre: '7 de Basto', valor: 7, palo: 'basto', imagen: 'resources/cartas/7debasto.png' },
  { id: '10debasto', nombre: '10 de Basto', valor: 10, palo: 'basto', imagen: 'resources/cartas/10debasto.png' },
  { id: '11debasto', nombre: '11 de Basto', valor: 11, palo: 'basto', imagen: 'resources/cartas/11debasto.png' },
  { id: '12debasto', nombre: '12 de Basto', valor: 12, palo: 'basto', imagen: 'resources/cartas/12debasto.png' },
  
  // Copas
  { id: '1decopa', nombre: '1 de Copa', valor: 1, palo: 'copa', imagen: 'resources/cartas/1decopa.png' },
  { id: '2decopa', nombre: '2 de Copa', valor: 2, palo: 'copa', imagen: 'resources/cartas/2decopa.png' },
  { id: '3decopa', nombre: '3 de Copa', valor: 3, palo: 'copa', imagen: 'resources/cartas/3decopa.png' },
  { id: '4decopa', nombre: '4 de Copa', valor: 4, palo: 'copa', imagen: null },
  { id: '5decopa', nombre: '5 de Copa', valor: 5, palo: 'copa', imagen: null },
  { id: '6decopa', nombre: '6 de Copa', valor: 6, palo: 'copa', imagen: null },
  { id: '7decopa', nombre: '7 de Copa', valor: 7, palo: 'copa', imagen: 'resources/cartas/7decopa.png' },
  { id: '10decopa', nombre: '10 de Copa', valor: 10, palo: 'copa', imagen: 'resources/cartas/10decopa.png' },
  { id: '11decopa', nombre: '11 de Copa', valor: 11, palo: 'copa', imagen: 'resources/cartas/11decopa.png' },
  { id: '12decopa', nombre: '12 de Copa', valor: 12, palo: 'copa', imagen: 'resources/cartas/12decopa.png' },
  
  // Oros
  { id: '1deoro', nombre: '1 de Oro', valor: 1, palo: 'oro', imagen: 'resources/cartas/1deoro.png' },
  { id: '2deoro', nombre: '2 de Oro', valor: 2, palo: 'oro', imagen: 'resources/cartas/2deoro.png' },
  { id: '3deoro', nombre: '3 de Oro', valor: 3, palo: 'oro', imagen: 'resources/cartas/3deoro.png' },
  { id: '4deoro', nombre: '4 de Oro', valor: 4, palo: 'oro', imagen: null },
  { id: '5deoro', nombre: '5 de Oro', valor: 5, palo: 'oro', imagen: null },
  { id: '6deoro', nombre: '6 de Oro', valor: 6, palo: 'oro', imagen: null },
  { id: '7deoro', nombre: '7 de Oro', valor: 7, palo: 'oro', imagen: 'resources/cartas/7deoro.png' },
  { id: '10deoro', nombre: '10 de Oro', valor: 10, palo: 'oro', imagen: 'resources/cartas/10deoro.png' },
  { id: '11deoro', nombre: '11 de Oro', valor: 11, palo: 'oro', imagen: 'resources/cartas/11deoro.png' },
  { id: '12deoro', nombre: '12 de Oro', valor: 12, palo: 'oro', imagen: 'resources/cartas/12deoro.png' }
];

// Cartas especiales roguelike
const CARTAS_ESPECIALES = [
  {
      id: 'mate_radiante',
      nombre: '🧉 MATE RADIANTE',
      valor: 15,
      palo: 'especial',
      jerarquia: 15,
      envidoBase: 8,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Cebada Doble', descripcion: 'Duplica la Jerarquía de tu carta más alta este turno', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Golpe de Cafeína', descripcion: '+1 Energía Gaucha y robás 1 carta', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Ruta de la Yerba', descripcion: 'Si ganás la ronda, abrís un camino secreto', cooldown: 'oncePerRound' },
          { id: 4, nombre: 'Re-Infusión', descripcion: 'Podés volver a cantar Truco una vez por ronda', cooldown: 'oncePerRound' },
          { id: 5, nombre: 'Amargo o Dulce', descripcion: 'Elegí: +3 Envido o espiar la primera carta rival', cooldown: 'oncePerTurn' }
      ]
  },
  {
      id: 'arcoiris_prismatico',
      nombre: '🌈 ARCOÍRIS PRISMÁTICA',
      valor: 13,
      palo: 'especial',
      jerarquia: 13,
      envidoBase: 6,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Prisma Salvaje', descripcion: 'Cuenta como cualquier palo para Flor/Envido', cooldown: 'always' },
          { id: 2, nombre: 'Espectro en Cadena', descripcion: '+2 al Truco por cada palo distinto en tu mano', cooldown: 'oncePerTurn' },
          { id: 3, nombre: 'Refracción', descripcion: 'Copia el último efecto especial que jugaste', cooldown: 'oncePerRound' },
          { id: 4, nombre: 'Aurora Oculta', descripcion: 'Al cerrar la ronda, vuelve 1 carta propia "foil" (+1 Jerarquía permanente)', cooldown: 'oncePerRound' },
          { id: 5, nombre: 'Clima Irreal', descripcion: 'Cambia el clima del piso a uno aleatorio favorable', cooldown: 'oncePerRun' }
      ]
  },
  {
      id: 'joker_bufon_bifasico',
      nombre: '🎭 JOKER BUFÓN BIFÁSICO',
      valor: 0,
      palo: 'especial',
      jerarquia: 0,
      envidoBase: 0,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Carcajada Letal', descripcion: 'Voltea el ganador de la 1.ª baza', cooldown: 'oncePerRound' },
          { id: 2, nombre: 'Máscara Copiona', descripcion: 'Se convierte en la carta rival recién jugada (+1 Jerarquía extra)', cooldown: 'oncePerTurn' },
          { id: 3, nombre: 'Bluff Maestro', descripcion: 'Obliga a la IA a aceptar Truco/Retruco (1 vez por partida)', cooldown: 'oncePerRun' },
          { id: 4, nombre: 'Caos Controlado', descripcion: 'Mezclá tu mano en el mazo y robá la misma cantidad', cooldown: 'oncePerRound' },
          { id: 5, nombre: 'Doble Filo', descripcion: 'Si ganás la ronda, +4 puntos; si la perdés, -1 Energía Gaucha', cooldown: 'oncePerRound' }
      ]
  },
  {
      id: 'tango_eterno',
      nombre: '💃 TANGO ETERNO',
      valor: 14,
      palo: 'especial',
      jerarquia: 14,
      envidoBase: 7,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Pasión Ardiente', descripcion: 'Si jugás esta carta, la siguiente tuya gana automáticamente', cooldown: 'oncePerRound' },
          { id: 2, nombre: 'Melodía Hipnótica', descripcion: 'La CPU no puede cantar Truco por 2 turnos', cooldown: 'oncePerRun' },
          { id: 3, nombre: 'Ritmo Perfecto', descripcion: 'Si tenés 3 cartas del mismo palo, +5 al Envido', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Abrazo Mortal', descripcion: 'Intercambia esta carta por la más alta de la CPU', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Final Dramático', descripcion: 'Si perdés la ronda, ganás 2 puntos extra', cooldown: 'oncePerRun' }
      ]
  },
  {
      id: 'gaucho_legendario',
      nombre: '🤠 GAUCHO LEGENDARIO',
      valor: 16,
      palo: 'especial',
      jerarquia: 16,
      envidoBase: 10,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Facón Dorado', descripcion: 'Gana automáticamente contra cualquier carta de valor 7 o menor', cooldown: 'always' },
          { id: 2, nombre: 'Poncho Protector', descripcion: 'No podés perder más de 2 puntos por ronda', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Caballo Salvaje', descripcion: 'Podés jugar 2 cartas en el mismo turno', cooldown: 'oncePerRun' },
          { id: 4, nombre: 'Historia de Campamento', descripcion: 'Si contás una historia, +3 al Truco', cooldown: 'oncePerTurn' },
          { id: 5, nombre: 'Leyenda Viva', descripcion: 'Esta carta nunca puede ser robada o intercambiada', cooldown: 'always' }
      ]
  },
  {
      id: 'asado_cosmic',
      nombre: '🔥 ASADO CÓSMICO',
      valor: 12,
      palo: 'especial',
      jerarquia: 12,
      envidoBase: 9,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Brasas Eternas', descripcion: 'Quema la carta más alta del rival (-2 Jerarquía)', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Aroma Divino', descripcion: 'Atrae todas las cartas de valor 10 a tu mano', cooldown: 'oncePerRun' },
          { id: 3, nombre: 'Chimichurri Sagrado', descripcion: 'Cura todas tus cartas (+1 Jerarquía a cada una)', cooldown: 'oncePerRound' },
          { id: 4, nombre: 'Fuego Eterno', descripcion: 'Esta carta nunca se agota, siempre está disponible', cooldown: 'always' },
          { id: 5, nombre: 'Banquete Final', descripcion: 'Si ganás con esta carta, +6 puntos extra', cooldown: 'oncePerRun' }
      ]
  },
  {
      id: 'malbec_mistico',
      nombre: '🍷 MALBEC MÍSTICO',
      valor: 11,
      palo: 'especial',
      jerarquia: 11,
      envidoBase: 5,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Crianza Perfecta', descripcion: 'Esta carta mejora con cada ronda (+1 Jerarquía por ronda)', cooldown: 'always' },
          { id: 2, nombre: 'Bouquet Encantado', descripcion: 'Confunde a la CPU, hace que juegue una carta aleatoria', cooldown: 'oncePerTurn' },
          { id: 3, nombre: 'Taninos Mágicos', descripcion: 'Reduce la Jerarquía de todas las cartas rivales en 1', cooldown: 'oncePerRound' },
          { id: 4, nombre: 'Copa de Cristal', descripcion: 'Revela la mano completa de la CPU', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Brindis Eterno', descripcion: 'Si bebés virtualmente, +2 a todos tus efectos', cooldown: 'oncePerTurn' }
      ]
  },
  {
      id: 'dulce_de_leche_celestial',
      nombre: '🍯 DULCE DE LECHE CELESTIAL',
      valor: 10,
      palo: 'especial',
      jerarquia: 10,
      envidoBase: 4,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Dulzura Infinita', descripcion: 'Convierte cualquier derrota en empate', cooldown: 'oncePerRound' },
          { id: 2, nombre: 'Caramelo Dorado', descripcion: 'Atrae todas las cartas de valor 1 a tu mano', cooldown: 'oncePerRun' },
          { id: 3, nombre: 'Alfajor Sagrado', descripcion: 'Si tenés 3 cartas dulces, +7 al Envido', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Postre Divino', descripcion: 'Al final de la ronda, robás 2 cartas extra', cooldown: 'oncePerRound' },
          { id: 5, nombre: 'Sabor Eterno', descripcion: 'Esta carta nunca pierde su dulzura', cooldown: 'always' }
      ]
  },
  {
      id: 'bombilla_dorada',
      nombre: '🥤 BOMBILLA DORADA',
      valor: 9,
      palo: 'especial',
      jerarquia: 9,
      envidoBase: 3,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Cebadura Perfecta', descripcion: 'Prepara el mate ideal, +3 a todas tus cartas', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Yerba Sagrada', descripcion: 'Purifica tu mano, elimina todas las cartas de valor 4', cooldown: 'oncePerRun' },
          { id: 3, nombre: 'Agua Caliente', descripcion: 'Calienta el ambiente, la CPU juega más agresivamente', cooldown: 'oncePerRound' },
          { id: 4, nombre: 'Mate Compartido', descripcion: 'Compartís el mate, ambos jugadores roban 1 carta', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Ronda de Mate', descripcion: 'Si todos toman mate, +5 puntos para todos', cooldown: 'oncePerRun' }
      ]
  },
  {
      id: 'fileteado_magico',
      nombre: '🎨 FILETEADO MÁGICO',
      valor: 8,
      palo: 'especial',
      jerarquia: 8,
      envidoBase: 2,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Pincel Dorado', descripcion: 'Pinta cualquier carta del color que quieras', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Diseño Único', descripcion: 'Crea una carta completamente nueva', cooldown: 'oncePerRun' },
          { id: 3, nombre: 'Arte Callejero', descripcion: 'Convierte el tablero en tu lienzo personal', cooldown: 'oncePerRound' },
          { id: 4, nombre: 'Firma del Artista', descripcion: 'Firma tu obra, +2 Jerarquía permanente', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Exposición Permanente', descripcion: 'Esta carta se queda en el museo del truco', cooldown: 'always' }
      ]
  },
  {
      id: 'bandoneon_etereo',
      nombre: '🪗 BANDONEÓN ETÉREO',
      valor: 7,
      palo: 'especial',
      jerarquia: 7,
      envidoBase: 1,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Tango Místico', descripcion: 'Hace que todas las cartas bailen tango', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Melodía Nostálgica', descripcion: 'Recuerda viejos tiempos, +2 a cartas antiguas', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Compás Perfecto', descripcion: 'Sincroniza todas tus cartas al mismo ritmo', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Fuelle Mágico', descripcion: 'Expande y contrae el tablero a tu antojo', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Concierto Final', descripcion: 'Si ganás con esta carta, todos aplauden', cooldown: 'oncePerRun' }
      ]
  },
  {
      id: 'empanada_dimensional',
      nombre: '🥟 EMPANADA DIMENSIONAL',
      valor: 6,
      palo: 'especial',
      jerarquia: 6,
      envidoBase: 0,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Repulgue Perfecto', descripcion: 'Sella cualquier carta dentro de otra', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Relleno Misterioso', descripcion: 'Descubre qué hay dentro de las cartas rivales', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Horno Cósmico', descripcion: 'Cocina las cartas hasta que estén perfectas', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Sabor Dimensional', descripcion: 'Prueba sabores de otros universos', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Empanada Infinita', descripcion: 'Esta empanada nunca se acaba', cooldown: 'always' }
      ]
  },
  {
      id: 'choripan_legendario',
      nombre: '🌭 CHORIPÁN LEGENDARIO',
      valor: 5,
      palo: 'especial',
      jerarquia: 5,
      envidoBase: 0,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Chimichurri Sagrado', descripcion: 'Bendice el choripán con hierbas místicas', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Pan Cósmico', descripcion: 'El pan viene de una panadería celestial', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Chorizo Dorado', descripcion: 'El chorizo brilla con luz propia', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Asado Eterno', descripcion: 'El fuego nunca se apaga', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Sabor Legendario', descripcion: 'Quien pruebe este choripán nunca lo olvida', cooldown: 'always' }
      ]
  },
  {
      id: 'factura_celestial',
      nombre: '🥐 FACTURA CELESTIAL',
      valor: 4,
      palo: 'especial',
      jerarquia: 4,
      envidoBase: 0,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Dulce de Leche Divino', descripcion: 'El relleno viene del cielo', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Masa Angelical', descripcion: 'La masa es más suave que una nube', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Azúcar Glaseado Mágico', descripcion: 'El azúcar brilla como estrellas', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Horno de los Dioses', descripcion: 'Cocida en el horno más perfecto', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Factura Eterna', descripcion: 'Esta factura nunca se pone dura', cooldown: 'always' }
      ]
  },
  {
      id: 'cafe_torrado_mistico',
      nombre: '☕ CAFÉ TORRADO MÍSTICO',
      valor: 3,
      palo: 'especial',
      jerarquia: 3,
      envidoBase: 0,
      imagen: null,
      esEspecial: true,
      efectos: [
          { id: 1, nombre: 'Aroma Cósmico', descripcion: 'El aroma despierta a los dioses', cooldown: 'oncePerTurn' },
          { id: 2, nombre: 'Torrado Perfecto', descripcion: 'Tostado en las brasas del infierno', cooldown: 'oncePerRound' },
          { id: 3, nombre: 'Café Negro Mágico', descripcion: 'El café más fuerte del universo', cooldown: 'oncePerTurn' },
          { id: 4, nombre: 'Taza de los Ancestros', descripcion: 'Serveda en la taza más antigua', cooldown: 'oncePerRun' },
          { id: 5, nombre: 'Café Eterno', descripcion: 'Este café nunca se enfría', cooldown: 'always' }
      ]
  }
];

// Variables globales
let mazoSeleccionado = [];
let cartasSeleccionadas = new Set();
let filtroPaloActual = 'todos';
let ordenActual = 'default';
let mazoFiltrado = [];

// Elementos del DOM
let mazoGrid, mazoPreview, btnJugar, cartasSeleccionadasSpan, ordenSelect;

// Función para obtener el poder de truco de una carta
function obtenerPoderTruco(carta) {
  const valor = carta.valor;
  const palo = carta.palo;
  
  // Poder de las cartas para truco (de mayor a menor)
  if (valor === 1 && palo === 'espada') return 14; // As de espadas (la mayor)
  if (valor === 1 && palo === 'basto') return 13;  // As de bastos
  if (valor === 7 && palo === 'espada') return 12; // Siete de espadas (manilla)
  if (valor === 7 && palo === 'oro') return 11;    // Siete de oros (manilla)
  if (valor === 3) return 10;       // Treses
  if (valor === 2) return 9;        // Doses
  if (valor === 1) return 8;        // Ases falsos (oros y copas)
  if (valor === 12) return 7;       // Doces
  if (valor === 11) return 6;       // Onces
  if (valor === 10) return 5;       // Dieces
  if (valor === 7) return 4;        // Sietes falsos (copas y bastos)
  if (valor === 6) return 3;        // Seises
  if (valor === 5) return 2;        // Cincos
  if (valor === 4) return 1;        // Cuatros
  return 0;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  inicializarMazoSelector();
});

function inicializarMazoSelector() {
  // Obtener elementos del DOM
  mazoGrid = document.querySelector('.mazo-grid');
  mazoPreview = document.querySelector('.mazo-preview');
  btnJugar = document.getElementById('btnJugar');
  cartasSeleccionadasSpan = document.querySelector('.cartas-seleccionadas');
  ordenSelect = document.getElementById('ordenSelect');
  
  // Cargar todas las cartas del mazo
  cargarMazoCompleto();
  
  // Configurar eventos
  configurarEventos();
  
  // Actualizar interfaz
  actualizarInterfaz();
}

// Función para filtrar y ordenar el mazo
function filtrarYOrdenarMazo() {
  // Filtrar por palo
  if (filtroPaloActual === 'todos') {
      mazoFiltrado = [...MAZO_COMPLETO, ...CARTAS_ESPECIALES];
  } else if (filtroPaloActual === 'especial') {
      mazoFiltrado = [...CARTAS_ESPECIALES];
  } else {
      mazoFiltrado = MAZO_COMPLETO.filter(carta => carta.palo === filtroPaloActual);
  }
  
  // Ordenar según la selección
  switch (ordenActual) {
      case 'numero-asc':
          mazoFiltrado.sort((a, b) => a.valor - b.valor);
          break;
      case 'numero-desc':
          mazoFiltrado.sort((a, b) => b.valor - a.valor);
          break;
      case 'poder-asc':
          mazoFiltrado.sort((a, b) => obtenerPoderTruco(a) - obtenerPoderTruco(b));
          break;
      case 'poder-desc':
          mazoFiltrado.sort((a, b) => obtenerPoderTruco(b) - obtenerPoderTruco(a));
          break;
      case 'palo':
          mazoFiltrado.sort((a, b) => {
              const ordenPalos = ['espada', 'basto', 'oro', 'copa'];
              const ordenA = ordenPalos.indexOf(a.palo);
              const ordenB = ordenPalos.indexOf(b.palo);
              if (ordenA === ordenB) {
                  return a.valor - b.valor;
              }
              return ordenA - ordenB;
          });
          break;
      default:
          // Mantener orden original
          break;
  }
  
  // Renderizar el mazo filtrado
  renderizarMazoFiltrado();
}

function cargarMazoCompleto() {
  // Inicializar mazo filtrado con todas las cartas
  mazoFiltrado = [...MAZO_COMPLETO];
  renderizarMazoFiltrado();
}

function renderizarMazoFiltrado() {
  mazoGrid.innerHTML = '';
  
  mazoFiltrado.forEach((carta, index) => {
      const cartaElement = crearElementoCarta(carta, index);
      mazoGrid.appendChild(cartaElement);
  });
}

function crearElementoCarta(carta, index) {
  const cartaDiv = document.createElement('div');
  cartaDiv.className = 'mazo-carta';
  cartaDiv.dataset.cartaId = carta.id;
  cartaDiv.dataset.index = index;
  
  if (carta.esEspecial) {
      // Carta especial
      cartaDiv.innerHTML = `
          <div style="text-align: center; padding: 8px;">
              <div style="font-size: 0.7rem; font-weight: bold; color: #8B4513; margin-bottom: 4px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">${carta.nombre}</div>
              <div style="font-size: 0.6rem; color: #DAA520; margin-bottom: 2px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">Jerarquía: ${carta.jerarquia}</div>
              <div style="font-size: 0.6rem; color: #CD853F; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">Envido: ${carta.envidoBase}</div>
          </div>
      `;
      cartaDiv.style.display = 'flex';
      cartaDiv.style.alignItems = 'center';
      cartaDiv.style.justifyContent = 'center';
      cartaDiv.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
      cartaDiv.style.border = '2px solid #DAA520';
      cartaDiv.style.color = '#8B4513';
      cartaDiv.style.textAlign = 'center';
      cartaDiv.style.lineHeight = '1.2';
      cartaDiv.style.borderRadius = '8px';
      cartaDiv.draggable = true;
      
      // Agregar indicador de jerarquía
      const jerarquiaDiv = document.createElement('div');
      jerarquiaDiv.className = 'jerarquia-especial';
      jerarquiaDiv.textContent = carta.jerarquia;
      jerarquiaDiv.style.position = 'absolute';
      jerarquiaDiv.style.top = '5px';
      jerarquiaDiv.style.left = '5px';
      jerarquiaDiv.style.background = 'rgba(139, 69, 19, 0.9)';
      jerarquiaDiv.style.color = '#FFD700';
      jerarquiaDiv.style.borderRadius = '50%';
      jerarquiaDiv.style.width = '20px';
      jerarquiaDiv.style.height = '20px';
      jerarquiaDiv.style.display = 'flex';
      jerarquiaDiv.style.alignItems = 'center';
      jerarquiaDiv.style.justifyContent = 'center';
      jerarquiaDiv.style.fontSize = '0.7rem';
      jerarquiaDiv.style.fontWeight = 'bold';
      jerarquiaDiv.style.border = '1px solid #FFD700';
      jerarquiaDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      cartaDiv.appendChild(jerarquiaDiv);
      
      // Crear tooltip con efectos
      const tooltip = crearTooltipEspecial(carta);
      cartaDiv.setAttribute('data-tooltip', tooltip);
      
  } else if (carta.imagen) {
      // Carta con imagen
      const img = document.createElement('img');
      img.src = carta.imagen;
      img.alt = carta.nombre;
      img.draggable = true;
      cartaDiv.appendChild(img);
      
      // Agregar indicador de poder de truco
      const poderTruco = obtenerPoderTruco(carta);
      if (poderTruco > 0) {
          const poderDiv = document.createElement('div');
          poderDiv.className = 'poder-truco';
          poderDiv.textContent = poderTruco;
          poderDiv.style.position = 'absolute';
          poderDiv.style.top = '5px';
          poderDiv.style.left = '5px';
          poderDiv.style.background = 'rgba(0, 0, 0, 0.8)';
          poderDiv.style.color = 'white';
          poderDiv.style.borderRadius = '50%';
          poderDiv.style.width = '20px';
          poderDiv.style.height = '20px';
          poderDiv.style.display = 'flex';
          poderDiv.style.alignItems = 'center';
          poderDiv.style.justifyContent = 'center';
          poderDiv.style.fontSize = '0.7rem';
          poderDiv.style.fontWeight = 'bold';
          cartaDiv.appendChild(poderDiv);
      }
  } else {
      // Carta sin imagen - mostrar texto
      const poderTruco = obtenerPoderTruco(carta);
      cartaDiv.innerHTML = `
          <div style="text-align: center;">
              <div style="font-size: 0.8rem; font-weight: bold; color: #333;">${carta.valor} de ${carta.palo}</div>
              ${poderTruco > 0 ? `<div style="font-size: 0.6rem; color: #666; margin-top: 2px;">Poder: ${poderTruco}</div>` : ''}
          </div>
      `;
      cartaDiv.style.display = 'flex';
      cartaDiv.style.alignItems = 'center';
      cartaDiv.style.justifyContent = 'center';
      cartaDiv.style.fontSize = '0.8rem';
      cartaDiv.style.fontWeight = 'bold';
      cartaDiv.style.color = '#333';
      cartaDiv.style.textAlign = 'center';
      cartaDiv.style.lineHeight = '1.2';
      cartaDiv.style.padding = '8px';
      cartaDiv.style.background = '#fffbe6';
      cartaDiv.style.border = '2px solid #b48a5a';
      cartaDiv.draggable = true;
  }
  
  // Eventos de la carta
  cartaDiv.addEventListener('click', () => toggleSeleccionCarta(carta));
  cartaDiv.addEventListener('dragstart', (e) => iniciarDrag(e, carta));
  cartaDiv.addEventListener('dragend', finalizarDrag);
  
  return cartaDiv;
}

// Función para crear tooltip de carta especial
function crearTooltipEspecial(carta) {
  let tooltip = `${carta.nombre}\n`;
  tooltip += `Jerarquía: ${carta.jerarquia} | Envido: ${carta.envidoBase}\n\n`;
  tooltip += `Efectos:\n`;
  
  carta.efectos.forEach(efecto => {
      const cooldownText = getCooldownText(efecto.cooldown);
      tooltip += `• ${efecto.nombre} (${cooldownText})\n`;
      tooltip += `  ${efecto.descripcion}\n\n`;
  });
  
  return tooltip;
}

// Función para obtener texto del cooldown
function getCooldownText(cooldown) {
  switch (cooldown) {
      case 'always': return 'Siempre';
      case 'oncePerTurn': return '1x/Turno';
      case 'oncePerRound': return '1x/Ronda';
      case 'oncePerRun': return '1x/Partida';
      default: return cooldown;
  }
}

function toggleSeleccionCarta(carta) {
  if (cartasSeleccionadas.has(carta.id)) {
      // Deseleccionar carta
      cartasSeleccionadas.delete(carta.id);
      mazoSeleccionado = mazoSeleccionado.filter(c => c.id !== carta.id);
  } else {
      // Verificar límite de 48 cartas
      if (mazoSeleccionado.length >= 43) {
          alert('¡Máximo 43 cartas! Ya tienes el límite permitido.');
          return;
      }
      // Seleccionar carta
      cartasSeleccionadas.add(carta.id);
      mazoSeleccionado.push(carta);
  }
  
  actualizarInterfaz();
}

function iniciarDrag(e, carta) {
  e.dataTransfer.setData('text/plain', carta.id);
  e.target.closest('.mazo-carta').classList.add('dragging');
}

function finalizarDrag(e) {
  e.target.closest('.mazo-carta').classList.remove('dragging');
}

function configurarEventos() {
  // Evento de drop en el preview
  mazoPreview.addEventListener('dragover', (e) => {
      e.preventDefault();
      mazoPreview.style.borderColor = '#27ae60';
      mazoPreview.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
  });
  
  mazoPreview.addEventListener('dragleave', (e) => {
      e.preventDefault();
      mazoPreview.style.borderColor = 'rgba(39, 174, 96, 0.3)';
      mazoPreview.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  });
  
  mazoPreview.addEventListener('drop', (e) => {
      e.preventDefault();
      mazoPreview.style.borderColor = 'rgba(39, 174, 96, 0.3)';
      mazoPreview.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      
      const cartaId = e.dataTransfer.getData('text/plain');
      const carta = MAZO_COMPLETO.find(c => c.id === cartaId) || CARTAS_ESPECIALES.find(c => c.id === cartaId);
      
      if (carta && !cartasSeleccionadas.has(carta.id)) {
          // Verificar límite de 48 cartas
          if (mazoSeleccionado.length >= 43) {
              alert('¡Máximo 43 cartas! Ya tienes el límite permitido.');
              return;
          }
          cartasSeleccionadas.add(carta.id);
          mazoSeleccionado.push(carta);
          actualizarInterfaz();
      }
  });
  
  // Evento del botón jugar
  btnJugar.addEventListener('click', iniciarJuego);
  
  // Eventos de filtros y ordenamiento
  configurarEventosFiltros();
}

function configurarEventosFiltros() {
  // Evento para el select de ordenamiento
  ordenSelect.addEventListener('change', (e) => {
      ordenActual = e.target.value;
      filtrarYOrdenarMazo();
  });
  
  // Eventos para los botones de filtro por palo
  document.querySelectorAll('.filtro-palo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
          // Remover clase activo de todos los botones
          document.querySelectorAll('.filtro-palo-btn').forEach(b => b.classList.remove('activo'));
          
          // Agregar clase activo al botón clickeado
          e.target.classList.add('activo');
          
          // Actualizar filtro
          filtroPaloActual = e.target.dataset.palo;
          filtrarYOrdenarMazo();
      });
  });
}

function actualizarInterfaz() {
  // Actualizar contador de cartas seleccionadas
  cartasSeleccionadasSpan.textContent = mazoSeleccionado.length;
  
  // Aplicar estilo de límite alcanzado al contador
  if (mazoSeleccionado.length >= 43) {
      cartasSeleccionadasSpan.classList.add('limite-alcanzado');
  } else {
      cartasSeleccionadasSpan.classList.remove('limite-alcanzado');
  }
  
  // Actualizar contador de cartas filtradas
  const cartasTotalesSpan = document.querySelector('.cartas-totales');
  if (cartasTotalesSpan) {
      cartasTotalesSpan.textContent = mazoFiltrado.length;
  }
  
  // Verificar límites para el botón jugar
  const tieneCartas = mazoSeleccionado.length > 0;
  const tieneLimiteMinimo = mazoSeleccionado.length >= 40; // Mínimo 40 cartas
  const tieneLimiteMaximo = mazoSeleccionado.length <= 43; // Máximo 43 cartas
  
  // Actualizar estado del botón jugar
  btnJugar.disabled = !tieneCartas || !tieneLimiteMinimo || !tieneLimiteMaximo;
  
  // Actualizar texto del botón según el estado
  if (!tieneCartas) {
      btnJugar.textContent = '¡SELECCIONA CARTAS!';
  } else if (!tieneLimiteMinimo) {
      btnJugar.textContent = `FALTAN ${40 - mazoSeleccionado.length} CARTAS`;
  } else if (!tieneLimiteMaximo) {
      btnJugar.textContent = '¡DEMASIADAS CARTAS!';
  } else {
      btnJugar.textContent = '¡JUGAR!';
  }
  
  // Actualizar visual de cartas seleccionadas en el grid
  document.querySelectorAll('.mazo-carta').forEach(cartaDiv => {
      const cartaId = cartaDiv.dataset.cartaId;
      if (cartasSeleccionadas.has(cartaId)) {
          cartaDiv.classList.add('seleccionada');
          cartaDiv.classList.remove('limite-alcanzado');
      } else {
          cartaDiv.classList.remove('seleccionada');
          // Aplicar estilo de límite alcanzado si ya tenemos 48 cartas
          if (mazoSeleccionado.length >= 43) {
              cartaDiv.classList.add('limite-alcanzado');
          } else {
              cartaDiv.classList.remove('limite-alcanzado');
          }
      }
  });
  
  // Actualizar preview del mazo seleccionado
  actualizarPreviewMazo();
}

function actualizarPreviewMazo() {
  mazoPreview.innerHTML = '';
  
  mazoSeleccionado.forEach((carta, index) => {
      const previewCarta = document.createElement('div');
      previewCarta.className = 'preview-carta';
      previewCarta.dataset.cartaId = carta.id;
      
      if (carta.esEspecial) {
          // Carta especial
          previewCarta.innerHTML = `
              <div style="text-align: center; padding: 4px;">
                  <div style="font-size: 0.5rem; font-weight: bold; color: #8B4513; margin-bottom: 2px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">${carta.nombre}</div>
                  <div style="font-size: 0.4rem; color: #DAA520; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">J:${carta.jerarquia} E:${carta.envidoBase}</div>
              </div>
          `;
          previewCarta.style.display = 'flex';
          previewCarta.style.alignItems = 'center';
          previewCarta.style.justifyContent = 'center';
          previewCarta.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
          previewCarta.style.border = '1px solid #DAA520';
          previewCarta.style.color = '#8B4513';
          previewCarta.style.textAlign = 'center';
          previewCarta.style.lineHeight = '1.1';
          previewCarta.style.borderRadius = '6px';
          
          // Agregar indicador de jerarquía
          const jerarquiaDiv = document.createElement('div');
          jerarquiaDiv.className = 'jerarquia-especial';
          jerarquiaDiv.textContent = carta.jerarquia;
          jerarquiaDiv.style.position = 'absolute';
          jerarquiaDiv.style.top = '2px';
          jerarquiaDiv.style.left = '2px';
          jerarquiaDiv.style.background = 'rgba(139, 69, 19, 0.9)';
          jerarquiaDiv.style.color = '#FFD700';
          jerarquiaDiv.style.borderRadius = '50%';
          jerarquiaDiv.style.width = '16px';
          jerarquiaDiv.style.height = '16px';
          jerarquiaDiv.style.display = 'flex';
          jerarquiaDiv.style.alignItems = 'center';
          jerarquiaDiv.style.justifyContent = 'center';
          jerarquiaDiv.style.fontSize = '0.5rem';
          jerarquiaDiv.style.fontWeight = 'bold';
          jerarquiaDiv.style.border = '1px solid #FFD700';
          previewCarta.appendChild(jerarquiaDiv);
          
          // Crear tooltip con efectos
          const tooltip = crearTooltipEspecial(carta);
          previewCarta.setAttribute('data-tooltip', tooltip);
          
      } else if (carta.imagen) {
          // Carta con imagen
          const img = document.createElement('img');
          img.src = carta.imagen;
          img.alt = carta.nombre;
          previewCarta.appendChild(img);
      } else {
          // Carta sin imagen - mostrar texto
          previewCarta.textContent = `${carta.valor} de ${carta.palo}`;
          previewCarta.style.display = 'flex';
          previewCarta.style.alignItems = 'center';
          previewCarta.style.justifyContent = 'center';
          previewCarta.style.fontSize = '0.6rem';
          previewCarta.style.fontWeight = 'bold';
          previewCarta.style.color = '#333';
          previewCarta.style.textAlign = 'center';
          previewCarta.style.lineHeight = '1.1';
          previewCarta.style.padding = '4px';
          previewCarta.style.background = '#fffbe6';
          previewCarta.style.border = '2px solid #b48a5a';
      }
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '×';
      removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removerCartaDelMazo(carta.id);
      });
      
      // Hacer la carta draggable para reordenar
      previewCarta.draggable = true;
      previewCarta.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ cartaId: carta.id, index }));
      });
      
      previewCarta.addEventListener('dragover', (e) => e.preventDefault());
      previewCarta.addEventListener('drop', (e) => {
          e.preventDefault();
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          reordenarMazo(data.index, index);
      });
      
      mazoPreview.appendChild(previewCarta);
  });
}

function removerCartaDelMazo(cartaId) {
  cartasSeleccionadas.delete(cartaId);
  mazoSeleccionado = mazoSeleccionado.filter(c => c.id !== cartaId);
  actualizarInterfaz();
}

function reordenarMazo(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;
  
  const carta = mazoSeleccionado.splice(fromIndex, 1)[0];
  mazoSeleccionado.splice(toIndex, 0, carta);
  
  actualizarInterfaz();
}

function iniciarJuego() {
  if (mazoSeleccionado.length === 0) {
      alert('Debes seleccionar al menos una carta para jugar');
      return;
  }
  
  // Guardar el mazo seleccionado en localStorage para que esté disponible en el juego
  localStorage.setItem('mazoSeleccionado', JSON.stringify(mazoSeleccionado));
  
  // Redirigir al juego principal
  window.location.href = 'trucovanilla.html';
}

// Función para obtener el mazo seleccionado (para usar en el juego principal)
function obtenerMazoSeleccionado() {
  const mazoGuardado = localStorage.getItem('mazoSeleccionado');
  return mazoGuardado ? JSON.parse(mazoGuardado) : [];
}

// Función para limpiar el mazo guardado (para usar cuando termine el juego)
function limpiarMazoGuardado() {
  localStorage.removeItem('mazoSeleccionado');
}

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
      obtenerMazoSeleccionado,
      limpiarMazoGuardado,
      MAZO_COMPLETO
  };
}
