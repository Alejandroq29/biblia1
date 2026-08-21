# Constitución técnica — Backend Biblia Kids

## Propósito

El backend expone una API REST educativa para historias bíblicas, niveles, juegos, progreso, lecturas y cuentas. La API protege la información personal y el aprendizaje de menores.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 22 o superior |
| Framework | Next.js 16 con Pages Router |
| API | `next-connect` y API Routes bajo `pages/api/` |
| Base de datos | PostgreSQL con Prisma 7 |
| Validación | Zod 4 |
| Sesión | OAuth 2.0, OIDC, PKCE y cookies cifradas con `@hapi/iron` |
| Caché y tareas | Redis, BullMQ e ioredis |
| Logs | Pino |
| Pruebas | Vitest |
| Paquetes | Yarn |

## Arquitectura

```text
HTTP → API Route → middleware → servicio → database → Prisma → PostgreSQL
```

- `pages/api/` valida el método, encadena middleware y devuelve respuestas HTTP.
- `middleware/` resuelve sesión, permisos y manejo uniforme de errores.
- `services/` contiene las reglas de aplicación.
- `database/` encapsula todas las consultas Prisma.
- `validations/` contiene los esquemas Zod.
- `documentation/` registra los contratos OpenAPI.
- `workers/` ejecuta tareas asíncronas.

Las rutas API no realizan consultas Prisma ni contienen reglas de negocio.

## Dominio educativo

- Participantes y perfiles.
- Historias bíblicas, niveles y juegos.
- Intentos, puntajes y progreso individual.
- Libros, capítulos, versículos, favoritos y planes de lectura.
- Roles y permisos globales para el acceso administrativo al contenido.

## Reglas de datos

- El progreso se actualiza de forma transaccional al registrar un intento.
- El contenido se desactiva cuando corresponda, preservando el historial de aprendizaje.
- Las fechas se almacenan en UTC.
- Las consultas ordinarias excluyen registros inactivos o eliminados.
- Los listados con crecimiento potencial son paginados.

## Seguridad

- Ninguna contraseña, token, cookie o dato sensible aparece en logs o respuestas de error.
- La sesión valida `state`, `nonce`, firma, emisor, audiencia y expiración.
- Los permisos se verifican en el backend para cada ruta protegida.
- Todas las entradas se validan con Zod.
- No usar `any`, SQL concatenado ni `PrismaClient` fuera de `database/client.ts`.

## Respuestas de API

```json
{ "data": { "id": "uuid" } }
```

```json
{ "data": [], "meta": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 0 } }
```

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

## Verificación

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```
