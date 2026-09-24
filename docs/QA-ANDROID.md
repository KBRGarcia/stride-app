# QA en Android real (pre-producción)

Ejecuta esto en un teléfono físico tras desplegar la landing o usando `npm run landing` en la misma red Wi‑Fi.

## Descarga desde la web

1. Abre la URL de producción (HTTPS) en Chrome.
2. Pulsa **Descargar** en Stride Lite.
3. Confirma que el archivo es `stride-lite.apk` (~80 MiB).
4. Instala (orígenes desconocidos si el sistema lo pide).

## Automatización parcial (USB)

```bash
npm run verify:release
npm run qa:android
```

Requiere depuración USB activada y `adb devices` visible.

## Flujo funcional en la app

- [ ] Primera instalación: splash → bienvenida → crear perfil válido.
- [ ] Home: rutina semanal y días bloqueados/desbloqueados según la semana.
- [ ] Entrenamiento: ejercicios, temporizador de descanso, notificación con pantalla apagada.
- [ ] Cardio y nutrición cargan sin internet.
- [ ] Tema claro/oscuro persiste al cerrar la app.
- [ ] Actualización: instalar un APK nuevo con el mismo certificado y `versionCode` mayor.

## Firma

El APK público debe **no** usar certificado `Android Debug`. Verifica con:

```bash
npm run verify:release
```
