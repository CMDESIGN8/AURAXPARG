# AURA XP — configuración de cuentas

## Qué incorpora

- Registro e inicio de sesión con email y contraseña mediante Firebase Authentication.
- Recuperación de contraseña por email.
- Perfil básico en `users/{uid}`.
- Progreso sincronizado en `users/{uid}/private/auraProgress`.
- Migración automática del progreso local al crear la primera cuenta.
- Al iniciar sesión en otro dispositivo, el progreso remoto reemplaza el almacenamiento local para evitar mezclar cuentas.

## Configuración obligatoria en Firebase Console

El código del sitio ya utiliza el proyecto Firebase `aura-xp-dd6d3`, compartido con el panel administrativo.

1. Abrí Firebase Console y seleccioná el proyecto **aura-xp-dd6d3**.
2. En **Authentication → Sign-in method**, habilitá **Email/Password**.
3. En **Authentication → Settings → Authorized domains**, verificá que esté autorizado el dominio de GitHub Pages donde se publica AURA XP (por ejemplo, `cmdesign8.github.io`).
4. En **Firestore Database → Rules**, publicá el contenido de `firestore.rules` incluido en este repositorio.
5. Confirmá que Firestore Database esté creado en el proyecto.

> Importante: hasta publicar las reglas de Firestore, la autenticación puede funcionar pero la creación del perfil y la sincronización no van a poder completarse. No habilites reglas abiertas de lectura/escritura.

## Estructura de datos

- `users/{uid}`: email, nickname, foto opcional y timestamps.
- `users/{uid}/private/auraProgress`: snapshot de las claves locales de progreso de AURA XP.

Cada usuario solo puede leer y modificar documentos dentro de su propio UID según las reglas incluidas.

## Nota de producto y seguridad

La sincronización actual persiste el progreso del jugador entre dispositivos. Como el cliente web escribe sus propios datos, todavía no debe utilizarse como autoridad para canjes, saldo monetario, descuentos ni recompensas con valor económico. Antes de habilitar la tienda, las transacciones y los canjes deben validarse del lado servidor (por ejemplo, Cloud Functions) y registrar movimientos no editables por el cliente.
