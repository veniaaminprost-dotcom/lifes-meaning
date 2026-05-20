import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Alert, Container, Stack, Typography } from "@mui/material";
import { Toaster } from "sonner";
import { router } from "@/app/providers/router";
import { supabase } from "@/app/providers/supabase";
import { setRole, setSession, signOutState } from "@/entities/auth/model/sessionSlice";
import { getMyProfile } from "@/entities/profile/api/profileApi";
import { env } from "@/shared/config/env";
import { useAppDispatch } from "@/shared/lib/hooks";

export const App = () => {
  const dispatch = useAppDispatch();
  const hasSupabaseEnv = Boolean(env.supabaseUrl && env.supabaseAnonKey);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      dispatch(setSession(data.session));

      if (data.session) {
        try {
          const profile = await getMyProfile();
          dispatch(setRole(profile?.role ?? "student"));
        } catch {
          dispatch(setRole("student"));
        }
      }
    };

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (!session) {
        dispatch(signOutState());
        return;
      }

      dispatch(setSession(session));
      setTimeout(async () => {
        if (!mounted) {
          return;
        }

        try {
          const profile = await getMyProfile();
          dispatch(setRole(profile?.role ?? "student"));
        } catch {
          dispatch(setRole("student"));
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  if (!hasSupabaseEnv) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={2}>
          <Typography variant="h3">Нужно заполнить `.env`</Typography>
          <Alert severity="warning">
            Укажи `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`, затем перезапусти `npm run dev`.
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
};
