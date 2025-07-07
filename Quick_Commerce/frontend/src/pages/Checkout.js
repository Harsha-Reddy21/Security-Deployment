import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    payment_method: 'cash_on_delivery',
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCart();
      setCartItems(data);
      
      // Check if any item requires prescription
      const needsPrescription = data.some(item => item.medicine.requires_prescription);
      setRequiresPrescription(needsPrescription);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items');
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.medicine.price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + 5; // Adding $5 shipping
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const requiredFields = ['full_name', 'phone_number', 'address', 'city', 'state', 'zip_code'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in your ${field.replace('_', ' ')}`);
        return false;
      }
    }
    
    if (requiresPrescription) {
      // Check if user has uploaded prescriptions
      // This would require an API call to check prescription status
      // For now, we'll assume it's handled elsewhere
    }
    
    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity
        }))
      };
      
      const response = await apiService.createOrder(orderData);
      
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Your cart is empty. Please add items to your cart before checkout.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/medicines')}>
          Browse Medicines
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Checkout</h1>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">Shipping Information</h4>
              <Form onSubmit={handleSubmitOrder}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <h4 className="mt-4 mb-3">Payment Method</h4>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    id="cash_on_delivery"
                    label="Cash on Delivery"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={formData.payment_method === 'cash_on_delivery'}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    type="radio"
                    id="credit_card"
                    label="Credit Card (Payment will be collected at delivery)"
                    name="payment_method"
                    value="credit_card"
                    checked={formData.payment_method === 'credit_card'}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                {requiresPrescription && (
                  <Alert variant="warning" className="mt-3">
                    Some items in your cart require a prescription. Please ensure you have uploaded valid prescriptions.
                    <div className="mt-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate('/prescriptions/upload')}
                      >
                        Upload Prescription
                      </Button>
                    </div>
                  </Alert>
                )}
                
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="mb-3">Order Summary</h4>
              
              <div className="mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span>
                      {item.medicine.name} x {item.quantity}
                      {item.medicine.requires_prescription && (
                        <span className="text-warning ms-2">*</span>
                      )}
                    </span>
                    <span>${(item.medicine.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>$5.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>${calculateTotal().toFixed(2)}</strong>
              </div>
              
              {requiresPrescription && (
                <small className="text-warning">* Requires prescription</small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout; 