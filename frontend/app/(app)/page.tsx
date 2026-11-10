import { Suspense } from "react";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <DashboardScreen />
    </Suspense>
  );
}
