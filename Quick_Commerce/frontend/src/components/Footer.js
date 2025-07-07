import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5>Quick Commerce</h5>
            <p className="text-muted">
              Your trusted partner for quick medicine delivery. We ensure that your health needs are met promptly and efficiently.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-light fs-5"><FaFacebook /></a>
              <a href="#" className="text-light fs-5"><FaTwitter /></a>
              <a href="#" className="text-light fs-5"><FaInstagram /></a>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li className="mb-2"><Link to="/medicines" className="text-decoration-none text-muted">Medicines</Link></li>
              <li className="mb-2"><Link to="/prescriptions/upload" className="text-decoration-none text-muted">Upload Prescription</Link></li>
              <li className="mb-2"><Link to="/cart" className="text-decoration-none text-muted">Cart</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><FaPhoneAlt className="me-2" /> +1 (555) 123-4567</li>
              <li className="mb-2"><FaEnvelope className="me-2" /> support@quickcommerce.com</li>
              <li className="mb-2"><FaMapMarkerAlt className="me-2" /> 123 Health Street, Medical City</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <div className="text-center text-muted">
          <small>&copy; {currentYear} Quick Commerce. All rights reserved.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 