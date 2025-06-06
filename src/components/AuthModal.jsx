import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Tab, Nav } from 'react-bootstrap';
import { medusaClient } from '../utils/client';
import { validateFullName, validateEmail, validatePassword } from '../utils/formHelper';
import { login, register } from '../utils/auth';
import { Alert } from 'react-bootstrap';

export default function AuthModal({ show, handleClose, tab, setLoggedIn }) {
    const [activeTab, setActiveTab] = useState('');
    const [form, setForm] = useState({ email: '', password: '', name: '', confirmPassword: '' });
    const [canSubmit, setCanSubmit] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    const googleButtonRef = useRef(null);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });

    };
    

    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log('Submitting data for validation');
        console.log('Medusa Client Object -> ', medusaClient);
        const nameValidation = validateFullName(activeTab === 'register' ? form.name : "Omar Cisse");
        const emailValidation = validateEmail(form.email);
        const passwordValidation = validatePassword(form.password, activeTab === 'register' ? form.confirmPassword : form.password);

        if(
            nameValidation.status &&
            emailValidation.status &&
            passwordValidation.status 
        ){
            let token;
            switch(activeTab){
                case "login":
                    
                    try{
                        const customer_login = await login(form.email,form.password);
                        if(customer_login === true){
                            const customer = await medusaClient.store.customer.retrieve();
                        if(customer?.customer?.has_account === true && customer?.customer?.id !== null){
                            setLoggedIn(true);
                        }
                        }
                    } catch(error){
                        const tmpError = error.message || 'Something went wrong. We could not sign you in. Please try again later';
                        setGeneralError(tmpError);
                        return;
                    }
                    
                    break;
                case "register":
                    console.log("About to register user -> ", form);
                    try{
                        const customer_register = await register(form.name,form.email,form.password);
                        if(customer_register === true){
                            const customer = await medusaClient.store.customer.retrieve();
                        if(customer?.customer?.has_account === true && customer?.customer?.id !== null){
                            setLoggedIn(true);
                        }
                    }
                    } catch(error){
                        console.log('Could not create a new user. Please check error -> ', error.message);
                        const tmpError = error.message || 'Something went wrong. We could not create your new account. Please try again later';
                        setGeneralError(tmpError);
                    }
                    break;
                default:
                    break;
            }
            // console.log('User token -> ', token);
            // await medusaClient.auth.setToken_(token);
            // console.log('New medusa with user token',medusaClient);
            // const customer = await medusaClient.store.customer.retrieve();
            // console.log('customer -> ', customer);
            handleClose();
        } else {
            if(!nameValidation.status){ setNameError(nameValidation.errorMsg);} 
            else {setNameError('');}
            if(!emailValidation.status){setEmailError(emailValidation.errorMsg);} 
            else {setEmailError('');}
            if(!passwordValidation.status){setPasswordError(passwordValidation.errorMsg);} 
            else {setPasswordError('');}
        }
        
    };
    useEffect(() => {
        setActiveTab(tab);;
    }, [tab])

    useEffect(() => {
        if (window.google && googleButtonRef.current) {
            window.google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // ⛔️ Replace this
                callback: handleGoogleResponse
            });

            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'outline',
                size: 'large',
                width: '100'
            });
        }
    }, [show]);


    
    useEffect(() => {
        if (validateEmail(form.email).status && validateFullName(activeTab === 'login' ? "Omar Cisse" : form.name).status) {
            if (validatePassword(form.password, activeTab === 'login' ? form.password : form.confirmPassword).status) {
                setCanSubmit(true);
            } else {
                if (canSubmit !== false) {
                    setCanSubmit(false);
                }
            }
        } else {
            if (canSubmit !== false) {
                setCanSubmit(false);
            }
        }

    }, [activeTab, form]);
    
    const getSubmitButton = () => {
        switch (canSubmit) {
            case true:
                return (<Button variant="primary" type="submit" className="w-100">
                    {activeTab === 'login' ? 'Sign In' : 'Register'}
                </Button>);
            case false:
                return (<Button variant="primary" type="submit" className="w-100" disabled>
                    {activeTab === 'login' ? 'Sign In' : 'Register'}
                </Button>);
            default:
                return <></>
        }
    }

    const handleGoogleResponse = (response) => {
        console.log('Google credential response:', response);
        // You can decode and validate `response.credential` with your backend.
        // You might call `medusaClient.auth.authenticateWithGoogle(response.credential)` if supported
        handleClose();
    };
    
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{activeTab === 'login' ? 'Sign In' : 'Register'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="login">🔐 Sign In</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="register">📝 Register</Nav.Link>
                    </Nav.Item>
                </Nav>

                <div ref={googleButtonRef} className="d-flex justify-content-center mb-3" />

                <hr />
                {generalError && <Alert variant="danger" className="mb-3">{generalError}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {activeTab === 'register' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={form.name} // Controlled component
                                placeholder="Jane Doe"
                                onChange={handleChange}
                                autoComplete="name" // More specific autocomplete
                                isInvalid={!!nameError} // Apply Bootstrap invalid styling
                                
                            />
                            {/* --- Field-specific Error Display --- */}
                            <Form.Control.Feedback type="invalid">
                                {nameError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={form.email} // Controlled component
                            placeholder="you@example.com"
                            onChange={handleChange}
                            autoComplete="username"
                            isInvalid={!!emailError}
                            
                        />
                        <Form.Control.Feedback type="invalid">
                            {emailError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={form.password} // Controlled component
                            placeholder="••••••••"
                            onChange={handleChange}
                            // Dynamic autocomplete based on tab
                            autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                            isInvalid={!!passwordError}
                            
                        />
                        <Form.Control.Feedback type="invalid">
                            {passwordError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {activeTab === 'register' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword} // Controlled component
                                placeholder="••••••••"
                                onChange={handleChange}
                                autoComplete="new-password" // Correct for new password confirmation
                                isInvalid={!!confirmPasswordError}
                                
                            />
                            <Form.Control.Feedback type="invalid">
                                {confirmPasswordError}
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                    {getSubmitButton()}
                </Form>
            </Modal.Body>
        </Modal>
    );
}
