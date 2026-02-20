
<div align="center">
  <img src="https://via.placeholder.com/150x50?text=ReportaYa" alt="ReportaYa Logo" height="80">

  # ReportaYa 1.1 🏛️

  **La plataforma ciudadana de Sevilla**

  Reporta incidencias, gana puntos y mejora tu comunidad.
</div>

## 📌 Descripción

**ReportaYa** es una aplicación web progresiva (PWA) diseñada para fomentar la participación ciudadana en Sevilla. Permite a los usuarios reportar problemas urbanos (baches, farolas rotas, limpieza) de manera sencilla y gamificada.

Los usuarios pueden:
- 📸 **Reportar incidencias** con geolocalización y fotos.
- 🏆 **Ganar experiencia y subir de nivel** (Ciudadano -> Colaborador -> Guardián -> Héroe).
- 🛍️ **Personalizar su perfil** comprando marcos, fondos y medallas con los puntos ganados.
- 🌍 **Participar en su idioma**: Disponible en Español, Inglés, Francés, Italiano y Portugués.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **Registro Seguro**: Validación de contraseñas fuertes y envío de correo de bienvenida.
- **Acceso Restringido**: 
  - Solo usuarios registrados pueden navegar el mapa detallado.
  - Solo usuarios con código postal de **Sevilla** pueden crear reportes.
- **Gestión de Sesión**: Logout seguro y recuperación de contraseña vía email.

### 🗺️ Mapa Interactivo
- Visualización de incidencias en tiempo real sobre mapa (OpenStreetMap / Leaflet).
- Filtrado por categorías (Infraestructura, Limpieza, Seguridad, etc.) y estado.
- Geolocalización automática para nuevos reportes.

### 🎮 Gamificación
- **Sistema de Niveles**: Gana XP por cada reporte validado.
- **Tienda Virtual**: Canjea tus puntos por elementos cosméticos para tu avatar.
- **Ranking**: Compite por ser el ciudadano más activo.

### 🎨 Experiencia de Usuario (UX/UI)
- **Diseño Moderno**: Interfaz limpia tipo "Glassmorphism".
- **Modo Oscuro / Claro**: Adaptable a tus preferencias.
- **Responsivo**: Funciona perfectamente en móviles y escritorio.
- **Internacionalización (i18n)**: 5 idiomas soportados.

---

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno y eficiente:

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Mapas**: [React Leaflet](https://react-leaflet.js.org/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Base de Datos**: [MongoDB](https://www.mongodb.com/) (Controlador nativo)
- **Correos**: [Nodemailer](https://nodemailer.com/)

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ReportaYa.git
cd ReportaYa
```

### 2. Instalar y Configurar (Recomendado)

Si estás en un entorno Linux (como Ubuntu) o tienes errores de permisos (`EACCES`), usa el script de reparación:
```bash
chmod +x fix-app.sh
./fix-app.sh
```
*Este script corrige permisos, limpia procesos antiguos, instala dependencias y prepara la base de datos.*

### 3. Configuración Manual (Opcional)
Crea un archivo `.env` en la raíz (puedes copiar `.env.example` si existe) con:
```env
MONGODB_URI=mongodb://localhost:27017/reportaya
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
DOMAIN=http://localhost:5173
```

### 4. Iniciar la App (Desarrollo / Hot Reload)

> ⚠️ **Importante**: Asegúrate de que **MongoDB** esté ejecutándose en tu sistema (`mongod`) antes de iniciar.

Puedes ejecutar cualquiera de los dos comandos:
```bash
npm start
# O bien:
npm run dev
```

Ambos harán lo mismo:
1. Iniciar el Frontend en `http://localhost:5173`
2. Iniciar el Backend en `http://localhost:3000`

### 5. Producción (Opcional)
Si quieres probar la versión compilada como en producción:
1. `npm run build`
2. `node server/api.cjs`
(Esto correrá todo en `http://localhost:3000`).

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si deseas mejorar ReportaYa:
1. Haz un Fork del proyecto.
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`).
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`).
4. Push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

---

<div align="center">
  Hecho con ❤️ en Sevilla
</div>
