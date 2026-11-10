import { Suspense } from "react";
import { AddDoctorPatientScreen } from "@/components/patients/patient-record-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Add patient" };

export default async function AddDoctorPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <AddDoctorPatientScreen doctorId={id} />
    </Suspense>
  );
}
