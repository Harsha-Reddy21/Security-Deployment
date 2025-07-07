import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllMedicines();
        setMedicines(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(med => med.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        toast.error('Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Filter medicines based on search term and category
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === '' || medicine.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container className="py-5">
      <h1 className="mb-4">Medicines</h1>
      
      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row>
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map(medicine => (
              <Col key={medicine.id} md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Img 
                    variant="top" 
                    src={medicine.image_url || 'https://via.placeholder.com/300x200?text=Medicine'} 
                    alt={medicine.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{medicine.name}</Card.Title>
                    <Card.Text className="text-muted mb-1">{medicine.category}</Card.Text>
                    <Card.Text className="mb-2">${medicine.price.toFixed(2)}</Card.Text>
                    <Card.Text className="mb-3 flex-grow-1">{medicine.description.substring(0, 100)}...</Card.Text>
                    <div className="mt-auto">
                      <Link to={`/medicines/${medicine.id}`}>
                        <Button variant="primary" className="w-100">View Details</Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">No medicines found matching your criteria.</p>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default MedicineList; 