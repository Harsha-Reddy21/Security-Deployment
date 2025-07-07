import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserProfile();
      setProfileData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip_code || '',
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile information');
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await apiService.updateUserProfile(profileData);
      
      // Update user info in auth context
      updateUserInfo({
        ...user,
        full_name: profileData.full_name,
        email: profileData.email
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setSaving(true);
      await apiService.updateUserPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please check your current password.');
    } finally {
      setSaving(false);
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

  return (
    <Container className="py-5">
      <h1 className="mb-4">My Profile</h1>
      
      <Tab.Container defaultActiveKey="profile">
        <Row>
          <Col md={3} className="mb-4">
            <Card>
              <Card.Body>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">Profile Information</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">Change Password</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Profile Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleProfileSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="full_name"
                              value={profileData.full_name}
                              onChange={handleProfileChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              required
                              disabled
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone_number"
                          value={profileData.phone_number}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                      
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              type="text"
                              name="city"
                              value={profileData.city}
                              onChange={handleProfileChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>State</Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              value={profileData.state}
                              onChange={handleProfileChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>ZIP Code</Form.Label>
                            <Form.Control
                              type="text"
                              name="zip_code"
                              value={profileData.zip_code}
                              onChange={handleProfileChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              <Tab.Pane eventKey="password">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Change Password</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handlePasswordSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                        />
                        <Form.Text className="text-muted">
                          Password must be at least 8 characters long
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirm_password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default Profile; 