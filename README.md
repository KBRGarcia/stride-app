<p align="center">
  <img src="./assets/images/Stride-logo.png" alt="Logo de Stride" width="220" />
</p>

<h1 align="center">Stride</h1>

<p align="center">
  <strong>Entrenamiento inteligente, sin distracciones.</strong>
</p>

<p align="center">
  Aplicación móvil de fitness que te guía paso a paso durante tu rutina semanal, adaptada a tu perfil, entorno y objetivo.
</p>

<p align="center">
  <a href="https://github.com/KBRGarcia/stride-app">Repositorio</a> ·
  <a href="./docs/INSTALACION-INICIAL.md">Instalación</a> ·
  <a href="./LICENSE">Licencia</a>
</p>

---

## ¿Qué es Stride?

**Stride** es una app de entrenamiento pensada para que te centres en lo importante: moverte. No necesitas buscar ejercicios en internet ni improvisar series en mitad de la sesión. La app genera un **plan semanal personalizado** según tu edad, peso, lugar de entrenamiento (casa o gimnasio) y objetivo (tonificación, ganancia muscular o reducción de grasa).

### Características principales

| Área | Descripción |
|------|-------------|
| **Perfil personalizado** | Onboarding con fecha de nacimiento, peso, entorno y objetivo. El perfil se guarda en el dispositivo. |
| **Rutinas adaptadas** | Seis arquetipos (A–F) calculados a partir de edad y peso; cada uno tiene su rutina semanal de fuerza. |
| **Sesión guiada** | Calentamiento, bloque principal y enfriamiento con imágenes, series, repeticiones y temporizador de descanso. |
| **Plan semanal** | Vista por días (lunes a domingo) con estado del día: completado, hoy, próximo o expirado. |
| **Cardio** | Planes independientes para correr, ciclismo y saltar la cuerda, con rutina semanal y guía nutricional. |
| **Nutrición** | Guías de macros, alimentación, hidratación y menú de ejemplo según el objetivo elegido. |
| **Temporizador inteligente** | Descansos entre ejercicios con notificaciones locales y pantalla activa durante el entrenamiento. |
| **Tema claro / oscuro** | Interfaz adaptable con preferencia persistida en el dispositivo. |
| **100 % local** | Sin backend ni conexión obligatoria: todos los datos de rutinas viven en archivos JSON embebidos. |

### Flujo de uso

```
Bienvenida → Perfil (onboarding) → Inicio (plan semanal) → Sesión de entrenamiento
                                      ↘ Cardio (actividades opcionales)
```

1. **Bienvenida** — Presentación de la app e inicio del flujo.
2. **Perfil** — El usuario indica fecha de nacimiento, peso, si entrena en casa o en gimnasio y su objetivo.
3. **Inicio** — Calendario semanal con acceso al entrenamiento del día y panel de nutrición.
4. **Entrenamiento** — Sesión paso a paso con temporizador de descanso, cuenta atrás y resumen al finalizar.
5. **Cardio** — Sección aparte con actividades de resistencia y su propia guía nutricional.

---

## Arquitectura técnica

### Stack tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Node.js (LTS recomendado) | 22.x |
| Framework móvil | React Native | 0.86.2 |
| Plataforma | Expo SDK | 57 |
| UI | React | 19.2.3 |
| Lenguaje | TypeScript | ~6.0.3 |
| Navegación | React Navigation (native stack) | 7.x |
| Estado global | Zustand | 5.x |
| Persistencia | AsyncStorage | 2.2.0 |
| Notificaciones | expo-notifications | ~57.0.14 |
| Pantalla activa | expo-keep-awake | ~57.0.1 |
| Tests | Jest + jest-expo | 29.x |

### Principios de diseño

- **Offline-first:** toda la lógica de negocio y el contenido de entrenamiento residen en el cliente.
- **Datos declarativos:** las rutinas, guías nutricionales y planes de cardio se definen en JSON tipado con TypeScript.
- **Matcher por arquetipo:** a partir del perfil se calcula un arquetipo y se selecciona la recomendación correspondiente del dataset.
- **Estado mínimo:** Zustand centraliza perfil, recomendación activa y progreso semanal; el tema tiene su propio store.
- **Separación por dominio:** pantallas, componentes reutilizables, utilidades puras, stores y datos en carpetas distintas.

### Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│  Pantallas (screens/)                                       │
│  Welcome · Profile · Home · Workout · Cardio · …            │
├─────────────────────────────────────────────────────────────┤
│  Componentes (components/) · Hooks (hooks/)                 │
│  AppShell · BirthDatePicker · useTimer · useTheme           │
├─────────────────────────────────────────────────────────────┤
│  Estado (stores/)                                           │
│  useAppStore · useThemeStore                                │
├─────────────────────────────────────────────────────────────┤
│  Lógica de dominio (utils/)                                 │
│  routineMatcher · archetypes · weekSchedule · notifications │
├─────────────────────────────────────────────────────────────┤
│  Datos embebidos (data/) + Persistencia (storage.ts)        │
│  JSON de rutinas / nutrición / cardio · AsyncStorage        │
└─────────────────────────────────────────────────────────────┘
```

### Sistema de arquetipos

El **matcher** traduce el perfil del usuario en uno de seis arquetipos (`A`–`F`) usando solo edad y peso:

| Arquetipo | Edad | Peso (kg) |
|-----------|------|-----------|
| **A** | ≤ 40 | ≤ 70 |
| **B** | ≤ 40 | > 70 |
| **C** | 41 – 65 | ≤ 70 |
| **D** | 41 – 65 | > 70 |
| **E** | 66 – 75 | cualquiera |
| **F** | > 75 | cualquiera |

Requisitos mínimos: edad ≥ 14 años y peso ≥ 40 kg. Si no se cumplen, no se asigna rutina.

```text
Perfil (birthDate, weight, location, goal)
        │
        ▼
 calculateAge() + getArchetype()
        │
        ▼
 findMatchingRecommendation() → Recommendation.weeklyRoutine
```

### Modelo de datos

Cada archivo de rutinas (`src/data/home/` y `src/data/gym/`) contiene un array de `Recommendation`, una por arquetipo. Cada recomendación incluye:

- Rangos de edad y peso de referencia.
- `weeklyRoutine`: siete `DayRoutine` (lunes = 1 … domingo = 7).
- Cada día tiene `warmUp`, `mainWorkout` y `coolDown` con ejercicios tipados (`Exercise`).

Los planes de cardio (`src/data/training/`) y las guías nutricionales (`src/data/nutrition/`) siguen esquemas propios definidos en `src/models/types.ts`.

### Navegación

La app usa un **native stack** de React Navigation con las siguientes rutas:

| Ruta | Pantalla | Propósito |
|------|----------|-----------|
| `Welcome` | Bienvenida | Entrada e inicio de onboarding |
| `Profile` | Perfil | Configuración del usuario |
| `Home` | Inicio | Plan semanal de fuerza + nutrición |
| `Workout` | Entrenamiento | Sesión guiada del día |
| `Cardio` | Cardio | Listado de actividades |
| `CardioActivity` | Actividad cardio | Detalle de un plan |
| `CardioSession` | Sesión cardio | Vista de sesión |

La ruta inicial depende de si existe un perfil guardado: usuarios nuevos van a `Welcome`; usuarios recurrentes entran directamente en `Home`.

### Temporizador y notificaciones

El hook `useTimer` gestiona los descansos entre ejercicios:

- Duración base de descanso: **30 segundos** (ampliable en bloques de 15 s).
- La cuenta usa timestamps absolutos para resistir cambios de `AppState` (app en segundo plano).
- Al iniciar un descanso se programa una **notificación local** (`expo-notifications`) que avisa al terminar.
- `expo-keep-awake` evita que la pantalla se apague durante la sesión.

### Persistencia local

`AsyncStorage` guarda:

- Perfil del usuario (`UserProfile`).
- Fechas de entrenamientos completados por día de la semana.
- Preferencia de tema (`light` / `dark`).

Al arrancar, `useAppStore.hydrate()` y `useThemeStore.hydrate()` restauran el estado antes de mostrar la navegación principal.

### Estructura del proyecto

```text
stride-app/
├── App.tsx                 # Navegación, splash y providers
├── app.json                # Configuración Expo
├── assets/                 # Iconos, splash y logos
├── docs/                   # Documentación técnica adicional
├── src/
│   ├── components/         # UI reutilizable (AppShell, pickers, paneles)
│   ├── data/
│   │   ├── gym/            # Rutinas de gimnasio por objetivo
│   │   ├── home/           # Rutinas en casa por objetivo
│   │   ├── nutrition/      # Guías nutricionales
│   │   └── training/       # Planes de cardio (JSON)
│   ├── hooks/              # useTimer, useTheme
│   ├── models/             # Tipos TypeScript del dominio
│   ├── navigation/         # Tipos del stack
│   ├── screens/            # Pantallas de la app
│   ├── stores/             # Zustand (app + tema)
│   ├── theme/              # Colores, imágenes y tipos de tema
│   └── utils/              # Matcher, schedule, formato, tests
├── jest.config.js
└── package.json
```

---

## Requisitos previos

- **Node.js 22.x** (recomendado vía [nvm](https://github.com/nvm-sh/nvm))
- **npm**
- **Expo Go SDK 57** en el dispositivo móvil ([expo.dev/go](https://expo.dev/go)) — no usar la versión de Play Store si está desactualizada
- PC y móvil en la misma red WiFi, o usar modo túnel

> Guía paso a paso del entorno: [docs/INSTALACION-INICIAL.md](./docs/INSTALACION-INICIAL.md)

---

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/KBRGarcia/stride-app.git
cd stride-app

# Usar Node LTS
nvm use 22

# Instalar dependencias
npm install

# Arrancar el servidor de desarrollo
npm start
# o: npx expo start --tunnel
```

Escanea el código QR con **Expo Go (SDK 57)** para abrir la app en tu dispositivo.

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia Metro Bundler (`expo start`) |
| `npm run android` | Abre en emulador o dispositivo Android |
| `npm run ios` | Abre en simulador iOS (macOS) |
| `npm run web` | Versión web (no es el foco principal) |
| `npm test` | Ejecuta la suite de tests con Jest |

### Buenas prácticas en proyectos Expo

```bash
# Instalar paquetes compatibles con el SDK
npx expo install <paquete>

# Corregir versiones desalineadas
npx expo install --fix
npx expo-doctor
```

Evita `npm update`, `npm audit fix --force` y el CLI global `expo-cli` (obsoleto).

---

## Tests

El proyecto incluye tests unitarios para la lógica crítica: arquetipos, matcher, calendario semanal, rutinas, nutrición, cardio y formato de ejercicios.

```bash
npm test
```

Los archivos de test viven en `src/utils/__tests__/`.

---

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [INSTALACION-INICIAL.md](./docs/INSTALACION-INICIAL.md) | Configuración del entorno desde cero |
| [PANTALLA-BIENVENIDA.md](./docs/PANTALLA-BIENVENIDA.md) | Explicación del flujo de arranque y pantallas |
| [PROMPT-RUTINAS-JSON.md](./docs/PROMPT-RUTINAS-JSON.md) | Esquema y convenciones para generar rutinas en JSON |

---

## Roadmap (Fase 1)

- [x] Onboarding y perfil persistente
- [x] Matcher por arquetipo y rutinas JSON (casa / gimnasio)
- [x] Plan semanal y sesión de entrenamiento guiada
- [x] Temporizador de descanso con notificaciones
- [x] Sección de cardio y guías nutricionales
- [x] Tema claro / oscuro
- [ ] Build de producción (APK) con EAS Build

---

## Autor

Desarrollado por **[KBRGarcia](https://github.com/KBRGarcia)**.

---

## Licencia

Consulta el archivo [LICENSE](./LICENSE) del repositorio.
