import { useState, useEffect } from 'react';
import { Button, Form, Alert, Tab,Row, Col, Card } from 'react-bootstrap';
import { FaPencilAlt, FaTimes, FaPlus, FaHome, FaTrash } from 'react-icons/fa';

const Addresses = ({ customer }) => {
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        province: '',
        postal_code: '',
        country_code: '',
        phone: ''
    });
    const [addressErrors, setAddressErrors] = useState({});
    const [errors, setErrors] = useState({
        general: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    useEffect(() => {
        setAddresses([
            ...customer?.addresses
        ])
    }, [customer]);

    return (
        <Tab.Pane eventKey="addresses">
            {errors.general && <Alert variant="danger">{errors.general}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>📍 My Addresses</h5>
                <Button variant="primary" size="sm" onClick={() => { }}>
                    <FaPlus className="me-1" /> Add Address
                </Button>
            </div>

            {showAddressForm && (
                <Card className="mb-4">
                    <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>{editingAddress ? '✏️ Edit Address' : '➕ Add New Address'}</span>
                            <Button variant="outline-secondary" size="sm" onClick={() => setShowAddressForm(false)}>
                                <FaTimes />
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        {addressErrors.general && <Alert variant="danger">{addressErrors.general}</Alert>}

                        <Form onSubmit={handleAddressSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="first_name"
                                            value={addressForm.first_name}
                                            onChange={handleAddressChange}
                                            isInvalid={!!addressErrors.first_name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.first_name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="last_name"
                                            value={addressForm.last_name}
                                            onChange={handleAddressChange}
                                            isInvalid={!!addressErrors.last_name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.last_name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Company</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="company"
                                    value={addressForm.company}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address Line 1 *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address_1"
                                    value={addressForm.address_1}
                                    onChange={handleAddressChange}
                                    isInvalid={!!addressErrors.address_1}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {addressErrors.address_1}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address Line 2</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address_2"
                                    value={addressForm.address_2}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>City *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="city"
                                            value={addressForm.city}
                                            onChange={handleAddressChange}
                                            isInvalid={!!addressErrors.city}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.city}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>State/Province</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="province"
                                            value={addressForm.province}
                                            onChange={handleAddressChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Postal Code *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="postal_code"
                                            value={addressForm.postal_code}
                                            onChange={handleAddressChange}
                                            isInvalid={!!addressErrors.postal_code}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.postal_code}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Country Code *</Form.Label>
                                        <Form.Select
                                            name="country_code"
                                            value={addressForm.country_code}
                                            onChange={handleAddressChange}
                                            isInvalid={!!addressErrors.country_code}
                                        >
                                            <option value="">Select Country</option>
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="DE">Germany</option>
                                            <option value="FR">France</option>
                                            <option value="AU">Australia</option>
                                            {/* Add more countries as needed */}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {addressErrors.country_code}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <Button type="submit" variant="primary">
                                    {editingAddress ? '💾 Update Address' : '➕ Add Address'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline-secondary"
                                    onClick={() => setShowAddressForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {loadingAddresses ? (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : addresses.length > 0 ? (
                <Row>
                    {addresses.map((address) => (
                        <Col md={6} key={address.id} className="mb-3">
                            <Card>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="d-flex align-items-center">
                                            {address.company ? <FaBuilding className="me-2 text-muted" /> : <FaHome className="me-2 text-muted" />} {address?.address_name}
                                            <strong>
                                                {address.first_name} {address.last_name}
                                            </strong>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditAddress(address)}
                                            >
                                                <FaPencilAlt />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteAddress(address.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </div>

                                    {address.company && (
                                        <div className="text-muted mb-1">{address.company}</div>
                                    )}

                                    <div className="small text-muted">
                                        {address.address_1}<br />
                                        {address.address_2 && <>{address.address_2}<br /></>}
                                        {address.city}, {address.province} {address.postal_code}<br />
                                        {address.country_code}
                                        {address.phone && <><br />📞 {address.phone}</>}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <FaHome size={48} className="text-muted" />
                    </div>
                    <h6 className="text-muted">No addresses found</h6>
                    <p className="text-muted">Add your first address to get started!</p>
                </div>
            )}
        </Tab.Pane>
    );
};
export default Addresses;