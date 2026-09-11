# Stride — Arquitectura y guía técnica del sistema

Documento de referencia para **desarrolladores nuevos** o para **retomar el proyecto** tras un periodo de inactividad. Describe cómo está construida la app, dónde vive cada responsabilidad y cómo fluye la información de punta a punta.

> **Documentos relacionados**
> - [README.md](../README.md) — Visión general y arranque rápido
> - [INSTALACION-INICIAL.md](./INSTALACION-INICIAL.md) — Configuración del entorno de desarrollo
> - [PROMPT-RUTINAS-JSON.md](./PROMPT-RUTINAS-JSON.md) — Esquema de los archivos de rutinas

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Herramientas, frameworks y dependencias](#2-herramientas-frameworks-y-dependencias)
3. [Estructura detallada del proyecto](#3-estructura-detallada-del-proyecto)
4. [Arranque de la aplicación](#4-arranque-de-la-aplicación)
5. [Navegación y rutas](#5-navegación-y-rutas)
6. [Gestión de estado y persistencia](#6-gestión-de-estado-y-persistencia)
7. [Modelo de dominio y datos embebidos](#7-modelo-de-dominio-y-datos-embebidos)
8. [Lógica de negocio (utils)](#8-lógica-de-negocio-utils)
9. [Pantallas y flujos de usuario](#9-pantallas-y-flujos-de-usuario)
10. [Componentes reutilizables](#10-componentes-reutilizables)
11. [Sistema de estilos y temas](#11-sistema-de-estilos-y-temas)
12. [Hooks personalizados](#12-hooks-personalizados)
13. [Notificaciones y temporizador](#13-notificaciones-y-temporizador)
14. [Tests](#14-tests)
15. [Convenciones y decisiones de diseño](#15-convenciones-y-decisiones-de-diseño)
16. [Mapa mental para retomar el proyecto](#16-mapa-mental-para-retomar-el-proyecto)

---

## 1. Visión general

**Stride** es una aplicación móvil **100 % local** (sin backend) construida con **Expo SDK 57** y **React Native**. Su propósito es guiar al usuario durante entrenamientos de fuerza y cardio, con rutinas personalizadas según perfil, entorno y objetivo.

### Principios arquitectónicos

| Principio | Implementación |
|-----------|----------------|
| Offline-first | Todo el contenido (rutinas, nutrición, cardio) vive en JSON embebidos en el bundle |
| Datos declarativos | Los JSON definen *qué* entrenar; TypeScript define *cómo* se interpretan |
| Estado mínimo | Zustand solo para perfil, recomendación activa, progreso semanal y tema |
| Lógica pura en `utils/` | Matcher, calendario, formato y notificaciones son funciones testeables |
| UI por capas | `AppShell` → pantallas → componentes; estilos derivados del tema activo |

### Diagrama de alto nivel

```
┌──────────────┐     hydrate()      ┌─────────────────┐
│ AsyncStorage │ ◄────────────────► │  Zustand stores │
└──────────────┘                    │ useAppStore     │
                                    │ useThemeStore   │
┌──────────────┐     import estático └────────┬────────┘
│  JSON data/  │ ────────────────────────────►│
└──────────────┘                              ▼
                                    ┌─────────────────┐
                                    │  Pantallas (UI) │
                                    │  + componentes  │
                                    └─────────────────┘
```

---

## 2. Herramientas, frameworks y dependencias

### 2.1. Entorno de desarrollo

| Herramienta | Versión recomendada | Uso |
|-------------|---------------------|-----|
| **Node.js** | 22.x (LTS, vía nvm) | Runtime para npm, Metro y Expo CLI |
| **npm** | Incluido con Node | Gestión de dependencias |
| **Expo Go** | SDK 57 ([expo.dev/go](https://expo.dev/go)) | Ejecución en dispositivo físico durante desarrollo |
| **EAS CLI** | Global (opcional) | Build de APK/AAB en producción (futuro) |
| **TypeScript** | ~6.0.3 | Tipado estático en todo el código fuente |

> **Importante:** No usar `expo-cli` global (obsoleto). Siempre `npx expo` dentro del proyecto.

### 2.2. Framework y plataforma

| Paquete | Versión | Rol |
|---------|---------|-----|
| `expo` | ~57.0.0 | Plataforma, bundler, plugins nativos |
| `react` | 19.2.3 | Motor de UI |
| `react-native` | 0.86.2 | Componentes nativos (View, Text, etc.) |

### 2.3. Navegación

| Paquete | Rol |
|---------|-----|
| `@react-navigation/native` | Contenedor de navegación (`NavigationContainer`) |
| `@react-navigation/native-stack` | Stack nativo con transiciones de plataforma |
| `react-native-screens` | Optimización de pantallas nativas (requerido) |
| `react-native-safe-area-context` | Áreas seguras (notch, barras del sistema) |

La configuración del stack vive en `App.tsx`. Los tipos de rutas y parámetros están en `src/navigation/types.ts`.

### 2.4. Estado y persistencia

| Paquete | Rol |
|---------|-----|
| `zustand` | Stores ligeros (`useAppStore`, `useThemeStore`) |
| `@react-native-async-storage/async-storage` | Persistencia clave-valor en el dispositivo |

### 2.5. Funcionalidades nativas (Expo modules)

| Paquete | Rol en Stride |
|---------|---------------|
| `expo-splash-screen` | Splash nativo de Expo; se oculta al terminar la hidratación |
| `expo-notifications` | Notificaciones locales al finalizar descansos |
| `expo-keep-awake` | Pantalla encendida durante sesiones de entrenamiento |
| `expo-status-bar` | Color de iconos de la barra de estado del sistema |
| `@react-native-community/datetimepicker` | Plugin registrado en `app.json` (el picker de fecha actual es custom) |
| `@expo/vector-icons` | Iconografía Ionicons en toda la app |

### 2.6. Plugins de Expo (`app.json`)

```json
"plugins": [
  "@react-native-community/datetimepicker",
  ["expo-notifications", { "defaultChannel": "rest-timer" }],
  ["expo-splash-screen", { "backgroundColor": "#ffffff", "image": "./assets/images/Stride-logo.png", ... }]
]
```

- **datetimepicker:** habilita el módulo nativo (reserva para usos futuros).
- **expo-notifications:** canal por defecto `rest-timer` en Android.
- **expo-splash-screen:** splash de marca con el logo de Stride.

### 2.7. Testing

| Paquete | Rol |
|---------|-----|
| `jest` | Runner de tests |
| `jest-expo` | Preset compatible con módulos de Expo |
| `@testing-library/react-native` | Utilidades para tests de componentes (disponible, uso principal en utils) |
| `react-test-renderer` | Renderizado en tests |

Configuración: `jest.config.js` + `jest.setup.ts`.

### 2.8. Scripts npm

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start` | `expo start` | Metro Bundler + QR |
| `android` | `expo start --android` | Lanza en Android |
| `ios` | `expo start --ios` | Lanza en iOS (macOS) |
| `web` | `expo start --web` | Versión web (no prioritario) |
| `test` | `jest` | Suite de tests unitarios |

---

## 3. Estructura detallada del proyecto

```text
stride-app/
├── index.ts                    # Punto de entrada: registerRootComponent(App)
├── App.tsx                     # Splash, hidratación, NavigationContainer, Stack
├── app.json                    # Configuración Expo (nombre, iconos, plugins)
├── package.json
├── tsconfig.json               # strict: true, extiende expo/tsconfig.base
├── jest.config.js
├── jest.setup.ts               # Mocks de módulos nativos para tests
│
├── assets/                     # Recursos estáticos (no importados vía URL)
│   ├── images/                 # Logos, splash, placeholder de ejercicios
│   ├── icon.png, favicon.png
│   └── android-icon-*.png      # Adaptive icon Android
│
├── docs/                       # Documentación del proyecto
│
└── src/
    ├── components/             # UI reutilizable
    ├── data/                   # JSON embebidos (rutinas, nutrición, cardio)
    ├── hooks/                  # useTheme, useTimer
    ├── models/                 # Tipos TypeScript del dominio
    ├── navigation/             # RootStackParamList
    ├── screens/                # Pantallas del stack
    ├── stores/                 # Zustand: app + tema
    ├── theme/                  # Paletas de color e imágenes por tema
    ├── types/                  # Declaraciones auxiliares (ej. vector-icons)
    └── utils/                  # Lógica pura + capa de acceso a datos
        └── __tests__/          # Tests unitarios
```

### Responsabilidad por carpeta

| Carpeta | Qué contiene | Qué NO debe contener |
|---------|--------------|----------------------|
| `screens/` | Pantallas completas conectadas a navegación | Lógica de matcher o acceso directo a AsyncStorage |
| `components/` | Piezas de UI reutilizables | Estado global de la app |
| `stores/` | Estado global + acciones async que orquestan persistencia | JSX |
| `utils/` | Funciones puras, acceso a storage, carga de JSON | Componentes React |
| `data/` | Solo archivos JSON | Código TypeScript |
| `models/` | Interfaces y tipos | Implementación |
| `theme/` | Tokens visuales (colores, imágenes) | Lógica de negocio |

---

## 4. Arranque de la aplicación

### Secuencia de inicio

```
index.ts
   └── App.tsx
         ├── SafeAreaProvider
         └── AppNavigator
               ├── [1] useEffect → hydrate() app + tema (AsyncStorage)
               ├── [2] Timer 2s → hasShownSplash = true
               ├── [3] Si !splash || !hydrated → BrandSplashScreen
               └── [4] NavigationContainer + Stack.Navigator
```

### Detalles clave en `App.tsx`

1. **`ExpoSplashScreen.preventAutoHideAsync()`** — Evita que el splash nativo desaparezca antes de tiempo (solo plataformas nativas, no web).
2. **Hidratación paralela** — `useAppStore.hydrate()` y `useThemeStore.hydrate()` cargan perfil, progreso y tema.
3. **Splash de marca** — `BrandSplashScreen` se muestra durante 2 segundos *y* hasta que ambas hidrataciones terminen.
4. **Ruta inicial dinámica** — Si hay perfil guardado → `Home`; si no → `Welcome`.
5. **Tema de navegación** — Se construye con `getThemeColors(colorScheme)` para que las transiciones del stack respeten el tema.

---

## 5. Navegación y rutas

### Definición de tipos (`src/navigation/types.ts`)

```typescript
export type RootStackParamList = {
  Welcome: undefined;
  Profile: undefined;
  Home: undefined;
  Cardio: undefined;
  CardioActivity: { activityId: CardioActivityId };
  CardioSession: { activityId: CardioActivityId; dayIndex: number };
  Workout: { day: DayOfWeek };
};
```

### Mapa de rutas

| Ruta | Pantalla | Parámetros | ¿Usa AppShell? | Descripción |
|------|----------|------------|----------------|-------------|
| `Welcome` | `WelcomeScreen` | — | No | Logo, intro y botón "Iniciar entrenamiento" |
| `Profile` | `ProfileScreen` | — | Sí | Onboarding / edición de perfil |
| `Home` | `HomeScreen` | — | Sí | Plan semanal de fuerza + nutrición |
| `Workout` | `WorkoutScreen` | `day: DayOfWeek` | Sí | Sesión guiada del día seleccionado |
| `Cardio` | `CardioScreen` | — | Sí | Listado de actividades cardio |
| `CardioActivity` | `CardioActivityScreen` | `activityId` | Sí | Días de la semana de una actividad |
| `CardioSession` | `CardioSessionScreen` | `activityId`, `dayIndex` | Sí | Detalle de sesión cardio (solo lectura) |

`DayOfWeek` = `1` (lunes) … `7` (domingo), convención ISO.

### Flujos de navegación principales

```
                    ┌─────────────┐
                    │   Welcome   │
                    └──────┬──────┘
                           │ replace
                           ▼
                    ┌─────────────┐
              ┌────►│   Profile   │◄──── reset (Actualizar datos)
              │     └──────┬──────┘
              │            │ replace (perfil guardado)
              │            ▼
              │     ┌─────────────┐     navigate      ┌─────────────┐
              │     │    Home     │ ────────────────► │   Workout   │
              │     └──────┬──────┘                   └─────────────┘
              │            │ MainSectionTabs
              │            ▼
              │     ┌─────────────┐     navigate      ┌──────────────────┐
              │     │   Cardio    │ ────────────────► │ CardioActivity   │
              │     └─────────────┘                   └────────┬─────────┘
              │                                                │ navigate
              │                                                ▼
              │                                       ┌──────────────────┐
              └───────────────────────────────────────│ CardioSession    │
                                                        └──────────────────┘
```

### Patrones de navegación usados

| Acción | Método | Cuándo |
|--------|--------|--------|
| Ir al onboarding | `navigation.replace('Profile')` | Desde Welcome |
| Ir al home tras guardar perfil | `navigation.replace('Home')` | ProfileScreen |
| Abrir entrenamiento | `navigation.navigate('Workout', { day })` | HomeScreen |
| Cambiar sección principal | `navigation.navigate('Home' \| 'Cardio')` | MainSectionTabs |
| Reset de perfil | `navigation.reset({ index: 0, routes: [{ name: 'Profile' }] })` | ResetProfileButton |
| Salir de entrenamiento | `navigation.navigate('Home')` | WorkoutScreen (detener) |

Todas las pantallas del stack tienen `headerShown: false`; la cabecera visual es `AppHeader` dentro de `AppShell`.

---

## 6. Gestión de estado y persistencia

### 6.1. Store principal — `useAppStore`

**Archivo:** `src/stores/useAppStore.ts`

| Campo / acción | Tipo | Descripción |
|----------------|------|-------------|
| `isHydrated` | `boolean` | `true` cuando terminó la carga desde AsyncStorage |
| `profile` | `UserProfile \| null` | Perfil activo del usuario |
| `recommendation` | `Recommendation \| null` | Rutina semanal asignada al arquetipo |
| `completedWorkouts` | `CompletedWorkoutDate[]` | Días completados con fecha ISO |
| `hydrate()` | async | Carga perfil + completados y calcula recomendación |
| `setProfile(profile)` | async → `boolean` | Valida matcher, guarda y actualiza estado |
| `resetProfile()` | async | Borra perfil y completados |
| `isDayCompleted(day)` | fn | `true` si el día se completó en la semana calendario actual |

**Función exportada aparte:**

- `markDayCompleted(day, date)` — Llamada desde `WorkoutScreen` al finalizar sesión. Actualiza AsyncStorage y el store.

### 6.2. Store de tema — `useThemeStore`

**Archivo:** `src/stores/useThemeStore.ts`

| Campo / acción | Descripción |
|----------------|-------------|
| `colorScheme` | `'light' \| 'dark'` (default: `'dark'`) |
| `hydrate()` | Lee preferencia guardada |
| `setColorScheme()` | Guarda y aplica |
| `toggleColorScheme()` | Alterna y persiste |

### 6.3. Capa de persistencia — `storage.ts`

**Archivo:** `src/utils/storage.ts`

| Clave AsyncStorage | Constante | Contenido |
|--------------------|-----------|-----------|
| `@stride/profile` | `STORAGE_KEYS.profile` | JSON de `UserProfile` |
| `@stride/completed_dates` | `STORAGE_KEYS.completedDates` | Array `{ day, date }` |
| `@stride/color_scheme` | `STORAGE_KEYS.colorScheme` | `'light'` o `'dark'` |

`getProfile()` valida el JSON parseado antes de devolverlo (goal, workoutLocation, birthDate, weight). Si algo es inválido, devuelve `null`.

`clearProfile()` elimina perfil y fechas completadas, **pero no** el tema.

### 6.4. Flujo de datos del perfil

```
Usuario completa ProfileScreen
        │
        ▼
setProfile({ birthDate, weight, workoutLocation, goal })
        │
        ├── calculateAge(birthDate)
        ├── getArchetype(age, weight)        → archetypes.ts
        ├── getRoutines(location, goal)      → routinesData.ts
        ├── findMatchingRecommendation()     → routineMatcher.ts
        │
        ├── Si null → return false (alerta en UI)
        └── Si match → saveProfile() + set state → return true
```

---

## 7. Modelo de dominio y datos embebidos

### 7.1. Tipos centrales (`src/models/types.ts`)

| Tipo | Descripción |
|------|-------------|
| `WorkoutLocation` | `'home' \| 'gym'` |
| `WorkoutGoal` | `'toning' \| 'muscle_gain' \| 'fat_reduction'` |
| `Archetype` | `'A' \| 'B' \| 'C' \| 'D' \| 'E' \| 'F'` |
| `DayOfWeek` | `1`–`7` (lunes a domingo) |
| `Exercise` | Ejercicio con series, reps o duración |
| `DayRoutine` | Un día: `warmUp`, `mainWorkout`, `coolDown` |
| `Recommendation` | Arquetipo + rangos + `weeklyRoutine` |
| `UserProfile` | `birthDate`, `weight`, `workoutLocation`, `goal` |
| `NutritionGuide` | Guía nutricional completa por objetivo |
| `CardioActivity` | Plan cardio con `id`, `title` y estructura semanal |

### 7.2. Archivos de datos

#### Rutinas de fuerza

```
src/data/
├── home/
│   ├── toning.json
│   ├── muscle_gain.json
│   └── fat_reduction.json
└── gym/
    ├── toning.json
    ├── muscle_gain.json
    └── fat_reduction.json
```

Cada archivo es un `RoutinesData` = `Recommendation[]` con **exactamente 6 entradas** (arquetipos A–F). Ver [PROMPT-RUTINAS-JSON.md](./PROMPT-RUTINAS-JSON.md).

**Carga:** `src/utils/routinesData.ts` importa los JSON estáticamente y expone:

- `getRoutines(location, goal)` → dataset completo
- `getDayExercises(dayRoutine)` → array plano warmUp + main + coolDown

#### Nutrición

```
src/data/nutrition/
├── nutrition_toning.json
├── nutrition_muscle_gain.json
└── nutrition_fat_reduction.json
```

**Carga:** `src/utils/nutritionData.ts`

- `getNutritionGuide(goal)` — según objetivo del perfil
- `getCardioNutritionGuide()` — siempre usa `fat_reduction`

#### Cardio

```
src/data/training/
├── jog.json
├── cycling.json
└── rope-jump.json
```

**Carga:** `src/utils/cardioData.ts`

- `getCardioActivities()` — listado ordenado
- `getCardioActivity(id)` — plan individual
- `getCardioWeekDays()`, `getCardioSessionDay()`, `getCardioDayPhases()` — presentación

---

## 8. Lógica de negocio (utils)

### 8.1. Arquetipos — `archetypes.ts`

```
Edad < 14 o peso < 40 kg  →  null (sin rutina)

Edad ≤ 40:
  peso ≤ 70 → A
  peso > 70 → B

Edad 41–65:
  peso ≤ 70 → C
  peso > 70 → D

Edad 66–75 → E
Edad > 75  → F
```

Constantes exportadas: `MIN_SUPPORTED_AGE = 14`, `MIN_SUPPORTED_WEIGHT_KG = 40`.

### 8.2. Matcher — `routineMatcher.ts`

- `calculateAge(birthDate)` — edad en años completos desde ISO `YYYY-MM-DD`
- `findMatchingRecommendation(profile, routines)` — une edad + arquetipo + búsqueda en array

### 8.3. Calendario semanal — `weekSchedule.ts`

| Función | Propósito |
|---------|-----------|
| `getDayOfWeek(date)` | Día actual como `DayOfWeek` (ISO) |
| `getWeekStartDate(date)` | Lunes 00:00 de la semana |
| `isSameCalendarWeek(isoDate)` | ¿La fecha pertenece a la semana actual? |
| `getDayScheduleStatus(day, completed)` | `'expired' \| 'completed' \| 'today' \| 'upcoming'` |
| `isDayWorkoutAccessible(day)` | **Solo el día de hoy** puede iniciar entrenamiento activo |
| `getDayStatusLabel(status)` | Texto para la UI del listado |

**Regla de negocio importante:** cualquier día se puede *ver* en modo preview, pero solo el día actual permite iniciar la sesión guiada. Un día completado en la semana actual se puede repetir si sigue siendo hoy.

### 8.4. Formato de ejercicios — `workoutFormat.ts`

- `formatExercisePrescription(exercise)` — `"3 series × 12"` o `"30s"` según campos
- `formatElapsedDuration(ms)` — duración legible de la sesión

### 8.5. Grupos musculares — `muscleGroups.ts`

Inferencia por palabras clave en el nombre del ejercicio. Usado en `WorkoutScreen` para mostrar zona muscular. Tiene fallback a etiqueta de `bodyZone` (`upper`, `lower`, `full`).

### 8.6. Imágenes de ejercicios — `imageMapper.ts`

Mapa `Images` con claves por `imagePlaceholder` del JSON. Actualmente solo existe `default` → `man-woman-body-gym.png`. Para añadir imágenes reales, registrar nuevas entradas en el mapa.

### 8.7. Notificaciones — `notifications.ts`

- Canal Android `rest-timer` (importancia HIGH)
- `ensureNotificationPermissions()` — pide permiso si falta
- `scheduleRestEndNotification(targetTime, nextExerciseName)` — notificación programada
- `cancelRestNotification(id)` — cancela al pausar/saltar/terminar

`notificationsSupport.ts` encapsula la detección de plataforma para canales Android.

---

## 9. Pantallas y flujos de usuario

### 9.1. `SplashScreen` (`BrandSplashScreen`)

- Logo centrado sobre fondo blanco fijo
- No depende del tema (pantalla de carga inicial)

### 9.2. `WelcomeScreen`

- Logo + texto introductorio
- Botón → `navigation.replace('Profile')`
- **No** usa `AppShell` (pantalla a pantalla completa)

### 9.3. `ProfileScreen`

**Campos del formulario:**

| Campo UI | ¿Se persiste? | Notas |
|----------|---------------|-------|
| Género | **No** | Solo validación de formulario; no forma parte de `UserProfile` ni del matcher |
| Tipo de rutina (casa/gym) | Sí | `workoutLocation` |
| Objetivo | Sí | `goal` |
| Peso (kg) | Sí | `weight` |
| Fecha de nacimiento | Sí | `birthDate` como ISO string |

**Validaciones:** género, ubicación, objetivo, peso > 0 y ≥ 40 kg, edad ≥ 14, matcher debe encontrar rutina.

**Al guardar con éxito:** `navigation.replace('Home')`.

### 9.4. `HomeScreen`

Dos subsecciones vía `SectionSubmenu`:

1. **Plan** — `FlatList` de los 7 días de `recommendation.weeklyRoutine`
   - Estado visual según `getDayScheduleStatus`
   - Tap → `Workout` con `{ day }`
2. **Nutrición** — `NutritionPanel` con guía del objetivo del perfil

`MainSectionTabs` permite saltar a la sección Cardio.

### 9.5. `WorkoutScreen` — Máquina de estados

Fases (`WorkoutPhase`):

```
preview → exercise → rest → countdown → exercise → … → summary
                ↘ (último ejercicio) → summary
```

| Fase | Qué muestra |
|------|-------------|
| `preview` | Listado de ejercicios del día; botón "Comenzar" (solo si `canStartWorkout`) |
| `exercise` | Imagen, nombre, prescripción, descripción; Completar / Saltar |
| `rest` | Temporizador con Pausar, +15s, Saltar descanso, Detener |
| `countdown` | Overlay 3-2-1 antes del siguiente ejercicio |
| `summary` | Tiempo total, ejercicios completados y omitidos; marca día como completado |

**Comportamientos especiales:**

- `useKeepAwake()` activo durante toda la pantalla
- `markDayCompleted(day, todayIso)` al llegar a `summary`
- Detener entrenamiento cancela timer y vuelve a Home sin marcar completado

### 9.6. Sección Cardio

| Pantalla | Contenido |
|----------|-----------|
| `CardioScreen` | Tabs Entrenamiento/Cardio + submenú Actividades/Nutrición |
| `CardioActivityScreen` | 5 días de la rutina semanal de la actividad |
| `CardioSessionScreen` | Fases: calentamiento, entrenamiento, enfriamiento (solo consulta, sin timer) |

El cardio **no depende del perfil** ni del arquetipo. La nutrición de cardio siempre es la de reducción de grasa.

---

## 10. Componentes reutilizables

### Layout y navegación interna

| Componente | Archivo | Rol |
|------------|---------|-----|
| `AppShell` | `AppShell.tsx` | Layout estándar: SafeArea + Header + contenido + Footer |
| `AppHeader` | `AppHeader.tsx` | Logo, menú modal (actualizar datos, cambiar tema) |
| `AppFooter` | `AppFooter.tsx` | Crédito "Developed by KBRGarcia" |
| `MainSectionTabs` | `MainSectionTabs.tsx` | Tabs "Entrenamiento" / "Cardio" |
| `SectionSubmenu` | `SectionSubmenu.tsx` | Submenú genérico (Plan/Nutrición, Actividades/Nutrición) |

### Formularios y contenido

| Componente | Archivo | Rol |
|------------|---------|-----|
| `BirthDatePicker` | `BirthDatePicker.tsx` | Selector custom día/mes/año con modales y `FlatList` |
| `NutritionPanel` | `NutritionPanel.tsx` | Cabecera + scroll de guía nutricional |
| `NutritionGuideContent` | `NutritionGuideContent.tsx` | Renderizado detallado de secciones de nutrición |
| `ResetProfileButton` | `ResetProfileButton.tsx` | Alerta de confirmación + `resetProfile()` + navegación a Profile |

### Jerarquía visual típica

```
AppShell
├── AppHeader
├── {children}          ← contenido de la pantalla
└── AppFooter (SafeArea bottom)
```

Pantallas con tabs:

```
AppShell
├── MainSectionTabs
├── SectionSubmenu (opcional)
└── contenido (lista, panel, etc.)
```

---

## 11. Sistema de estilos y temas

### 11.1. Arquitectura del tema

```
useThemeStore (colorScheme)
        │
        ▼
useTheme() hook
        ├── colors  ← getThemeColors(colorScheme)   → theme/colors.ts
        ├── images  ← getThemeImages(colorScheme)   → theme/images.ts
        ├── isDark
        └── statusBarStyle ('light' | 'dark')
```

### 11.2. Tokens de color (`theme/colors.ts`)

Paleta completa por modo: `background`, `surface`, `primary`, `success`, `danger`, `text*`, bordes, overlays, etc. No hay CSS ni Tailwind; todo es `StyleSheet` de React Native.

### 11.3. Imágenes por tema (`theme/images.ts`)

| Token | Oscuro | Claro |
|-------|--------|-------|
| `logoIcon` | Stride-logo-dark.png | Stride-logo-light.png |
| `logoName` | Stride-name-dark.png | Stride-name-light.png |
| `splashLogo` | Stride-logo.png (común) | Stride-logo.png |

### 11.4. Patrón de estilos en componentes

**Convención dominante:** estilos creados con `useMemo` + `StyleSheet.create`, dependiendo de `colors`:

```typescript
const { colors } = useTheme();

const styles = useMemo(
  () => StyleSheet.create({
    title: { color: colors.text, fontSize: 28 },
    // ...
  }),
  [colors]
);
```

Esto garantiza que al cambiar el tema se recalculan los estilos sin reiniciar la app.

**Excepciones:** `AppShell`, `AppHeader`, `AppFooter` y `BrandSplashScreen` mezclan `StyleSheet.create` estático con colores inline donde hace falta.

### 11.5. React Navigation theme

`App.tsx` construye un objeto `navigationTheme` que extiende `DarkTheme` o `DefaultTheme` con los colores de Stride para fondo, cards, texto y primary del stack.

---

## 12. Hooks personalizados

### `useTheme` (`src/hooks/useTheme.ts`)

Facade sobre `useThemeStore` + funciones de `theme/`. Es el hook que deben usar componentes para colores e imágenes.

### `useTimer` (`src/hooks/useTimer.ts`)

Gestiona el temporizador de descanso entre ejercicios.

| Constante | Valor |
|-----------|-------|
| `REST_DURATION_MS` | 30 000 (30 s) |
| `ADD_REST_MS` | 15 000 (+15 s) |
| `TICK_MS` | 100 (intervalo de UI) |

| Método | Comportamiento |
|--------|----------------|
| `startRest(duration?)` | Inicia descanso, programa notificación |
| `pause()` | Pausa, cancela notificación, guarda tiempo restante |
| `resume()` | Reanuda desde tiempo pausado |
| `addTime()` | Suma 15 s (activo o pausado) |
| `skipRest()` | Salta al callback `onRestComplete` |
| `stop()` | Cancela sin callback (salir de entrenamiento) |

**Robustez:** usa `targetTime` absoluto (timestamp) en lugar de contador simple, y escucha `AppState` para resincronizar al volver del background.

---

## 13. Notificaciones y temporizador

### Flujo durante un entrenamiento

```
Usuario completa ejercicio
        │
        ▼
startRest() ──► ensureNotificationPermissions()
        │         scheduleRestEndNotification(targetTime, nextExercise)
        ▼
Fase "rest" en WorkoutScreen (UI del timer)
        │
        ├── Pausa → cancelRestNotification()
        ├── +15s → reprograma notificación
        ├── Skip → cancel + onRestComplete()
        └── Tiempo agotado → onRestComplete()
                │
                ▼
        countdown 3-2-1 → siguiente ejercicio
```

### Configuración Android

- Canal: `rest-timer` (nombre visible: "Descanso")
- Definido en `app.json` como `defaultChannel` del plugin expo-notifications
- También creado en runtime por `notifications.ts`

---

## 14. Tests

### Ubicación

`src/utils/__tests__/`

### Cobertura actual

| Archivo de test | Qué valida |
|-----------------|------------|
| `archetypes.test.ts` | Límites y asignación de arquetipos |
| `routineMatcher.test.ts` | Cálculo de edad y matching |
| `weekSchedule.test.ts` | Semana calendario, estados de día, accesibilidad |
| `routinesData.test.ts` | Carga y estructura de rutinas |
| `nutritionData.test.ts` | Guías por objetivo |
| `cardioData.test.ts` | Parsing y presentación cardio |
| `workoutFormat.test.ts` | Formato de prescripciones |
| `muscleGroups.test.ts` | Inferencia de grupos musculares |

### Ejecutar

```bash
npm test
```

Los tests se centran en **lógica pura** (sin renderizar pantallas), lo que los hace rápidos y estables.

---

## 15. Convenciones y decisiones de diseño

### Código

- **TypeScript strict** habilitado
- Imports de JSON con `as RoutinesData` / `as NutritionGuide` para tipado
- Fechas siempre en formato ISO `YYYY-MM-DD` en persistencia
- Días de semana: convención ISO (1 = lunes)
- No hay API REST, GraphQL ni base de datos remota

### UI / UX

- Sin header nativo de React Navigation; cabecera custom en `AppHeader`
- Accesibilidad: `accessibilityLabel` y `accessibilityRole` en botones clave
- Iconos: familia Ionicons de `@expo/vector-icons`
- El género se pide en onboarding pero **no afecta** la lógica (decisión explícita documentada en PROMPT-RUTINAS-JSON)

### Añadir contenido nuevo

| Quiero añadir… | Dónde tocar |
|----------------|-------------|
| Nueva rutina/objetivo | JSON en `data/` + tipos en `models/types.ts` + mapa en `routinesData.ts` |
| Nueva actividad cardio | JSON en `data/training/` + entrada en `cardioData.ts` |
| Imagen de ejercicio | PNG en `assets/images/` + clave en `imageMapper.ts` |
| Nueva pantalla | `screens/` + ruta en `navigation/types.ts` + `Stack.Screen` en `App.tsx` |
| Nuevo dato persistente | Clave en `storage.ts` + campo/acción en store |

### Comandos a evitar en Expo

```bash
npm install -g expo-cli    # Obsoleto
npm update                 # Rompe alineación de SDK
npm audit fix --force      # Puede degradar expo
npm install <paquete-rn>   # Usar: npx expo install <paquete>
```

---

## 16. Mapa mental para retomar el proyecto

Si vuelves tras un tiempo sin tocar el código, revisa en este orden:

1. **`package.json` / `app.json`** — ¿Sigue en SDK 57? ¿Nuevas dependencias?
2. **`src/models/types.ts`** — ¿Cambió el modelo de dominio?
3. **`src/data/`** — ¿Se añadieron o modificaron JSON de rutinas/nutrición/cardio?
4. **`src/stores/useAppStore.ts`** — ¿Nuevo estado global o flujo de perfil?
5. **`App.tsx`** — ¿Nuevas rutas en el stack?
6. **`src/screens/WorkoutScreen.tsx`** — Pantalla más compleja (fases + timer)
7. **`src/utils/`** — Lógica de negocio; leer tests para entender reglas
8. **`docs/PROMPT-RUTINAS-JSON.md`** — Si vas a generar o editar rutinas

### Preguntas frecuentes al retomar

| Pregunta | Respuesta corta |
|----------|-----------------|
| ¿Dónde se elige la rutina? | `routineMatcher.ts` + JSON según `location` y `goal` |
| ¿Por qué no hay backend? | Fase 1: app local, contenido embebido |
| ¿Dónde se guarda el progreso? | AsyncStorage vía `storage.ts` y `useAppStore` |
| ¿Por qué no puedo entrenar un martes si hoy es lunes? | `isDayWorkoutAccessible` solo permite el día actual |
| ¿El cardio depende del perfil? | No; solo la nutrición de Home/Cardio usa el objetivo |
| ¿Cómo cambio colores? | `src/theme/colors.ts` |
| ¿Cómo pruebo en el móvil? | `npx expo start` + Expo Go SDK 57 |

---

*Documento de arquitectura — Stride App. Mantener actualizado cuando cambien rutas, stores, esquemas JSON o dependencias principales.*
