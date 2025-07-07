import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrderById(id);
      setOrder(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
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
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Order not found'}
        </Alert>
        <Link to="/orders" className="btn btn-primary mt-3">
          Back to Orders
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Order #{order.id}</h1>
        {getStatusBadge(order.status)}
      </div>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
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
                          </div>
                        </div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Timeline</h5>
            </Card.Header>
            <Card.Body>
              <ul className="timeline">
                <li className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h5 className="timeline-title">Order Placed</h5>
                    <p className="timeline-text">{formatDate(order.created_at)}</p>
                  </div>
                </li>
                
                {order.status !== 'pending' && (
                  <li className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h5 className="timeline-title">Processing</h5>
                      <p className="timeline-text">
                        {order.processing_date ? formatDate(order.processing_date) : 'In progress'}
                      </p>
                    </div>
                  </li>
                )}
                
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <li className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h5 className="timeline-title">Shipped</h5>
                      <p className="timeline-text">
                        {order.shipping_date ? formatDate(order.shipping_date) : 'In progress'}
                      </p>
                    </div>
                  </li>
                )}
                
                {order.status === 'delivered' && (
                  <li className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h5 className="timeline-title">Delivered</h5>
                      <p className="timeline-text">
                        {order.delivery_date ? formatDate(order.delivery_date) : 'In progress'}
                      </p>
                    </div>
                  </li>
                )}
                
                {order.status === 'cancelled' && (
                  <li className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h5 className="timeline-title">Cancelled</h5>
                      <p className="timeline-text">
                        {order.cancelled_date ? formatDate(order.cancelled_date) : 'N/A'}
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${(order.total_amount - 5).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>$5.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>${order.total_amount.toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Method:</span>
                <span>{order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Credit Card'}</span>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {order.full_name}</p>
              <p><strong>Phone:</strong> {order.phone_number}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>City:</strong> {order.city}</p>
              <p><strong>State:</strong> {order.state}</p>
              <p><strong>ZIP Code:</strong> {order.zip_code}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="mt-4">
        <Link to="/orders" className="btn btn-outline-primary">
          Back to Orders
        </Link>
      </div>
    </Container>
  );
};

export default OrderDetail; 