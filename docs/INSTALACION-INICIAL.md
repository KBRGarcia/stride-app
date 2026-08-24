# Stride — Instalación inicial del entorno (Fase 1)

Documento de referencia que consolida la configuración del proyecto **Stride** desde cero hasta el primer despliegue en **Expo Go (SDK 57)** con todas las dependencias de la Fase 1 instaladas.

> **Alcance de este documento:** entorno de desarrollo, creación del proyecto Expo, dependencias y ejecución en dispositivo móvil.  
> **Fuera de alcance:** estructura de pantallas, `routines.json`, Matcher, temporizador y build APK (EAS).

---

## Tabla de contenidos

1. [Resumen del proyecto](#1-resumen-del-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Herramientas instaladas en el sistema](#3-herramientas-instaladas-en-el-sistema)
4. [Preparación del entorno (una sola vez)](#4-preparación-del-entorno-una-sola-vez)
5. [Creación del proyecto Expo](#5-creación-del-proyecto-expo)
6. [Instalación de dependencias del proyecto](#6-instalación-de-dependencias-del-proyecto)
7. [Arranque del servidor de desarrollo](#7-arranque-del-servidor-de-desarrollo)
8. [Expo Go en el móvil (SDK 57)](#8-expo-go-en-el-móvil-sdk-57)
9. [Verificación final](#9-verificación-final)
10. [Errores conocidos y soluciones](#10-errores-conocidos-y-soluciones)
11. [Comandos prohibidos](#11-comandos-prohibidos)
12. [Estado actual del proyecto](#12-estado-actual-del-proyecto)
13. [Próximos pasos (desarrollo Fase 1)](#13-próximos-pasos-desarrollo-fase-1)

---

## 1. Resumen del proyecto

**Stride** (KBR-Tempo) es una app de entrenamiento inteligente orientada a eliminar distracciones durante la rutina. En **Fase 1 ("La Chispa")** la app es:

- **100 % local** (sin backend, sin internet obligatorio).
- Basada en un archivo `routines.json` embebido.
- Con perfil de usuario guardado en **AsyncStorage**.
- Con temporizador de descanso y notificaciones locales (por implementar).

Este documento cubre únicamente la **instalación y configuración inicial** del entorno de desarrollo.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión (actual) |
|------|------------|------------------|
| Runtime | Node.js (LTS vía nvm) | **22.x** |
| Framework móvil | React Native | **0.86.2** |
| Plataforma | Expo SDK | **57** |
| Lenguaje | TypeScript | **~6.0.3** |
| UI | React | **19.2.3** |
| Navegación | React Navigation (native stack) | **7.x** |
| Estado global | Zustand | **5.x** |
| Almacenamiento local | AsyncStorage | **2.2.0** |
| Notificaciones | expo-notifications | **~57.0.14** |
| Build futuro (APK) | EAS CLI | global |

---

## 3. Herramientas instaladas en el sistema

### 3.1. Instaladas globalmente (por versión de Node con nvm)

| Herramienta | Comando de instalación | Para qué sirve |
|-------------|------------------------|----------------|
| **EAS CLI** | `npm install -g eas-cli` | Compilar el APK en la nube al final de la Fase 1 (`eas build`). No se usa durante el desarrollo diario con Expo Go. |
| **@expo/ngrok** | Se instala al ejecutar `npx expo start --tunnel` | Crea un túnel público cuando el móvil no puede conectar por LAN/WiFi. |

> **Importante:** Con **nvm**, los paquetes globales son **independientes por versión de Node**. Si cambias de Node 25 a Node 22, debes reinstalar `eas-cli` en Node 22.

### 3.2. NO instalar (obsoleto o innecesario)

| Herramienta | Motivo |
|-------------|--------|
| **`expo-cli` global** | Deprecado desde SDK 46. Provoca conflictos y el aviso *"legacy expo-cli"*. Usar `npx expo` dentro del proyecto. |
| **`npm install -g expo-cli`** | Mismo motivo. Si estuviera instalado: `npm uninstall -g expo-cli` |

### 3.3. Incluidas en el proyecto (no globales)

| Herramienta | Dónde vive | Para qué sirve |
|-------------|------------|----------------|
| **Expo CLI** (`@expo/cli`) | `node_modules` (viene con `expo`) | `npx expo start`, `npx expo install`, etc. |
| **Metro Bundler** | `node_modules` | Empaqueta el JavaScript y sirve la app al móvil. |
| **TypeScript** | `devDependencies` | Tipado estático y autocompletado. |

### 3.4. En el dispositivo móvil

| App | Origen | Notas |
|-----|--------|-------|
| **Expo Go (SDK 57)** | [https://expo.dev/go](https://expo.dev/go) | **No usar la versión de Play Store** para SDK 57; suele estar desactualizada (SDK 54). |

### 3.5. Extensiones de IDE

No se instaló ninguna extensión obligatoria durante esta fase. Opcionales recomendadas para Cursor/VS Code:

- **ES7+ React/Redux/React-Native snippets** — snippets de componentes.
- **Expo Tools** — utilidades Expo en el editor (opcional).

---

## 4. Preparación del entorno (una sola vez)

### Paso 4.1 — Usar Node.js LTS (22) con nvm

**Por qué:** Node 25 puede dar incompatibilidades. Expo recomienda LTS (20 o 22).

```bash
nvm install 22
nvm use 22
nvm alias default 22
node -v    # Debe mostrar v22.x.x
npm -v
```

### Paso 4.2 — Eliminar expo-cli global si existía

**Por qué:** El CLI global antiguo intercepta `npx expo` y muestra errores de *legacy expo-cli*.

```bash
npm uninstall -g expo-cli
```

### Paso 4.3 — Instalar EAS CLI (para el APK futuro)

**Por qué:** Al cierre de la Fase 1 se generará el `.apk` con `eas build`. Instalarlo ahora evita sorpresas.

```bash
npm install -g eas-cli
eas --version
```

Si `eas` no se encuentra tras cambiar de versión de Node, repetir `npm install -g eas-cli` con `nvm use 22` activo.

### Paso 4.4 — Crear carpeta del proyecto

**Por qué:** Centralizar el código en un directorio de trabajo conocido.

```bash
mkdir -p ~/Escritorio/Proyectos/stride-app
cd ~/Escritorio/Proyectos/stride-app
```

---

## 5. Creación del proyecto Expo

### Paso 5.1 — Limpiar restos de intentos fallidos (si aplica)

**Por qué:** Intentos anteriores pueden dejar solo la carpeta `.expo` sin `package.json` válido.

```bash
cd ~/Escritorio/Proyectos/stride-app
rm -rf .expo
```

### Paso 5.2 — Crear proyecto con TypeScript y SDK 57 fijo

**Por qué:**

- **`blank-typescript`:** plantilla mínima con TypeScript (ideal para Fase 1).
- **`@57`:** fija Expo SDK 57 sin menú interactivo (evita cancelaciones accidentales).

```bash
npx create-expo-app@latest . --template blank-typescript@57
```

Cuando pregunte `Ok to proceed? (y)` → escribir **`y`**.

### Paso 5.3 — Instalar dependencias base del proyecto

**Por qué:** Asegura que `node_modules` y `package-lock.json` estén completos.

```bash
npm install
```

### Paso 5.4 — Verificar SDK

**Por qué:** Confirmar que el proyecto quedó en SDK 57 antes de continuar.

```bash
grep '"expo"' package.json
npx expo --version
```

Resultado esperado: `"expo": "~57.0.0"` y CLI `57.x.x`.

---

## 6. Instalación de dependencias del proyecto

> **Regla de oro:** Siempre usar `npx expo install` para paquetes compatibles con el SDK. Expo elige las versiones correctas automáticamente.

### Paso 6.1 — Navegación

**Por qué:** Stride tendrá varias pantallas (onboarding, calendario, entrenamiento). React Navigation native stack ofrece transiciones nativas y buen rendimiento.

```bash
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

| Paquete | Rol en Stride |
|---------|---------------|
| `@react-navigation/native` | Core de navegación entre pantallas. |
| `@react-navigation/native-stack` | Stack nativo (mejor que `@react-navigation/stack` clásico). |
| `react-native-screens` | Optimiza memoria de pantallas nativas (requerido por React Navigation). |
| `react-native-safe-area-context` | Respeta notch/barra de estado en dispositivos modernos. |

### Paso 6.2 — Estado y almacenamiento local

**Por qué:** Fase 1 sin backend: perfil (fecha nacimiento, peso, género) y estado de entrenamiento viven en el dispositivo.

```bash
npx expo install zustand @react-native-async-storage/async-storage
```

| Paquete | Rol en Stride |
|---------|---------------|
| `zustand` | Estado global ligero (perfil, ejercicio actual, temporizador). |
| `@react-native-async-storage/async-storage` | Persistencia local del perfil (equivalente a “guardar en el móvil”). |

> **Nota:** El paquete correcto es `@react-native-async-storage/async-storage`, **no** `async-storage`.

### Paso 6.3 — Notificaciones y pantalla activa

**Por qué:** El contador de descanso debe sonar en segundo plano (notificaciones) y mantener la pantalla encendida durante el entrenamiento.

```bash
npx expo install expo-notifications expo-keep-awake
```

| Paquete | Rol en Stride |
|---------|---------------|
| `expo-notifications` | Notificaciones locales al terminar el descanso (con app en background). |
| `expo-keep-awake` | Evita que la pantalla se apague mid-rutina. |

### Paso 6.4 — Selector de fecha de nacimiento

**Por qué:** El onboarding pide fecha de nacimiento para calcular edad y filtrar rutinas.

```bash
npx expo install @react-native-community/datetimepicker
```

| Paquete | Rol en Stride |
|---------|---------------|
| `@react-native-community/datetimepicker` | UI nativa para elegir fecha de nacimiento. |

### Paso 6.5 — Alinear versiones (si hace falta)

**Por qué:** Corrige desajustes entre paquetes y el SDK instalado.

```bash
npx expo install --fix
npx expo-doctor
```

---

## 7. Arranque del servidor de desarrollo

### Paso 7.1 — Activar Node 22 e ir al proyecto

```bash
nvm use 22
cd ~/Escritorio/Proyectos/stride-app
```

### Paso 7.2 — Cerrar servidores duplicados (opcional)

**Por qué:** Evita el mensaje *"Port 8081 is running this app in another window"*.

```bash
pkill -f "expo start" || true
```

### Paso 7.3 — Iniciar Metro

**Opción A — Misma red WiFi (recomendada):**

```bash
npx expo start
```

**Opción B — Túnel (red distinta o QR LAN falla):**

```bash
npx expo start --tunnel
```

**Por qué el túnel:** Expone Metro vía internet (`exp.direct`) para que el móvil no dependa de la IP local.

### Paso 7.4 — Qué esperar en terminal

- Código QR.
- URL tipo `exp://192.168.x.x:8081` (LAN) o `exp://....exp.direct` (túnel).
- Posible **ERROR de React Native DevTools** (sandbox Linux) → **ignorar**; Metro sigue en `Waiting on http://localhost:8081`.
- **No pulsar `j`** (abre DevTools de escritorio, que falla en Linux sin configurar sandbox).

### Paso 7.5 — Instalar dependencias con el servidor corriendo

Se puede abrir **una segunda terminal** y ejecutar los comandos del [apartado 6](#6-instalación-de-dependencias-del-proyecto) sin detener Metro.

---

## 8. Expo Go en el móvil (SDK 57)

### Por qué no basta Play Store

Cada build de Expo Go incluye **un solo SDK**. Play Store suele ir retrasado respecto a SDK 57. Si el proyecto usa SDK 57 y Expo Go es SDK 54, aparece:

> *"Project is incompatible with this version of Expo Go"*

### Pasos en Android

1. **Desinstalar** Expo Go de Play Store (si está instalada).
2. Abrir en el navegador del móvil: **[https://expo.dev/go](https://expo.dev/go)**.
3. Confirmar selector **SDK 57**.
4. Pulsar **Install** en Android y descargar el APK.
5. Instalar el APK (permitir “orígenes desconocidas” si Android lo pide).
6. Abrir la nueva Expo Go y **escanear el QR** de la terminal.

### Conexión

| Modo | Requisito |
|------|-----------|
| LAN (`npx expo start`) | PC y móvil en la **misma WiFi** |
| Túnel (`npx expo start --tunnel`) | Internet en PC y móvil; no requiere misma WiFi |

---

## 9. Verificación final

Checklist cuando todo está correcto:

- [ ] `node -v` → v22.x.x
- [ ] `eas --version` → responde (global en Node 22)
- [ ] `grep expo package.json` → `"expo": "~57.0.0"`
- [ ] `npx expo start` → QR visible, Metro activo
- [ ] Expo Go SDK 57 instalada desde expo.dev/go
- [ ] Al escanear QR → pantalla inicial de la app (template blank)
- [ ] `npx expo-doctor` → sin errores críticos de versiones

---

## 10. Errores conocidos y soluciones

### 10.1 — `Unable to find expo in this project`

**Causa:** No se ejecutó `create-expo-app` o el proyecto no tiene `expo` en `package.json`.  
**Solución:** Completar [sección 5](#5-creación-del-proyecto-expo).

### 10.2 — Aviso `legacy expo-cli`

**Causa:** `expo-cli` global instalado.  
**Solución:** `npm uninstall -g expo-cli` y usar solo `npx expo`.

### 10.3 — `eas: orden no encontrada`

**Causa:** Cambio de versión de Node con nvm; `eas-cli` estaba en otra versión.  
**Solución:** `nvm use 22 && npm install -g eas-cli`.

### 10.4 — `npm warn deprecated` al instalar eas-cli

**Causa:** Avisos de dependencias internas de EAS CLI.  
**Solución:** Ignorar si termina con `added XXX packages` y exit code 0.

### 10.5 — `npm audit fix --force` rompió el proyecto

**Causa:** Forzó downgrade de `expo` (ej. SDK 46) incompatible con el resto.  
**Solución:**

```bash
rm -rf node_modules package-lock.json
npm install expo@~57.0.0
npx expo install --fix
```

**Prevención:** No usar `npm update` ni `npm audit fix --force` en proyectos Expo.

### 10.6 — React Native DevTools / chrome-sandbox (Linux)

**Causa:** DevTools (Electron) requiere permisos SUID en Linux.  
**Impacto:** No afecta Expo Go ni Metro.  
**Solución:** Ignorar. Opcional (solo si quieres DevTools con tecla `j`):

```bash
sudo chown root:root "/home/TU_USUARIO/.cache/dotslash/64/.../React Native DevTools-linux-x64/chrome-sandbox"
sudo chmod 4755 "/home/TU_USUARIO/.cache/dotslash/64/.../React Native DevTools-linux-x64/chrome-sandbox"
```

### 10.7 — Puerto 8081 ocupado

**Causa:** Otra instancia de `expo start` activa.  
**Solución:** `pkill -f "expo start"` o cerrar la otra terminal.

### 10.8 — Expo Go incompatible (SDK)

**Causa:** Expo Go de Play Store ≠ SDK 57.  
**Solución:** Instalar desde [expo.dev/go](https://expo.dev/go) ([sección 8](#8-expo-go-en-el-móvil-sdk-57)).

---

## 11. Comandos prohibidos

En proyectos Expo, **evitar**:

```bash
npm install -g expo-cli      # Obsoleto
expo start                   # Usa CLI global si existe
npm update                   # Rompe versiones alineadas al SDK
npm audit fix --force        # Puede degradar expo a otra SDK
npm install <paquete-rn>     # Usar npx expo install <paquete>
```

**Usar en su lugar:**

```bash
npx expo start
npx expo install <paquete>
npx expo install --fix
npx expo-doctor
```

---

## 12. Estado actual del proyecto

### 12.1 — Dependencias en `package.json`

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/datetimepicker": "9.1.0",
    "@react-navigation/native": "^7.3.17",
    "@react-navigation/native-stack": "^7.18.9",
    "expo": "~57.0.0",
    "expo-keep-awake": "~57.0.1",
    "expo-notifications": "~57.0.14",
    "expo-status-bar": "~57.0.1",
    "react": "19.2.3",
    "react-native": "0.86.2",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  }
}
```

### 12.2 — Estructura inicial del repositorio

```
stride-app/
├── App.tsx              # Componente raíz
├── index.ts             # Punto de entrada
├── app.json             # Configuración Expo
├── package.json
├── tsconfig.json
├── assets/              # Iconos e imágenes
└── docs/
    └── INSTALACION-INICIAL.md   # Este documento
```

### 12.3 — Scripts npm disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `npm start` | `expo start` | Servidor de desarrollo |
| `npm run android` | `expo start --android` | Abrir en emulador/dispositivo Android |
| `npm run ios` | `expo start --ios` | Abrir en simulador iOS (macOS) |
| `npm run web` | `expo start --web` | Versión web (no prioritario en Fase 1) |

---

## 13. Próximos pasos (desarrollo Fase 1)

Con el entorno listo, el desarrollo continúa con:

1. Estructura de carpetas (`src/screens`, `src/store`, `src/data`, etc.).
2. Schema TypeScript y archivo `routines.json`.
3. Matcher (filtro por género, edad, peso).
4. Pantallas: onboarding → calendario → entrenamiento.
5. Contador inteligente con `expo-notifications` y `expo-keep-awake`.
6. Configuración EAS y build APK para la landing page.

---

## Referencia rápida — flujo completo desde cero

```bash
# 1. Entorno
nvm install 22 && nvm use 22 && nvm alias default 22
npm uninstall -g expo-cli
npm install -g eas-cli

# 2. Proyecto
cd ~/Escritorio/Proyectos/stride-app
rm -rf .expo
npx create-expo-app@latest . --template blank-typescript@57
npm install

# 3. Dependencias Stride Fase 1
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install zustand @react-native-async-storage/async-storage
npx expo install expo-notifications expo-keep-awake
npx expo install @react-native-community/datetimepicker
npx expo install --fix
npx expo-doctor

# 4. Desarrollo
npx expo start
# o: npx expo start --tunnel

# 5. Móvil: instalar Expo Go SDK 57 desde https://expo.dev/go y escanear QR
```

---

*Documento generado para Stride — Fase 1. Última actualización: configuración validada con Expo SDK 57, Node 22 y despliegue en Expo Go.*
