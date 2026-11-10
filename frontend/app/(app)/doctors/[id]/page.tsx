import { Suspense } from "react";
import { DoctorDetail } from "@/components/doctors/doctor-detail";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Doctor" };

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <DoctorDetail id={id} />
    </Suspense>
  );
}
