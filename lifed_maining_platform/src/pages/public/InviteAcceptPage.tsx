import { Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AcceptInviteForm } from "@/features/accept-invite/ui/AcceptInviteForm";
import { useAcceptInvitationMutation } from "@/shared/api/baseApi";
import { PageShell } from "@/shared/ui/PageShell";

export const InviteAcceptPage = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [acceptInvitation, { isLoading }] = useAcceptInvitationMutation();

  const onAccept = async () => {
    if (!token) {
      toast.error("Токен приглашения отсутствует");
      return;
    }

    try {
      await acceptInvitation(token).unwrap();
      toast.success("Приглашение принято");
      navigate("/student", { replace: true });
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Не удалось принять приглашение";
      toast.error(message);
    }
  };

  return (
    <PageShell maxWidth="sm">
      <Stack spacing={2}>
        <AcceptInviteForm token={token} loading={isLoading} onAccept={onAccept} />
      </Stack>
    </PageShell>
  );
};
