"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Col, Card, Button, Alert } from "react-bootstrap";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { todosLosProductos, Producto } from "../Data";
import { getOfertaFor } from "../Data";

const getProductsMap = (): Map<number, Producto> => {
  const map = new Map<number, Producto>();
  [
    ...todosLosProductos.juguetes,
    ...todosLosProductos.accesorios,
    ...todosLosProductos.alimentos,
  ].forEach((p) => map.set(p.id, p));
  return map;
};

const productDataMap = getProductsMap();

const getTodosLosProductosArray = (): Producto[] => {
  return Array.from(productDataMap.values());
};

const InventarioClient: React.FC = () => {
  const searchParams = useSearchParams();
  const categoriaQuery = searchParams.get("categoria") as
    | keyof typeof todosLosProductos
    | undefined;

  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>(
    getTodosLosProductosArray()
  );
  const [titulo, setTitulo] = useState("Todos los Productos");
  const [mensaje, setMensaje] = useState<any>(null);
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<{
    [key: number]: number;
  }>({});
  const [stockActual, setStockActual] = useState<{ [key: number]: number }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initialStock: { [key: number]: number } = {};
    let storedStock = JSON.parse(sessionStorage.getItem("stockActual") || "{}");
    productDataMap.forEach((product) => {
      if (storedStock[product.id] === undefined) {
        initialStock[product.id] = product.stock;
      } else {
        initialStock[product.id] = storedStock[product.id];
      }
    });
    setStockActual(initialStock);
    sessionStorage.setItem("stockActual", JSON.stringify(initialStock));
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "1");
    const onAuth = () =>
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "1");
    window.addEventListener("authChanged", onAuth);
    return () => window.removeEventListener("authChanged", onAuth);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("stockActual", JSON.stringify(stockActual));
  }, [stockActual]);

  useEffect(() => {
    let productosAMostrar = getTodosLosProductosArray();
    let nuevoTitulo = "Todos los Productos";
    if (categoriaQuery && todosLosProductos[categoriaQuery]) {
      productosAMostrar = todosLosProductos[categoriaQuery];
      nuevoTitulo =
        categoriaQuery.charAt(0).toUpperCase() + categoriaQuery.slice(1);
    }
    setProductosFiltrados(productosAMostrar);
    setTitulo(nuevoTitulo);
    setCantidadesSeleccionadas({});
  }, [categoriaQuery]);

  const handleSetCantidad = (id: number, cantidad: number) => {
    const maxStock = stockActual[id] || 0;
    const nuevaCantidad = Math.max(0, Math.min(cantidad, maxStock));
    setCantidadesSeleccionadas((prev) => ({ ...prev, [id]: nuevaCantidad }));
  };

  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    if (cantidad === 0) {
      setMensaje({
        texto: `Selecciona al menos 1 unidad de ${producto.nombre}.`,
        tipo: "danger",
      });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }
    const currentStock = stockActual[producto.id] || 0;
    if (cantidad > currentStock) {
      setMensaje({
        texto: `Error: No hay suficiente stock disponible. Solo quedan ${currentStock}.`,
        tipo: "danger",
      });
      setTimeout(() => setMensaje(null), 4000);
      return;
    }
    let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const itemExistenteIndex = carrito.findIndex(
      (item: any) => item.id === producto.id
    );
    if (itemExistenteIndex > -1) {
      carrito[itemExistenteIndex].cantidad += cantidad;
    } else {
      carrito.push({ id: producto.id, cantidad: cantidad });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent("carritoActualizado"));
    setStockActual((prevStock) => ({
      ...prevStock,
      [producto.id]: prevStock[producto.id] - cantidad,
    }));
    setCantidadesSeleccionadas((prev) => ({ ...prev, [producto.id]: 0 }));
    setMensaje({
      texto: `Se añadieron ${cantidad} unidades de "${producto.nombre}" al carrito.`,
      tipo: "success",
    });
    setTimeout(() => setMensaje(null), 3000);
  };

  const precioConOferta = (p: Producto) => {
    const off = isLoggedIn ? getOfertaFor(p.id) : 0;
    if (!off) return null;
    const linea = Math.round(p.precio - p.precio * (off / 100));
    return { off, linea };
  };

  return (
    <main className="container my-5 flex-grow-1">
      <h2
        id="tituloCategoria"
        className="mb-4 text-center text-primary fw-bold"
      >
        {titulo}
      </h2>

      {mensaje && (
        <Alert variant={mensaje.tipo} className="mt-3 text-center">
          {mensaje.texto}
        </Alert>
      )}

      <div id="contenedorInventario" className="row g-4">
        {productosFiltrados.map((producto) => {
          const stock = stockActual[producto.id] || 0;
          const cantidadSeleccionada =
            cantidadesSeleccionadas[producto.id] || 0;
          const esBajoStock = stock > 0 && stock < 3;
          const oferta = precioConOferta(producto);

          return (
            <Col xs={12} sm={6} md={4} lg={3} key={producto.id}>
              <Card className="h-100 shadow-sm border-0 rounded-lg overflow-hidden product-card d-flex flex-column">
                <Link href={`/detalle/${producto.id}`} passHref legacyBehavior>
                  <a className="text-decoration-none text-dark d-block position-relative">
                    {oferta && (
                      <span
                        className="position-absolute top-0 start-0 m-2 badge bg-danger"
                        style={{ zIndex: 2 }}
                      >
                        -{oferta.off}%
                      </span>
                    )}
                    <Card.Img
                      variant="top"
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "contain" }}
                    />
                    <Card.Body className="d-flex flex-column pb-0">
                      <Card.Title className="fs-5 text-primary">
                        {producto.nombre}
                      </Card.Title>
                      {oferta ? (
                        <div className="d-flex align-items-baseline gap-2">
                          <span className="text-muted text-decoration-line-through">
                            ${producto.precio.toLocaleString("es-CL")}
                          </span>
                          <span className="fw-bold text-success fs-5">
                            ${oferta.linea.toLocaleString("es-CL")}
                          </span>
                        </div>
                      ) : (
                        <Card.Text className="fw-bold text-dark fs-5 mt-1">
                          Precio: ${producto.precio.toLocaleString("es-CL")}
                        </Card.Text>
                      )}
                      <Card.Text className="text-muted mb-1">
                        Stock:{" "}
                        <span className="fw-bold text-info">{stock}</span>
                      </Card.Text>
                      {esBajoStock && (
                        <p className="text-warning fw-semibold mb-3">
                          ⚠️ Queda poco stock, ¡apresúrate!
                        </p>
                      )}
                    </Card.Body>
                  </a>
                </Link>

                <div className="p-3 pt-0 mt-auto w-100">
                  <div className="d-flex gap-2 align-items-center justify-content-center mb-3">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-pill"
                      onClick={() =>
                        handleSetCantidad(producto.id, cantidadSeleccionada - 1)
                      }
                      disabled={cantidadSeleccionada === 0}
                    >
                      <i className="fas fa-minus"></i>
                    </Button>
                    <span className="fw-bold fs-5 text-dark px-2">
                      {cantidadSeleccionada}
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() =>
                        handleSetCantidad(producto.id, cantidadSeleccionada + 1)
                      }
                      disabled={cantidadSeleccionada >= stock || stock === 0}
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    className="w-100 btn-sm"
                    onClick={() =>
                      agregarAlCarrito(producto, cantidadSeleccionada)
                    }
                    disabled={cantidadSeleccionada === 0}
                  >
                    Añadir
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </div>
    </main>
  );
};

export default InventarioClient;
