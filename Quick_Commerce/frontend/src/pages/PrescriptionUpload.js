import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a prescription image to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (notes.trim()) {
        formData.append('notes', notes);
      }
      
      await apiService.uploadPrescription(formData);
      
      // Redirect to prescriptions list on success
      navigate('/prescriptions');
    } catch (err) {
      console.error('Error uploading prescription:', err);
      setError(
        err.response?.data?.detail || 
        'Failed to upload prescription. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Upload Prescription</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Guidelines for Prescription Upload</Card.Title>
          <Card.Text>
            <ul>
              <li>Upload a clear, readable image of your prescription</li>
              <li>Make sure the doctor's signature and details are visible</li>
              <li>Supported formats: JPG, PNG, PDF</li>
              <li>Maximum file size: 5MB</li>
            </ul>
          </Card.Text>
        </Card.Body>
      </Card>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="prescriptionFile" className="mb-3">
          <Form.Label>Prescription Image</Form.Label>
          <Form.Control 
            type="file" 
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <Form.Text className="text-muted">
            Upload a clear image of your prescription
          </Form.Text>
        </Form.Group>
        
        {preview && (
          <div className="mb-3">
            <p>Preview:</p>
            <img 
              src={preview} 
              alt="Prescription preview" 
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              className="border rounded"
            />
          </div>
        )}
        
        <Form.Group controlId="prescriptionNotes" className="mb-4">
          <Form.Label>Additional Notes (Optional)</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special instructions or notes for the pharmacist"
          />
        </Form.Group>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Uploading...
              </>
            ) : (
              'Upload Prescription'
            )}
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/prescriptions')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default PrescriptionUpload; 