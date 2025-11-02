import { Suspense } from "react";
import CompraExitosaClient from "./CompraExitosaClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompraExitosaClient />
    </Suspense>
  );
}
