import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import apiService from '../services/apiService';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUserPrescriptions();
        setPrescriptions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>My Prescriptions</h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/prescriptions/upload" variant="primary">
            Upload New Prescription
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {prescriptions.length === 0 ? (
        <Alert variant="info">
          You haven't uploaded any prescriptions yet. Click the button above to upload your first prescription.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {prescriptions.map((prescription) => (
            <Col key={prescription.id}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Prescription #{prescription.id}</Card.Title>
                  <Card.Text>
                    <strong>Status:</strong>{' '}
                    <span className={`text-${prescription.status === 'approved' ? 'success' : prescription.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </span>
                  </Card.Text>
                  <Card.Text>
                    <strong>Uploaded:</strong> {format(new Date(prescription.created_at), 'PPP')}
                  </Card.Text>
                  {prescription.notes && (
                    <Card.Text>
                      <strong>Notes:</strong> {prescription.notes}
                    </Card.Text>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Button variant="outline-primary" size="sm" as={Link} to={`/prescriptions/${prescription.id}`}>
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PrescriptionList; 