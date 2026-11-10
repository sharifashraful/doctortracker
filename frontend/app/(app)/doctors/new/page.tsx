import { Suspense } from "react";
import { AddDoctorScreen } from "@/components/doctors/add-doctor-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Add doctor" };

export default function AddDoctorPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <AddDoctorScreen />
    </Suspense>
  );
}
