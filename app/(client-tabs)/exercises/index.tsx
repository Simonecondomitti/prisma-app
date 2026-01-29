import { useAuth } from "@/app/src/auth/authContext";
import { RequireAuth } from "@/app/src/auth/requireAuth";
import { usePtStore } from "@/app/src/pt/PtStore";
import { AppHeader } from "@/app/src/ui/appHeader";
import { RowLink } from "@/app/src/ui/rowLink";
import { Screen } from "@/app/src/ui/screen";
import { router } from "expo-router";


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