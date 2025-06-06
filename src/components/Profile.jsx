import { useState, useEffect } from 'react';
import { Button, Form, Alert, Tab, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPencilAlt, FaCheckCircle, FaTimes, FaPhone, FaGlobe } from 'react-icons/fa';
import { validateFullName, validateEmail, validateCompany, validatePhoneNumber } from '../utils/formHelper';
import { updateCustomerDetails } from '../utils/updateCustomer';

const Profile = ({ customer, refreshCustomer }) => {
    const [editingField, setEditingField] = useState(null);
    const [canSave, setCanSave] = useState(false);
    const initialFormState = {
        name: '',
        email: '',
        company_name: '',
        phone: ''
    };
    const [form, setForm] = useState(initialFormState);
    const [phoneCountry, setPhoneCountry] = useState('US'); // Default to US
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        company_name: '',
        phone: ''
    });
    const [updateFields, setUpdateFields] = useState({
        name: false,
        email: false,
        password: false,
        company_name: false,
        phone: false
    });
    const [successMessage, setSuccessMessage] = useState('');

    // Country codes and formatting data
    const countries = [
        { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(###) ###-####' },
        { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(###) ###-####' },
        { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: '#### ### ####' },
        { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: '### ### ####' },
        { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: '# ## ## ## ##' },
        { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: '### ### ###' },
        { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: '### ### ####' },
        { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', format: '# #### ####' },
        { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: '#### ### ###' },
        { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: '###-####-####' },
        { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', format: '###-####-####' },
        { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: '### #### ####' },
        { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: '##### #####' },
        { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: '(##) #####-####' },
        { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', format: '## #### ####' },
        { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', format: '## #### ####' },
        { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', format: '## ### ####' },
        { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', format: '### ### ####' },
        { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', format: '### ### ###' },
        { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', format: '## #### ####' },
        { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: '## ### ####' },
        { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', format: '## ### ####' },
        { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: '#### ####' },
        { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', format: '##-#### ####' },
        { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', format: '##-####-####' },
        { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', format: '### ### ####' },
        { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', format: '###-####-####' },
        { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', format: '### ### ####' },
        { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', format: '### ###-##-##' },
        { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', format: '### ### ####' }
    ];

    const getCurrentCountry = () => {
        return countries.find(country => country.code === phoneCountry) || countries[0];
    };

    // Phone formatting utility functions
    const formatPhoneByCountry = (value, countryCode) => {
        const country = countries.find(c => c.code === countryCode);
        if (!country) return value;

        const digitsOnly = value.replace(/\D/g, '');
        const format = country.format;
        let formatted = '';
        let digitIndex = 0;

        for (let i = 0; i < format.length && digitIndex < digitsOnly.length; i++) {
            if (format[i] === '#') {
                formatted += digitsOnly[digitIndex];
                digitIndex++;
            } else {
                formatted += format[i];
            }
        }

        // Add any remaining digits
        if (digitIndex < digitsOnly.length) {
            formatted += digitsOnly.slice(digitIndex);
        }

        return formatted;
    };

    const getFullPhoneNumber = (phoneValue, countryCode) => {
        if (!phoneValue) return '';
        const country = getCurrentCountry();
        const cleanNumber = phoneValue.replace(/\D/g, '');
        return `${country.dialCode} ${formatPhoneByCountry(cleanNumber, countryCode)}`;
    };

    const parseStoredPhoneNumber = (storedPhone) => {
        if (!storedPhone) return { country: 'US', number: '' };
        
        // Try to match with existing country codes
        for (const country of countries) {
            if (storedPhone.startsWith(country.dialCode)) {
                const number = storedPhone.substring(country.dialCode.length).trim();
                return { country: country.code, number: number.replace(/\D/g, '') };
            }
        }
        
        // Default to US if no match found
        return { country: 'US', number: storedPhone.replace(/\D/g, '') };
    };

    // Enhanced phone input handler
    const handlePhoneChange = (e) => {
        const rawValue = e.target.value;
        const digitsOnly = rawValue.replace(/\D/g, '');
        
        // Limit to reasonable phone number length (15 digits max for international)
        if (digitsOnly.length <= 15) {
            setForm({ ...form, phone: digitsOnly });
        }
    };

    const handleCountryChange = (e) => {
        setPhoneCountry(e.target.value);
    };

    useEffect(() => {
        if (customer) {
            console.log(customer);
            
            // Parse existing phone number to extract country and number
            const phoneData = parseStoredPhoneNumber(customer?.phone || '');
            
            setForm({
                name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
                email: customer?.email || '',
                company_name: customer?.company_name || '',
                phone: phoneData.number
            });
            setPhoneCountry(phoneData.country);
            
            setErrors({
                name: '',
                email: '',
                company_name: '',
                phone: ''
            });
            setUpdateFields({
                name: false,
                email: false,
                password: false,
                company_name: false,
                phone: false
            });
        }
    }, [customer]);

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
        const originalCompany = customer?.company_name || '';
        const originalPhoneData = parseStoredPhoneNumber(customer?.phone || '');
        const originalPhone = originalPhoneData.number;

        const nameChanged = form.name !== originalName;
        const emailChanged = form.email !== originalEmail;
        const hasPassword = form.password && form.password.length > 0;
        const companyChanged = form.company_name !== originalCompany;
        const phoneChanged = form.phone !== originalPhone || phoneCountry !== originalPhoneData.country;

        console.log('📊 Change detection:', {
            nameChanged,
            emailChanged,
            companyChanged,
            phoneChanged
        });

        if (nameChanged || emailChanged || companyChanged || phoneChanged) {
            const temp = {
                name: false,
                email: false,
                company_name: false,
                phone: false
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
            if (companyChanged) {
                const companyValidation = validateCompany(form.company_name);
                temp.company_name = companyValidation.status;
                console.log('Company validation:', companyValidation);
            }
            if (phoneChanged) {
                const phoneValidation = validatePhoneNumber(form.phone);
                temp.phone = phoneValidation.status;
                console.log('📱 Phone validation:', phoneValidation);
            }

            console.log('✅ Setting updateFields to:', temp);
            setUpdateFields(temp);
        } else {
            console.log('🔄 No changes detected, resetting updateFields');
            setUpdateFields({
                name: false,
                email: false,
                company_name: false,
                phone: false
            });
        }
    }, [form, customer, editingField]);

    useEffect(() => {
        console.log('💾 Save button logic:', {
            updateFields,
            canSave,
            shouldEnable: updateFields?.name || updateFields?.email || updateFields?.company_name || updateFields?.phone
        });

        const shouldEnable = updateFields?.name || updateFields?.email || updateFields?.company_name || updateFields?.phone;

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

    const getFormInputs = (name, type = 'text') => {
        if (name === editingField && name !== 'email') {
            if (name === 'phone') {
                const currentCountry = getCurrentCountry();
                return (
                    <Row className="g-2">
                        <Col xs={4}>
                            <Form.Select
                                value={phoneCountry}
                                onChange={handleCountryChange}
                                size="sm"
                                style={{ fontSize: '0.9rem' }}
                            >
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.flag} {country.dialCode}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col xs={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaPhone className="text-muted" style={{ fontSize: '0.8rem' }} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="tel"
                                    name={name}
                                    value={formatPhoneByCountry(form[name] || '', phoneCountry)}
                                    onChange={handlePhoneChange}
                                    placeholder={currentCountry.format.replace(/#/g, '0')}
                                    isInvalid={!!errors[name]}
                                    style={{
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.5px'
                                    }}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                );
            }
            return (
                <Form.Control
                    type={type}
                    name={name}
                    value={form[name] || ''}
                    onChange={handleChange}
                    isInvalid={!!errors[name]}
                />
            );
        }
        
        // Display formatted phone for read-only view
        const displayValue = name === 'phone' ? getFullPhoneNumber(form[name], phoneCountry) : (form[name] || '');
        
        return (
            <Form.Control
                plaintext
                readOnly
                value={displayValue}
                style={name === 'phone' ? { 
                    fontFamily: 'monospace', 
                    letterSpacing: '0.5px',
                    color: '#495057'
                } : {}}
            />
        );
    };

    const renderEditableField = (label, name, type = 'text') => (
        <Form.Group className="mb-3">
            <Row>
                <Col xs={10}>
                    <Form.Label>{label}</Form.Label>
                    {getFormInputs(name, type)}
                    {name === 'email' && (
                        <Form.Text className="text-muted">
                            Email cannot be updated. Please reach out to customer support for assistance
                        </Form.Text>
                    )}
                    {name === 'phone' && editingField === 'phone' && (
                        <Form.Text className="text-muted">
                            <FaGlobe className="me-1" />
                            Select your country and enter your phone number
                        </Form.Text>
                    )}
                    <Form.Control.Feedback type="invalid">
                        {errors[name]}
                    </Form.Control.Feedback>
                </Col>

                <Col xs={2} className="d-flex align-items-end justify-content-end">
                    {name !== editingField && editingField === null && name !== 'email' ? (
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
        </Form.Group>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pendingData = {};
        for (let field in updateFields) {
            if (updateFields[field]) {
                if (field === 'phone') {
                    // Store the full international phone number
                    pendingData[field] = getFullPhoneNumber(form[field], phoneCountry);
                } else {
                    pendingData[field] = form[field];
                }
            }
        }
        try {
            const updateResult = await updateCustomerDetails(pendingData);
            console.log('Final result with results objs -> ', updateResult);
            if (updateResult.length > 0) {
                refreshCustomer();
            }
        } catch (error) {
            console.log('An error occurred. Please validate errors and try again -> ', error.message);
        }
    };

    const getSaveButton = () => {
        console.log('🎯 Rendering save button:', { canSave, updateFields });
        return (
            <Button
                type="submit"
                variant="primary"
                className="w-100 mt-2"
                disabled={!canSave}
            >
                💾 Save
            </Button>
        );
    };

    console.log(customer);

    return (
        <>
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
                        {renderEditableField('Company', 'company_name')}
                        {renderEditableField('Phone Number', 'phone', 'tel')}

                        {getSaveButton()}
                    </Form>
                </Tab.Pane>
            )}
        </>
    );
};

export default Profile;