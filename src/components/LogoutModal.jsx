import React from "react";
import { Modal, Button } from "react-bootstrap";
import { logout } from "../utils/auth";

const LogoutModal = ({ show, onHide, setLoggedIn }) => {
  const handleLogout = async () => {
    try {
       const result = await logout();
      console.log(result);
      setLoggedIn(false);
      onHide()
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Log Out</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to log out?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          Log Out
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LogoutModal;
