# Prompt para generar los JSON de rutinas (Stride)

Copia y pega el bloque siguiente en DeepSeek, Gemini, ChatGPT u otro modelo. Si el JSON es demasiado largo para una sola respuesta, pide primero las rutinas de un género y, en mensajes siguientes, el resto por rangos de edad.

---

## Prompt (copiar desde aquí)

Eres un entrenador personal y un generador de datos estructurados. Debes crear **dos archivos JSON independientes** para la app de fitness **Stride**:

1. `routines-male.json` — solo recomendaciones con `"gender": "male"`
2. `routines-female.json` — solo recomendaciones con `"gender": "female"`

No expliques nada. No uses markdown. No envuelvas el JSON en backticks. La primera respuesta debe ser **únicamente** el contenido de `routines-male.json` (un array JSON válido). Cuando te lo pida, genera `routines-female.json` igual de completo.

### Objetivo de la app

El usuario introduce **peso exacto** (kg) y **fecha de nacimiento**. La app calcula la **edad exacta** y asigna una única rutina semanal según **género + rango de edad + rango de peso**. Tú debes cubrir **todas** las combinaciones: no puede faltar ningún par (edad × peso) para ese género.

### Rangos de edad (usa exactamente estos strings en `ageRange`)

El límite compartido pertenece al rango **anterior**. Ejemplo: 20 años → `"15-20"`; 21 años → `"20-30"`.

| `ageRange` | Edades cubiertas (años cumplidos) | `ageMin` | `ageMax` |
|---|---|---|---|
| `<=14` | 0 a 14 inclusive | 0 | 14 |
| `15-20` | 15 a 20 inclusive | 15 | 20 |
| `20-30` | 21 a 30 inclusive | 21 | 30 |
| `30-40` | 31 a 40 inclusive | 31 | 40 |
| `40-50` | 41 a 50 inclusive | 41 | 50 |
| `50-60` | 51 a 60 inclusive | 51 | 60 |
| `60-69` | 61 a 69 inclusive | 61 | 69 |
| `>=70` | 70 o más | 70 | 120 |

### Rangos de peso en kg (usa exactamente estos strings en `weightRange`)

El límite inferior es inclusivo y el superior exclusivo, salvo `>=90`.

| `weightRange` | Peso (kg) | `weightMin` | `weightMax` |
|---|---|---|---|
| `40-50` | 40 ≤ kg < 50 | 40 | 50 |
| `50-60` | 50 ≤ kg < 60 | 50 | 60 |
| `60-70` | 60 ≤ kg < 70 | 60 | 70 |
| `70-80` | 70 ≤ kg < 80 | 70 | 80 |
| `80-89` | 80 ≤ kg < 90 | 80 | 89 |
| `>=90` | kg ≥ 90 | 90 | 200 |

Ejemplo: 71 kg → `"70-80"`. 90 kg → `">=90"`. 49.9 kg → `"40-50"`. 50 kg → `"50-60"`.

### Cobertura obligatoria

Para **cada género** genera **48 recomendaciones** (8 edades × 6 pesos). Cada una es un objeto del array raíz. No fusiones rangos. No omitas combinaciones. No dupliques el mismo par `ageRange` + `weightRange`.

### Esquema de cada recomendación

```json
{
  "id": "uuid-v4-unico",
  "gender": "male",
  "ageRange": "20-30",
  "weightRange": "70-80",
  "ageMin": 21,
  "ageMax": 30,
  "weightMin": 70,
  "weightMax": 80,
  "weeklyRoutine": []
}
```

`gender` solo puede ser `"male"` o `"female"` (en el archivo de mujeres, siempre `"female"`).

`weeklyRoutine` es un array de **7 objetos**, uno por día, `day` del **1 al 7** (1 = lunes, 7 = domingo), sin días repetidos ni faltantes.

Cada día:

```json
{
  "day": 1,
  "exercises": []
}
```

Cada ejercicio:

```json
{
  "id": "uuid-v4-unico",
  "name": "Nombre del ejercicio en español",
  "description": "Instrucción breve en español (1 o 2 frases) de cómo ejecutarlo con buena técnica.",
  "imagePlaceholder": "nombre_archivo.png",
  "sets": 3,
  "reps": "12",
  "durationSeconds": null
}
```

Reglas de ejercicio:

- `id` UUID v4 único en todo el archivo (ningún id repetido entre recomendaciones, días o ejercicios).
- `name` y `description` en **español**.
- `imagePlaceholder`: nombre de archivo en `snake_case`, solo letras minúsculas, números y `.png`. Debe identificar el movimiento (ej. `sentadillas.png`, `plancha_frontal.png`). El mismo ejercicio puede repetir el mismo placeholder en distintos días/rangos (así se reutiliza la imagen). No pongas rutas, URLs ni espacios.
- `sets`: entero ≥ 1.
- `reps` y `durationSeconds` son excluyentes:
  - Fuerza/cardio por repeticiones: `"reps": "12"` o `"12 por pierna"` y `"durationSeconds": null`.
  - Isométricos o holds: `"reps": null` y `"durationSeconds": 40` (segundos, entero).
- 4 a 6 ejercicios por día.
- Prioriza material mínimo: peso corporal, silla, banda o mancuernas ligeras. Indica el material en el nombre o la descripción si hace falta.
- Adapta **intensidad y complejidad** al rango:
  - `<=14`: juegos de movimiento, técnica, nada de cargas altas ni burpees agresivos.
  - `15-20` y `20-30`: más intenso, puede incluir pliometría si el peso no es `>=90`.
  - `30-40` y `40-50`: fuerza funcional, impacto moderado.
  - `50-60`, `60-69`, `>=70`: más control, menos impacto articular, más equilibrio y movilidad; evita saltos y flexiones estrictas si hay alternativa (pared, inclinadas).
  - Pesos `80-89` y `>=90`: prioriza articulaciones, rango de movimiento controlado y menos pliometría.
  - Pesos `40-50` en hombres jóvenes: volumen y técnica, no asumas fuerza máxima.
- Varía el estímulo a lo largo de la semana (ej. tren inferior, tren superior, full body, core/cardio, movilidad). El día 7 puede ser más ligero o de movilidad, pero **debe tener ejercicios** (no array vacío).
- No inventes campos extra. No uses `null` en `id`, `name`, `imagePlaceholder`, `sets` ni en los rangos.

### Validación antes de entregar

- El resultado es un **array JSON** parseable (`JSON.parse` no debe fallar).
- Exactamente 48 objetos en el array.
- Cada objeto tiene los 7 días (1–7) y cada día 4–6 ejercicios.
- Todas las combinaciones `ageRange` × `weightRange` están presentes una sola vez.
- `ageMin`/`ageMax`/`weightMin`/`weightMax` coinciden con la tabla de arriba según `ageRange` y `weightRange`.
- Ningún UUID repetido.

Empieza ahora con `routines-male.json`. Cuando termine, espera a que te pida `routines-female.json` y genéralo con las mismas reglas, adaptando los ejercicios a biomecánica y objetivos frecuentes en mujeres (sin estereotipos vacíos: incluye fuerza de tren superior, no solo glúteos/abdomen).

---

## Cómo usar los archivos generados

1. Guarda los JSON en:
   - `src/data/routines-male.json`
   - `src/data/routines-female.json`
2. Las imágenes van en `assets/images/` con el mismo nombre que `imagePlaceholder` (ej. `sentadillas.png`).
3. Avísame cuando los JSON estén listos para integrarlos en el matcher y en `imageMapper.ts`.
