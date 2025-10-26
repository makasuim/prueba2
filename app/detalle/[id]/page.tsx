import { Suspense } from "react";
import DetalleClient from "./DetalleClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando producto…</div>}>
      <DetalleClient />
    </Suspense>
  );
}
