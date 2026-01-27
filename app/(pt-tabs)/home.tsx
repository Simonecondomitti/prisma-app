import { Text } from "react-native";
import { useAuth } from "../src/auth/authContext";
import { RequireAuth } from "../src/auth/requireAuth";
import { AppHeader } from "../src/ui/appHeader";
import { Card } from "../src/ui/card";
import { Screen } from "../src/ui/screen";

export default function PtHomeTab() {
    const { user, logout } = useAuth();

    return (
        <RequireAuth role="pt">
            <Screen>
                <AppHeader title={`Ciao ${user?.name ?? ""}`} subtitle="Home PT" />

                <Card>
                    <Text style={{ color: "#ffffffff" }}>
                        Qui metteremo in seguito dashboard, appuntamenti, riepilogo schede, ecc.
                    </Text>
                </Card>

            </Screen>
        </RequireAuth>
    );
}