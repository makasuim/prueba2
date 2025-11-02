"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import Link from "next/link";
import { todosLosProductos, getOfertaFor, Producto } from "../app/Data";
import Slider from "react-slick";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      aria-label="Anterior"
      className="kp-arrow kp-arrow-prev"
      onClick={onClick}
      type="button"
    >
      <i className="fas fa-chevron-left" />
    </button>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      aria-label="Siguiente"
      className="kp-arrow kp-arrow-next"
      onClick={onClick}
      type="button"
    >
      <i className="fas fa-chevron-right" />
    </button>
  );
};

const getFeaturedProducts = (): Producto[] => {
  const all = [
    ...todosLosProductos.juguetes,
    ...todosLosProductos.accesorios,
    ...todosLosProductos.alimentos,
  ];
  return all.slice(0, 10);
};

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const productosDestacados = getFeaturedProducts();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    adaptiveHeight: true,
    swipeToSlide: true,
    lazyLoad: "ondemand" as const,
    responsive: [
      { breakpoint: 1600, settings: { slidesToShow: 4, centerMode: true } },
      { breakpoint: 1200, settings: { slidesToShow: 3, centerMode: true } },
      { breakpoint: 992, settings: { slidesToShow: 2, centerMode: false } },
      { breakpoint: 576, settings: { slidesToShow: 1, centerMode: false } },
    ],
  };

  if (loading) {
    return (
      <div id="loading" className="loading">
        <i className="fas fa-paw fa-6x text-white"></i>
      </div>
    );
  }

  return (
    <main role="main" className="container my-5">
      <section className="hero-section text-center mb-5">
        <h2 className="display-5 fw-bold text-primary mb-3">
          Bienvenido a KittyPatitasSuaves
        </h2>
        <p className="lead text-muted mb-3">
          Tu tienda especializada en juguetes innovadores y entretenidos para
          mascotas.
        </p>
        <Link href="/inventario" passHref legacyBehavior>
          <a className="hero-image-link d-inline-block">
            <img
              src="img/Banner Tienda Online Mercado Shop Mascotas Curvo Celeste y Azul.png"
              alt="Explorar todos los productos"
              className="img-fluid rounded shadow-lg"
            />
          </a>
        </Link>
      </section>

      <section className="kp-destacados mb-5 text-center">
        <h3 className="text-primary mb-4 fw-bold">Destacados y Ofertas</h3>
        <div className="kp-slider-wrap">
          <Slider {...settings}>
            {productosDestacados.map((p) => {
              const oferta = getOfertaFor(p.id);
              const precioFinal = oferta
                ? p.precio - p.precio * (oferta / 100)
                : p.precio;

              return (
                <div key={p.id} className="px-2">
                  <Link
                    href={`/detalle/${p.id}`}
                    className="text-decoration-none"
                    style={{ color: "inherit" }}
                  >
                    <Card className="border-0 shadow-sm mx-2 h-100 text-center kp-card">
                      <Card.Img
                        variant="top"
                        src={p.imagen}
                        alt={p.nombre}
                        className="p-3 kp-card-img"
                      />
                      <Card.Body>
                        <Card.Title className="fw-bold fs-6 mb-2 text-primary">
                          {p.nombre}
                        </Card.Title>

                        {oferta > 0 && (
                          <div className="mb-2">
                            <span className="badge bg-danger">OFERTA</span>
                            <div
                              className="text-muted text-decoration-line-through"
                              style={{ fontSize: "0.9rem" }}
                            >
                              ${p.precio.toLocaleString("es-CL")}
                            </div>
                          </div>
                        )}

                        <div
                          className="fw-bold"
                          style={{ color: "#007f4e", fontSize: "1.1rem" }}
                        >
                          ${precioFinal.toLocaleString("es-CL")}
                        </div>
                      </Card.Body>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </Slider>
        </div>
      </section>

      <section className="product-categories">
        <h3 className="text-center text-primary mb-4">
          Explora Nuestras Categorías
        </h3>
        <Row xs={1} md={3} className="g-4">
          <Col>
            <Card className="h-100 shadow-sm category-card">
              <Card.Img
                variant="top"
                src="img/jugete.png"
                alt="Juguetes para mascotas"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-primary fw-bold">
                  Juguetes para Mascotas
                </Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Diversos juguetes para perros, gatos y más.
                </Card.Text>
                <Link href="/inventario?categoria=juguetes" legacyBehavior>
                  <Button variant="primary" className="mt-auto">
                    Explorar Juguetes
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 shadow-sm category-card">
              <Card.Img
                variant="top"
                src="img/accesorio.jpg"
                alt="Accesorios"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-primary fw-bold">
                  Accesorios
                </Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Collares, correas y más para tus mascotas.
                </Card.Text>
                <Link href="/inventario?categoria=accesorios" legacyBehavior>
                  <Button variant="primary" className="mt-auto">
                    Ver Accesorios
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 shadow-sm category-card">
              <Card.Img
                variant="top"
                src="img/gatocomida.png"
                alt="Alimentos"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-primary fw-bold">
                  Alimentos
                </Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Comida saludable para tus mascotas.
                </Card.Text>
                <Link href="/inventario?categoria=alimentos" legacyBehavior>
                  <Button variant="primary" className="mt-auto">
                    Descubre Alimentos
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </main>
  );
};

export default Home;
