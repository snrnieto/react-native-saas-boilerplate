# 🚀 Guía de Deployment

Guía para generar builds de producción y desplegar la aplicación.

## 📦 Build para Web

### Generar Build de Producción

```bash
npm run build:web
```

Este comando:
- Genera un build optimizado y minificado usando Metro bundler
- Crea archivos estáticos en la carpeta `dist/`
- Listo para desplegar en cualquier hosting estático

**Nota:** Este proyecto usa Metro bundler (no Webpack), por lo que usa `expo export --platform web` en lugar de `expo export:web`

### Ubicación del Build

Después de ejecutar el comando, encontrarás los archivos en:
```
dist/
├── index.html
├── _expo/
│   └── static/
│       └── js/
│           └── (archivos JS minificados)
└── assets/
    └── (imágenes, fuentes, etc.)
```

**Nota:** Con Metro, el build se genera en `dist/` en lugar de `web-build/`

## 🌐 Opciones de Deployment

### 1. Vercel (Recomendado)

**Pasos:**
1. Instala Vercel CLI: `npm i -g vercel`
2. En la raíz del proyecto: `vercel`
3. Sigue las instrucciones
4. O conecta tu repo de GitHub en [vercel.com](https://vercel.com)

**Configuración automática:**
- Vercel detecta automáticamente que es un proyecto Expo
- Build command: `npm run build:web`
- Output directory: `dist`

### 2. Netlify

**Pasos:**
1. Instala Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build:web`
3. Deploy: `netlify deploy --prod --dir=dist`
4. O conecta tu repo en [netlify.com](https://netlify.com)

**Configuración:**
- Build command: `npm run build:web`
- Publish directory: `dist`

### 3. GitHub Pages

**Pasos:**
1. Genera el build: `npm run build:web`
2. En GitHub, ve a Settings > Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` (o la que prefieras)
5. Folder: `/dist`

**Script para automatizar:**
```bash
npm run build:web
git checkout -b gh-pages
git add dist
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 4. Cloudflare Pages

**Pasos:**
1. Conecta tu repo en [Cloudflare Pages](https://pages.cloudflare.com)
2. Build command: `npm run build:web`
3. Build output directory: `dist`

### 5. Servidor propio (Nginx, Apache, etc.)

**Pasos:**
1. Genera el build: `npm run build:web`
2. Sube todo el contenido de `dist/` a tu servidor
3. Configura tu servidor web para servir archivos estáticos

**Ejemplo Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📱 Build para Mobile

### Android

```bash
# Debug
npm run build:android:debug

# Release (para producción)
npm run build:android:release
```

**Ubicación del APK:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### iOS

```bash
npm run ios
# O usa Xcode para generar el build
```

## 🔧 Variables de Entorno

Asegúrate de configurar las variables de entorno antes del build:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=tu-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-key
```

Para producción, configura estas variables en tu plataforma de hosting:
- **Vercel**: Settings > Environment Variables
- **Netlify**: Site settings > Environment variables
- **Cloudflare Pages**: Settings > Environment variables

## 📝 Checklist Pre-Deployment

- [ ] Variables de entorno configuradas
- [ ] Build generado sin errores
- [ ] Probar build localmente antes de deployar
- [ ] Verificar que todas las rutas funcionan
- [ ] Verificar autenticación en producción
- [ ] Verificar que las imágenes/assets se cargan correctamente

## 🧪 Probar Build Localmente

Antes de deployar, prueba el build localmente:

```bash
# 1. Genera el build
npm run build:web

# 2. Sirve el build localmente
npm run preview:web
```

Esto iniciará un servidor local en `http://localhost:3000` (o el puerto disponible).

### Otras opciones manuales:

```bash
# Opción 1: Con Python
cd dist
python -m http.server 8000

# Opción 2: Con Node.js (npx serve)
npx serve dist

# Opción 3: Con PHP
cd dist
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

## 🚨 Troubleshooting

### Build falla con errores de React

Si ves errores relacionados con React 19:
1. Limpia el cache: `npm run clean && rm -rf node_modules/.cache`
2. Reinstala dependencias: `rm -rf node_modules && npm install`
3. Vuelve a generar el build: `npm run build:web`

### Rutas no funcionan en producción

Asegúrate de que tu hosting esté configurado para:
- Servir `index.html` para todas las rutas (SPA routing)
- Esto es automático en Vercel, Netlify y Cloudflare Pages

### Assets no se cargan

Verifica que:
- Las rutas de assets sean relativas
- El build incluya todos los assets necesarios
- Las variables de entorno estén configuradas correctamente
