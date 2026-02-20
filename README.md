
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

### 2. Instalar y Configurar (Rápido)

Si usas **Bash** (Git Bash, WSL, etc.), puedes configurar todo el entorno con un solo comando:
```bash
./fix-app.sh
```
*Este script limpiará artefactos previos, instalará dependencias, poblará la base de datos y compilará el frontend.*

### 3. Configurar manualmente (Opcional)

Si prefieres hacerlo paso a paso:

**A. Instalar dependencias**
```bash
npm install
```

**B. Configurar variables de entorno**
Crea un archivo `.env` en la raíz con:
```env
MONGODB_URI=mongodb://localhost:27017/reportaya
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
DOMAIN=http://localhost:5173
```

### 4. Iniciar la App (Desarrollo / Hot Reload)

> ⚠️ **Importante**: Asegúrate de tener **MongoDB** instalado. El comando de inicio intentará arrancar `mongod` automáticamente.

Para arrancar todo el sistema (Base de Datos + Backend + Frontend) de forma simultánea:
```bash
npm run dev
```

Esto lanzará:
1. **Frontend**: En `http://localhost:3000` (Vite)
2. **Backend (API)**: En `http://localhost:3001`
3. **Base de Datos**: MongoDB en su puerto por defecto (27017)

### 5. Poblar la Base de Datos (Seeding)

Para cargar los usuarios de prueba y reportes iniciales en tu base de datos local:
```bash
npm run seed:users
```

### 6. Usuarios de Prueba

Una vez poblada la base de datos, puedes usar estas credenciales:

| Tipo | Email | Contraseña |
|------|-------|------------|
| **Administrador** | `ayuntamiento@reportaya.es` | `ayuntamiento` |
| **Ciudadano** | `antonio.diaz@reportaya.es` | `reportaya_2025` |
| **Premium** | `david.camacho@reportaya.es` | `reportaya_2025` |

---

## 🏗️ Producción

Si deseas compilar la aplicación para producción:

1. **Compilar el frontend**:
   ```bash
   npm run build
   ```
2. **Lanzar el servidor unificado**:
   ```bash
   npm run serve
   ```
   *Esto servirá la aplicación completa (Frontend y API) en `http://localhost:3000`.*


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
