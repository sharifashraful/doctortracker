import { Suspense } from "react";
import { PatientsScreen } from "@/components/patients/patients-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <PatientsScreen />
    </Suspense>
  );
}
