import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TABLES } from "@/lib/menu";
import { CustomerApp } from "@/components/customer/CustomerApp";

export async function generateStaticParams() {
  return TABLES.map((table) => ({ table }));
}

export async function generateMetadata({ params }: PageProps<"/meja/[table]">): Promise<Metadata> {
  const { table } = await params;
  return { title: `Meja ${table}` };
}

async function Table({ params }: Pick<PageProps<"/meja/[table]">, "params">) {
  const { table } = await params;
  if (!TABLES.includes(table)) notFound();
  return <CustomerApp table={table} />;
}

export default function TablePage({ params }: PageProps<"/meja/[table]">) {
  // ponytail: fallback kosong, ganti skeleton kalau shell kosong terasa mengganggu
  return (
    <Suspense fallback={null}>
      <Table params={params} />
    </Suspense>
  );
}
