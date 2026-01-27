export type CatalogExercise = {
  id: string;
  name: string;
  muscles?: string[];
  description?: string;
};

export const EXERCISE_CATALOG: CatalogExercise[] = [
  { id: "cat1", name: "Panca piana", muscles: ["Petto", "Tricipiti"], description: "Scapole addotte, controllo in discesa." },
  { id: "cat2", name: "Lat machine", muscles: ["Dorsali", "Bicipiti"], description: "Tira al petto, gomiti verso il basso." },
  { id: "cat3", name: "Squat guidato / multipower", muscles: ["Gambe"], description: "Schiena neutra, spinta dai talloni." },
  { id: "cat4", name: "Alzate laterali", muscles: ["Spalle"], description: "Gomiti morbidi, salita controllata." },
  { id: "cat5", name: "Curl manubri", muscles: ["Bicipiti"], description: "Non dondolare, range completo." },
];