import { Suspense } from "react";
import { DoctorsScreen } from "@/components/doctors/doctors-screen";
import { Skeleton } from "@/components/ui";

export const metadata = { title: "Doctors" };

export default function DoctorsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <DoctorsScreen />
    </Suspense>
  );
}
