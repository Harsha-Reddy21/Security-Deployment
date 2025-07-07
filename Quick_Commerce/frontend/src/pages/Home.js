import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTruck, FaClipboardList, FaPhoneAlt, FaSearch } from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured medicines (just the first few medicines)
        const medicinesResponse = await api.get('/medicines?limit=6');
        setFeaturedMedicines(medicinesResponse.data);
        
        // Fetch categories
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Quick Medicine Delivery at Your Doorstep</h1>
              <p className="lead mb-4">Get your medicines delivered quickly and safely. Upload your prescription and we'll take care of the rest.</p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/medicines" variant="light" size="lg">
                  Shop Now
                </Button>
                <Button as={Link} to="/prescriptions/upload" variant="outline-light" size="lg">
                  Upload Prescription
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src="https://img.freepik.com/free-vector/pharmacy-delivery-concept_23-2148528126.jpg" 
                alt="Medicine Delivery" 
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose Quick Commerce?</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-3">
                  <FaTruck size={40} />
                </div>
                <Card.Body>
                  <Card.Title>Fast Delivery</Card.Title>
                  <Card.Text>
                    Get your medicines delivered within hours. Emergency deliveries available.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-3">
                  <FaClipboardList size={40} />
                </div>
                <Card.Body>
                  <Card.Title>Easy Prescription Upload</Card.Title>
                  <Card.Text>
                    Simply upload your prescription and our pharmacists will verify it.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-3">
                  <FaPhoneAlt size={40} />
                </div>
                <Card.Body>
                  <Card.Title>24/7 Support</Card.Title>
                  <Card.Text>
                    Our customer support is available round the clock for any assistance.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Featured Medicines */}
      <section className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Medicines</h2>
            <Button as={Link} to="/medicines" variant="outline-primary">View All</Button>
          </div>
          
          <Row>
            {featuredMedicines.map(medicine => (
              <Col key={medicine.id} md={4} className="mb-4">
                <Card className="h-100 medicine-card card-hover">
                  {medicine.prescription_required && (
                    <div className="prescription-required">Rx</div>
                  )}
                  <Card.Img 
                    variant="top" 
                    src={medicine.image_url ? `http://localhost:8000/uploads/${medicine.image_url}` : 'https://via.placeholder.com/300x200?text=Medicine'} 
                    height="200"
                    style={{ objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{medicine.name}</Card.Title>
                    <Card.Text className="text-muted">{medicine.manufacturer}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">${medicine.price.toFixed(2)}</span>
                      <Button as={Link} to={`/medicines/${medicine.id}`} variant="primary" size="sm">View Details</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      
      {/* Categories */}
      <section className="py-5">
        <Container>
          <h2 className="mb-4">Browse by Category</h2>
          <Row>
            {categories.map(category => (
              <Col key={category.id} md={3} sm={6} className="mb-4">
                <Card 
                  as={Link} 
                  to={`/medicines?category_id=${category.id}`}
                  className="text-center h-100 card-hover border-0 shadow-sm text-decoration-none"
                >
                  <Card.Body>
                    <div className="mb-3">
                      <FaSearch size={30} className="text-primary" />
                    </div>
                    <Card.Title>{category.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {category.description || `Browse all ${category.name} medicines`}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      
      {/* Emergency Delivery CTA */}
      <section className="py-5 bg-danger text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mb-4 mb-lg-0">
              <h2>Need Medicines Urgently?</h2>
              <p className="lead mb-0">
                Use our emergency delivery service to get medicines delivered within 60 minutes.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button as={Link} to="/medicines" variant="light" size="lg">
                Order Now
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home; 