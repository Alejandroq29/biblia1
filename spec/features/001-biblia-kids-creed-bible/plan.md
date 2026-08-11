Plan de implementación

1. Revisar modelos Prisma y migraciones actuales (`prisma/schema.prisma`) y extender con tablas `books`, `chapters`, `verses`, `favorites`, `reading_plans` si es necesario.
2. Añadir queries y transacciones en `database/biblia-kids` para nuevos recursos y comportamientos (soft delete, cache, paginación).
3. Extender `services/biblia-kids` con funciones de negocio: sincronización de perfil, gestión de favoritos, generación de planes diarios, lógica de recompensas y niveles.
4. Crear rutas REST en `pages/api/biblia-kids/*` usando `next-connect`, middlewares existentes (`auth`, `access`) y validaciones Zod en `validations/biblia-kids`.
5. Añadir colas BullMQ para procesamiento asíncrono (e.g., analytics, recompensas) si procede.
6. Tests unitarios e integración: servicios y endpoints críticos.
7. Registrar componentes y paths en `documentation/schemas/biblia-kids.ts`.
8. Ejecutar `yarn lint && yarn typecheck && yarn test && yarn build` antes de cerrar la feature.
