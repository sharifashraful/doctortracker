import { Suspense } from "react";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardScreen />
    </Suspense>
  );
}
