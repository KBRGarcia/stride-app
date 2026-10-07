#!/usr/bin/env node
/**
 * Alinea *-list.json con los ejercicios presentes en rutina5Dias / rutina3Dias.
 * Uso: node scripts/sync-exercise-library.mjs [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data');
const write = process.argv.includes('--write');

const GROUP_ORDER = [
  'pecho',
  'espalda',
  'hombros',
  'brazos',
  'abdomen',
  'piernas',
  'calentamiento',
  'enfriamiento',
];

const MUSCLE_TO_GROUP = [
  [/pecho|pectoral/i, 'pecho'],
  [/espalda|dorsal|trapecio|romboide/i, 'espalda'],
  [/hombro|deltoid/i, 'hombros'],
  [/bíceps|biceps|tríceps|triceps|brazo|antebrazo/i, 'brazos'],
  [/abdomen|abdominal|core/i, 'abdomen'],
  [/pierna|cuádriceps|cuadriceps|glúteo|gluteo|isquio|gemelo|pantorrilla/i, 'piernas'],
];

const PAIRS = [
  ['home', 'toning', 'home/toning.json', 'home-list/toning_list.json'],
  ['home', 'muscle_gain', 'home/muscle_gain.json', 'home-list/muscle_gain_list.json'],
  ['home', 'fat_reduction', 'home/fat_reduction.json', 'home-list/fat_reduction_list.json'],
  ['gym', 'toning', 'gym/toning.json', 'gym-list/toning_list.json'],
  ['gym', 'muscle_gain', 'gym/muscle_gain.json', 'gym-list/muscle_gain_list.json'],
  ['gym', 'fat_reduction', 'gym/fat_reduction.json', 'gym-list/fat_reduction_list.json'],
];

const THREE_DAY_WEEKDAYS = [1, 3, 5];

function weekdayFromName(name) {
  const prefix = name.split('-')[0]?.trim().toLowerCase() ?? '';
  const map = [
    ['lunes', 1],
    ['martes', 2],
    ['miércoles', 3],
    ['miercoles', 3],
    ['jueves', 4],
    ['viernes', 5],
    ['sábado', 6],
    ['sabado', 6],
    ['domingo', 7],
  ];
  return map.find(([label]) => prefix === label)?.[1] ?? null;
}

function getCatalogRoutine(catalog, schedule) {
  if (schedule === '3-days') {
    return catalog.rutina3Dias ?? null;
  }
  return catalog.rutina5Dias;
}

function listAvailableSchedules(catalog) {
  return catalog.rutina3Dias ? ['5-days', '3-days'] : ['5-days'];
}

function resolveCalendarDay(day, schedule, index) {
  const fromName = weekdayFromName(day.nombre);
  if (fromName) return fromName;
  if (schedule === '3-days') return THREE_DAY_WEEKDAYS[index] ?? 1;
  return day.dia >= 1 && day.dia <= 7 ? day.dia : 1;
}

function listCatalogDays(catalog, schedule) {
  const routine = getCatalogRoutine(catalog, schedule);
  if (!routine) return [];
  return routine.dias
    .map((day, index) => ({ day, weekday: resolveCalendarDay(day, schedule, index) }))
    .sort((a, b) => a.weekday - b.weekday)
    .map((entry) => entry.day);
}

function collectRoutineExercises(catalog) {
  const byId = new Map();
  for (const schedule of listAvailableSchedules(catalog)) {
    for (const day of listCatalogDays(catalog, schedule)) {
      for (const [block, fase] of [
        ['calentamiento', 'calentamiento'],
        ['ejercicios', 'entrenamiento'],
        ['enfriamiento', 'enfriamiento'],
      ]) {
        for (const exercise of day[block] ?? []) {
          if (!exercise?.id) continue;
          if (!byId.has(exercise.id)) {
            byId.set(exercise.id, { exercise, fase });
          }
        }
      }
    }
  }
  return byId;
}

function inferGroupId(exercise, fase) {
  if (fase === 'calentamiento') return 'calentamiento';
  if (fase === 'enfriamiento') return 'enfriamiento';
  const text = `${exercise.grupoMuscular ?? ''} ${exercise.musculo ?? ''}`;
  for (const [pattern, groupId] of MUSCLE_TO_GROUP) {
    if (pattern.test(text)) return groupId;
  }
  return 'piernas';
}

function toLibraryExercise(exercise, fase, catalog) {
  const band = Object.keys(catalog.distribucionEdades ?? {})[0];
  const prescription = band ? catalog.distribucionEdades[band] : null;
  const reps =
    exercise.reps ??
    exercise.repsPorEdad?.[band] ??
    (prescription ? String(prescription.repeticiones) : null);
  const series = exercise.series ?? exercise.seriesPorEdad?.[band] ?? prescription?.series ?? null;

  return {
    id: exercise.id,
    nombre: exercise.nombre,
    descripcion: exercise.descripcion,
    imagePlaceholder: exercise.imagePlaceholder,
    bodyZone: exercise.bodyZone,
    fase,
    grupoMuscular: exercise.grupoMuscular ?? null,
    musculo: exercise.musculo ?? null,
    herramienta: exercise.herramienta ?? null,
    series,
    reps: reps != null ? String(reps) : null,
  };
}

function syncList(catalog, library, routineById) {
  const allowed = new Set(routineById.keys());
  const indexById = new Map();
  for (const group of library.gruposMusculares) {
    for (const exercise of group.ejercicios) {
      indexById.set(exercise.id, { groupId: group.id, exercise });
    }
  }

  const groups = new Map(GROUP_ORDER.map((id) => [id, []]));

  for (const id of allowed) {
    const { exercise, fase } = routineById.get(id);
    const existing = indexById.get(id);
    const groupId = existing?.groupId ?? inferGroupId(exercise, fase);
    const lib =
      existing?.exercise && allowed.has(id)
        ? { ...existing.exercise, fase: existing.exercise.fase ?? fase }
        : toLibraryExercise(exercise, fase, catalog);
    groups.get(groupId)?.push(lib);
  }

  const groupNames = new Map(library.gruposMusculares.map((g) => [g.id, g.nombre]));
  const defaultNames = {
    pecho: 'Pecho',
    espalda: 'Espalda',
    hombros: 'Hombros',
    brazos: 'Brazos',
    abdomen: 'Abdomen',
    piernas: 'Piernas',
    calentamiento: 'Calentamiento',
    enfriamiento: 'Enfriamiento',
  };

  return {
    objetivo: library.objetivo,
    lugar: library.lugar,
    gruposMusculares: GROUP_ORDER.map((id) => ({
      id,
      nombre: groupNames.get(id) ?? defaultNames[id],
      ejercicios: groups.get(id) ?? [],
    })),
  };
}

let changed = 0;
for (const [location, goal, routineRel, listRel] of PAIRS) {
  const catalog = JSON.parse(readFileSync(join(dataDir, routineRel), 'utf8'));
  const library = JSON.parse(readFileSync(join(dataDir, listRel), 'utf8'));
  const routineById = collectRoutineExercises(catalog);
  const synced = syncList(catalog, library, routineById);

  const beforeIds = library.gruposMusculares.flatMap((g) => g.ejercicios.map((e) => e.id)).sort();
  const afterIds = synced.gruposMusculares.flatMap((g) => g.ejercicios.map((e) => e.id)).sort();
  const same = JSON.stringify(beforeIds) === JSON.stringify(afterIds);

  console.log(`${location}/${goal}: ${beforeIds.length} → ${afterIds.length} ejercicios${same ? ' (sin cambios de IDs)' : ''}`);

  if (!same || JSON.stringify(synced) !== JSON.stringify(library)) {
    changed += 1;
    if (write) {
      writeFileSync(join(dataDir, listRel), `${JSON.stringify(synced, null, 4)}\n`, 'utf8');
    }
  }
}

if (!write) {
  console.log('\nModo lectura. Ejecuta: node scripts/sync-exercise-library.mjs --write');
  process.exit(changed > 0 ? 2 : 0);
}

console.log(`\nActualizados ${changed} archivo(s).`);
