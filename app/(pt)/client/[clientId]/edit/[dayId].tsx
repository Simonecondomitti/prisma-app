import { RequireAuth } from "@/app/src/auth/requireAuth";
import { usePtStore } from "@/app/src/pt/PtStore";
import { AppHeader } from "@/app/src/ui/appHeader";
import { Card } from "@/app/src/ui/card";
import { Screen } from "@/app/src/ui/screen";
import { theme } from "@/app/src/ui/theme";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, TextInput } from "react-native";

function numOr(value: string, fallback: number) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export default function PtEditDay() {
    const { clientId, dayId } = useLocalSearchParams<{ clientId: string; dayId: string }>();
    const { getClientById, updateExercise, addExercise, removeExercise, updateDayTitle } = usePtStore();

    const client = getClientById(String(clientId));
    const day = client?.planDays.find((d) => d.id === String(dayId)) ?? null;

    return (
        <RequireAuth role="pt">
            <Screen>
                <AppHeader title={day ? `Modifica: ${day.title}` : "Editor"} showBack subtitle={client?.name} />

                {!client || !day ? (
                    <Text style={{ color: theme.colors.subtext }}>Cliente o giorno non trovato.</Text>
                ) : (
                    <>
                        <Card>
                            <Text style={{ fontWeight: "900", color: theme.colors.text }}>Aggiungi esercizio</Text>

                            <Pressable
                                onPress={() =>
                                    router.push({
                                        pathname: "/(pt)/client/[clientId]/edit/[dayId]/add-exercise",
                                        params: { clientId: client.id, dayId: day.id },
                                    })
                                }
                                style={{
                                    marginTop: 10,
                                    backgroundColor: theme.colors.text,
                                    padding: 12,
                                    borderRadius: 12,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "800" }}>+ Aggiungi</Text>
                            </Pressable>
                        </Card>

                        {day.exercises.map((ex) => (
                            <Card key={ex.id}>
                                <Text style={{ fontWeight: "900", color: theme.colors.text }}>{ex.name}</Text>

                                <Text style={{ marginTop: 10, color: theme.colors.subtext }}>Nome</Text>
                                <TextInput
                                    defaultValue={ex.name}
                                    onEndEditing={(e) =>
                                        updateExercise(client.id, day.id, ex.id, { name: e.nativeEvent.text })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: theme.colors.border,
                                        borderRadius: 12,
                                        padding: 12,
                                        marginTop: 6,
                                    }}
                                />

                                <Text style={{ marginTop: 10, color: theme.colors.subtext }}>Serie</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    defaultValue={String(ex.sets)}
                                    onEndEditing={(e) =>
                                        updateExercise(client.id, day.id, ex.id, { sets: numOr(e.nativeEvent.text, ex.sets) })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: theme.colors.border,
                                        borderRadius: 12,
                                        padding: 12,
                                        marginTop: 6,
                                    }}
                                />

                                <Text style={{ marginTop: 10, color: theme.colors.subtext }}>Ripetizioni</Text>
                                <TextInput
                                    defaultValue={ex.reps}
                                    onEndEditing={(e) => updateExercise(client.id, day.id, ex.id, { reps: e.nativeEvent.text })}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: theme.colors.border,
                                        borderRadius: 12,
                                        padding: 12,
                                        marginTop: 6,
                                    }}
                                />

                                <Text style={{ marginTop: 10, color: theme.colors.subtext }}>Recupero (sec)</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    defaultValue={String(ex.restSec)}
                                    onEndEditing={(e) =>
                                        updateExercise(client.id, day.id, ex.id, { restSec: numOr(e.nativeEvent.text, ex.restSec) })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: theme.colors.border,
                                        borderRadius: 12,
                                        padding: 12,
                                        marginTop: 6,
                                    }}
                                />

                                <Text style={{ marginTop: 10, color: theme.colors.subtext }}>Note</Text>
                                <TextInput
                                    defaultValue={ex.notes ?? ""}
                                    onEndEditing={(e) => updateExercise(client.id, day.id, ex.id, { notes: e.nativeEvent.text })}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: theme.colors.border,
                                        borderRadius: 12,
                                        padding: 12,
                                        marginTop: 6,
                                    }}
                                    placeholder="Note facoltative"
                                />
                                <Pressable
                                    onPress={() =>
                                        Alert.alert(
                                            "Rimuovere esercizio?",
                                            ex.name,
                                            [
                                                { text: "Annulla", style: "cancel" },
                                                {
                                                    text: "Rimuovi",
                                                    style: "destructive",
                                                    onPress: () => removeExercise(client.id, day.id, ex.id),
                                                },
                                            ]
                                        )
                                    }
                                    style={{ marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee" }}
                                >
                                    <Text style={{ color: "#111", fontWeight: "800" }}>🗑️ Rimuovi esercizio</Text>
                                </Pressable>
                            </Card>
                        ))}

                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                backgroundColor: theme.colors.text,
                                padding: 14,
                                borderRadius: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "800" }}>Fine</Text>
                        </Pressable>
                    </>
                )}
            </Screen>
        </RequireAuth>
    );
}