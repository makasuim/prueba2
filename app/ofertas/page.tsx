"use client";

import React, { useMemo } from "react";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { todosLosProductos } from "../Data";
import { getOfertaFor } from "../Data";

const OfertasPage: React.FC = () => {
  const router = useRouter();

  const productosConOferta = useMemo(() => {
    const all = [
      ...todosLosProductos.juguetes,
      ...todosLosProductos.accesorios,
      ...todosLosProductos.alimentos,
    ];
    return all.filter((p) => getOfertaFor(p.id) > 0);
  }, []);

  return (
    <main className="container my-5">
      <h2 className="mb-4 text-center text-primary fw-bold">Ofertas para ti</h2>
      <Row xs={1} sm={2} md={3} xl={4} className="g-4">
        {productosConOferta.length === 0 && (
          <Col xs={12}>
            <p className="text-center text-muted">
              No hay ofertas activas por ahora.
            </p>
          </Col>
        )}

        {productosConOferta.map((p) => {
          const off = getOfertaFor(p.id);
          const rebaja = Math.round(p.precio * (off / 100));
          const precioConOff = p.precio - rebaja;

          return (
            <Col key={p.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img
                  src={p.imagen}
                  alt={p.nombre}
                  style={{
                    height: "clamp(180px, 26vw, 240px)",
                    objectFit: "contain",
                  }}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "/img/placeholder.png")
                  }
                />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0 fs-6">{p.nombre}</Card.Title>
                    <Badge bg="danger">-{off}%</Badge>
                  </div>
                  <div className="d-flex gap-2 align-items-baseline">
                    <span className="text-muted text-decoration-line-through">
                      ${p.precio.toLocaleString("es-CL")}
                    </span>
                    <span className="fw-bold text-success">
                      ${precioConOff.toLocaleString("es-CL")}
                    </span>
                  </div>

                  <Button
                    className="mt-auto w-100"
                    variant="primary"
                    onClick={() => router.push(`/detalle/${p.id}`)}
                  >
                    Ver producto
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </main>
  );
};

export default OfertasPage;
