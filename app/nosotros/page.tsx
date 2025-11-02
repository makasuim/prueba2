"use client";

import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Nosotros: React.FC = () => {
  const miembros = [
    {
      nombre: "Juan Pérez",
      rol: "Desarrollador Frontend Líder",
      especialidad: "HTML, CSS, JavaScript, Bootstrap",
      contribucion: "Diseño UI, navegación y estilos responsivos.",
      imagen: "img/juan.jpg",
    },
    {
      nombre: "María García",
      rol: "Desarrolladora JavaScript",
      especialidad: "Formularios, carrito, manejo de datos con localStorage",
      contribucion:
        "Validaciones, gestión de inventario y funcionalidad del carrito.",
      imagen: "img/mariagarcia.jpg",
    },
  ];

  return (
    <main className="container my-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4 p-md-5">
            <h2 className="card-title text-center text-primary mb-4 display-6 fw-bold">
              Sobre Nosotros
            </h2>

            <section className="mb-5">
              <div className="col text-center text-md-start">
                <h3 className="text-primary mb-3 fw-bold">
                  Nuestra Historia y Misión
                </h3>
                <p className="lead text-muted">
                  En KittyPatitasSuaves, creemos que cada mascota merece lo
                  mejor. Fundada en 2025, nuestra tienda nació de la pasión por
                  los animales y el deseo de ofrecer productos de alta calidad
                  que promuevan su bienestar y felicidad.
                </p>
                <p className="text-muted">
                  Nuestra misión es ser el aliado número uno de los dueños de
                  mascotas, proporcionando una experiencia de compra
                  excepcional, productos seleccionados y un servicio al cliente
                  que refleje nuestro amor por los animales.
                </p>
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-primary text-center mb-4 fw-bold">
                Nuestro Equipo de Desarrolladores
              </h3>
              <Row xs={1} md={2} className="g-4 justify-content-center">
                {miembros.map((miembro, index) => (
                  <Col key={index}>
                    <Card className="h-100 shadow-sm text-center p-3">
                      <img
                        src={miembro.imagen}
                        className="rounded-circle mx-auto mt-3 img-fluid"
                        alt={`Foto de ${miembro.nombre}`}
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            "/img/placeholder.png")
                        }
                      />
                      <Card.Body>
                        <h5 className="card-title text-primary fw-bold mt-2">
                          {miembro.nombre}
                        </h5>
                        <p className="card-text text-muted">
                          <strong>Rol:</strong> {miembro.rol} <br />
                          <strong>Especialidad:</strong> {miembro.especialidad}{" "}
                          <br />
                          <strong>Contribución:</strong> {miembro.contribucion}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          </Card>
        </Col>
      </Row>
    </main>
  );
};

export default Nosotros;
