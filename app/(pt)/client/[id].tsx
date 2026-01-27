import { router, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

import { usePtStore } from "@/app/src/pt/PtStore";
import { RequireAuth } from "../../src/auth/requireAuth";
import { AppHeader } from "../../src/ui/appHeader";
import { Card } from "../../src/ui/card";
import { RowLink } from "../../src/ui/rowLink";
import { Screen } from "../../src/ui/screen";

export default function PtClientDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getClientById, addDay, removeDay, isHydrating } = usePtStore();
    if (isHydrating) return null;
    const client = getClientById(String(id));
    return (
        <RequireAuth role="pt">
            <Screen>
                <AppHeader title={client ? client.name : "Cliente non trovato"} showBack />

                {!client ? (
                    <Text style={{ color: "#444" }}>ID: {String(id)}</Text>
                ) : (
                    <>
                        <Card>
                            <Text style={{ fontWeight: "800", color: "#111" }}>Stato</Text>
                            <Text style={{ color: "#444" }}>
                                {client.status === "active" ? "Attivo" : "In pausa"}
                            </Text>
                            {client.notes ? <Text style={{ color: "#444" }}>Note: {client.notes}</Text> : null}
                        </Card>

                        <AppHeader title="Scheda" subtitle="Seleziona un giorno" />
                        <RowLink
                            title="+ Aggiungi giorno"
                            subtitle="Seleziona giorno della settimana"
                            onPress={() => router.push(`/(pt)/client/${client.id}/add-day`)}
                        />
                        {client.planDays.map((day) => (
                            <RowLink
                                key={day.id}
                                title={day.title}
                                subtitle={`${day.exercises.length} esercizi`}
                                onPress={() =>
                                    router.push({
                                        pathname: "./[clientId]/day/[dayId]",
                                        params: { clientId: client.id, dayId: day.id },
                                    })
                                }
                            />
                        ))}
                    </>
                )}
            </Screen>
        </RequireAuth>
    );
}