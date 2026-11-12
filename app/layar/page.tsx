import type { Metadata } from "next";
import { PickupDisplay } from "@/components/staff/PickupDisplay";

export const metadata: Metadata = { title: "Layar Antrean" };

export default function PickupDisplayPage() {
  return <PickupDisplay />;
}
