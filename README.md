# Gas&Go

Web corporativa, portal de conductores y administración de contenidos. El proyecto usa Next.js, Payload y SQLite.

## Desarrollo

Requiere Node.js 24.22.1 o superior y pnpm 10.34.3.

```sh
pnpm install --frozen-lockfile
# Ejecuta este comando solo al preparar una copia sin archivo .env.
(umask 077; set -C; printf 'PAYLOAD_SECRET=%s\n' "$(openssl rand -hex 32)" > .env)
pnpm dev
```

Abre `http://localhost:3000`. El panel está en `/admin` y el portal en `/portal`. El esquema se prepara automáticamente en desarrollo.

## Producción

Usa un alojamiento con Node.js y almacenamiento persistente. Configura un `PAYLOAD_SECRET` propio, `NEXT_PUBLIC_SITE_URL` con la URL HTTPS pública, `DATABASE_URL` con una URL SQLite de archivo (por ejemplo, `file:/data/gasgo.sqlite`) y `MEDIA_DIRECTORY` con una carpeta persistente para las subidas (por ejemplo, `/data/media`).

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm payload migrate
pnpm start
```

Configura el primer administrador en `/admin` con el acceso al servicio restringido, antes de abrir el sitio al público. Configura un servicio de correo en Payload si vas a utilizar recuperación de contraseña o correos del CMS. Haz copias de la base de datos y de los archivos subidos.

El mapa consulta `sedeaplicaciones.minetur.gob.es` desde el servidor y descarga los mapas de OpenStreetMap desde el navegador. El portal, el panel y las API requieren un servidor, por lo que el proyecto completo necesita un alojamiento distinto de GitHub Pages.

La base de datos se inicializa vacía. Los datos del backend de Figma, como cuentas, vehículos, repostajes, puntos y archivos subidos al CMS, requerirían una exportación aparte. Las imágenes incluidas en el ZIP se conservan en `public/`.

## Web corporativa en GitHub Pages

La versión pública se genera desde los mismos componentes de Figma que usa
la aplicación completa. Incluye la portada y las secciones corporativas, con
un enlace al Geoportal en la sección Estaciones. El portal de clientes y
el panel de administración requieren el despliegue con Node.js descrito arriba.

```sh
pnpm install --frozen-lockfile
pnpm build:pages
```

La compilación reemplaza el contenido generado en `docs/`. Para publicarla,
incluye esa carpeta en el commit de `main` y selecciona **Settings → Pages →
Deploy from a branch → main → /docs**. El despliegue se puede seguir en
**Actions → pages build and deployment**.

La web se abre en <https://guillemgalveb.github.io/Gas-Go-web/>. En la portada,
pulsa el logotipo para abrir el menú.
