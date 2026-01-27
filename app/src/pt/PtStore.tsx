import React, { createContext, useContext, useMemo, useState } from "react";
import { Client, MOCK_CLIENTS } from "../mock/clients";
import { WorkoutExercise } from "../mock/workout";

type PtStoreValue = {
  clients: Client[];
  getClientById: (id: string) => Client | null;

  updateExercise: (
    clientId: string,
    dayId: string,
    exerciseId: string,
    patch: Partial<WorkoutExercise>
  ) => void;

  addExercise: (clientId: string, dayId: string, exercise: WorkoutExercise) => void;
};

const PtStoreContext = createContext<PtStoreValue | undefined>(undefined);

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function PtStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(deepClone(MOCK_CLIENTS));

  const getClientById = (id: string) => clients.find((c) => c.id === id) ?? null;

  const updateExercise: PtStoreValue["updateExercise"] = (clientId, dayId, exerciseId, patch) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          planDays: c.planDays.map((d) => {
            if (d.id !== dayId) return d;
            return {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exerciseId ? { ...e, ...patch } : e
              ),
            };
          }),
        };
      })
    );
  };

  const addExercise: PtStoreValue["addExercise"] = (clientId, dayId, exercise) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          planDays: c.planDays.map((d) => {
            if (d.id !== dayId) return d;
            return { ...d, exercises: [exercise, ...d.exercises] };
          }),
        };
      })
    );
  };

  const value = useMemo(
    () => ({ clients, getClientById, updateExercise, addExercise }),
    [clients]
  );

  return <PtStoreContext.Provider value={value}>{children}</PtStoreContext.Provider>;
}

export function usePtStore() {
  const ctx = useContext(PtStoreContext);
  if (!ctx) throw new Error("usePtStore must be used within PtStoreProvider");
  return ctx;
}