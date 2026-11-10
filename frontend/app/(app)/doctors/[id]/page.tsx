import { Suspense } from "react";
import { DoctorDetail } from "@/components/doctors/doctor-detail";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Doctor" };

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader />}>
      <DoctorDetail id={id} />
    </Suspense>
  );
}
