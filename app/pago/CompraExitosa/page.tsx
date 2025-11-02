"use client";

import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Page() {
  const search = useSearchParams();
  const total = Number(search.get("total") || 0);
  const items = Number(search.get("items") || 0);

  const totalCLP = total.toLocaleString("es-CL");

  return (
    <main className="container my-5">
      <Container className="d-flex justify-content-center">
        <Card
          className="shadow-lg text-center p-4"
          style={{ maxWidth: 560, width: "100%" }}
        >
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 86,
              height: 86,
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            <i className="fas fa-check fa-2x" />
          </div>
          <h2 className="text-primary fw-bold mb-2">¡Compra exitosa!</h2>
          <p className="text-muted mb-4">
            Tu pago fue procesado correctamente.
          </p>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="d-flex justify-content-between">
              <span>Total pagado</span>
              <span className="fw-bold" style={{ color: "#007f4e" }}>
                ${totalCLP}
              </span>
            </Card.Body>
            <Card.Body className="d-flex justify-content-between pt-0">
              <span>Productos</span>
              <span className="fw-bold">{items}</span>
            </Card.Body>
          </Card>

          <div className="d-grid gap-3">
            <Link href="/inventario" className="btn btn-primary">
              Seguir comprando
            </Link>
            <Link href="/" className="btn btn-outline-primary">
              Volver al inicio
            </Link>
          </div>
        </Card>
      </Container>
    </main>
  );
}
