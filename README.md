# Biblia Kids Backend

Backend REST de Biblia Kids para enseñar historias bíblicas mediante niveles y juegos interactivos a participantes de 6 a 18 años.

## Stack

- Node.js 22+
- Next.js 16 con Pages Router y `next-connect`
- TypeScript estricto
- PostgreSQL y Prisma 7
- Zod y OpenAPI
- OAuth 2.0/OIDC con sesiones seguras
- Vitest

Flutter consume esta API como cliente externo. Este repositorio no contiene frontend ni pantallas visuales.

## Desarrollo

```bash
yarn install
yarn generate
yarn migrate-deploy
yarn seed
yarn dev
```

La API queda disponible en `http://localhost:3000/api` y la documentación Swagger en `http://localhost:3000/api/docs`.

## Módulo Biblia Kids

- `GET/POST /api/biblia-kids/stories`
- `GET/PATCH/DELETE /api/biblia-kids/stories/:storyId`
- `GET/POST /api/biblia-kids/levels`
- `PATCH/DELETE /api/biblia-kids/levels/:levelId`
- `GET/POST /api/biblia-kids/games`
- `PATCH/DELETE /api/biblia-kids/games/:gameId`
- `POST /api/biblia-kids/attempts`
- `GET /api/biblia-kids/progress`

Las operaciones de contenido requieren permisos de administración. Los intentos y el progreso se vinculan al usuario autenticado.

## Verificación

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```
