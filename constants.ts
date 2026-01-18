
import { Issue, IssueCategory, IssueStatus, UserRole, ShopItem } from './types';

// Sevilla Center
export const SEVILLA_CENTER = { lat: 37.3891, lng: -5.9845 };

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
    id: 'frame_betis',
    name: 'Verdiblanco',
    description: 'Para los fieles de Heliópolis.',
    cost: 100,
    type: 'frame',
    previewValue: 'border-green-600 ring-4 ring-white border-double'
  },
  {
    id: 'frame_seville',
    name: 'Rojo Sevilla',
    description: 'Para los fieles de Nervión.',
    cost: 100,
    type: 'frame',
    previewValue: 'border-red-700 ring-4 ring-white border-double'
  },
  {
    id: 'frame_gold',
    name: 'Marco Oro',
    description: 'Un toque de elegancia para ciudadanos ejemplares.',
    cost: 250,
    type: 'frame',
    previewValue: 'border-yellow-400 ring-4 ring-yellow-200'
  },
  {
    id: 'frame_feria',
    name: 'Feria de Abril',
    description: 'Estilo farolillos y lunares.',
    cost: 350,
    type: 'frame',
    previewValue: 'border-red-500 ring-4 ring-green-500 border-dashed'
  },
  {
    id: 'frame_nazareno',
    name: 'Semana Santa',
    description: 'Solemne morado nazareno.',
    cost: 450,
    type: 'frame',
    previewValue: 'border-purple-800 ring-4 ring-purple-300'
  },
  {
    id: 'frame_triana',
    name: 'Cerámica Triana',
    description: 'Inspirado en los azulejos del puente.',
    cost: 600,
    type: 'frame',
    previewValue: 'border-blue-600 ring-4 ring-yellow-400 border-dotted'
  },
  {
    id: 'frame_diamond',
    name: 'Diamante VIP',
    description: 'Solo para los ciudadanos más activos.',
    cost: 1000,
    type: 'frame',
    previewValue: 'border-cyan-300 ring-4 ring-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
  },

  // --- FONDOS (BACKGROUNDS) ---
  {
    id: 'bg_default',
    name: 'Verde Esperanza',
    description: 'Fondo Verde Esperanza.',
    cost: 10,
    type: 'background',
    previewValue: 'bg-gradient-to-r from-green-500 to-green-700'
  },
  {
    id: 'bg_alameda',
    name: 'Atardecer Plaza España',
    description: 'Atardecer Plaza España.',
    cost: 150,
    type: 'background',
    previewValue: "bg-[url('/atardecer-plaza-espana.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_guadalquivir',
    name: 'Río Guadalquivir',
    description: 'Frescura azul verdosa.',
    cost: 250,
    type: 'background',
    previewValue: "bg-[url('/rio_guadalquivir.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_azahar',
    name: 'Catedral de Sevilla',
    description: 'Catedral de Sevilla.',
    cost: 300,
    type: 'background',
    previewValue: "bg-[url('/catedral.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_giralda',
    name: 'Atardecer Giralda',
    description: 'Los colores del cielo sobre la torre.',
    cost: 500,
    type: 'background',
    previewValue: "bg-[url('/atardecer_giralda.jpg')] bg-cover bg-center"
  },
    {
    id: 'bg_alcazar',
    name: 'Oro del Alcázar',
    description: 'Lujo histórico y patrones dorados.',
    cost: 700,
    type: 'background',
    previewValue: "bg-[url('/alcazar_patio.jpg')] bg-cover bg-center"
  },
  {
    id: 'bg_noche',
    name: 'Noche Sevillana',
    description: 'Elegancia nocturna bajo las estrellas.',
    cost: 900,
    type: 'background',
    previewValue: "bg-[url('/noche_sevillana.jpg')] bg-cover bg-center"
  }
];

// --- BADGES / PROFILE TAGS ---
// Small items that users can buy to set as their profile tag
export const BADGE_ITEMS: ShopItem[] = [
  {
    id: 'tag_colaborador',
    name: 'Colaborador',
    description: 'Usuario activo que colabora con su barrio.',
    cost: 20,
    type: 'badge',
    previewValue: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'tag_guardian',
    name: 'Guardián de Sevilla',
    description: 'Protege y vigila tu entorno urbano.',
    cost: 50,
    type: 'badge',
    previewValue: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'tag_mvp',
    name: 'MVP Ciudadano',
    description: 'Reconocimiento por contribuciones destacadas.',
    cost: 120,
    type: 'badge',
    previewValue: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'tag_voluntario',
    name: 'Voluntario',
    description: 'Participa en iniciativas de barrio.',
    cost: 30,
    type: 'badge',
    previewValue: 'bg-green-100 text-green-800'
  },
  {
    id: 'tag_conserje',
    name: 'Conserje',
    description: 'Cuida tu entorno y reporta anomalías.',
    cost: 15,
    type: 'badge',
    previewValue: 'bg-gray-100 text-gray-800'
  },
  // Premium tags (solo para usuarios Premium)
  {
    id: 'tag_elite',
    name: 'Élite Ciudadana',
    description: 'Etiqueta exclusiva para usuarios Premium.',
    cost: 450,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
  },
  {
    id: 'tag_embajador',
    name: 'Embajador',
    description: 'Representante activo y reconocido de la comunidad.',
    cost: 600,
    type: 'badge',
    previewValue: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
  },
  {
    id: 'tag_founder',
    name: 'Founder',
    description: 'Edición limitada para mecenas fundadores.',
    cost: 1000,
    type: 'badge',
    previewValue: 'bg-black text-yellow-300'
  }
];

// Merge badge items into SHOP_ITEMS so the shop shows them
export const ALL_SHOP_ITEMS: ShopItem[] = [...SHOP_ITEMS, ...BADGE_ITEMS];

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

// Cost in points to unlock Premium via in-app points purchase
// Set to 500 points for in-app purchase with points
export const PREMIUM_COST_POINTS = 500;
