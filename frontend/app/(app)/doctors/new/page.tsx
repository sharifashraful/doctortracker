import { Suspense } from "react";
import { AddDoctorScreen } from "@/components/doctors/add-doctor-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Add doctor" };

export default function AddDoctorPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AddDoctorScreen />
    </Suspense>
  );
}
