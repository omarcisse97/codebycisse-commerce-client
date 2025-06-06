import { Modal, Button, Form, Alert, Tab, Nav, Row, Col, Card } from 'react-bootstrap';
const Settings = () => {
    return (
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
    );
};
export default Settings;