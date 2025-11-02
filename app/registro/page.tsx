"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { comunasPorRegion } from "../Data";

interface Mascota {
  tipo: string;
  nombre: string;
}

interface Mensaje {
  texto: string;
  tipo: "success" | "danger";
}

interface FormData {
  nombreCompleto: string;
  correoElectronico: string;
  contrasenaRegistro: string;
  confirmarContrasenaRegistro: string;
  telefono: string;
  region: string;
  comuna: string;
}

const initialFormData: FormData = {
  nombreCompleto: "",
  correoElectronico: "",
  contrasenaRegistro: "",
  confirmarContrasenaRegistro: "",
  telefono: "",
  region: "",
  comuna: "",
};

const Registro = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [mascotas, setMascotas] = useState<Mascota[]>([
    { tipo: "", nombre: "" },
  ]);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [comunasDisponibles, setComunasDisponibles] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);

  const regexNombre = /^[A-Za-z\s]+$/;
  const regexCorreoRegistro =
    /^(?=.{1,100}$)([a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com))$/;
  const patronContrasena =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&!*?])[A-Za-z\d@#$%^&!*?]{8,}$/;
  const regexTelefono = /^\+?[0-9]{8,15}$/;

  useEffect(() => {
    if (formData.region && comunasPorRegion[formData.region]) {
      setComunasDisponibles(comunasPorRegion[formData.region]);
      setFormData((prev) => ({ ...prev, comuna: "" }));
    } else {
      setComunasDisponibles([]);
      setFormData((prev) => ({ ...prev, comuna: "" }));
    }
  }, [formData.region]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setMensaje(null);
  };

  const handleMascotaChange = (
    index: number,
    field: keyof Mascota,
    value: string
  ) => {
    const nuevasMascotas = [...mascotas];
    nuevasMascotas[index] = { ...nuevasMascotas[index], [field]: value };
    setMascotas(nuevasMascotas);
  };

  const agregarMascota = () => {
    setMascotas([...mascotas, { tipo: "", nombre: "" }]);
  };

  const eliminarMascota = (index: number) => {
    setMascotas(mascotas.filter((_, i) => i !== index));
  };

  const validarFormulario = (): boolean => {
    let valido = true;
    if (
      !regexNombre.test(formData.nombreCompleto) ||
      formData.nombreCompleto.length > 50
    )
      valido = false;
    if (!regexCorreoRegistro.test(formData.correoElectronico)) valido = false;
    if (!patronContrasena.test(formData.contrasenaRegistro)) valido = false;
    if (
      formData.contrasenaRegistro !== formData.confirmarContrasenaRegistro ||
      formData.confirmarContrasenaRegistro.trim() === ""
    )
      valido = false;
    if (
      formData.telefono.trim() !== "" &&
      !regexTelefono.test(formData.telefono)
    )
      valido = false;
    if (formData.region === "") valido = false;
    if (formData.comuna === "") valido = false;
    const mascotasActivas = mascotas.filter(
      (m) => m.tipo !== "" || m.nombre.trim() !== ""
    );
    if (mascotasActivas.length > 0) {
      mascotasActivas.forEach((m) => {
        if (m.tipo === "" || m.nombre.trim() === "" || m.nombre.length > 50) {
          valido = false;
        }
      });
    }
    return valido;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    setMensaje(null);
    const esValido = validarFormulario();
    if (esValido) {
      const mascotasParaGuardar = mascotas.filter(
        (m) => m.tipo !== "" && m.nombre.trim() !== ""
      );
      const usuarioRegistrado = {
        nombreCompleto: formData.nombreCompleto.trim(),
        correo: formData.correoElectronico.trim(),
        contrasena: formData.contrasenaRegistro,
        mascotas: mascotasParaGuardar,
      };
      localStorage.setItem(
        "usuarioRegistrado",
        JSON.stringify(usuarioRegistrado)
      );
      setMensaje({
        texto:
          "¡Registro exitoso en KittyPatitasSuaves! Ahora puedes iniciar sesión.",
        tipo: "success",
      });
      setFormData(initialFormData);
      setMascotas([{ tipo: "", nombre: "" }]);
      setValidated(false);
    } else {
      setMensaje({
        texto: "Por favor, corrige los errores en el formulario de registro.",
        tipo: "danger",
      });
    }
  };

  useEffect(() => {
    if (mascotas.length === 0) {
      setMascotas([{ tipo: "", nombre: "" }]);
    }
  }, [mascotas.length]);

  return (
    <main className="container my-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-lg p-4">
            <h2 className="card-title text-center text-primary mb-4">
              Registro de Usuario
            </h2>
            <Form
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
              className="needs-validation"
            >
              <Form.Group className="mb-3" controlId="nombreCompleto">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  isInvalid={
                    validated &&
                    (!formData.nombreCompleto ||
                      !regexNombre.test(formData.nombreCompleto) ||
                      formData.nombreCompleto.length > 50)
                  }
                  placeholder="Tu Nombre Completo"
                />
                <Form.Control.Feedback type="invalid">
                  El nombre no debe estar vacío, debe contener solo letras y
                  espacios, y tener un máximo de 50 caracteres.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="correoElectronico">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.correoElectronico}
                  onChange={handleChange}
                  required
                  isInvalid={
                    validated &&
                    !regexCorreoRegistro.test(formData.correoElectronico)
                  }
                  placeholder="usuario@duoc.cl / @profesor.duoc.cl / @gmail.com"
                />
                <Form.Control.Feedback type="invalid">
                  El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="contrasenaRegistro">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.contrasenaRegistro}
                  onChange={handleChange}
                  required
                  isInvalid={
                    validated &&
                    !patronContrasena.test(formData.contrasenaRegistro)
                  }
                  placeholder="********"
                />
                <Form.Control.Feedback type="invalid">
                  La contraseña debe tener al menos 8 caracteres, incluir
                  mayúscula, minúscula, número y carácter especial.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="confirmarContrasenaRegistro"
              >
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.confirmarContrasenaRegistro}
                  onChange={handleChange}
                  required
                  isInvalid={
                    validated &&
                    (formData.contrasenaRegistro !==
                      formData.confirmarContrasenaRegistro ||
                      formData.confirmarContrasenaRegistro.trim() === "")
                  }
                  placeholder="********"
                />
                <Form.Control.Feedback type="invalid">
                  Las contraseñas no coinciden.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="telefono">
                <Form.Label>Teléfono (Opcional)</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  isInvalid={
                    validated &&
                    formData.telefono.trim() !== "" &&
                    !regexTelefono.test(formData.telefono)
                  }
                  placeholder="+5691234567"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un número de teléfono válido.
                </Form.Control.Feedback>
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="region">
                    <Form.Label>Región</Form.Label>
                    <Form.Select
                      value={formData.region}
                      onChange={handleChange}
                      required
                      isInvalid={validated && formData.region === ""}
                    >
                      <option value="">Seleccione región</option>
                      {Object.keys(comunasPorRegion).map((regionKey) => (
                        <option key={regionKey} value={regionKey}>
                          {regionKey.charAt(0).toUpperCase() +
                            regionKey.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="comuna">
                    <Form.Label>Comuna</Form.Label>
                    <Form.Select
                      value={formData.comuna}
                      onChange={handleChange}
                      required
                      disabled={
                        !formData.region || comunasDisponibles.length === 0
                      }
                      isInvalid={validated && formData.comuna === ""}
                    >
                      <option value="">Seleccione comuna</option>
                      {comunasDisponibles.map((comuna, index) => (
                        <option key={index} value={comuna.toLowerCase()}>
                          {comuna}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div
                id="contenedorMascotas"
                className="mb-3 p-3 border rounded bg-light-subtle"
              >
                <h5 className="text-primary mb-3">Registro de Mascotas</h5>
                <ListGroup variant="flush">
                  {mascotas.map((mascota, index) => (
                    <ListGroup.Item
                      key={index}
                      className="item-mascota mb-3 p-3 border rounded bg-white shadow-sm"
                    >
                      <Row className="g-3 align-items-end">
                        <Col md={5}>
                          <Form.Group controlId={`tipoMascota_${index}`}>
                            <Form.Label>Tipo de Mascota</Form.Label>
                            <Form.Select
                              value={mascota.tipo}
                              onChange={(e) =>
                                handleMascotaChange(
                                  index,
                                  "tipo",
                                  (e.target as HTMLSelectElement).value
                                )
                              }
                              isInvalid={validated && mascota.tipo === ""}
                            >
                              <option value="">Selecciona...</option>
                              <option value="Gato">Gato</option>
                              <option value="Perro">Perro</option>
                              <option value="Ave">Ave</option>
                              <option value="Otro">Otro</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              Por favor, selecciona el tipo de mascota.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={5}>
                          <Form.Group controlId={`nombreMascota_${index}`}>
                            <Form.Label>Nombre de Mascota</Form.Label>
                            <Form.Control
                              type="text"
                              value={mascota.nombre}
                              onChange={(e) =>
                                handleMascotaChange(
                                  index,
                                  "nombre",
                                  (e.target as HTMLInputElement).value
                                )
                              }
                              maxLength={50}
                              isInvalid={
                                validated &&
                                (mascota.nombre.trim() === "" ||
                                  mascota.nombre.length > 50)
                              }
                              placeholder="Nombre de tu mascota"
                            />
                            <Form.Control.Feedback type="invalid">
                              Por favor, ingresa el nombre de la mascota (máx.
                              50 caracteres).
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex justify-content-end">
                          {mascotas.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => eliminarMascota(index)}
                              className="w-100"
                              title="Eliminar Mascota"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>

              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                className="mb-3"
                onClick={agregarMascota}
              >
                Añadir otra mascota
              </Button>

              <div className="d-flex justify-content-center mt-3">
                <Button
                  type="submit"
                  variant="success"
                  className="px-5 w-100 w-sm-auto"
                >
                  Registrarse
                </Button>
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

export default Registro;
