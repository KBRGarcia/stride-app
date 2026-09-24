# Despliegue a producción — Stride Lite + landing

Checklist para publicar la web de descarga y el APK sin sorpresas.

## 1. Iconos de la app (ya configurado en el repo)

| Uso | Archivo | Notas |
|-----|---------|--------|
| Icono de tienda / build | `assets/icon.png` | 1024×1024 |
| Adaptive icon Android | `assets/android-icon-foreground.png` | 512×512 |
| Splash nativo (logo rectangular) | `assets/images/Stride-logo.png` | Válido con `resizeMode: contain` |
| Branding en la app (header) | `Stride-logo-*.png` / `Stride-name-*.png` | Solo UI, no afecta EAS |

`npx expo-doctor` debe pasar **21/21** antes de generar el APK.

## 2. Generar el APK (tu cuenta Expo)

**Opción A — local (sin cuenta Expo, requiere Android SDK):**

```bash
npm run verify
npm run build:apk:local   # Gradle + copia a landing/downloads/stride-lite.apk
```

**Opción B — EAS (nube):**

```bash
npm install -g eas-cli   # si no lo tienes
eas login
eas init                 # solo la primera vez: vincula el proyecto en expo.dev
npm run verify           # tests + doctor + archivos landing
npm run build:apk:landing
```

El script deja el archivo en:

`landing/downloads/stride-lite.apk`

Ese archivo **no va en git** (está en `.gitignore`). Lo subes al servidor por separado o con el mismo `rsync` que la carpeta `landing/`.

Si descargas el APK manualmente desde expo.dev:

```bash
bash scripts/install-apk-to-landing.sh ~/Descargas/tu-build.apk
```

## 3. Subir la landing al servidor

Copia la carpeta `landing/` completa **incluyendo** `downloads/stride-lite.apk`:

```bash
rsync -avz --delete landing/ usuario@tu-servidor:/var/www/stride/
```

La URL de descarga debe ser exactamente:

`https://tu-dominio.com/downloads/stride-lite.apk`

(ajusta si el sitio no está en la raíz del dominio).

## 4. Servidor web — tipo MIME del APK

Algunos servidores no reconocen `.apk` y la descarga falla en el móvil.

**Nginx** (ejemplo):

```nginx
types {
    application/vnd.android.package-archive apk;
}
```

**Apache** (`.htaccess` en `downloads/`):

```apache
AddType application/vnd.android.package-archive .apk
```

## 5. Comprobar antes de abrir al público

En local, con el APK ya en `landing/downloads/`:

```bash
npm run verify:release
npm run landing
# Abre http://localhost:3000 — el botón debe decir "Descargar" y bajar el APK
```

En producción, prueba en un Android real: descargar, permitir “orígenes desconocidos” si aplica, instalar.

## 6. Cada nueva versión de la app

1. Sube `version` en `app.json` (ej. `1.0.1`).
2. Incrementa `android.versionCode` (entero mayor que el anterior).
3. `npm run build:apk:landing`
4. Vuelve a subir `landing/downloads/stride-lite.apk` (y el resto de `landing/` si cambió HTML/CSS).

## 7. Qué debes hacer tú (no automatizable desde el repo)

| Paso | Acción |
|------|--------|
| Cuenta Expo | Crear/iniciar sesión en [expo.dev](https://expo.dev) |
| `eas init` | Vincular este repo a un proyecto EAS |
| Hosting | Dominio, HTTPS, subir carpeta `landing/` |
| APK en servidor | Asegurar que `stride-lite.apk` esté en `downloads/` tras cada release |
| Logo KBR | `landing/assets/images/logo-kbr-light.png` y `logo-kbr-dark.png` (copias de `assets/images/`) |

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run verify` | Tests + TypeScript + expo-doctor + archivos landing |
| `npm run verify:release` | Lo anterior + exige APK en `landing/downloads/` |
| `npm run build:apk:landing` | Build EAS + descarga del APK a la landing |
| `npm run landing` | Servir la landing en local |
