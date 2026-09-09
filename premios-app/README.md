# Ceremonia de Premios — Base del sistema

## Stack
- Next.js 14 (App Router)
- Prisma + PostgreSQL
- NextAuth (Credentials)
- Vercel Blob (fotos/audios)

## Modelo de datos
- **User**: usuarios registrados.
- **Category**: categorías a votar (`TEXT`, `PHOTO`, `AUDIO`).
- **Vote**: un voto por usuario y categoría (constraint único `userId + categoryId`), con `textAnswer` o `fileUrl` según el tipo.

## Setup

```bash
npm install
cp .env.example .env   # completar DATABASE_URL, NEXTAUTH_SECRET, BLOB_READ_WRITE_TOKEN
npx prisma migrate dev --name init
npm run dev
```

- **DATABASE_URL**: crear una base gratis en [Neon](https://neon.tech) o [Supabase](https://supabase.com).
- **NEXTAUTH_SECRET**: generar con `openssl rand -base64 32`.
- **BLOB_READ_WRITE_TOKEN**: se obtiene creando un Blob Store en el dashboard de Vercel (Storage → Blob).

## Endpoints ya funcionando

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/api/register` | Crea un usuario nuevo |
| GET/POST | `/api/auth/[...nextauth]` | Login/logout (NextAuth) |
| GET/POST | `/api/categories` | Lista o crea categorías |
| GET | `/api/votes` | Devuelve las categorías en las que el usuario logueado ya votó |
| POST | `/api/votes` | Registra un voto (multipart/form-data: `categoryId`, `textAnswer` o `file`) |

## Falta (próximos pasos)
- Pantallas de login/registro.
- Pantalla de categorías con el formulario según `type`.
- Carga de categorías reales de la ceremonia.
- Diseño visual definitivo.
