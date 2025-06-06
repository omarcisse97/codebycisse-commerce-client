import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Tab, Nav, Row, Col, Card } from 'react-bootstrap';
import { FaPencilAlt, FaCheckCircle, FaTimes, FaPlus, FaHome, FaTrash } from 'react-icons/fa';
import { validateFullName, validateEmail, validatePassword } from '../utils/formHelper';

export default function ProfileModal({ show, handleClose, customer, updateProfile }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [editingField, setEditingField] = useState(null);
    const [canSave, setCanSave] = useState(false);

    // Initialize with empty strings instead of empty object
    const initialFormState = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    };
    const [form, setForm] = useState(initialFormState);

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [updateFields, setUpdateFields] = useState({
        name: false,
        email: false,
        password: false
    });
    const [successMessage, setSuccessMessage] = useState('');
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

    useEffect(() => {
        if (customer) {
            console.log(customer);
            setForm({
                name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
                email: customer?.email || '',
                password: '',
                confirmPassword: '',
            });
            setErrors({
                name: '',
                email: '',
                password: ''
            });
            setUpdateFields({
                name: false,
                email: false,
                password: false
            });
            // Load addresses when customer data is available
            setAddresses([
                ...customer?.addresses
            ])
            if (show) {
                // loadAddresses();
            }
        }
    }, [customer, show]);
    console.log('customer addresses -> ', addresses);
    useEffect(() => {
        console.log('🔍 Checking for changes...', {
            customer: customer ? 'loaded' : 'null',
            editingField,
            form,
            currentName: form?.name,
            originalName: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
            currentEmail: form?.email,
            originalEmail: customer?.email || '',
            hasPassword: !!form?.password
        });

        if (!customer || editingField || !form) {
            console.log('❌ Early return - missing customer, editing, or no form');
            return;
        }

        const originalName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        const originalEmail = customer.email || '';

        const nameChanged = form.name !== originalName;
        const emailChanged = form.email !== originalEmail;
        const hasPassword = form.password && form.password.length > 0;

        console.log('📊 Change detection:', {
            nameChanged,
            emailChanged,
            hasPassword
        });

        if (nameChanged || emailChanged || hasPassword) {
            const temp = {
                name: false,
                email: false,
                password: false
            };

            if (nameChanged) {
                const nameValidation = validateFullName(form.name);
                temp.name = nameValidation.status;
                console.log('📝 Name validation:', nameValidation);
            }

            if (emailChanged) {
                const emailValidation = validateEmail(form.email);
                temp.email = emailValidation.status;
                console.log('📧 Email validation:', emailValidation);
            }

            if (hasPassword) {
                const passwordValidation = validatePassword(form.password, form.confirmPassword);
                temp.password = passwordValidation.status;
                console.log('🔐 Password validation:', passwordValidation);
            }

            console.log('✅ Setting updateFields to:', temp);
            setUpdateFields(temp);
        } else {
            console.log('🔄 No changes detected, resetting updateFields');
            setUpdateFields({
                name: false,
                email: false,
                password: false
            });
        }
    }, [form, customer, editingField]);

    useEffect(() => {
        console.log('💾 Save button logic:', {
            updateFields,
            canSave,
            shouldEnable: updateFields?.name || updateFields?.email || updateFields?.password
        });

        const shouldEnable = updateFields?.name || updateFields?.email || updateFields?.password;

        if (shouldEnable !== canSave) {
            console.log(`🔄 Changing canSave from ${canSave} to ${shouldEnable}`);
            setCanSave(shouldEnable);
        }
    }, [updateFields, canSave]);

    const getInitials = () => {
        const names = form?.name?.trim().split(' ') || [];
        const initials = names.map(n => n[0]?.toUpperCase()).slice(0, 2).join('');
        return initials || '👤';
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Add your submit logic here
    };

    const getFormInputs = (name, type = 'text') => {
        if (name === editingField || name === 'confirmPassword') {
            return (
                <Form.Control
                    type={type}
                    name={name}
                    value={form[name] || ''} // Always provide a string value
                    onChange={handleChange}
                    isInvalid={!!errors[name]}
                />
            );
        }
        if (name !== 'password') {
            return (
                <Form.Control
                    plaintext
                    readOnly
                    value={form[name] || ''} // Use value instead of defaultValue
                />
            );
        } else {
            return null; // Return null instead of empty string
        }
    };

    const renderEditableField = (label, name, type = 'text') => (
        <Form.Group className="mb-3">
            <Row>
                <Col xs={10}>
                    <Form.Label>{label}</Form.Label>
                    {getFormInputs(name, type)}
                    <Form.Control.Feedback type="invalid">
                        {errors[name]}
                    </Form.Control.Feedback>
                </Col>

                <Col xs={2} className="d-flex align-items-end justify-content-end">
                    {name !== editingField && editingField === null ? (
                        <Button variant="outline-secondary" onClick={() => setEditingField(name)} size="sm">
                            <FaPencilAlt />
                        </Button>
                    ) : editingField !== null && name === editingField ? (
                        <>
                            <Button variant="outline-success" onClick={() => setEditingField(null)} size="sm" className="me-1">
                                <FaCheckCircle />
                            </Button>
                            <Button variant="outline-danger" onClick={() => setEditingField(null)} size="sm">
                                <FaTimes />
                            </Button>
                        </>
                    ) : null}
                </Col>
            </Row>
            {name === 'password' && name === editingField && (
                <Row>
                    <Col xs={10}>
                        <Form.Label>Confirm Password</Form.Label>
                        {getFormInputs('confirmPassword', type)}
                        <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword || ''}
                        </Form.Control.Feedback>
                    </Col>
                </Row>
            )}
        </Form.Group>
    );

    const getSaveButton = () => {
        console.log('🎯 Rendering save button:', { canSave, updateFields });
        return (
            <Button
                type="submit"
                variant="primary"
                className="w-100 mt-2"
                disabled={!canSave}
            >
                💾 Save {canSave ? '(Enabled)' : '(Disabled)'}
            </Button>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>🧑‍💻 My Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Nav variant="tabs" className="mb-3">
                        <Nav.Item>
                            <Nav.Link eventKey="profile">👤 Profile</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="addresses">🏠 Addresses</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="settings">⚙️ Settings</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        {customer && (
                            <Tab.Pane eventKey="profile">
                                {errors.general && <Alert variant="danger">{errors.general}</Alert>}
                                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                                {/* Avatar */}
                                <div className="d-flex justify-content-center mb-4">
                                    <div
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            backgroundColor: '#007bff33',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            color: '#007bff',
                                            border: '2px solid #007bff66'
                                        }}
                                    >
                                        {getInitials()}
                                    </div>
                                </div>

                                <Form onSubmit={handleSubmit}>
                                    {renderEditableField('Full Name', 'name')}
                                    {renderEditableField('Email', 'email', 'email')}

                                    <hr />
                                    <Form.Text className="text-muted mb-2 d-block">Change password (optional):</Form.Text>
                                    {renderEditableField('Edit Password', 'password', 'password')}

                                    {getSaveButton()}
                                </Form>
                            </Tab.Pane>
                        )}

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

                        <Tab.Pane eventKey="settings">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Check type="switch" label="Dark Mode (coming soon 😉)" disabled />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Check type="switch" label="Email Notifications (disabled for now)" disabled />
                                </Form.Group>
                                <Alert variant="info">More settings will be added soon!</Alert>
                            </Form>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
}