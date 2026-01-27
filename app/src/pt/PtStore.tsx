import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  removeExercise: (clientId: string, dayId: string, exerciseId: string) => void;
  addDay: (clientId: string, weekdayKey: string, weekdayLabel: string) => string; removeDay: (clientId: string, dayId: string) => void;
  updateDayTitle: (clientId: string, dayId: string, title: string) => void;
  isHydrating: boolean;
  resetStore: () => Promise<void>;
};
const STORAGE_KEY = "palestra_app_ptstore_clients_v1";
const PtStoreContext = createContext<PtStoreValue | undefined>(undefined);

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function PtStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Client[] = JSON.parse(raw);
          setClients(parsed);
        } else {
          setClients(deepClone(MOCK_CLIENTS));
        }
      } catch {
        // se storage corrotto, riparti dai mock
        setClients(deepClone(MOCK_CLIENTS));
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isHydrating) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients, isHydrating]);

  const resetStore = async () => {
    setClients(deepClone(MOCK_CLIENTS));
    await AsyncStorage.removeItem(STORAGE_KEY);
  };
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

  const removeExercise = (clientId: string, dayId: string, exerciseId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          planDays: c.planDays.map((d) => {
            if (d.id !== dayId) return d;
            return {
              ...d,
              exercises: d.exercises.filter((e) => e.id !== exerciseId),
            };
          }),
        };
      })
    );
  };

  const addDay: PtStoreValue["addDay"] = (clientId, weekdayKey, weekdayLabel) => {
    const newDayId = `${weekdayKey}_${Date.now()}`;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;

        // opzionale: evita duplicati dello stesso giorno della settimana
        const alreadyExists = c.planDays.some((d) => d.id.startsWith(`${weekdayKey}_`));
        if (alreadyExists) return c;

        return {
          ...c,
          planDays: [
            ...c.planDays,
            {
              id: newDayId,
              title: `${weekdayLabel}`,
              exercises: [],
            },
          ],
        };
      })
    );

    return newDayId;
  };

  const removeDay = (clientId: string, dayId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          planDays: c.planDays.filter((d) => d.id !== dayId),
        };
      })
    );
  };

  const updateDayTitle = (clientId: string, dayId: string, title: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          planDays: c.planDays.map((d) => (d.id === dayId ? { ...d, title } : d)),
        };
      })
    );
  };

  const value = useMemo(
  () => ({
    clients,
    isHydrating,
    resetStore,
    getClientById,
    updateExercise,
    addExercise,
    removeExercise,
    addDay,
    removeDay,
    updateDayTitle,
  }),
  [clients, isHydrating]
);

  return <PtStoreContext.Provider value={value}>{children}</PtStoreContext.Provider>;
}

export function usePtStore() {
  const ctx = useContext(PtStoreContext);
  if (!ctx) throw new Error("usePtStore must be used within PtStoreProvider");
  return ctx;
}