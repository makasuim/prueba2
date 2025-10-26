import { Suspense } from "react";
import InventarioClient from "./InventarioClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando inventario…</div>}>
      <InventarioClient />
    </Suspense>
  );
}
