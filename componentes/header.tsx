"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { Container, Offcanvas, Button, Badge } from "react-bootstrap";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { usePathname } from "next/navigation";

type Pos = { top: number; left: number; width: number };

const MenuPortal: React.FC<{
  open: boolean;
  position: Pos | null;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, position, onClose, children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) requestAnimationFrame(() => setMounted(true));
    return () => setMounted(false);
  }, [open]);
  if (!open || !position) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 2000,
        minWidth: position.width,
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#111",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.08)",
          overflow: "hidden",
          transform: mounted ? "translateY(0)" : "translateY(-8px)",
          opacity: mounted ? 1 : 0,
          transition: "opacity .18s ease, transform .18s ease",
        }}
        role="menu"
      >
        {children}
      </div>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: "transparent",
        }}
      />
    </div>,
    document.body
  );
};

const HoverItem: React.FC<{
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ href, onClick, children }) => {
  const [hover, setHover] = useState(false);
  return (
    <Link href={href} legacyBehavior>
      <a
        className="dropdown-item px-3 py-2 d-block"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          transition:
            "transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hover ? "0 10px 20px rgba(106,13,173,.12)" : "none",
          background: hover ? "var(--primary-color)" : "transparent",
          color: hover ? "#fff" : "inherit",
        }}
      >
        {children}
      </a>
    </Link>
  );
};

const NavbarComponent: React.FC = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPos, setAuthPos] = useState<Pos | null>(null);
  const [morePos, setMorePos] = useState<Pos | null>(null);
  const authBtnRef = useRef<HTMLAnchorElement | null>(null);
  const moreBtnRef = useRef<HTMLAnchorElement | null>(null);
  const pathname = usePathname();
  const [hoverKey, setHoverKey] = useState<string | null>(null);

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

  const baseLinks = useMemo(
    () => [
      { path: "/", label: "Inicio", isCart: false, key: "inicio" },
      {
        path: "/inventario",
        label: "Productos",
        isCart: false,
        key: "productos",
      },
      { path: "/pago", label: "Mi carrito", isCart: true, key: "carrito" },
    ],
    []
  );

  const moreLinks = useMemo(
    () => [
      { path: "/contacto", label: "Contacto" },
      { path: "/blog", label: "Blog" },
      { path: "/nosotros", label: "Nosotros" },
      { path: "/ofertas", label: "Ofertas" },
    ],
    []
  );

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

  const calcPosRightAligned = (el: HTMLElement, minWidth = 200): Pos => {
    const r = el.getBoundingClientRect();
    const width = Math.max(minWidth, r.width);
    const left = Math.max(
      8,
      Math.min(r.right - width, window.innerWidth - width - 8)
    );
    const top = r.bottom + 8;
    return { top, left, width };
  };

  useEffect(() => {
    const onResize = () => {
      if (showAuthMenu && authBtnRef.current)
        setAuthPos(calcPosRightAligned(authBtnRef.current, 180));
      if (showMoreMenu && moreBtnRef.current)
        setMorePos(calcPosRightAligned(moreBtnRef.current, 220));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize as any);
    };
  }, [showAuthMenu, showMoreMenu]);

  const toggleAuthMenu = () => {
    const next = !showAuthMenu;
    setShowAuthMenu(next);
    setShowMoreMenu(false);
    if (next && authBtnRef.current)
      setAuthPos(calcPosRightAligned(authBtnRef.current, 180));
  };

  const toggleMoreMenu = () => {
    const next = !showMoreMenu;
    setShowMoreMenu(next);
    setShowAuthMenu(false);
    if (next && moreBtnRef.current)
      setMorePos(calcPosRightAligned(moreBtnRef.current, 220));
  };

  const navAnim = (key: string, active: boolean) =>
    hoverKey === key
      ? {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 20px rgba(106,13,173,.25)",
          background: active ? "var(--secondary-color)" : undefined,
        }
      : {};

  return (
    <>
      <header
        className="main-header bg-dark text-white"
        style={{ position: "sticky", top: 0, zIndex: 1030 }}
      >
        <Container className="d-flex align-items-center justify-content-between py-3 flex-wrap">
          <div className="d-flex align-items-center me-auto">
            <Link
              href="/"
              className="text-decoration-none text-white"
              legacyBehavior
            >
              <h1 className="m-0 site-title fs-4 fs-lg-2">
                KittyPatitasSuaves
              </h1>
            </Link>
          </div>

          <nav role="navigation" className="main-nav ms-auto d-none d-lg-block">
            <ul className="list-unstyled d-flex m-0 align-items-center">
              {baseLinks.map((link) => (
                <li
                  key={link.key}
                  className={`nav-item ${
                    link.isCart ? "position-relative" : ""
                  }`}
                >
                  {link.isCart ? (
                    <a
                      role="button"
                      tabIndex={0}
                      onClick={irAPagar}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") && irAPagar()
                      }
                      className={`nav-link px-3 ${
                        isActive(link.path) ? "active" : ""
                      }`}
                      onMouseEnter={() => setHoverKey(link.key)}
                      onMouseLeave={() => setHoverKey(null)}
                      style={{
                        transition:
                          "transform .18s ease, box-shadow .18s ease, background .18s ease",
                        ...navAnim(link.key, isActive(link.path)),
                      }}
                    >
                      {renderDesktopLinkContent(link)}
                    </a>
                  ) : (
                    <Link href={link.path} passHref legacyBehavior>
                      <a
                        className={`nav-link px-3 ${
                          isActive(link.path) ? "active" : ""
                        }`}
                        onMouseEnter={() => setHoverKey(link.key)}
                        onMouseLeave={() => setHoverKey(null)}
                        style={{
                          transition:
                            "transform .18s ease, box-shadow .18s ease, background .18s ease",
                          ...navAnim(link.key, isActive(link.path)),
                        }}
                      >
                        {renderDesktopLinkContent(link)}
                      </a>
                    </Link>
                  )}
                </li>
              ))}

              {!isLoggedIn && (
                <li className="nav-item">
                  <a
                    ref={authBtnRef}
                    role="button"
                    tabIndex={0}
                    className="nav-link px-3"
                    onClick={toggleAuthMenu}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && toggleAuthMenu()
                    }
                    onMouseEnter={() => setHoverKey("auth")}
                    onMouseLeave={() => setHoverKey(null)}
                    style={{
                      transition:
                        "transform .18s ease, box-shadow .18s ease, background .18s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      ...navAnim("auth", false),
                    }}
                  >
                    Iniciar sesión
                    <i
                      className="fas fa-chevron-down small"
                      style={{
                        transition: "transform .18s ease",
                        transform: showAuthMenu
                          ? "rotate(180deg)"
                          : "rotate(0)",
                      }}
                    />
                  </a>
                </li>
              )}

              <li className="nav-item">
                <a
                  ref={moreBtnRef}
                  role="button"
                  tabIndex={0}
                  className="nav-link px-3"
                  onClick={toggleMoreMenu}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && toggleMoreMenu()
                  }
                  onMouseEnter={() => setHoverKey("more")}
                  onMouseLeave={() => setHoverKey(null)}
                  style={{
                    transition:
                      "transform .18s ease, box-shadow .18s ease, background .18s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    ...navAnim("more", false),
                  }}
                >
                  Más
                  <i
                    className="fas fa-chevron-down small"
                    style={{
                      transition: "transform .18s ease",
                      transform: showMoreMenu ? "rotate(180deg)" : "rotate(0)",
                    }}
                  />
                </a>
              </li>

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
                    onMouseEnter={() => setHoverKey("salir")}
                    onMouseLeave={() => setHoverKey(null)}
                    style={{
                      transition:
                        "transform .18s ease, box-shadow .18s ease, background .18s ease",
                      ...navAnim("salir", false),
                    }}
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

      <MenuPortal
        open={showAuthMenu}
        position={authPos}
        onClose={() => setShowAuthMenu(false)}
      >
        <HoverItem href="/acceso">Acceder</HoverItem>
        <HoverItem href="/registro">Registrarse</HoverItem>
      </MenuPortal>

      <MenuPortal
        open={showMoreMenu}
        position={morePos}
        onClose={() => setShowMoreMenu(false)}
      >
        {moreLinks.map((l) => (
          <HoverItem key={l.path} href={l.path}>
            {l.label}
          </HoverItem>
        ))}
      </MenuPortal>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => {
          handleClose();
        }}
        placement="end"
        id="offcanvasMenu"
        aria-labelledby="offcanvasMenuLabel"
        className="offcanvas-end"
        tabIndex={-1}
        style={{ zIndex: 2001 }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvasMenuLabel">Menú</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0 d-flex flex-column h-100">
          <ul className="list-unstyled m-0 flex-grow-1">
            <li>
              <Link
                href="/"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/inventario"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/inventario") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Productos
              </Link>
            </li>
            <li>
              <a
                role="button"
                tabIndex={0}
                onClick={irAPagar}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && irAPagar()
                }
                className="offcanvas-nav-link d-block px-3 py-2 text-primary"
              >
                Mi carrito
                {renderBadge(cartCount, "cart-count-mobile")}
              </a>
            </li>
            <li>
              <Link
                href="/acceso"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/acceso") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link
                href="/registro"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/registro") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Registro
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/contacto") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Contacto
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/blog") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/nosotros"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/nosotros") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/ofertas"
                className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                  isActive("/ofertas") ? "active" : ""
                }`}
                onClick={handleClose}
                legacyBehavior
              >
                Ofertas
              </Link>
            </li>
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
