import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

import { useAuth } from "../../src/auth/authContext";
import { RequireAuth } from "../../src/auth/requireAuth";
import { supabase } from "../../src/supabase/client";
import { AppHeader } from "../../src/ui/appHeader";
import { RowLink } from "../../src/ui/rowLink";
import { Screen } from "../../src/ui/screen";
import { theme } from "../../src/ui/theme";

type DbClientRow = {
  id: string;
  pt_id: string;
  client_user_id: string | null;
  name: string;
  created_at: string;
};

export default function StudentsIndex() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = React.useState(true);
  const [clients, setClients] = React.useState<DbClientRow[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        const { data: auth } = await supabase.auth.getUser();
        const ptId = auth.user?.id;
        if (!ptId) {
          if (!alive) return;
          setClients([]);
          setErrorMsg("Non autenticato");
          return;
        }

        const { data, error } = await supabase
          .from("clients")
          .select("id,pt_id,client_user_id,name,created_at")
          .eq("pt_id", ptId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!alive) return;

        setClients((data ?? []) as DbClientRow[]);
      } catch (e: any) {
        if (!alive) return;
        setClients([]);
        setErrorMsg(e?.message ?? "Errore nel caricamento");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title="I tuoi allievi" subtitle={`Ciao ${user?.name}.`} />

        {isLoading ? (
          <Text style={{ color: theme.colors.subtext, paddingHorizontal: 16, marginTop: 8 }}>
            Caricamento...
          </Text>
        ) : errorMsg ? (
          <Text style={{ color: "#ff5a5a", paddingHorizontal: 16, marginTop: 8 }}>
            {errorMsg}
          </Text>
        ) : clients.length === 0 ? (
          <Text style={{ color: theme.colors.subtext, paddingHorizontal: 16, marginTop: 8 }}>
            Nessun allievo trovato.
          </Text>
        ) : (
          <View style={{ gap: 6 }}>
            {clients.map((c) => (
              <RowLink
                key={c.id}
                title={c.name}
                subtitle={c.client_user_id ? "Account collegato" : "Da collegare"}
                right={""}
                onPress={() =>
                  router.push({
                    pathname: "/(pt-tabs)/students/[clientId]",
                    params: { clientId: String(c.id) },
                  })
                }
              />
            ))}
          </View>
        )}
      </Screen>
    </RequireAuth>
  );
}