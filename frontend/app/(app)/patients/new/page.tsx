import { Suspense } from "react";
import { AddPatientScreen } from "@/components/patients/patient-record-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Add patient" };

export default function AddPatientPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <AddPatientScreen />
    </Suspense>
  );
}
