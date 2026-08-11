Feature: Biblia Kids — "Creed Bible" backend

Resumen
Implementar la funcionalidad de `biblia-kids` siguiendo el estilo y flujos de "creed bible": historias adaptadas para niños, juegos/trivias, planes de lectura y gestión de recursos bíblicos (libros, capítulos, versículos). La implementación mantendrá la arquitectura en capas del repositorio.

Alcance funcional
- Autenticación: registro e inicio de sesión mediante Keycloak (OAuth2 + PKCE). Crear sincronización de perfil local al primer login.
- Recursos: CRUD para `books`, `chapters`, `verses`, `stories` (historias adaptadas), `levels`.
- Flujos de lectura: búsqueda, favoritos por usuario, planes de lectura diarios.
- Módulo de juego/Trivias: gestión de `games`, `questions`, `attempts`, cálculo de puntajes, niveles y recompensas.

Criterios de aceptación
1. Endpoints REST en `pages/api/biblia-kids/*` para todos los recursos (listar, obtener, crear, actualizar, eliminar según corresponda) y validación Zod.
2. Lógica de negocio en `services/biblia-kids` y queries en `database/biblia-kids` (Prisma) respetando transacciones y soft delete.
3. Integración con Keycloak para auth; endpoints protegidos con middleware `auth` y `access`.
4. Tests unitarios con Vitest para servicios y pruebas de integración para endpoints críticos.
5. Documentación OpenAPI registrada en `documentation/schemas/biblia-kids.ts`.
