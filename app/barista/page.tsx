import type { Metadata } from "next";
import { BaristaBoard } from "@/components/staff/BaristaBoard";

export const metadata: Metadata = { title: "Papan Pesanan" };

export default function BaristaPage() {
  return <BaristaBoard />;
}
