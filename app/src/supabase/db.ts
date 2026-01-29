import { supabase } from "./client";

export type DbClient = {
  id: string;
  pt_id: string;
  client_user_id: string | null;
  name: string;
  created_at: string;
};

export type DbDay = {
  id: string;
  client_id: string;
  title: string;
  weekday_key: string | null;
  position: number;
  created_at: string;
};

export async function listMyClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbClient[];
}

export async function createClient(name: string) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("clients")
    .insert({ pt_id: userId, name })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbClient;
}

export async function getClientById(clientId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error) throw error;
  return data as DbClient;
}

export async function listDaysByClient(clientId: string) {
  const { data, error } = await supabase
    .from("workout_days")
    .select("*")
    .eq("client_id", clientId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbDay[];
}