# 014 · Biblia Kids — Núcleo educativo

**Estado:** en curso

## Qué hace

Biblia Kids administra participantes, historias bíblicas, niveles, juegos ilustrativos, intentos, puntajes y progreso individual para niños y jóvenes de 6 a 18 años. El backend expone una API REST consumible por Flutter y reutiliza autenticación, sesiones y permisos.

## Por qué

El repositorio reemplaza el proyecto anterior y conserva su arquitectura técnica para entregar persistencia segura, validación consistente y operaciones transaccionales de aprendizaje.

## Criterios de aceptación

- [ ] Un usuario autenticado puede consultar historias bíblicas activas mediante un listado paginado y obtener una historia individual.
- [ ] Un usuario con el permiso correspondiente puede crear, actualizar, consultar y desactivar historias, juegos y niveles.
- [ ] Cada juego puede asociarse con una historia y un nivel, y mantener una o más preguntas persistibles.
- [ ] Un participante puede registrar un intento con puntaje, respuestas resumidas, nivel y fecha UTC.
- [ ] El progreso de un participante se consulta por historia y nivel, y se actualiza transaccionalmente junto con el intento.
- [ ] La API valida cuerpos, parámetros, filtros y paginación con Zod y devuelve respuestas estandarizadas.
- [ ] Las consultas normales excluyen contenido desactivado y los listados incluyen paginación.
- [ ] Los endpoints protegidos validan autenticación y permisos sin exponer respuestas correctas de los juegos.
- [ ] Las operaciones críticas de progreso tienen pruebas para éxito, puntajes inválidos, duplicados y autorización.

### Documentación (obligatorio)

- [ ] Los endpoints están registrados en `documentation/schemas/biblia-kids.ts` mediante `registry.registerPath()`.
- [ ] Los schemas de entrada y salida están registrados mediante `registry.register()`/`registry.registerComponent()`.
- [ ] El módulo está exportado desde `documentation/schemas/index.ts`.
- [ ] Los endpoints y schemas aparecen correctamente en `GET /api/docs`.

## Fuera de alcance

- Aplicación Flutter, pantallas visuales o componentes frontend.
- Autenticación propia de Firebase o reemplazo del proveedor OAuth existente.
- Chat, red social, pagos, publicidad o analítica avanzada.
- Almacenamiento de imágenes o videos.
- Consentimiento parental y cumplimiento legal, que corresponden a la feature 015.
