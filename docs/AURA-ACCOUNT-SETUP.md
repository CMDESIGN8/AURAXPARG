# AURA XP — configuración de cuentas

## Qué incorpora

- Registro e inicio de sesión con email y contraseña o cuenta de Google mediante Firebase Authentication.
- Si un email ya tiene una cuenta con contraseña, el usuario puede iniciar sesión con esa contraseña y vincular Google a la misma cuenta; no se crea un segundo UID.
- Recuperación de contraseña por email.
- Perfil básico en `users/{uid}`.
- Progreso sincronizado en `users/{uid}/private/auraProgress`.
- Migración automática del progreso local al crear la primera cuenta.
- Al iniciar sesión en otro dispositivo, el progreso remoto reemplaza el almacenamiento local para evitar mezclar cuentas.

## Configuración obligatoria en Firebase Console

El código del sitio ya utiliza el proyecto Firebase `aura-xp-dd6d3`, compartido con el panel administrativo.

1. Abrí Firebase Console y seleccioná el proyecto **aura-xp-dd6d3**.
2. Entrá en **Authentication → Sign-in method**.
3. Abrí **Email/Password**, activá **Enable** y guardá.
4. Volvé a **Sign-in method**, abrí **Google**, activá **Enable**, elegí un **Support email** y guardá.
5. Entrá en **Authentication → Settings → Authorized domains** y agregá los dominios exactos desde los que se publica la web. Por ejemplo:
   - `auraxp.ar`
   - `www.auraxp.ar`
   - `cmdesign8.github.io` (si usás GitHub Pages)
   - `localhost` (solo para pruebas locales, si no aparece ya)
   
   Escribilos sin `https://`, sin rutas y sin barras finales. Agregá únicamente los dominios que realmente uses.
6. Confirmá que **Firestore Database** esté creado en este mismo proyecto.
7. En **Firestore Database → Rules**, reemplazá el contenido por el archivo `firestore.rules` de este repositorio y tocá **Publish**. No uses reglas abiertas de lectura/escritura.
8. Si publicás en un dominio propio, verificá que ese dominio esté agregado en **Authorized domains** antes de probar Google.

> Importante: habilitar los proveedores permite autenticar, pero hasta publicar las reglas de Firestore la creación del perfil y la sincronización no van a poder completarse. No habilites reglas abiertas de lectura/escritura.

### Cómo funciona la vinculación de Google

Si alguien intenta entrar con Google y Firebase detecta que ese email ya existe con contraseña, AURA XP le pide iniciar sesión con ese email y contraseña. Una vez validada la cuenta, vincula la credencial de Google al mismo usuario. El progreso sigue asociado al UID original. Este flujo requiere que el usuario recuerde su contraseña; si no la recuerda, debe usar **Recuperar contraseña** y después repetir la vinculación.

## Estructura de datos

- `users/{uid}`: email, nickname, foto opcional y timestamps. El acceso funciona igual con email/contraseña y con Google.
- `users/{uid}/private/auraProgress`: snapshot de las claves locales de progreso de AURA XP.

Cada usuario solo puede leer y modificar documentos dentro de su propio UID según las reglas incluidas.

## Nota de producto y seguridad

La sincronización actual persiste el progreso del jugador entre dispositivos. Como el cliente web escribe sus propios datos, todavía no debe utilizarse como autoridad para canjes, saldo monetario, descuentos ni recompensas con valor económico. Antes de habilitar la tienda, las transacciones y los canjes deben validarse del lado servidor (por ejemplo, Cloud Functions) y registrar movimientos no editables por el cliente.
