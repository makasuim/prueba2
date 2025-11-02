"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import { todosLosProductos, Producto, getOfertaFor } from "../../Data";
import "@fortawesome/fontawesome-free/css/all.min.css";

const getProductById = (id: number): Producto | undefined => {
  const all = [
    ...todosLosProductos.juguetes,
    ...todosLosProductos.accesorios,
    ...todosLosProductos.alimentos,
  ];
  return all.find((p) => p.id === id);
};

const norm = (p: string) => (p?.startsWith("/") ? p : `/${p}`);

const DetalleClient: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stockLocal, setStockLocal] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>("");

  useEffect(() => {
    if (!productId || isNaN(productId)) {
      setLoading(false);
      return;
    }
    const prod = getProductById(productId);
    if (prod) {
      setProducto(prod);
      setImagenPrincipal(norm(prod.imagen));
      const stored = JSON.parse(sessionStorage.getItem("stockActual") || "{}");
      const stock =
        stored[productId] !== undefined ? stored[productId] : prod.stock;
      setStockLocal(stock);
      setCantidad(stock > 0 ? 1 : 0);
    }
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "1");
    const onAuth = () =>
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "1");
    window.addEventListener("authChanged", onAuth);
    setLoading(false);
    return () => window.removeEventListener("authChanged", onAuth);
  }, [productId]);

  const handleSetCantidad = (n: number) => {
    if (!producto) return;
    const v = Math.max(1, Math.min(n, stockLocal));
    setCantidad(v);
  };

  const agregarAlCarrito = () => {
    if (!producto) return;
    if (cantidad === 0 || cantidad > stockLocal) {
      setMensaje({
        texto:
          stockLocal === 0
            ? "Este producto está agotado."
            : `Cantidad inválida o superior al stock disponible (${stockLocal}).`,
        tipo: "danger",
      });
      setTimeout(() => setMensaje(null), 4000);
      return;
    }
    let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const idx = carrito.findIndex((i: any) => i.id === producto.id);
    if (idx > -1) carrito[idx].cantidad += cantidad;
    else
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
        stock: producto.stock,
      });
    localStorage.setItem("carrito", JSON.stringify(carrito));
    const nuevoStock = stockLocal - cantidad;
    const stored = JSON.parse(sessionStorage.getItem("stockActual") || "{}");
    stored[producto.id] = nuevoStock;
    sessionStorage.setItem("stockActual", JSON.stringify(stored));
    setStockLocal(nuevoStock);
    setMensaje({
      texto: `Se añadieron ${cantidad} unidades de "${producto.nombre}" al carrito.`,
      tipo: "success",
    });
    setCantidad(nuevoStock > 0 ? 1 : 0);
    setTimeout(() => setMensaje(null), 3000);
    window.dispatchEvent(new CustomEvent("carritoActualizado"));
  };

  if (loading || !producto) {
    return (
      <main className="container my-5 text-center">
        <p className="text-muted">Cargando detalle del producto...</p>
      </main>
    );
  }

  const esBajoStock = stockLocal > 0 && stockLocal < 3;
  const off = getOfertaFor(producto.id);
  const precioConOff = off
    ? Math.round(producto.precio - producto.precio * (off / 100))
    : producto.precio;
  const hayOferta = off > 0;

  return (
    <main className="container my-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4 position-relative">
            {hayOferta && (
              <span className="position-absolute top-0 start-0 m-3 badge bg-danger">
                -{off}%
              </span>
            )}
            <Row>
              <Col md={6} className="mb-4 mb-md-0 text-center">
                <img
                  src={imagenPrincipal}
                  alt={producto.nombre}
                  className="kp-producto-principal"
                  onError={(e) =>
                    (e.currentTarget.src = "/img/placeholder.png")
                  }
                />
                <div className="d-flex justify-content-center gap-3 mt-3">
                  {producto.imagendescripcion.map((img, idx) => {
                    const src = norm(img);
                    return (
                      <img
                        key={idx}
                        src={src}
                        alt={`vista-${idx}`}
                        onClick={() => setImagenPrincipal(src)}
                        className={`kp-thumb rounded border ${
                          imagenPrincipal === src
                            ? "border-primary"
                            : "border-light"
                        }`}
                        style={{
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1.0)")
                        }
                        onError={(e) =>
                          (e.currentTarget.src = "/img/placeholder.png")
                        }
                      />
                    );
                  })}
                </div>
              </Col>

              <Col md={6}>
                <h1 className="text-primary fw-bold mb-3">{producto.nombre}</h1>
                <p className="lead">{producto.descripcion}</p>

                {hayOferta ? (
                  <div className="mb-3 d-flex align-items-baseline gap-2">
                    <span className="text-muted text-decoration-line-through">
                      ${producto.precio.toLocaleString("es-CL")}
                    </span>
                    <span className="fw-bold text-success fs-3">
                      ${precioConOff.toLocaleString("es-CL")}
                    </span>
                  </div>
                ) : (
                  <div className="mb-3">
                    <span className="fw-bold fs-3 text-dark">
                      ${producto.precio.toLocaleString("es-CL")}
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <span className="fw-bold text-muted">Stock Disponible: </span>
                  <span className="fw-bold text-info fs-5">{stockLocal}</span>
                </div>

                {esBajoStock && (
                  <Alert variant="warning" className="fw-semibold">
                    ⚠️ ¡Queda poco stock, apresúrate!
                  </Alert>
                )}

                <div className="d-flex gap-2 align-items-center mb-4">
                  <Button
                    variant="outline-danger"
                    size="lg"
                    onClick={() => handleSetCantidad(cantidad - 1)}
                    disabled={cantidad <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </Button>
                  <span className="fw-bold fs-3 text-dark px-3">
                    {cantidad}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => handleSetCantidad(cantidad + 1)}
                    disabled={cantidad >= stockLocal || stockLocal === 0}
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>

                <Button
                  variant="success"
                  size="lg"
                  className="w-100 mb-3"
                  onClick={agregarAlCarrito}
                  disabled={stockLocal === 0 || cantidad === 0}
                >
                  <i className="fas fa-cart-plus me-2"></i>
                  Añadir al Carrito
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100"
                  onClick={() => router.back()}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {mensaje && (
        <Row className="justify-content-center mt-4">
          <Col lg={10}>
            <Alert variant={mensaje.tipo} className="text-center">
              {mensaje.texto}
            </Alert>
          </Col>
        </Row>
      )}
    </main>
  );
};

export default DetalleClient;
