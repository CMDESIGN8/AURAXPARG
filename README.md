# AURA XP

**FUTSAL × GAMING × STREETWEAR**

**Farmeá estilo. Subí de nivel.**

AURA XP es una marca independiente de indumentaria urbana nacida de la cultura futsal y gaming. Diseñamos piezas para la cancha y para todos los días: actitud deportiva, lenguaje gamer y códigos streetwear.

## Universo de marca

- **Futsal:** origen, movimiento, técnica, equipo y competencia.
- **Gaming:** XP, niveles, drops, rarezas, loadouts y challenges.
- **Streetwear:** prendas versátiles, identidad visual y expresión personal.

El futsal es nuestro punto de entrada, no nuestro límite. AURA XP no es un club ni una tienda de camisetas deportivas: es una marca con un universo propio.

## Dirección visual

- Base: azul noche y negro.
- Color firma: cyan eléctrico.
- Acento: verde lima, reservado para XP, estados y highlights.
- Neutros: blanco frío y gris azulado.
- Tipografía: sans serif geométrica, pesada en titulares y muy legible en interfaz.
- Estética: editorial deportiva, urbana, técnica y digital. Evitar el look infantil, los clichés de esports y el exceso de colores neón.

## Líneas de producto

- **FARM TEE:** pieza de entrada, streetwear cotidiano.
- **SPORT AURA:** capa deportiva urbana para cancha y ciudad.
- **GRIND:** pieza premium / edición limitada.
- **FUTSAL KITS:** STARTER KIT (RARE, +100 XP), MATCHDAY KIT (EPIC, +250 XP) y ELITE KIT (LEGENDARY, +500 XP). Cada kit contempla camiseta, short y medias.
- **CUSTOM BOOTS:** línea especializada de personalización de botines; mantenerla diferenciada del catálogo principal de indumentaria.

Los kits ya cuentan con selección visual y rareza dinámica en la landing. No habilitar reservas hasta configurar inventario por componente, talles, precios y fotos finales; no descontar stock de FARM TEE como sustituto.

## Experiencia digital

La web separa las experiencias: `index.html` presenta AURA XP y el catálogo Apparel/Custom Boots existente; `training.html` presenta exclusivamente AURA XP Training Systems. Mantener las propuestas de entrenamiento fuera del selector de indumentaria y del inventario de ropa.

La XP debe comunicarse de forma transparente: no prometer recompensas, beneficios o funcionalidades que todavía no estén implementados y disponibles.

## Desarrollo local

Es una web estática en HTML, CSS y JavaScript. Publicada mediante GitHub Pages.

1. Clonar el repositorio.
2. Abrir `index.html` para revisar la landing.
3. Abrir `admin.html` para revisar el panel administrativo (requiere la configuración Firebase existente).

## Principios de producto

1. Mobile-first y carga rápida.
2. Fotos reales y datos verificables de producto, talle, precio y stock.
3. No mostrar escasez, disponibilidad o contadores que no estén respaldados por datos reales.
4. No considerar la validación de acceso del frontend como seguridad suficiente: las reglas de Firestore deben aplicar autorización del lado del servicio.
5. Mantener nombres e identificadores de producto consistentes entre landing, reservas y administración.

## Documentación

- [Identidad de marca](docs/BRAND-IDENTITY.md)
- [Configuración de cuentas AURA XP y sincronización](docs/AURA-ACCOUNT-SETUP.md)
