import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="mb-4 text-warning">
            <FaExclamationTriangle size={100} />
          </div>
          <h1 className="display-4 mb-4">404 - Page Not Found</h1>
          <p className="lead mb-5">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            <FaHome className="me-2" /> Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 