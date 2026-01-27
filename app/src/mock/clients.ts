import { MOCK_DAYS, WorkoutDay } from "./workout";

export type Client = {
  id: string;
  name: string;
  status: "active" | "paused";
  notes?: string;
  planDays: WorkoutDay[];
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Simone Cliente",
    status: "active",
    notes: "Obiettivo: massa • 4x/settimana",
    planDays: MOCK_DAYS,
  },
  {
    id: "c2",
    name: "Luigi Bianchi",
    status: "active",
    notes: "Dimagrimento • Pesi + cardio",
    planDays: MOCK_DAYS.slice(0, 2),
  },
  {
    id: "c3",
    name: "Giulia Verdi",
    status: "paused",
    notes: "Pausa per spalla",
    planDays: MOCK_DAYS.slice(0, 1),
  },
];

export function getClientById(id: string) {
  return MOCK_CLIENTS.find((c) => c.id === id) ?? null;
}