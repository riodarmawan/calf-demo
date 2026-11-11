import type { Metadata } from "next";
import { TableTents } from "@/components/staff/TableTents";

export const metadata: Metadata = { title: "QR Meja" };

export default function QrPage() {
  return <TableTents />;
}
