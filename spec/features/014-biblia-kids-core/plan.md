# 014 · Biblia Kids — API educativa y transición de dominio — Plan

## Enfoque

Se consolida la API de Biblia Kids bajo nombres de recurso en español y Pages Router. La capa de datos conserva los modelos educativos existentes y recupera un RBAC global mínimo, sin ninguna relación multi-tenant. Las rutas no contendrán lógica de negocio: delegarán a validaciones, servicios y repositorios.

## Implementación

1. Revisar y retirar referencias funcionales a Canchago, organizaciones, sedes y canchas, sin reescribir migraciones históricas.
2. Ajustar Prisma y la migración pendiente para crear `Role`, `Permission`, `UserRole` y `RolePermission` globales, sin organizaciones ni sedes.
3. Implementar repositorios, servicios, validaciones y documentación de RBAC global.
4. Sustituir rutas inglesas y `/biblia-kids/*` por el contrato español aprobado: `/usuarios`, `/historias`, `/niveles`, `/juegos`, `/libros`, `/capitulos` y `/planes-lectura`.
5. Implementar las rutas anidadas de progreso, favoritos, capítulos y versículos con verificación de propiedad y autorización.
6. Actualizar Swagger para que solo registre las rutas aprobadas.
7. Añadir pruebas de contrato, autorización, paginación y propiedad de recursos.
8. Ejecutar lint, typecheck, tests y build; actualizar el roadmap al terminar.

## Decisiones

- **Rutas en español sin alias** — evita duplicar contratos y sigue la nomenclatura solicitada.
- **RBAC global** — Biblia Kids necesita roles y permisos, pero no la jerarquía de organización/sede del dominio anterior.
- **Migraciones históricas intactas** — preservan la trazabilidad; solo se modifica la migración local pendiente si aún no fue aplicada.

## Riesgos

- **Migración pendiente destructiva** — se revisará antes de aplicarla para no eliminar el RBAC requerido.
- **Usuarios menores de edad** — los datos de perfil se mantienen mínimos; el consentimiento parental queda fuera de esta feature.
