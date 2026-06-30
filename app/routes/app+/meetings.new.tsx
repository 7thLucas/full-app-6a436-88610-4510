import { useNavigate } from "react-router";
import { MeetingUploadModal } from "~/modules/meetings/components/meeting-upload-modal";
import type { Meeting } from "~/modules/meetings/hooks/use-meetings";

export default function NewMeetingPage() {
  const navigate = useNavigate();

  function handleCreated(meeting: Meeting) {
    navigate(`/app/meetings/${meeting._id}`);
  }

  return (
    <MeetingUploadModal
      open={true}
      onClose={() => navigate("/app/meetings")}
      onCreated={handleCreated}
    />
  );
}
