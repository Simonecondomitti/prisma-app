import { router } from "expo-router";

import { useAuth } from "../src/auth/authContext";
import { RequireAuth } from "../src/auth/requireAuth";

import { usePtStore } from "../src/pt/PtStore";
import { AppHeader } from "../src/ui/appHeader";
import { RowLink } from "../src/ui/rowLink";
import { Screen } from "../src/ui/screen";

export default function PtHome() {
  const { user, logout } = useAuth();
  const { clients } = usePtStore();

  return (
    <RequireAuth role="pt">
      <Screen>
        <AppHeader title="Clienti" subtitle={`Ciao ${user?.name}.`} />

        {clients.map((c) => (
          <RowLink
            key={c.id}
            title={c.name}
            subtitle={c.notes ?? ""}
            right={c.status === "active" ? "Attivo" : "In pausa"}
            onPress={() => router.push(`/(pt)/client/${c.id}`)}
          />
        ))}

        <RowLink
          title="Logout"
          subtitle="Esci dall’area PT"
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
        />
      </Screen>
    </RequireAuth>
  );
}