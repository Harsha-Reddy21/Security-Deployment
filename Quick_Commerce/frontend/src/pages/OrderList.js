import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserOrders();
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    
    return (
      <Badge bg={statusMap[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <h1 className="mb-4">My Orders</h1>
      
      {orders.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders yet.</p>
            <Link to="/medicines" className="btn btn-primary">
              Browse Medicines
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {orders.map(order => (
            <Col md={6} lg={4} key={order.id} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Order #{order.id}</span>
                  {getStatusBadge(order.status)}
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    {formatDate(order.created_at)}
                  </Card.Title>
                  <Card.Text>
                    <strong>Items:</strong> {order.items.length} <br />
                    <strong>Total:</strong> ${order.total_amount.toFixed(2)} <br />
                    <strong>Shipping Address:</strong> <br />
                    {order.address}, {order.city}, {order.state} {order.zip_code}
                  </Card.Text>
                  <Link to={`/orders/${order.id}`} className="btn btn-outline-primary">
                    View Details
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default OrderList; 