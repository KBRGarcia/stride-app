# Especificación de los JSON de rutinas (Stride)

La app selecciona una rutina mediante tres datos:

1. Entorno: `home` o `gym`.
2. Objetivo: `toning`, `muscle_gain` o `fat_reduction`.
3. Arquetipo calculado a partir de edad y peso.

El género no forma parte del perfil ni de la selección.

## Archivos

- `src/data/home/toning.json`
- `src/data/home/muscle_gain.json`
- `src/data/home/fat_reduction.json`
- `src/data/gym/toning.json`
- `src/data/gym/muscle_gain.json`
- `src/data/gym/fat_reduction.json`

## Arquetipos

| Arquetipo | Edad | Peso |
|---|---:|---:|
| A | 14–40 | 40–70 kg |
| B | 14–40 | Más de 70 kg |
| C | 41–65 | 40–70 kg |
| D | 41–65 | Más de 70 kg |
| E | 66–75 | Cualquiera desde 40 kg |
| F | 76 o más | Cualquiera desde 40 kg |

Cada archivo debe contener exactamente una recomendación para cada arquetipo, en orden de A a F.

## Esquema

```json
{
  "archetype": "A",
  "ageMin": 14,
  "ageMax": 40,
  "weightMin": 40,
  "weightMax": 70,
  "weeklyRoutine": [
    {
      "day": 1,
      "warmUp": [],
      "mainWorkout": [],
      "coolDown": []
    }
  ]
}
```

`weeklyRoutine` contiene siete días únicos, del 1 (lunes) al 7 (domingo).

Cada ejercicio sigue esta forma:

```json
{
  "id": "uuid-unico",
  "name": "Nombre en español",
  "description": "Instrucción breve y segura.",
  "imagePlaceholder": "nombre_archivo.png",
  "bodyZone": "upper",
  "sets": 3,
  "reps": "12",
  "durationSeconds": null
}
```

Reglas:

- `bodyZone` solo puede ser `upper`, `lower` o `full`.
- En ejercicios por tiempo, `durationSeconds` es un entero positivo y `reps` es `null`.
- En ejercicios por repeticiones, `reps` tiene contenido y `durationSeconds` es `null`.
- `sets` puede ser `null` en calentamiento y enfriamiento.
- `imagePlaceholder` se conserva como metadato; mientras no exista una imagen mapeada, la app usa su imagen predeterminada.
- Los identificadores deben ser únicos dentro de cada archivo.
- Los ejercicios deben priorizar técnica, progresión y bajo impacto conforme aumenta la edad o el peso.

## Validación antes de integrar

- El archivo se puede procesar con `JSON.parse`.
- Incluye A, B, C, D, E y F exactamente una vez.
- Cada arquetipo contiene los siete días.
- Cada día contiene `warmUp`, `mainWorkout` y `coolDown`.
- No se agregan campos de género.
