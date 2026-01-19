export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin', // Represents City Hall / Community Manager
}

export enum IssueStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Proceso',
  RESOLVED = 'Resuelto',
}

export enum IssueCategory {
  INFRASTRUCTURE = 'Infraestructura (Baches/Aceras)',
  LIGHTING = 'Alumbrado',
  CLEANING = 'Limpieza/Basura',
  NOISE = 'Ruido',
  PARKS = 'Parques y Jardines',
  OTHER = 'Otro',
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Issue {
  id: string;
  title?: string; // Título del reporte
  description?: string; // Descripción del reporte
  category?: IssueCategory; // Categoría del reporte
  status: IssueStatus;
  location?: Location; // Ubicación del reporte
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  votes?: number; // Número de votos del reporte
  author?: string; // Made optional to resolve the error
  adminResponse?: string;
}

export type ItemType = 'frame' | 'background' | 'badge';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: ItemType;
  previewValue: string; // URL for bg, or CSS class/color for frame
  premium?: boolean;
  minLevel?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  points: number;
  inventory: string[]; // Array of ShopItem IDs
  equippedFrame?: string; // ID of equipped frame
  equippedBackground?: string; // ID of equipped background
  email: string; // Correo electrónico del usuario
  experience?: number;
  profileTag?: string;
  premium?: boolean;
  password?: string;
}
