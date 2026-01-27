import { Redirect } from "expo-router";
import { ReactNode } from "react";
import { useAuth } from "./authContext";

type Props = {
  children: ReactNode;
  role?: "client" | "pt";
};

export function RequireAuth({ children, role }: Props) {
  const { user } = useAuth();

  // non loggato → login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // ruolo sbagliato → login
  if (role && user.role !== role) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}