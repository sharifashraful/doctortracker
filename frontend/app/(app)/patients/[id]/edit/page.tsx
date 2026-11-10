import { Suspense } from "react";
import { EditPatientScreen } from "@/components/patients/patient-record-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Edit patient" };

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader />}>
      <EditPatientScreen patientId={id} />
    </Suspense>
  );
}
