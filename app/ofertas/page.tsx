"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { todosLosProductos } from "../Data";
import { OFERTAS_PRODUCTO, getOfertaFor } from "../Data";

const OfertasPage: React.FC = () => {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const logged =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "1";
    if (!logged) {
      router.replace("/acceso");
      return;
    }
    setIsLogged(true);
  }, [router]);

  const productosConOferta = useMemo(() => {
    if (!isLogged) return [];
    const all = [
      ...todosLosProductos.juguetes,
      ...todosLosProductos.accesorios,
      ...todosLosProductos.alimentos,
    ];
    return all.filter((p) => getOfertaFor(p.id) > 0);
  }, [isLogged]);

  if (!isLogged) return null;

  return (
    <main className="container my-5">
      <h2 className="mb-4 text-center">Ofertas para ti</h2>
      <Row className="g-4">
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
            <Col md={6} lg={4} key={p.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  src={p.imagen}
                  alt={p.nombre}
                  style={{ height: 220, objectFit: "contain" }}
                />
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0">{p.nombre}</Card.Title>
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
                    className="mt-3 w-100"
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
