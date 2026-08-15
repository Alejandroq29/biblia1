# Misión

_Proveer una plataforma educativa segura, accesible y escalable para enseñar historias bíblicas a niños y jóvenes de 6 a 18 años mediante contenido interactivo y juegos._

## Qué construimos

Biblia Kids es un backend SaaS modular que administra participantes, historias bíblicas, niveles, juegos y el progreso individual de cada usuario. Expone una API REST documentada para que clientes Flutter puedan ofrecer experiencias educativas interactivas.

1. **Contenido bíblico estructurado** — Historias, niveles y actividades desactivables sin perder el historial de aprendizaje.
2. **Aprendizaje interactivo** — Juegos asociados a historias y niveles, con preguntas, intentos y puntajes persistidos.
3. **Progreso individual** — Resúmenes de avance por participante, historia y nivel, actualizados transaccionalmente.
4. **Seguridad y privacidad** — Autenticación, autorización por permisos y minimización de datos personales, especialmente para menores.

## Para quién

- **Niños y jóvenes de 6 a 18 años:** Aprenden historias bíblicas mediante actividades adecuadas a su nivel.
- **Familias, tutores y educadores:** Consultan el avance y administran experiencias de aprendizaje cuando el producto de cumplimiento lo permita.
- **Administradores de contenido:** Crean y mantienen historias, niveles, juegos y actividades.
- **Equipos de integración:** Consumen una API REST predecible desde Flutter u otros clientes.

## Principios

- **El contrato es la ley** — Ningún endpoint ni validación se implementa sin una especificación verificable.
- **Privacidad por diseño** — Se almacenan únicamente los datos necesarios y nunca se registran tokens, respuestas sensibles o información personal innecesaria.
- **Contenido no destructivo** — El contenido se desactiva; los intentos y avances históricos no se borran accidentalmente.
- **Progreso consistente** — Registrar un intento y actualizar el progreso son una sola operación transaccional.
- **Modularidad** — Autenticación, contenido, aprendizaje y cumplimiento viven en módulos separados.

## Qué NO es

- No es una aplicación Flutter ni incluye pantallas, componentes visuales o código frontend.- No es una red social, sistema de mensajería ni plataforma de pagos.
- No reemplaza los mecanismos legales de consentimiento parental; ese cumplimiento requiere una feature específica antes de producción.
