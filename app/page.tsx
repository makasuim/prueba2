"use client";

import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import Link from "next/link";
import { todosLosProductos, Producto } from "../app/Data";
import { getOfertaFor } from "../app/Data";
import "@fortawesome/fontawesome-free/css/all.min.css";

// --- Productos destacados (solo un par de cada categoría)
const getFeaturedProducts = (
  productos: typeof todosLosProductos
): Producto[] => {
  const featured: Producto[] = [];
  featured.push(...productos.juguetes.slice(0, 3));
  featured.push(...productos.accesorios.slice(0, 3));
  featured.push(...productos.alimentos.slice(0, 3));
  return featured;
};

// --- Productos con oferta
const getOfferProducts = (productos: typeof todosLosProductos): Producto[] => {
  const allProducts = [
    ...productos.juguetes,
    ...productos.accesorios,
    ...productos.alimentos,
  ];
  return allProducts.filter((p) => getOfertaFor(p.id) > 0).slice(0, 5);
};

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // --- Generar listas separadas con y sin oferta
  const allProducts = [
    ...todosLosProductos.juguetes,
    ...todosLosProductos.accesorios,
    ...todosLosProductos.alimentos,
  ];

  // Productos con y sin oferta reales
  const offers = allProducts.filter((p) => getOfertaFor(p.id) > 0);
  const noOffers = allProducts.filter((p) => getOfertaFor(p.id) === 0);

  // Igualar cantidad
  const minCount = Math.min(offers.length, noOffers.length);

  // Intercalar: uno con oferta, uno sin oferta
  const intercalado: Producto[] = [];
  for (let i = 0; i < minCount; i++) {
    intercalado.push(noOffers[i]);
    intercalado.push(offers[i]);
  }

  // Eliminar duplicados por ID, por seguridad
  const productosCarrusel = Array.from(
    new Map(intercalado.map((p) => [p.id, p])).values()
  );

  // --- Funciones de navegación tipo loop
  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + productosCarrusel.length) % productosCarrusel.length
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % productosCarrusel.length);
  };

  if (loading) {
    return (
      <div id="loading" className="loading">
        <i className="fas fa-paw fa-6x text-white"></i>
      </div>
    );
  }

  // --- Muestra 5 productos (2 izq + 1 centro + 2 der)
  const getVisibleProducts = (): Producto[] => {
    const visible: Producto[] = [];
    const len = productosCarrusel.length;
    for (let offset = -2; offset <= 2; offset++) {
      const idx = (currentIndex + offset + len) % len;
      visible.push(productosCarrusel[idx]);
    }
    return visible;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <main role="main" className="container my-5">
      {/* Hero */}
      <section className="hero-section text-center mb-5">
        <h2 className="display-4 fw-bold text-primary mb-3">
          Bienvenido a KittyPatitasSuaves
        </h2>
        <p className="lead text-muted mb-4">
          Tu tienda especializada en juguetes innovadores y entretenidos para
          mascotas.
        </p>

        <Link href="/inventario" passHref legacyBehavior>
          <a className="hero-image-link d-inline-block">
            <img
              src="img/Banner Tienda Online Mercado Shop Mascotas Curvo Celeste y Azul.png"
              alt="Explorar todos los productos de KittyPatitasSuaves"
              className="img-fluid rounded shadow-lg hero-banner-clickable"
            />
          </a>
        </Link>
      </section>

      {/* Carrusel combinado */}
      <section className="mb-5 text-center">
        <h3 className="text-primary mb-5 mt-4">Destacados y Ofertas</h3>

        <div className="d-flex justify-content-center align-items-center position-relative">
          <Button
            variant="outline-primary"
            className="position-absolute start-0 top-50 translate-middle-y"
            onClick={prevSlide}
          >
            <i className="fas fa-chevron-left"></i>
          </Button>

          <div
            className="d-flex justify-content-center align-items-center flex-nowrap"
            style={{
              width: "88%",
              margin: "0 auto",
              marginTop: "2.5rem",
              gap: "26px",
              overflow: "visible",
            }}
          >
            {visibleProducts.map((producto, i) => {
              const oferta = getOfertaFor(producto.id);
              const precioOferta = oferta
                ? Math.round(producto.precio - producto.precio * (oferta / 100))
                : null;

              const esCentral = i === 2; // producto central
              const ancho = 190; // todos ocupan mismo ancho
              const altoImg = esCentral ? 220 : 180;
              const scale = esCentral ? 1.12 : 1;
              const sombra = esCentral
                ? "0 15px 35px rgba(120, 0, 255, 0.25)"
                : "0 8px 18px rgba(0,0,0,0.1)";

              return (
                <div
                  key={producto.id}
                  style={{
                    flex: "0 0 auto",
                    width: `${ancho}px`,
                    transition: "transform 0.4s ease, box-shadow 0.4s ease",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Link
                    href={`/detalle/${producto.id}`}
                    passHref
                    legacyBehavior
                  >
                    <a className="d-block text-center text-dark">
                      <Card
                        className="border-0 h-100"
                        style={{
                          borderRadius: "12px",
                          boxShadow: sombra,
                          transform: `scale(${scale}) translateY(${
                            esCentral ? "-8px" : "0"
                          })`,
                          backgroundColor: "#fff",
                          transition: "all 0.4s ease",
                          zIndex: esCentral ? 5 : 1,
                        }}
                      >
                        <Card.Img
                          src={producto.imagen}
                          alt={producto.nombre}
                          style={{
                            height: `${altoImg}px`,
                            objectFit: "contain",
                            transition: "height 0.4s ease",
                          }}
                        />
                        <Card.Body>
                          <Card.Title
                            className={`fs-6 text-primary ${
                              esCentral ? "fw-bold" : ""
                            }`}
                          >
                            {producto.nombre}
                          </Card.Title>

                          {precioOferta ? (
                            <>
                              <span
                                className="badge bg-danger mb-1"
                                style={{ fontSize: "0.75rem" }}
                              >
                                OFERTA
                              </span>
                              <Card.Text className="text-muted text-decoration-line-through">
                                ${producto.precio.toLocaleString("es-CL")}
                              </Card.Text>
                              <Card.Text className="text-success fw-bold fs-5">
                                ${precioOferta.toLocaleString("es-CL")}
                              </Card.Text>
                            </>
                          ) : (
                            <Card.Text className="fw-bold text-primary fs-5">
                              ${producto.precio.toLocaleString("es-CL")}
                            </Card.Text>
                          )}
                        </Card.Body>
                      </Card>
                    </a>
                  </Link>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline-primary"
            className="position-absolute end-0 top-50 translate-middle-y"
            onClick={nextSlide}
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Home;
