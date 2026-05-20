import { Button, Stack, Typography } from "@mui/material";

interface AcceptInviteFormProps {
  token: string;
  loading?: boolean;
  onAccept: () => Promise<void>;
}

export const AcceptInviteForm = ({ token, loading, onAccept }: AcceptInviteFormProps) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Принятие приглашения</Typography>
      <Typography color="text.secondary">Токен: {token}</Typography>
      <Button variant="contained" onClick={onAccept} disabled={loading}>
        Принять приглашение
      </Button>
    </Stack>
  );
};
