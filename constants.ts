
import { Issue, IssueCategory, IssueStatus, UserRole, ShopItem } from './types';

// Sevilla Center
export const SEVILLA_CENTER = { lat: 37.3891, lng: -5.9845 };

// Sevilla Bounding Box (Province-wide coverage, refined to exclude Huelva edge)
export const SEVILLA_BOUNDS = {
  minLat: 36.80,
  maxLat: 38.20,
  minLng: -6.30,
  maxLng: -4.70
};

// For Leaflet maxBounds format: [[southLat, westLng], [northLat, eastLng]]
export const SEVILLA_LEAFLET_BOUNDS: [[number, number], [number, number]] = [
  [SEVILLA_BOUNDS.minLat, SEVILLA_BOUNDS.minLng],
  [SEVILLA_BOUNDS.maxLat, SEVILLA_BOUNDS.maxLng]
];

export const SHOP_ITEMS: ShopItem[] = [
  // --- MARCOS (FRAMES) ---
  {
    id: 'frame_default',
    name: 'Borde Clásico',
    description: 'El estilo estándar.',
    cost: 0,
    type: 'frame',
    previewValue: 'border-white'
  },
  {
    id: 'frame_seville',
    name: 'Sevilla FC',
    description: 'Para los fieles de Nervión.',
    cost: 50,
    type: 'frame',
    previewValue: 'border-red-700 ring-4 ring-white border-double'
  },
  {
    id: 'frame_betis',
    name: 'Real Betis Balompié',
    description: 'Para los fieles de Heliópolis.',
    cost: 50,
    type: 'frame',
    previewValue: 'border-green-600 ring-4 ring-white border-double'
  },
  {
    id: 'frame_solid_neon',
    name: 'Azul Neón',
    description: 'Borde sólido brillante.',
    cost: 100,
    type: 'frame',
    previewValue: 'border-[6px] border-cyan-400 shadow-[0_0_10px_#22d3ee]'
  },
  {
    id: 'frame_solid_ruby',
    name: 'Rojo Rubí',
    description: 'Elegancia en color sólido.',
    cost: 100,
    type: 'frame',
    previewValue: 'border-[6px] border-red-600 shadow-[0_0_10px_#dc2626]'
  },
  {
    id: 'frame_gold',
    name: 'Marco Oro',
    description: 'Un toque de elegancia para ciudadanos ejemplares.',
    cost: 150,
    type: 'frame',
    previewValue: 'border-yellow-400 ring-4 ring-yellow-200'
  },
  {
    id: 'frame_feria',
    name: 'Feria de Abril',
    description: 'Estilo farolillos y lunares.',
    cost: 200,
    type: 'frame',
    previewValue: 'border-red-500 ring-4 ring-green-500 border-dashed'
  },
  {
    id: 'frame_maestranza',
    name: 'Albero Maestranza',
    description: 'Colores de la plaza de toros.',
    cost: 200,
    type: 'frame',
    previewValue: 'border-yellow-600 ring-4 ring-white border-solid'
  },
  {
    id: 'frame_nazareno',
    name: 'Semana Santa',
    description: 'Solemne morado nazareno.',
    cost: 250,
    type: 'frame',
    previewValue: 'border-purple-800 ring-4 ring-purple-300'
  },
  {
    id: 'frame_alfalfa',
    name: 'Azulejo Alfalfa',
    description: 'Patrón cerámico del centro histórico.',
    cost: 250,
    type: 'frame',
    previewValue: 'border-blue-500 ring-4 ring-emerald-100 border-dotted'
  },
  {
    id: 'frame_grad_sunset',
    name: 'Atardecer',
    description: 'Gradiente cálido de Sevilla.',
    cost: 250,
    type: 'frame',
    previewValue: 'border-[6px] border-transparent bg-gradient-to-r from-orange-400 to-red-500 bg-clip-border'
  },
  {
    id: 'frame_grad_ocean',
    name: 'Océano',
    description: 'Gradiente refrescante.',
    cost: 250,
    type: 'frame',
    previewValue: 'border-[6px] border-transparent bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-border'
  },
  {
    id: 'frame_triana',
    name: 'Cerámica Triana',
    description: 'Inspirado en los azulejos del puente.',
    cost: 300,
    type: 'frame',
    previewValue: 'border-blue-600 ring-4 ring-yellow-400 border-dotted'
  },
  {
    id: 'frame_isabel',
    name: 'Puente de Triana',
    description: 'Inspirado en los arcos del puente de hierro.',
    cost: 300,
    type: 'frame',
    previewValue: 'border-slate-700 ring-2 ring-slate-400 border-double rounded-none'
  },
  {
    id: 'frame_metropol',
    name: 'Setas de Sevilla',
    description: 'Diseño orgánico de madera.',
    cost: 400,
    type: 'frame',
    previewValue: 'border-amber-100 ring-2 ring-amber-300 border-dashed rounded-xl'
  },
  {
    id: 'frame_diamond',
    name: 'Diamante VIP',
    description: 'Solo para los ciudadanos más activos.',
    cost: 500,
    type: 'frame',
    previewValue: 'border-cyan-300 ring-4 ring-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
  },
  {
    id: 'frame_mix_royal',
    name: 'Realeza',
    description: 'Mezcla de oro y púrpura.',
    cost: 400,
    type: 'frame',
    premium: true,
    previewValue: 'border-[6px] border-purple-700 ring-4 ring-yellow-400 shadow-xl'
  },
  {
    id: 'frame_mix_cyber',
    name: 'Cyber Sevilla',
    description: 'Estilo futurista mezclado.',
    cost: 500,
    type: 'frame',
    premium: true,
    previewValue: 'border-[6px] border-fuchsia-500 ring-2 ring-cyan-400 border-double'
  },

  // --- FONDOS (BACKGROUNDS) ---
  {
    id: 'bg_default',
    name: 'Verde Esperanza',
    description: 'Fondo Verde Esperanza.',
    cost: 50,
    type: 'background',
    previewValue: 'bg-gradient-to-r from-green-500 to-green-700'
  },
  {
    id: 'bg_cielo',
    name: 'Cielo Sevillano',
    description: 'Vistas de la ciudad y del cielo.',
    cost: 60,
    type: 'background',
    previewValue: "bg-[url('/cielo.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_alameda',
    name: 'Atardecer Plaza España',
    description: 'Atardecer Plaza España.',
    cost: 80,
    type: 'background',
    previewValue: "bg-[url('/atardecer-plaza-espana.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_mosaico',
    name: 'Feria de Sevilla',
    description: 'Feria de Sevilla.',
    cost: 80,
    type: 'background',
    previewValue: "bg-[url('/feria_sevilla.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_plaza_alba',
    name: 'Plaza al Alba',
    description: 'Tonos cálidos al amanecer.',
    cost: 90,
    type: 'background',
    previewValue: "bg-[url('/plaza_alba.jpg')] bg-cover bg-center brightness-95"
  },
  {
    id: 'bg_fondo_inicio',
    name: 'Fondo Inicio',
    description: 'Imagen de cabecera del sitio.',
    cost: 100,
    type: 'background',
    previewValue: "bg-[url('/fondo_inicio.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_guadalquivir',
    name: 'Río Guadalquivir',
    description: 'Frescura azul verdosa.',
    cost: 120,
    type: 'background',
    previewValue: "bg-[url('/rio_guadalquivir.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_azahar',
    name: 'Catedral de Sevilla',
    description: 'Catedral de Sevilla.',
    cost: 150,
    type: 'background',
    previewValue: "bg-[url('/catedral.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_azulejos',
    name: 'Azulejos Triana',
    description: 'Patrón inspirado en azulejos.',
    cost: 120,
    type: 'background',
    premium: true,
    previewValue: "bg-[url('/azulejo_triana.jpg')] bg-cover bg-center brightness-95"
  },
  {
    id: 'bg_giralda',
    name: 'Atardecer Giralda',
    description: 'Los colores del cielo sobre la torre.',
    cost: 250,
    type: 'background',
    premium: true,
    previewValue: "bg-[url('/atardecer_giralda.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_alcazar',
    name: 'Oro del Alcázar',
    description: 'Lujo histórico y patrones dorados.',
    cost: 350,
    type: 'background',
    premium: true,
    previewValue: "bg-[url('/alcazar_patio.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_noche',
    name: 'Noche Sevillana',
    description: 'Elegancia nocturna bajo las estrellas.',
    cost: 450,
    type: 'background',
    premium: true,
    previewValue: "bg-[url('/noche_sevillana.jpg')] bg-cover bg-center"
  }
];

// --- INSIGNIAS / ETIQUETAS DE PERFIL ---
// Pequeños items que los usuarios pueden comprar para establecer como etiqueta de perfil
export const BADGE_ITEMS: ShopItem[] = [
  {
    id: 'tag_colaborador',
    name: 'Colaborador',
    description: 'Usuario activo que colabora con su barrio.',
    cost: 100,
    type: 'badge',
    previewValue: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'tag_conserje',
    name: 'Conserje',
    description: 'Cuida tu entorno y reporta anomalías.',
    cost: 100,
    type: 'badge',
    previewValue: 'bg-gray-100 text-gray-800'
  },
  {
    id: 'tag_voluntario',
    name: 'Voluntario',
    description: 'Participa en iniciativas de barrio.',
    cost: 150,
    type: 'badge',
    previewValue: 'bg-green-100 text-green-800'
  },
  {
    id: 'tag_guardian',
    name: 'Guardián de Sevilla',
    description: 'Protege y vigila tu entorno urbano.',
    cost: 250,
    type: 'badge',
    previewValue: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'tag_mvp',
    name: 'MVP Ciudadano',
    description: 'Reconocimiento por contribuciones destacadas.',
    cost: 600,
    type: 'badge',
    previewValue: 'bg-purple-100 text-purple-800'
  },

  // Etiquetas premium (solo para usuarios Premium)
  {
    id: 'tag_elite',
    name: 'Élite Ciudadana',
    description: 'Etiqueta exclusiva para usuarios Premium.',
    cost: 1500,
    type: 'badge',
    premium: true,
    previewValue: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
  },
  {
    id: 'tag_embajador',
    name: 'Embajador',
    description: 'Representante activo y reconocido de la comunidad.',
    cost: 2000,
    type: 'badge',
    premium: true,
    previewValue: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
  },
  {
    id: 'tag_founder',
    name: 'Founder',
    description: 'Edición limitada para mecenas fundadores.',
    cost: 5000,
    type: 'badge',
    premium: true,
    previewValue: 'bg-black text-yellow-300'
  }
];

// Developer / Admin badges (exclusivas: no aparecen en la tienda)
export const EXCLUSIVE_BADGES: ShopItem[] = [
  {
    id: 'tag_developer',
    name: 'Developer',
    description: 'Insignia de desarrollador (test).',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-sky-200 to-sky-400 text-sky-800'
  },
  {
    id: 'tag_admin',
    name: 'Admin',
    description: 'Insignia de administrador municipal.',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900'
  }
];

// --- COLABORACIONES CON EMPRESAS DE SEVILLA ---
export const COLLAB_ITEMS: ShopItem[] = [
  {
    id: 'collab_sevici',
    name: 'Mes Sevici',
    description: 'Suscripción gratuita de 1 mes al servicio Sevici.',
    cost: 2500,
    type: 'collaboration',
    previewValue: 'bg-red-600 text-white'
  },
  {
    id: 'collab_lipasam',
    name: 'Vale Lipasam',
    description: 'Cupón de descuento de 5€ en servicios asociados.',
    cost: 3000,
    type: 'collaboration',
    previewValue: 'bg-orange-600 text-white'
  },
  {
    id: 'collab_emasesa',
    name: 'Descuento Emasesa',
    description: 'Descuento de 6€ en tu próxima factura del agua.',
    cost: 4000,
    type: 'collaboration',
    previewValue: 'bg-blue-700 text-white'
  },
  {
    id: 'collab_tussam',
    name: 'Bonobús Tussam',
    description: 'Recarga de 7€ para tu tarjeta de transporte Tussam.',
    cost: 5000,
    type: 'collaboration',
    previewValue: 'bg-emerald-600 text-white'
  },
  {
    id: 'collab_mercado',
    name: 'Mercado de Triana',
    description: 'Bono de 10€ para compras en el Mercado de Triana.',
    cost: 7000,
    type: 'collaboration',
    previewValue: 'bg-amber-700 text-white'
  },
  {
    id: 'collab_alcazar',
    name: 'Descuento Alcázar',
    description: 'Entrada reducida para residentes en el Real Alcázar.',
    cost: 2000,
    type: 'collaboration',
    premium: true,
    previewValue: 'bg-yellow-800 text-white'
  },
  {
    id: 'collab_catedral',
    name: 'Visita Catedral',
    description: 'Pase prioritario para la Catedral de Sevilla.',
    cost: 3500,
    type: 'collaboration',
    premium: true,
    previewValue: 'bg-neutral-800 text-white'
  },
  {
    id: 'collab_isla_magica',
    name: 'Bono Isla Mágica',
    description: '10€ de descuento en tu entrada a Isla Mágica.',
    cost: 6000,
    type: 'collaboration',
    premium: true,
    previewValue: 'bg-sky-500 text-white'
  }
];

// Merge badge and collab items into SHOP_ITEMS so the shop shows them
export const ALL_SHOP_ITEMS: ShopItem[] = [...SHOP_ITEMS, ...BADGE_ITEMS, ...COLLAB_ITEMS];

export const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Farola fundida en Plaza de España',
    description: 'La farola principal cerca de la fuente central no funciona desde hace dos noches. Es una zona muy oscura.',
    category: IssueCategory.LIGHTING,
    status: IssueStatus.PENDING,
    location: { lat: 37.3772, lng: -5.9869 },
    createdAt: '2023-10-25',
    votes: 5,
    author: 'Juan Pérez',
    imageUrl: 'https://picsum.photos/400/300',
  },
  {
    id: '2',
    title: 'Bache peligroso en Calle Betis',
    description: 'Hay un agujero grande en la calzada que puede dañar las motos.',
    category: IssueCategory.INFRASTRUCTURE,
    status: IssueStatus.IN_PROGRESS,
    location: { lat: 37.3841, lng: -6.0028 },
    createdAt: '2023-10-24',
    votes: 12,
    author: 'Ana García',
    imageUrl: 'https://picsum.photos/401/300',
  },
  {
    id: '3',
    title: 'Contenedores desbordados Triana',
    description: 'Basura acumulada fuera de los contenedores en la calle San Jacinto.',
    category: IssueCategory.CLEANING,
    status: IssueStatus.RESOLVED,
    location: { lat: 37.3835, lng: -6.0070 },
    createdAt: '2023-10-20',
    votes: 3,
    author: 'Carlos Ruiz',
    adminResponse: 'Servicio de limpieza enviado el 21/10. Gracias por el aviso.',
    imageUrl: 'https://picsum.photos/402/300',
  },
  {
    id: '4',
    title: 'Ruido excesivo bar local',
    description: 'Música alta hasta las 4 AM en zona residencial Alameda.',
    category: IssueCategory.NOISE,
    status: IssueStatus.PENDING,
    location: { lat: 37.3999, lng: -5.9960 },
    createdAt: '2023-10-26',
    votes: 8,
    author: 'Maria S.',
    imageUrl: 'https://picsum.photos/403/300',
  },
];

// Start user with enough points to buy one cheap item for demo purposes
export const MOCK_USER = {
  id: 'u1',
  name: 'Vecino de Sevilla',
  role: UserRole.CITIZEN,
  inventory: ['frame_default', 'bg_default'],
  equippedFrame: 'frame_default',
  equippedBackground: 'bg_default',
  points: 150,
  experience: 0
};

// Mock test users requested
export const MOCK_USERS = [
  {
    id: 'antonio.diaz',
    name: 'Antonio Díaz',
    role: UserRole.CITIZEN,
    inventory: ['frame_default', 'tag_developer'],
    equippedFrame: 'frame_default',
    equippedBackground: 'bg_default',
    points: 200,
    experience: 0,
    email: 'antonio.diaz@reportaya.es',
    password: 'reportaya_2025',
    profileTag: 'tag_developer'
  },
  {
    id: 'david.camacho',
    name: 'David Camacho',
    role: UserRole.CITIZEN,
    inventory: ['frame_default', 'tag_developer'],
    equippedFrame: 'frame_default',
    equippedBackground: 'bg_default',
    points: 300,
    experience: 0,
    email: 'david.camacho@reportaya.es',
    password: 'reportaya_2025',
    profileTag: 'tag_developer',
    premium: false
  }
];

// Badges desbloqueables por nivel (no están en la tienda)
export const LEVEL_BADGES: ShopItem[] = [
  {
    id: 'tag_nivel_20',
    name: 'Nivel 20',
    description: 'Desbloqueado al alcanzar nivel 20.',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-green-200 to-green-400 text-green-800',
    minLevel: 20
  },
  {
    id: 'tag_nivel_40',
    name: 'Nivel 40',
    description: 'Desbloqueado al alcanzar nivel 40.',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-teal-200 to-teal-400 text-teal-800',
    minLevel: 40
  },
  {
    id: 'tag_nivel_60',
    name: 'Nivel 60',
    description: 'Desbloqueado al alcanzar nivel 60.',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800',
    minLevel: 60
  },
  {
    id: 'tag_nivel_80',
    name: 'Nivel 80',
    description: 'Desbloqueado al alcanzar nivel 80.',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800',
    minLevel: 80
  },
  {
    id: 'tag_nivel_100',
    name: 'Nivel 100',
    description: 'Desbloqueado al alcanzar nivel 100.',
    cost: 0,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-purple-200 to-purple-400 text-purple-800',
    minLevel: 100
  }
];

// Cost in points to unlock Premium via in-app points purchase
// Set to 2000 points for in-app purchase with points
export const PREMIUM_COST_POINTS = 2000;
