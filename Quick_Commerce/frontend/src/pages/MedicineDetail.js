import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMedicineById(id);
        setMedicine(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching medicine:', error);
        setError('Failed to load medicine details');
        toast.error('Failed to load medicine details');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await apiService.addToCart(medicine.id, quantity);
      toast.success('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !medicine) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Medicine not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={5}>
          <img 
            src={medicine.image_url || 'https://via.placeholder.com/500x500?text=Medicine'} 
            alt={medicine.name}
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        </Col>
        <Col md={7}>
          <h1>{medicine.name}</h1>
          <p className="text-muted mb-2">Category: {medicine.category}</p>
          <h3 className="mb-3">${medicine.price.toFixed(2)}</h3>
          
          <div className="mb-4">
            <h5>Description:</h5>
            <p>{medicine.description}</p>
          </div>
          
          {medicine.requires_prescription ? (
            <Alert variant="warning">
              This medicine requires a prescription. Please upload your prescription before ordering.
            </Alert>
          ) : null}
          
          <div className="d-flex align-items-center mb-4">
            <Form.Label className="me-3 mb-0">Quantity:</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              style={{ width: '80px' }}
              className="me-3"
            />
            <Button 
              variant="primary" 
              onClick={handleAddToCart}
              disabled={medicine.requires_prescription && !isAuthenticated}
            >
              Add to Cart
            </Button>
          </div>
          
          <Card className="mt-4">
            <Card.Body>
              <h5>Additional Information</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Manufacturer:</strong> {medicine.manufacturer || 'Not specified'}</p>
                  <p><strong>Dosage:</strong> {medicine.dosage || 'Not specified'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Stock:</strong> {medicine.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</p>
                  <p><strong>Expiry:</strong> {medicine.expiry_date || 'Not specified'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MedicineDetail; 