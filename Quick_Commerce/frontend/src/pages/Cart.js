import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCart();
      setCartItems(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items');
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await apiService.updateCartItem(itemId, newQuantity);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await apiService.removeFromCart(itemId);
      
      // Update local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.medicine.price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
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

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h3>Your cart is empty</h3>
            <p className="mb-4">Looks like you haven't added any medicines to your cart yet.</p>
            <Link to="/medicines">
              <Button variant="primary">Browse Medicines</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Table responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={item.medicine.image_url || 'https://via.placeholder.com/50x50?text=Medicine'} 
                        alt={item.medicine.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                      />
                      <div>
                        <h6 className="mb-0">{item.medicine.name}</h6>
                        <small className="text-muted">{item.medicine.category}</small>
                        {item.medicine.requires_prescription && (
                          <small className="d-block text-warning">Requires prescription</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>${item.medicine.price.toFixed(2)}</td>
                  <td style={{ width: '150px' }}>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="mx-2"
                        style={{ width: '60px' }}
                      />
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>${(item.medicine.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <Row className="mt-4">
            <Col md={6}>
              <Link to="/medicines">
                <Button variant="outline-primary">Continue Shopping</Button>
              </Link>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>$5.00</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong>${(calculateTotal() + 5).toFixed(2)}</strong>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Cart; 