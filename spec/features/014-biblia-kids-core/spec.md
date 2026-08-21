# 014 · Biblia Kids — API educativa y transición de dominio

**Estado:** en curso

## Qué hace

Convierte el backend en Biblia Kids: una API educativa para niños y adolescentes. Elimina los módulos funcionales, rutas y documentación de Canchago (organizaciones, sedes y canchas) y expone exclusivamente el contrato REST en español para usuarios, historias, niveles, juegos, progresos, libros, capítulos, versículos, favoritos y planes de lectura.

El control de acceso se conserva como RBAC global: usuarios, roles y permisos no dependen de organizaciones ni sedes.

## Por qué

El dominio anterior de gestión deportiva no forma parte del producto. Mantener sus rutas o referencias en Swagger confunde a los consumidores e introduce un modelo multi-tenant que Biblia Kids no utiliza.

## Criterios de aceptación

- [ ] No existe ninguna ruta, módulo activo, schema Prisma, registro OpenAPI ni referencia funcional a organizaciones, sedes, canchas o Canchago.
- [ ] El RBAC global permite administrar roles y permisos, y autorizar endpoints sin `organizationId`, `venueId` ni alcance de sede.
- [ ] Existen las rutas en español indicadas por el contrato para usuarios, historias, niveles, juegos, progresos, libros, capítulos, versículos, favoritos y planes de lectura.
- [ ] Las rutas antiguas bajo `/api/biblia-kids/*` y `/api/users/*` dejan de exponerse para evitar contratos duplicados.
- [ ] Todos los listados que pueden crecer son paginados y cada entrada, parámetro y filtro se valida con Zod.
- [ ] Las mutaciones de contenido y RBAC requieren autenticación y permisos; cada usuario solo accede a sus propios progresos, favoritos y planes salvo permisos administrativos explícitos.
- [ ] Las eliminaciones de historias, niveles, juegos y recursos bíblicos son desactivaciones lógicas; el historial de progreso se conserva.
- [ ] Swagger muestra únicamente el contrato aprobado, con respuestas estandarizadas y seguridad por cookie.

### Documentación (obligatorio)

- [ ] Todas las rutas del contrato están registradas en `documentation/schemas/` mediante `registry.registerPath()`.
- [ ] Los schemas de entrada y salida están registrados en el mismo módulo de documentación.
- [ ] Los módulos se exportan desde `documentation/schemas/index.ts`.
- [ ] Las rutas y schemas aparecen correctamente en `GET /api/docs`.

## Fuera de alcance

- Aplicación Flutter, pantallas visuales o componentes frontend.
- Consentimiento parental, que corresponde a la feature 015.
- Reescritura o eliminación de migraciones históricas ya aplicadas.
