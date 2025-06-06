import { useState, useEffect } from 'react';
import Profile from './Profile';
import Addresses from './Addresses';
import Settings from './Settings';
import { Modal, Tab, Nav} from 'react-bootstrap';

export default function UserManagement({ show, handleClose, customer, selectedTab, refreshCustomer }) {
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        setActiveTab(selectedTab);
    }, [selectedTab]);

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
                        <Profile customer={customer} refreshCustomer={refreshCustomer} />
                        <Addresses customer={customer} />
                        <Settings />
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
}