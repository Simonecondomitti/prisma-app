import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://wcfysdhkusaddmyafhxj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d97B34OKjDNqp6LnTb1eRw_dzKlPshm";

// Expo Web can run some code in a Node/SSR-like context where `window` does not exist.
const isBrowser = typeof window !== "undefined";

// Web storage (browser) -> localStorage, wrapped as async.
const webStorage = {
  getItem: async (key: string) => (isBrowser ? window.localStorage.getItem(key) : null),
  setItem: async (key: string, value: string) => {
    if (isBrowser) window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isBrowser) window.localStorage.removeItem(key);
  },
};

// In-memory storage (SSR/Node) -> avoids touching `window`.
const mem = new Map<string, string>();
const memoryStorage = {
  getItem: async (key: string) => mem.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    mem.set(key, value);
  },
  removeItem: async (key: string) => {
    mem.delete(key);
  },
};

// Avoid importing AsyncStorage at module top-level on Web.
const nativeStorage =
  Platform.OS === "web"
    ? null
    : // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@react-native-async-storage/async-storage").default;

const storage = Platform.OS === "web" ? (isBrowser ? webStorage : memoryStorage) : nativeStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // In Expo Web we usually don't want the OAuth URL session parsing.
    detectSessionInUrl: false,
  },
});