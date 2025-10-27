"use client";

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import Link from "next/link";

interface Mensaje {
  texto: string;
  tipo: "success" | "danger";
}

// Interfaz para el objeto completo guardado en localStorage
interface UsuarioCompleto {
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  // Asumimos que los datos de mascota se guardan aquí también
  mascotas?: { tipo: string; nombre: string }[];
}

const Acceso: React.FC = () => {
  const [correoAcceso, setCorreoAcceso] = useState("");
  const [contrasenaAcceso, setContrasenaAcceso] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [validated, setValidated] = useState(false);

  const regexCorreoAcceso =
    /^(?=.{1,100}$)([a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com))$/;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    setMensaje(null);

    const form = e.currentTarget;

    if (!form.checkValidity() || !regexCorreoAcceso.test(correoAcceso)) {
      setMensaje({
        texto: "Por favor, rellena correctamente todos los campos.",
        tipo: "danger",
      });
      return;
    }

    const usuarioString = localStorage.getItem("usuarioRegistrado");

    if (!usuarioString) {
      setMensaje({
        texto: "No hay usuarios registrados. Por favor, regístrate primero.",
        tipo: "danger",
      });
      return;
    }

    // Usamos la interfaz UsuarioCompleto para leer todos los datos
    const usuarioRegistrado: UsuarioCompleto = JSON.parse(usuarioString);

    if (
      usuarioRegistrado.correo === correoAcceso &&
      usuarioRegistrado.contrasena === contrasenaAcceso
    ) {
      const nombreUsuario =
        usuarioRegistrado.nombreCompleto?.trim().split(" ")[0] || "Usuario";
      const correoUsuario = usuarioRegistrado.correo;

      let mensajeMascotas = "";

      // 🎯 LÓGICA DE MASCOTAS Y CORREO ENTRE PARÉNTESIS
      if (usuarioRegistrado.mascotas && usuarioRegistrado.mascotas.length > 0) {
        const mascotasList = usuarioRegistrado.mascotas
          .filter((m) => m.tipo && m.nombre) // Solo mascotas que tengan tipo y nombre
          .map((m) => `${m.tipo}: ${m.nombre}`)
          .join(", ");

        if (mascotasList) {
          mensajeMascotas = ` (Mascotas: ${mascotasList})`;
        }
      }

      const mensajeExito = `¡Inicio de sesión exitoso! Bienvenido, ${nombreUsuario} (${correoUsuario})${mensajeMascotas}`;

      setMensaje({ texto: mensajeExito, tipo: "success" });
      sessionStorage.setItem(
        "sesionActiva",
        JSON.stringify({ correo: correoAcceso, activo: true })
      );

      localStorage.setItem("isLoggedIn", "1");
      window.dispatchEvent(new Event("authChanged"));
    } else {
      setMensaje({
        texto: "Credenciales incorrectas. Verifica tu correo y contraseña.",
        tipo: "danger",
      });
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col md={80} lg={30}>
          <Card className="shadow-lg p-4">
            <h2 className="card-title text-center text-primary mb-4">
              Inicio de Sesión
            </h2>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="correoAcceso">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={correoAcceso}
                  onChange={(e) => setCorreoAcceso(e.target.value)}
                  required
                  isInvalid={validated && !regexCorreoAcceso.test(correoAcceso)}
                  placeholder="tu@ejemplo.com"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un correo válido (@duoc.cl,
                  @profesor.duoc.cl o @gmail.com).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="contrasenaAcceso">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={contrasenaAcceso}
                  onChange={(e) => setContrasenaAcceso(e.target.value)}
                  required
                  placeholder="********"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa tu contraseña.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-center mt-4">
                <Button variant="primary" type="submit" className="px-5">
                  Iniciar Sesión
                </Button>
              </div>

              <div className="mt-3 text-center">
                <Link
                  href="#"
                  className="text-decoration-none text-primary-hover"
                  legacyBehavior
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {mensaje && (
                <Alert variant={mensaje.tipo} className="mt-3 text-center">
                  {mensaje.texto}
                </Alert>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </main>
  );
};

export default Acceso;
