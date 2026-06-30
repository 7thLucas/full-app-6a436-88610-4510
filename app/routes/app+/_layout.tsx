import { Outlet } from "react-router";
import { AppLayout } from "~/modules/meetings/components/app-layout";

export default function AppLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
