
<div align="center">
  <img src="./public/logo.png" alt="ReportaYa Logo" height="200">

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

### 2. Configuración del Entorno (.env)

Es necesario crear un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
MONGO_URI=mongodb://localhost:27017/reportaya
DB_NAME=reportaya
PORT=3001
DOMAIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply.reportaya@gmail.com
SMTP_PASS=vxlx njyo pucz twnv
```

### 3. Instalar y Configurar (Rápido)

Si estás en **Ubuntu/Linux**, puedes instalador e iniciar la aplicación con un solo comando:
```bash
chmod +x fix-app.sh && ./fix-app.sh
```

<div align="center">
  Proyecto realizado por el equipo de ReportaYa
</div>
