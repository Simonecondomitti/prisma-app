import { router } from "expo-router";
import { useAuth } from "../src/auth/authContext";
import { RequireAuth } from "../src/auth/requireAuth";
import { usePtStore } from "../src/pt/PtStore";
import { AppHeader } from "../src/ui/appHeader";
import { RowLink } from "../src/ui/rowLink";
import { Screen } from "../src/ui/screen";

export default function ClientExercisesTab() {
    const { user } = useAuth();
    const { getClientById } = usePtStore();

    const client = user ? getClientById(user.id) : null;
    const days = client?.planDays ?? [];
    return (
        <RequireAuth role="client">
            <Screen>
                <AppHeader
                    title="La tua scheda"
                    subtitle={`Ciao ${user?.name}. Seleziona un giorno.`}
                />

                {days.map((day) => (
                    <RowLink
                        key={day.id}
                        title={day.title}
                        subtitle={`${day.exercises.length} esercizi`}
                        right={`${day.exercises.length}`}
                        onPress={() => router.push(`/(client)/day/${day.id}`)}
                    />
                ))}
            </Screen>
        </RequireAuth>
    );
}