# noir_blanc

## Cloudinary para productos

Las nuevas imagenes de productos ya no se guardan en `backend/uploads`. Ahora se suben a Cloudinary desde el backend y PostgreSQL conserva:

- `imagenPrincipal`
- `imagenPrincipalPublicId`
- `imagenes`
- `imagenesMetadata`

El backend sigue exponiendo `/uploads` solo para compatibilidad temporal con productos antiguos que todavia apunten a rutas locales.

## Variables requeridas

Configura estas variables solo en el backend:

```bash
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Desarrollo local

1. Instala dependencias:

```bash
cd backend
npm install
cd ../frontend
npm install
```

2. Agrega las credenciales de Cloudinary en `backend/.env`.

3. Ejecuta la migracion:

```bash
cd backend
npm run migration:run
```

4. Levanta backend y frontend:

```bash
cd backend
npm run start:dev
```

```bash
cd frontend
npm run dev
```

5. Verifica:

- las nuevas imagenes aparecen en la carpeta `noir-blanc/productos` de Cloudinary;
- PostgreSQL guarda la URL segura y el `public_id`;
- React muestra la URL devuelta por la API;
- no aparecen archivos nuevos dentro de `backend/uploads`.

## Railway

En el servicio del backend agrega:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

No configures estas variables en el frontend ni con prefijo `VITE_`.

Antes de arrancar la version nueva, ejecuta la migracion del backend:

```bash
cd backend
npm run migration:run:prod
```

Despues despliega normalmente el backend y el frontend con el flujo que ya uses en Railway.
