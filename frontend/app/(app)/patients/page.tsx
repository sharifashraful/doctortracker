import { Suspense } from "react";
import { PatientsScreen } from "@/components/patients/patients-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PatientsScreen />
    </Suspense>
  );
}
