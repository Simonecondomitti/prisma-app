import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Client, MOCK_CLIENTS } from "../mock/clients";
import { WeekdayKey, WorkoutDay, WorkoutExercise } from "../mock/workout";

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

  addDay: (clientId: string, weekdayKey: WeekdayKey, weekdayLabel: string) => string;
  removeDay: (clientId: string, dayId: string) => void;

  updateDayTitle: (clientId: string, dayId: string, title: string) => void;

  isHydrating: boolean;
  resetStore: () => Promise<void>;
};

const STORE_VERSION = 1;
const STORAGE_KEY = "palestra_app_ptstore_clients_v1";
const PtStoreContext = createContext<PtStoreValue | undefined>(undefined);

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

type PersistedStore = {
  version: number;
  clients: Client[];
};

const WEEKDAYS: { key: WeekdayKey; label: string }[] = [
  { key: "mon", label: "Lunedì" },
  { key: "tue", label: "Martedì" },
  { key: "wed", label: "Mercoledì" },
  { key: "thu", label: "Giovedì" },
  { key: "fri", label: "Venerdì" },
  { key: "sat", label: "Sabato" },
  { key: "sun", label: "Domenica" },
];

function inferWeekdayFromIdOrTitle(day: Partial<WorkoutDay>): WeekdayKey | undefined {
  const id = String(day.id ?? "");
  const idPrefix = id.split("_")[0]; // "mon_123" -> "mon"
  if (["mon", "tue", "wed", "thu", "fri", "sat", "sun"].includes(idPrefix)) {
    return idPrefix as WeekdayKey;
  }

  const title = (day.title ?? "").toLowerCase();
  if (title.startsWith("luned")) return "mon";
  if (title.startsWith("marted")) return "tue";
  if (title.startsWith("mercoled")) return "wed";
  if (title.startsWith("gioved")) return "thu";
  if (title.startsWith("venerd")) return "fri";
  if (title.startsWith("sabat")) return "sat";
  if (title.startsWith("domenic")) return "sun";
  return undefined;
}

function normalizeClientDays(client: Client): Client {
  return {
    ...client,
    planDays: (client.planDays ?? []).map((d) => {
      if (d.weekday) return d;
      return { ...d, weekday: inferWeekdayFromIdOrTitle(d) };
    }),
  };
}

function migrate(payload: any): PersistedStore {
  // legacy: salvato direttamente Client[]
  if (Array.isArray(payload)) {
    const clients = payload.map(normalizeClientDays);
    return { version: 1, clients };
  }

  const version = payload?.version ?? 1;
  let clients: Client[] = payload?.clients ?? [];
  clients = clients.map(normalizeClientDays);

  return { version, clients };
}

export function PtStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const migrated = migrate(parsed);
          setClients(migrated.clients);
        } else {
          // mock iniziali normalizzati
          setClients(deepClone(MOCK_CLIENTS).map(normalizeClientDays));
        }
      } catch {
        setClients(deepClone(MOCK_CLIENTS).map(normalizeClientDays));
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isHydrating) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORE_VERSION, clients }));
  }, [clients, isHydrating]);

  const resetStore = async () => {
    setClients(deepClone(MOCK_CLIENTS).map(normalizeClientDays));
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
              exercises: d.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)),
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

  const removeExercise: PtStoreValue["removeExercise"] = (clientId, dayId, exerciseId) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          planDays: c.planDays.map((d) => {
            if (d.id !== dayId) return d;
            return { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) };
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

        // evita duplicati dello stesso weekday (opzionale)
        const alreadyExists = c.planDays.some((d) => d.weekday === weekdayKey);
        if (alreadyExists) return c;

        const newDay: WorkoutDay = {
          id: newDayId,
          weekday: weekdayKey,
          title: weekdayLabel,
          exercises: [],
        };

        return { ...c, planDays: [...c.planDays, newDay] };
      })
    );

    return newDayId;
  };

  const removeDay: PtStoreValue["removeDay"] = (clientId, dayId) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, planDays: c.planDays.filter((d) => d.id !== dayId) };
      })
    );
  };

  const updateDayTitle: PtStoreValue["updateDayTitle"] = (clientId, dayId, title) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, planDays: c.planDays.map((d) => (d.id === dayId ? { ...d, title } : d)) };
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