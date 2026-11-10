import { Suspense } from "react";
import { EditDoctorScreen } from "@/components/doctors/edit-doctor-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Edit doctor" };

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <EditDoctorScreen id={id} />
    </Suspense>
  );
}
