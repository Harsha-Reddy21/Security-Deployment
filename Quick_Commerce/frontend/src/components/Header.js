import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaPrescriptionBottleAlt, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  
  // Get cart count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);
  
  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart');
      setCartCount(response.data.cart_items.length);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <strong>Quick Commerce</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/medicines">Medicines</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/cart">
                  <FaShoppingCart /> Cart
                  {cartCount > 0 && (
                    <Badge bg="danger" pill className="cart-badge">
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>
                <NavDropdown title={<><FaUser /> {user.full_name}</>} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    <FaClipboardList /> Orders
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/prescriptions">
                    <FaPrescriptionBottleAlt /> Prescriptions
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 