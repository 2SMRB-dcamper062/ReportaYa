Usage: Crear cuentas de Ayuntamiento (admins)
===========================================

Este script crea un usuario en Firebase Authentication y guarda un documento en Firestore con `role: 'ADMIN'`.

Requisitos:
- Tener un fichero de credenciales de servicio (service account JSON) con permisos para Auth y Firestore.
- Instalar la dependencia `firebase-admin` en el proyecto: `npm install firebase-admin`.

Ejemplo de uso:

```bash
# usando path a JSON
SERVICE_ACCOUNT_PATH=./serviceAccount.json npm run create-admin -- --email=alcaldia@sevilla.es --password=Secreto123 --name="Ayuntamiento Sevilla" --points=1000

# o con la variable JSON (útil en CI)
SERVICE_ACCOUNT_JSON='{"type":"..."}' npm run create-admin -- --email=alcaldia@sevilla.es --password=Secreto123
```

Notas:
- El script retorna en la consola el `uid` y la contraseña (si se genera una aleatoria). Guarda la contraseña en un lugar seguro.
- No expongas este script en entornos públicos. Ejecuta solo desde una máquina segura con el `serviceAccount.json`.
