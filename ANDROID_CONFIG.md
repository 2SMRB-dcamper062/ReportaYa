# Configuración de Android/PWA para Reporta Ya

## Cambios Realizados

La aplicación ha sido configurada para funcionar óptimamente en dispositivos Android como una Progressive Web App (PWA).

### 1. **index.html** - Meta tags mejorados
- ✅ Agregado viewport mejorado con `viewport-fit=cover` para soporte de notches
- ✅ Meta tags de Apple para iOS (home screen app, status bar style)
- ✅ Meta tags de Android y Microsoft para mejor integración
- ✅ Service Worker registration script
- ✅ Manifest.json link para PWA

### 2. **manifest.json** - Configuración PWA
- ✅ Nombre corto y descripción en español
- ✅ Modo `standalone` - la app se abre como aplicación nativa
- ✅ Tema oscuro compatible
- ✅ Orientación en modo portrait
- ✅ Acceso directo para crear reportes rápidamente
- ✅ Iconos en múltiples tamaños (192x192 y 512x512)

### 3. **sw.js (Service Worker)** - Soporte offline
- ✅ Caché de assets estáticos
- ✅ Estrategia "Network First, Cache Fallback" para mejor rendimiento
- ✅ Manejo de requests offline
- ✅ Sincronización en background (preparado para futuras mejoras)
- ✅ Actualización automática del service worker

### 4. **index.css** - Optimizaciones móviles
- ✅ Anti-aliasing y optimizaciones de fuentes para Android
- ✅ Deshabilitación de zoom innecesario
- ✅ Tamaño mínimo de 44px para botones (estándar iOS/Android)
- ✅ Soporte para dispositivos con notches (safe-area)
- ✅ Optimizaciones para Leaflet en móvil
- ✅ Prevención de zoom en inputs (44px+ de font-size)

### 5. **vite.config.ts** - Configuración de build
- ✅ Code splitting para vendor libraries
- ✅ Minificación con Terser
- ✅ Optimización de chunks para mejor caching

### 6. **browserconfig.xml** - Soporte Windows Tiles
- ✅ Configuración para tiles en Windows 11
- ✅ Tema de color consistente

## Cómo Usar en Android

### Opción 1: Agregar a Pantalla Principal (Recomendado)
1. Abre la app en Chrome/Firefox en Android
2. Toca el ⋮ (menú) → "Instalar aplicación" o "Instalar en pantalla principal"
3. La app se instalará como una aplicación nativa

### Opción 2: Acceso como Shortcut
1. Mantén presionado el icono de la app
2. Acceso directo a "Crear Reporte" disponible

## Beneficios

✅ **Experiencia nativa**: Se abre como una app sin barra del navegador
✅ **Funcionamiento offline**: Los assets estáticos se cachean automáticamente
✅ **Mejor rendimiento**: Optimizaciones específicas para móvil
✅ **Instalable**: Puede agregarse a pantalla principal
✅ **Responsive**: Funciona perfectamente en cualquier tamaño de pantalla
✅ **Seguro**: Funciona sobre HTTPS en producción
✅ **Accesible**: Botones y elementos con tamaños óptimos para touch

## Verificación en Desarrollo

Para probar en desarrollo:
1. Abre DevTools (F12) → Application → Service Workers
2. Verifica que el SW esté registrado
3. Revisa la pestaña "Manifest" para validar el manifest.json
4. Abre DevTools → Lighthouse para hacer audit de PWA

## Requisitos para Producción

Para que funcione completamente en Android:
- ✅ HTTPS (se recomienda implementar antes de ir a producción)
- ✅ manifest.json accesible
- ✅ Service Worker en `/sw.js`
- ✅ Icons en `/logo.png`
- ✅ Los cambios ya están implementados

## Próximas Mejoras Sugeridas

1. **Sincronización en background**: Guardar reportes offline y enviar cuando hay conexión
2. **Notificaciones**: Notificar al usuario sobre estado de reportes
3. **Geolocalización**: Mejorar detección automática de ubicación
4. **Modo offline mejorado**: Cache completo de datos frecuentes
5. **Splash screen**: Agregar pantalla de carga personalizada

## Notas Técnicas

- El localStorage está disponible y puede usarse para datos de usuario
- Las APIs geolocalización y cámara funcionan en dispositivos con permisos
- El caching es automático para GET requests (excepto /api/)
- Los cambios de configuración requieren cache invalidation manual en algunos navegadores
