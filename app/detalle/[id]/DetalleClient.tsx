"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import { todosLosProductos, Producto } from "../../Data";
import "@fortawesome/fontawesome-free/css/all.min.css";

const getProductById = (id: number): Producto | undefined => {
  const allProducts = [
    ...todosLosProductos.juguetes,
    ...todosLosProductos.accesorios,
    ...todosLosProductos.alimentos,
  ];
  return allProducts.find((p) => p.id === id);
};

const DetalleClient: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const productId = Number(params?.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [mensaje, setMensaje] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stockLocal, setStockLocal] = useState<number>(0);

  useEffect(() => {
    if (!productId || isNaN(productId)) {
      setLoading(false);
      return;
    }

    const productoEncontrado = getProductById(productId);

    if (productoEncontrado) {
      setProducto(productoEncontrado);

      const stored = sessionStorage.getItem("stockActual");
      const storedStock = stored ? JSON.parse(stored) : {};
      const stock =
        storedStock[productId] !== undefined
          ? storedStock[productId]
          : productoEncontrado.stock;

      setStockLocal(stock);
      setCantidad(stock > 0 ? 1 : 0);
    }

    setLoading(false);
  }, [productId]);

  const handleSetCantidad = (nuevaCantidad: number) => {
    if (!producto) return;
    let finalCantidad = Math.max(1, nuevaCantidad);
    finalCantidad = Math.min(finalCantidad, stockLocal);
    setCantidad(finalCantidad);
  };

  const agregarAlCarrito = () => {
    if (!producto) return;

    if (cantidad === 0 || cantidad > stockLocal) {
      setMensaje({
        texto:
          stockLocal === 0
            ? `Este producto está agotado.`
            : `Cantidad inválida o superior al stock disponible (${stockLocal}).`,
        tipo: "danger",
      });
      setTimeout(() => setMensaje(null), 4000);
      return;
    }

    const storedCart = localStorage.getItem("carrito");
    let carrito = storedCart ? JSON.parse(storedCart) : [];
    const itemExistenteIndex = carrito.findIndex(
      (item: any) => item.id === producto.id
    );

    if (itemExistenteIndex > -1) {
      carrito[itemExistenteIndex].cantidad += cantidad;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
        stock: producto.stock,
      });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));

    const nuevoStock = stockLocal - cantidad;
    const stored = sessionStorage.getItem("stockActual");
    const storedStock = stored ? JSON.parse(stored) : {};
    storedStock[producto.id] = nuevoStock;
    sessionStorage.setItem("stockActual", JSON.stringify(storedStock));
    setStockLocal(nuevoStock);

    setMensaje({
      texto: `Se añadieron ${cantidad} unidades de "${producto.nombre}" al carrito.`,
      tipo: "success",
    });

    setCantidad(nuevoStock > 0 ? 1 : 0);
    setTimeout(() => setMensaje(null), 3000);
  };

  if (loading || !producto) {
    return (
      <main className="container my-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <p className="text-muted">Cargando detalle del producto...</p>
          </div>
        </div>
      </main>
    );
  }

  const esBajoStock = stockLocal > 0 && stockLocal < 3;
  const stockDisponible = stockLocal;

  return (
    <main className="container my-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4">
            <Row>
              <Col md={6} className="mb-4 mb-md-0">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="img-fluid rounded-lg shadow-sm"
                  style={{ maxHeight: "450px", objectFit: "cover", width: "100%" }}
                />
              </Col>

              <Col md={6}>
                <h1 className="text-primary fw-bold mb-3">{producto.nombre}</h1>
                <p className="lead">{producto.descripcion}</p>

                <div className="mb-3">
                  <span className="fw-bold fs-3 text-dark">
                    ${producto.precio.toLocaleString("es-CL")}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="fw-bold text-muted">Stock Disponible: </span>
                  <span className="fw-bold text-info fs-5">{stockDisponible}</span>
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
                  <span className="fw-bold fs-3 text-dark px-3" id="cantidadDetalle">
                    {cantidad}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => handleSetCantidad(cantidad + 1)}
                    disabled={cantidad >= stockDisponible || stockDisponible === 0}
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>

                <Button
                  variant="success"
                  size="lg"
                  className="w-100 mb-3"
                  onClick={agregarAlCarrito}
                  disabled={stockDisponible === 0 || cantidad === 0}
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
