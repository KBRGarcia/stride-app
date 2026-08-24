# Pantalla de bienvenida — Explicación del código (Stride App)

Este documento explica **línea por línea** el código de la pantalla de bienvenida temporal de Stride. Está pensado para un desarrollador junior que ya tiene el entorno instalado ([INSTALACION-INICIAL.md](./INSTALACION-INICIAL.md)) y quiere entender **qué hace cada parte** y **cómo llega a verse en el móvil**.

---

## Tabla de contenidos

1. [Archivos involucrados](#1-archivos-involucrados)
2. [Cómo se visualiza en el móvil (flujo completo)](#2-cómo-se-visualiza-en-el-móvil-flujo-completo)
3. [index.ts — Punto de entrada](#3-indexts--punto-de-entrada)
4. [App.tsx — Componente raíz](#4-apptsx--componente-raíz)
5. [WelcomeScreen.tsx — Pantalla de bienvenida](#5-welcomescreentsx--pantalla-de-bienvenida)
6. [Estilos (StyleSheet) explicados](#6-estilos-stylesheet-explicados)
7. [Ejemplos prácticos para experimentar](#7-ejemplos-prácticos-para-experimentar)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)

---

## 1. Archivos involucrados

```
stride-app/
├── index.ts                        ← Registra la app en el sistema
├── App.tsx                         ← Componente principal (contenedor)
└── src/
    └── screens/
        └── WelcomeScreen.tsx       ← Pantalla que ves al abrir la app
```

| Archivo | Rol en una frase |
|---------|------------------|
| `index.ts` | Le dice a Expo/React Native: *"Cuando arranques, ejecuta `App`"*. |
| `App.tsx` | Envuelve la app con utilidades globales y muestra la pantalla de bienvenida. |
| `WelcomeScreen.tsx` | Dibuja el texto "Stride App" y el subtítulo en pantalla. |

---

## 2. Cómo se visualiza en el móvil (flujo completo)

Antes de leer línea por línea, conviene entender **el camino desde tu PC hasta la pantalla del teléfono**:

```
┌─────────────────┐     WiFi / Túnel      ┌─────────────────┐
│  Tu PC          │  ──────────────────►  │  Expo Go        │
│  npx expo start │     exp://...         │  (SDK 57)       │
│  Metro Bundler  │                       │  en el móvil    │
└─────────────────┘                       └─────────────────┘
        │                                         │
        │ 1. Metro empaqueta el JS                │ 4. Ejecuta el JS
        │ 2. Sirve index.ts → App.tsx             │ 5. Renderiza WelcomeScreen
        │ 3. QR apunta a esa URL                  │ 6. Ves "Stride App"
        ▼                                         ▼
```

### Paso a paso (lo que ocurre al escanear el QR)

1. **En la PC** ejecutas `npx expo start`. **Metro** (el bundler) compila tu TypeScript/JavaScript en un solo paquete que el móvil puede ejecutar.

2. **Expo Go** en el móvil descarga ese paquete desde la URL (`exp://192.168.x.x:8081` o túnel `exp.direct`).

3. **Expo Go** busca el punto de entrada definido en `package.json`:
   ```json
   "main": "index.ts"
   ```

4. **`index.ts`** registra y ejecuta `App`.

5. **`App.tsx`** renderiza `WelcomeScreen`.

6. **React Native** convierte los componentes (`<Text>`, `<View>`, etc.) en elementos nativos de Android/iOS. Por eso ves texto real en pantalla, no una web embebida (salvo que uses web).

### Recarga en caliente (Fast Refresh)

Si guardas cambios en `WelcomeScreen.tsx` con Metro activo, Expo Go **actualiza la pantalla sin reinstalar**. Ejemplo: cambia el título a `"Stride App v2"`, guarda el archivo y en unos segundos lo verás en el móvil.

---

## 3. `index.ts` — Punto de entrada

```typescript
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
```

### Línea por línea

| Línea | Código | Qué hace |
|-------|--------|----------|
| 1 | `import { registerRootComponent } from 'expo';` | Importa la función de Expo que registra el componente raíz de la aplicación. |
| 3 | `import App from './App';` | Importa el componente `App` definido en `App.tsx`. `./` significa "misma carpeta que este archivo". |
| 8 | `registerRootComponent(App);` | Le dice al sistema: *"La app entera comienza aquí, con el componente `App`"*. Funciona igual en Expo Go y en un APK compilado. |

### Analogía

Imagina un edificio:
- **`index.ts`** = la puerta principal (única entrada oficial).
- **`App`** = el vestíbulo que conecta con las habitaciones (pantallas).

### Ejemplo de uso

No sueles tocar `index.ts` en el día a día. Solo lo modificarías si cambias el nombre del archivo raíz (poco habitual).

---

## 4. `App.tsx` — Componente raíz

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './src/screens/WelcomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <WelcomeScreen />
    </SafeAreaProvider>
  );
}
```

### Línea por línea

| Línea | Código | Qué hace |
|-------|--------|----------|
| 1 | `import { SafeAreaProvider } from 'react-native-safe-area-context';` | Importa un **contenedor global** que calcula las zonas seguras del dispositivo (notch, barra de estado, barra de gestos). |
| 3 | `import WelcomeScreen from './src/screens/WelcomeScreen';` | Importa nuestra pantalla de bienvenida. La ruta `./src/screens/...` sale desde la raíz del proyecto. |
| 5 | `export default function App() {` | Declara y exporta el componente principal. `export default` permite importarlo como `import App from './App'`. |
| 6-10 | `return ( ... );` | Devuelve **JSX**: código que parece HTML pero es JavaScript. Describe *qué* debe aparecer en pantalla. |
| 7 | `<SafeAreaProvider>` | Envuelve toda la app para que cualquier pantalla hija pueda usar `SafeAreaView` y respetar bordes del dispositivo. |
| 8 | `<WelcomeScreen />` | Renderiza la pantalla de bienvenida. El `/` al final indica "componente sin hijos anidados en JSX". |
| 9 | `</SafeAreaProvider>` | Cierra el contenedor (en JSX todo tag abierto debe cerrarse). |

### ¿Por qué `SafeAreaProvider` aquí y no dentro de `WelcomeScreen`?

**Convención:** el provider va **una sola vez**, lo más arriba posible (en `App.tsx`). Así, cuando añadas navegación y más pantallas, todas podrán usar áreas seguras sin repetir configuración.

### Ejemplo mental

```tsx
// ❌ Sin SafeAreaProvider: el texto podría quedar debajo del notch
<WelcomeScreen />

// ✅ Con SafeAreaProvider: WelcomeScreen puede usar SafeAreaView correctamente
<SafeAreaProvider>
  <WelcomeScreen />
</SafeAreaProvider>
```

### Ejemplo futuro (cuando tengas navegación)

```tsx
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

Hoy solo mostramos `WelcomeScreen` directamente; más adelante `App.tsx` será el "director de orquesta" de todas las pantallas.

---

## 5. `WelcomeScreen.tsx` — Pantalla de bienvenida

### Bloque 1: Imports

```tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

| Línea | Import | Para qué sirve |
|-------|--------|----------------|
| 1 | `StatusBar` (expo) | Controla la barra superior del sistema (hora, batería): color claro/oscuro. |
| 2 | `StyleSheet, Text, View` (react-native) | **`View`**: caja contenedora (como un `<div>`). **`Text`**: solo para texto (obligatorio en RN). **`StyleSheet`**: define estilos optimizados. |
| 3 | `SafeAreaView` | Igual que `View`, pero **empuja el contenido** fuera del notch y barras del sistema. |

> **Regla de React Native:** no puedes escribir texto suelto. Siempre debe ir dentro de `<Text>`.

```tsx
// ❌ Incorrecto
<View>Hola</View>

// ✅ Correcto
<View><Text>Hola</Text></View>
```

---

### Bloque 2: Componente y JSX

```tsx
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stride App</Text>
        <Text style={styles.subtitle}>An application developed by KBRGarcia</Text>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
```

| Línea | Código | Qué hace |
|-------|--------|----------|
| 5 | `export default function WelcomeScreen()` | Define la pantalla como componente reutilizable. |
| 7 | `<SafeAreaView style={styles.container}>` | Contenedor principal a pantalla completa con color de fondo. `style={...}` aplica CSS-like styles. |
| 8 | `<View style={styles.content}>` | Subcontenedor para centrar el texto vertical y horizontalmente. |
| 9 | `<Text style={styles.title}>Stride App</Text>` | Título visible en pantalla. |
| 10 | `<Text style={styles.subtitle}>...</Text>` | Subtítulo con crédito al desarrollador. |
| 12 | `<StatusBar style="light" />` | Iconos de la barra de estado en **blanco** (adecuado para fondo oscuro). |
| 13 | `</SafeAreaView>` | Cierra el contenedor raíz de la pantalla. |

### Jerarquía visual (árbol de componentes)

```
SafeAreaView          ← Pantalla completa, respeta notch
└── View (content)    ← Zona centrada
    ├── Text (title)      "Stride App"
    └── Text (subtitle)   "An application developed by KBRGarcia"
StatusBar             ← Configuración del sistema (no ocupa espacio visual propio)
```

### Ejemplo: cambiar textos

```tsx
<Text style={styles.title}>Stride App</Text>
<Text style={styles.subtitle}>An application developed by KBRGarcia</Text>

// Cambio temporal para probar Fast Refresh:
<Text style={styles.title}>¡Hola, Stride!</Text>
<Text style={styles.subtitle}>Fase 1 — Entrenamiento local</Text>
```

Guarda el archivo → en Expo Go verás el cambio en segundos.

---

## 6. Estilos (StyleSheet) explicados

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
});
```

### ¿Por qué `StyleSheet.create` y no un objeto suelto?

React Native **optimiza** los estilos creados con `StyleSheet.create` y valida propiedades. Es la forma recomendada.

### Propiedad por propiedad

#### `container` (fondo de toda la pantalla)

| Propiedad | Valor | Significado |
|-----------|-------|-------------|
| `flex: 1` | 1 | Ocupa **todo** el espacio disponible del padre. Sin esto, la pantalla podría colapsar a altura 0. |
| `backgroundColor` | `'#0f172a'` | Azul oscuro (estilo slate). Color de fondo de la app. |

**Ejemplo:** `flex: 1` en un contenedor hijo dentro de otro `flex: 1` reparte el espacio. Aquí solo hay un nivel principal.

#### `content` (zona del texto centrado)

| Propiedad | Valor | Significado |
|-----------|-------|-------------|
| `flex: 1` | 1 | Ocupa todo el `SafeAreaView`. |
| `alignItems: 'center'` | center | Centra hijos **horizontalmente** (eje cruzado en columna). |
| `justifyContent: 'center'` | center | Centra hijos **verticalmente** (eje principal). |
| `paddingHorizontal: 24` | 24 px | Margen interno izquierda/derecha para que el texto no toque los bordes en pantallas estrechas. |

**Analogía Flexbox:** imagina una caja vertical (`flexDirection` por defecto es `column`). `justifyContent` mueve arriba/abajo; `alignItems` mueve izquierda/derecha.

```
┌────────────────────────────┐
│                            │
│      Stride App            │  ← centrado con justify + align
│   An application...        │
│                            │
└────────────────────────────┘
```

#### `title`

| Propiedad | Valor | Significado |
|-----------|-------|-------------|
| `fontSize` | 32 | Texto grande. |
| `fontWeight` | `'700'` | Negrita (bold). |
| `color` | `'#f8fafc'` | Blanco casi puro. |
| `letterSpacing` | 0.5 | Separación entre letras (look más "marca"). |
| `marginBottom` | 12 | Espacio debajo del título antes del subtítulo. |

#### `subtitle`

| Propiedad | Valor | Significado |
|-----------|-------|-------------|
| `fontSize` | 16 | Texto secundario más pequeño. |
| `color` | `'#94a3b8'` | Gris azulado (menos protagonismo que el título). |
| `textAlign` | `'center'` | Multilínea centrada si el texto es largo. |
| `lineHeight` | 24 | Altura de línea para mejor lectura. |

### Ejemplo: probar otro esquema de color

```tsx
container: {
  flex: 1,
  backgroundColor: '#ffffff',  // fondo blanco
},
title: {
  fontSize: 32,
  fontWeight: '700',
  color: '#0f172a',            // texto oscuro
  // ...
},
```

Si cambias a fondo claro, recuerda cambiar también `<StatusBar style="light" />` a `style="dark"`.

---

## 7. Ejemplos prácticos para experimentar

### Ejemplo A — Añadir un tercer texto (versión)

En `WelcomeScreen.tsx`, dentro de `<View style={styles.content}>`:

```tsx
<Text style={styles.subtitle}>An application developed by KBRGarcia</Text>
<Text style={styles.subtitle}>v0.1.0 — Fase 1</Text>
```

### Ejemplo B — Botón placeholder (sin navegación aún)

```tsx
import { Pressable } from 'react-native';

// Dentro del View content, después de los Text:
<Pressable
  style={{
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  }}
  onPress={() => console.log('Próximamente: onboarding')}
>
  <Text style={{ color: '#fff', fontWeight: '600' }}>Comenzar</Text>
</Pressable>
```

`console.log` aparece en la terminal de Metro, no en el móvil. Sirve para practicar eventos antes de conectar navegación.

### Ejemplo C — Ver la pantalla en web (opcional)

```bash
npx expo start --web
```

Abre el navegador. La misma `WelcomeScreen` se renderiza con React Native Web. Útil para diseño rápido, aunque Stride está pensado para móvil.

---

## 8. Preguntas frecuentes

### ¿Por qué hay carpeta `src/screens/` si solo hay una pantalla?

**Organización futura.** Cuando añadas onboarding, calendario y entrenamiento, cada una vivirá en `src/screens/`. Evita un `App.tsx` gigante.

### ¿Qué diferencia hay entre `App.tsx` y `WelcomeScreen.tsx`?

| | `App.tsx` | `WelcomeScreen.tsx` |
|---|-----------|---------------------|
| Rol | Configuración global de la app | Una pantalla concreta |
| Contenido | Providers, navegación (futuro) | UI visible al usuario |
| Cambios | Pocos, estructurales | Frecuentes, diseño |

### ¿Por qué no usamos navegación todavía?

Es una pantalla **temporal de bienvenida**. React Navigation se añadirá cuando existan varias pantallas entre las que moverse. Por ahora `App` → `WelcomeScreen` es suficiente.

### La pantalla no se actualiza en el móvil

1. ¿Metro sigue corriendo? (`npx expo start`)
2. ¿Guardaste el archivo?
3. Agita el móvil → menú dev → **Reload**
4. Si falla la conexión, prueba `npx expo start --tunnel`

### ¿Dónde se "dibuja" realmente la UI?

React Native convierte:

- `<View>` → `android.view` / `UIView`
- `<Text>` → componentes de texto nativos

Expo Go incluye el runtime que ejecuta ese puente. Por eso no necesitas Android Studio solo para ver esta pantalla.

---

## Resumen en una frase

**`index.ts`** arranca **`App.tsx`**, que envuelve la app con **`SafeAreaProvider`** y muestra **`WelcomeScreen`**, donde **`Text`** y **`View`** con **`StyleSheet`** dibujan el mensaje de bienvenida que Metro envía a **Expo Go** cuando escaneas el QR.

---

*Documento asociado al código en `App.tsx` y `src/screens/WelcomeScreen.tsx` — Stride App, Fase 1.*
