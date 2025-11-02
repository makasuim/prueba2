"use client";

import React from "react";
import { Container } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

const FooterComponent: React.FC = () => {
  return (
    <footer className="site-footer bg-dark text-white text-center p-4 mt-5">
      <Container>
        <p className="mb-2">&copy; 2025 KittyPatitasSuaves.</p>
        <div className="social-links d-flex justify-content-center gap-3">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white fs-4 social-icon"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white fs-4 social-icon"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
          <a
            href="https://www.x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white fs-4 social-icon"
            aria-label="X (Twitter)"
          >
            <i className="fab fa-x"></i>
          </a>
        </div>
      </Container>
    </footer>
  );
};

export default FooterComponent;
