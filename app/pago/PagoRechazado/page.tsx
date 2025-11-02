"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button } from "react-bootstrap";
import Link from "next/link";

export default function PagoRechazado() {
  const params = useSearchParams();
  const router = useRouter();
  const total = params.get("total") || "0";
  const items = params.get("items") || "0";
  const reason = params.get("reason") || "No especificado";

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <Card className="shadow-lg text-center">
            <div className="card-header bg-danger text-white py-3">
              <h3 className="h4 m-0">
                <i className="fas fa-times-circle me-2"></i>Pago rechazado
              </h3>
            </div>
            <Card.Body className="p-4">
              <div className="display-6 mb-2" style={{ color: "#6a0dad" }}>
                ${Number(total).toLocaleString("es-CL")}
              </div>
              <div className="text-muted mb-3">Artículos: {items}</div>
              <div className="badge bg-light text-dark mb-4">
                Motivo: {reason}
              </div>
              <div className="d-grid gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push("/pago")}
                >
                  Intentar nuevamente
                </Button>
                <Link href="/inventario" legacyBehavior>
                  <Button variant="outline-primary" size="lg">
                    Seguir comprando
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </main>
  );
}
