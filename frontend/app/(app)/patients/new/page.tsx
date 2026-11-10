import { Suspense } from "react";
import { AddPatientScreen } from "@/components/patients/patient-record-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Add patient" };

export default function AddPatientPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AddPatientScreen />
    </Suspense>
  );
}
