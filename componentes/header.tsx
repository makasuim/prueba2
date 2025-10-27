"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Container, Offcanvas, Button, Badge } from "react-bootstrap";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { usePathname } from "next/navigation";

const NavbarComponent: React.FC = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const actualizarContadorCarrito = () => {
    if (typeof window !== "undefined") {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const totalItems = carrito.reduce(
        (sum: number, item: { cantidad: number }) => sum + item.cantidad,
        0
      );
      setCartCount(totalItems);
    }
  };

  const leerLogin = () => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "1");
    }
  };

  useEffect(() => {
    actualizarContadorCarrito();
    leerLogin();
    const handleCarritoActualizado = () => actualizarContadorCarrito();
    const handleAuthChanged = () => leerLogin();
    window.addEventListener("carritoActualizado", handleCarritoActualizado);
    window.addEventListener("authChanged", handleAuthChanged);
    return () => {
      window.removeEventListener(
        "carritoActualizado",
        handleCarritoActualizado
      );
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("authChanged"));
    handleClose();
    window.location.href = "/";
  };

  const irAPagar = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("carritoActualizado"));
      handleClose();
      window.location.href = "/pago";
    }
  };

  const links = useMemo(() => {
    const base = [
      { path: "/", label: "Inicio", isCart: false, show: true },
      {
        path: "/registro",
        label: "Registro",
        isCart: false,
        show: !isLoggedIn,
      },
      { path: "/acceso", label: "Acceder", isCart: false, show: !isLoggedIn },
      { path: "/inventario", label: "Productos", isCart: false, show: true },
      { path: "/pago", label: "Mi carrito", isCart: true, show: true },
      { path: "/contacto", label: "Contacto", isCart: false, show: true },
      { path: "/blog", label: "Blog", isCart: false, show: true },
      { path: "/nosotros", label: "Nosotros", isCart: false, show: true },
      { path: "/ofertas", label: "Ofertas", isCart: false, show: isLoggedIn },
    ];
    return base.filter((l) => l.show);
  }, [isLoggedIn]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" || pathname === "/inicio";
    return pathname === path;
  };

  const renderBadge = (count: number, id: string) => (
    <Badge id={id} bg="secondary" pill className="ms-1">
      {count}
    </Badge>
  );

  const renderDesktopLinkContent = (link: any) =>
    link.isCart ? (
      <>
        {link.label}
        {renderBadge(cartCount, "cart-count-desktop")}
      </>
    ) : (
      link.label
    );

  return (
    <>
      <header className="main-header bg-dark text-white">
        <Container className="d-flex justify-content-between align-items-center py-3 flex-wrap">
          <Link
            href="/"
            className="text-decoration-none text-white"
            legacyBehavior
          >
            <h1 className="m-0 site-title fs-4 fs-lg-2">KittyPatitasSuaves</h1>
          </Link>

          <nav role="navigation" className="main-nav d-none d-lg-block">
            <ul className="list-unstyled d-flex m-0">
              {links.map((link, index) => (
                <li
                  key={index}
                  className={`nav-item ${
                    link.isCart ? "position-relative" : ""
                  }`}
                >
                  <Link href={link.path} passHref legacyBehavior>
                    <a
                      className={`nav-link px-3 ${
                        isActive(link.path) ? "active" : ""
                      }`}
                    >
                      {renderDesktopLinkContent(link)}
                    </a>
                  </Link>
                </li>
              ))}
              {isLoggedIn && (
                <li className="nav-item">
                  <a
                    role="button"
                    tabIndex={0}
                    className="nav-link px-3 text-danger"
                    onClick={cerrarSesion}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && cerrarSesion()
                    }
                  >
                    Salir
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <Button
            className="btn btn-outline-secondary menu-hamburguesa d-lg-none"
            type="button"
            onClick={handleShow}
            aria-controls="offcanvasMenu"
            aria-label="Abrir menú"
          >
            <img src="/img/huella.png" alt="Menú" className="menu-icon" />
          </Button>
        </Container>
      </header>

      <Offcanvas
        show={showOffcanvas}
        onHide={handleClose}
        placement="end"
        id="offcanvasMenu"
        aria-labelledby="offcanvasMenuLabel"
        className="offcanvas-end"
        tabIndex={-1}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvasMenuLabel">Menú</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0 d-flex flex-column h-100">
          <ul className="list-unstyled m-0 flex-grow-1">
            {links
              .filter((l) => !l.isCart)
              .map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                      isActive(link.path) ? "active" : ""
                    }`}
                    onClick={handleClose}
                    legacyBehavior
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            {isLoggedIn && (
              <li>
                <a
                  role="button"
                  tabIndex={0}
                  className="offcanvas-nav-link d-block px-3 py-2 text-danger"
                  onClick={cerrarSesion}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && cerrarSesion()
                  }
                >
                  Salir
                </a>
              </li>
            )}
          </ul>

          <div className="p-3 border-top mt-auto bg-light">
            <div className="d-flex justify-content-start align-items-center mb-3">
              <span className="text-muted fs-6 me-2">Items en carrito:</span>
              <span className="fw-bold fs-5 text-primary">{cartCount}</span>
            </div>
            <Button
              variant="primary"
              className="w-100 py-2 fs-5"
              onClick={irAPagar}
              disabled={cartCount === 0}
            >
              <i className="fas fa-money-check-alt me-2"></i>
              IR A PAGAR
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavbarComponent;
