export type WorkoutExercise = {
    id: string;
    name: string;
    sets: number;
    reps: string;
    restSec: number;
    notes?: string;
    muscles?: string[];      // es: ["Petto", "Tricipiti"]
    description?: string;    // breve spiegazione
};


export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkoutDay = {
    id: string;          // es "mon" oppure "mon_123" se creato dopo
    weekday?: WeekdayKey; // 👈 nuovo (opzionale per non rompere vecchi dati)
    title: string;
    exercises: WorkoutExercise[];
};

export const MOCK_DAYS: WorkoutDay[] = [
    {
        id: "mon",
        weekday: "mon",
        title: "Lunedì — Petto / Tricipiti",
        exercises: [
            {
                id: "ex1",
                name: "Panca piana",
                sets: 4,
                reps: "8",
                restSec: 90,
                muscles: ["Petto", "Tricipiti", "Spalle"],
                description: "Schiena ben appoggiata, scapole addotte. Discesa controllata e spinta esplosiva.",
            }, { id: "ex2", name: "Distensioni manubri inclinata", sets: 3, reps: "10", restSec: 90 },
            { id: "ex3", name: "Croci ai cavi", sets: 3, reps: "12", restSec: 60 },
            { id: "ex4", name: "Pushdown cavo", sets: 3, reps: "12", restSec: 60, notes: "Controllo lento" },
        ],
    },
    {
        id: "wed",
        weekday: "wed",
        title: "Mercoledì — Schiena / Bicipiti",
        exercises: [
            { id: "ex5", name: "Lat machine", sets: 4, reps: "10", restSec: 90 },
            { id: "ex6", name: "Rematore manubrio", sets: 3, reps: "10", restSec: 90 },
            { id: "ex7", name: "Curl manubri", sets: 3, reps: "10-12", restSec: 60 },
        ],
    },
    {
        id: "fri",
        weekday: "fri",
        title: "Venerdì — Gambe / Spalle",
        exercises: [
            { id: "ex8", name: "Leg press", sets: 4, reps: "12", restSec: 120 },
            { id: "ex9", name: "Alzate laterali", sets: 4, reps: "12-15", restSec: 60 },
        ],
    },
];

export function getDayById(id: string) {
    return MOCK_DAYS.find((d) => d.id === id) ?? null;
}