import { Suspense } from "react";
import { EditDoctorPatientScreen } from "@/components/patients/patient-record-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Edit patient" };

export default async function EditDoctorPatientPage({ params }: { params: Promise<{ id: string; patientId: string }> }) {
  const { id, patientId } = await params;
  return (
    <Suspense fallback={<PageLoader />}>
      <EditDoctorPatientScreen doctorId={id} patientId={patientId} />
    </Suspense>
  );
}
