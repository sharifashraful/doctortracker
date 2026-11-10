import { Suspense } from "react";
import { DoctorsScreen } from "@/components/doctors/doctors-screen";
import { PageLoader } from "@/components/ui";

export const metadata = { title: "Doctors" };

export default function DoctorsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DoctorsScreen />
    </Suspense>
  );
}
