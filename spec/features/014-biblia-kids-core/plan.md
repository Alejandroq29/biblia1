# 014 · Biblia Kids — Núcleo educativo — Plan

## Enfoque

Biblia Kids reemplaza el dominio anterior y usa el monolito modular existente: TypeScript sobre Node.js/Next.js, API Routes, `next-connect`, Zod, Prisma y PostgreSQL. Flutter queda como cliente REST externo.

## Implementación

1. Reemplazar la misión, el nombre del paquete y la información de OpenAPI.
2. Añadir modelos Prisma para historias, niveles, asociaciones, juegos, preguntas, intentos y progreso.
3. Crear la migración SQL y sembrar permisos `biblia-kids.*`.
4. Crear validaciones Zod para entradas, parámetros y paginación.
5. Encapsular queries y transacciones en `database/biblia-kids/`.
6. Exponer servicios en `services/biblia-kids/`.
7. Crear endpoints protegidos bajo `pages/api/biblia-kids/`.
8. Registrar schemas y rutas en `documentation/schemas/biblia-kids.ts`.
9. Añadir pruebas de validación, autorización, paginación y progreso.
10. Ejecutar `yarn lint`, `yarn typecheck`, `yarn test` y `yarn build`.
11. Marcar la feature como implementada y actualizar el roadmap.

## Decisiones

- **Backend en TypeScript/Next.js** — es el stack backend autorizado por la constitución; Flutter se integra como cliente.
- **PostgreSQL mediante Prisma** — mantiene asociaciones y progreso con integridad referencial.
- **Progreso separado de intentos** — el intento conserva historial y el progreso resume el estado actual.
- **Desactivación en lugar de borrado** — evita perder referencias de contenido usado por participantes.
- **Respuestas correctas privadas** — nunca se devuelven en consultas de juegos para impedir hacer trampa desde el cliente.

## Riesgos

- **Privacidad de menores** — se almacenan campos mínimos y se difiere consentimiento parental a la feature 015.
- **Migraciones con historial existente** — la nueva migración es aditiva y no modifica migraciones aplicadas.
- **Dependencias locales ausentes** — la validación requiere que el entorno pueda instalar Yarn y generar Prisma.
