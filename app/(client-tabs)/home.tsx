import { router } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { useAuth } from "../src/auth/authContext";
import { RequireAuth } from "../src/auth/requireAuth";
import { usePtStore } from "../src/pt/PtStore";
import { debugListMyExercises } from "../src/supabase/db";
import { AppHeader } from "../src/ui/appHeader";
import { Card } from "../src/ui/card";
import { RowLink } from "../src/ui/rowLink";
import { Screen } from "../src/ui/screen";

export default function ClientHomeTab() {
    const { user, logout } = useAuth();
    const { getClientById, isHydrating } = usePtStore();

    const client = user ? getClientById(user.id) : null;

    if (isHydrating) return null;
    React.useEffect(() => {
        debugListMyExercises();
    }, []);
    return (
        <RequireAuth role="client">
            <Screen>
                <AppHeader title={`Ciao ${user?.name ?? ""}`} subtitle="Home" />

                <Card>
                    <Text style={{ fontWeight: "800", fontSize: 16, color: "#ffffffff" }}>La tua scheda</Text>
                    <Text style={{ color: "#ffffffff", marginTop: 6 }}>
                        {client ? `${client.planDays.length} giorni disponibili` : "Nessuna scheda trovata"}
                    </Text>
                </Card>

                {/* Accesso rapido alla scheda (primo giorno) */}
                {client?.planDays?.[0] ? (
                    <RowLink
                        title="Apri scheda"
                        subtitle="Vai ai giorni di allenamento"
                        onPress={() => router.push("/exercises")}
                    />
                ) : null}
            </Screen>
        </RequireAuth>
    );
}





