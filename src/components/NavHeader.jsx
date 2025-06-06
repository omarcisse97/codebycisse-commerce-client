import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Navbar,
    Nav,
    NavDropdown,
    Badge,
    Button
} from 'react-bootstrap';
import { medusaClient } from '../utils/client';
import { FaShoppingCart } from 'react-icons/fa';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import LogoutModal from './LogoutModal';
import UserManagement from './UserManagement';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function NavHeader(props) {
    const cartCount = localStorage.getItem('cartCount') ?? 0;
    const [regions, setRegions] = useState([]);
    const [region, setRegion] = useState({});
    const [regionid, setRegionid] = useState(props.regionid);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [userProfileModal, setUserProfileModal] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [accountTab, setAccountTab] = useState('');
    const [userManagementSelectedTab, setUserManagementSelectedTab] = useState('');

    const [customer, setCustomer] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadRegions = async () => {
            const res = await medusaClient.store.region.list();
            setRegions(res);
        };
        const retrieveCustomer = async () => {
            const cus = await medusaClient.store.customer.retrieve();
            if (cus?.customer?.has_account === true && cus?.customer.id !== null) {
                setCustomer(cus.customer);
            }
        };

        loadRegions();

        const savedRegion = localStorage.getItem("region");
        if (!props.regionid && savedRegion) {
            props.onRegionSelect(savedRegion);
        }
        if (props.loggedIn === true) {
            retrieveCustomer();
        }
    }, []);



    useEffect(() => {
        const retrieveCustomer = async () => {
            const cus = await medusaClient.store.customer.retrieve();
            if (cus?.customer?.has_account === true && cus?.customer.id !== null) {
                setCustomer(cus.customer);
            }
        };

        if (props.loggedIn === true) {
            retrieveCustomer();
        } else {
            setCustomer(null);
        }
    }, [props.loggedIn])

    useEffect(() => {
        const getRegion = async () => {
            if (regionid) {
                const res = await medusaClient.store.region.retrieve(regionid);
                setRegion(res);
            }
        };

        getRegion();
    }, [regionid]);

    useEffect(() => {
        if (props.regionid && props.regionid !== regionid) {
            setRegionid(props.regionid);
        }
    }, [props.regionid]);

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
        // You can later redirect or filter products here
        navigate(`/search/${searchTerm}`);
    };
    const getAuthContent = () => {
        if (!props.loggedIn) {
            return (
                <Nav className="me-auto">
                    <NavDropdown
                        title="👤 Account"
                        id="account-options"
                        menuVariant="dark"
                        className="text-light"
                    >
                        <NavDropdown.Item
                            onClick={() => { setAccountTab('login'); setShowAuthModal(true); }}
                        >
                            🔐 Sign In
                        </NavDropdown.Item>
                        <NavDropdown.Item
                            onClick={() => { setAccountTab('register'); setShowAuthModal(true) }}
                        >
                            ➕👤 Register
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            );
        } else if (props.loggedIn) {
            return (
                <Nav className="me-auto">
                    <NavDropdown
                        title={customer ? customer?.last_name !== '' ?
                            customer?.first_name !== '' ?
                                `${customer?.first_name} ${customer?.last_name}`
                                : customer?.last_name
                            : customer?.first_name !== '' ?
                                customer?.first_name : customer?.email : 'loading'}
                        id="account-options"
                        menuVariant="dark"
                        className="text-light"
                    >
                        <NavDropdown.Item
                            onClick={() => { setUserManagementSelectedTab('profile'); setUserProfileModal(true); }}
                        >
                            <FaUser style={{ color: 'gray' }} /> Profile
                        </NavDropdown.Item>
                        <NavDropdown.Item
                            onClick={() => { setUserManagementSelectedTab('settings'); setUserProfileModal(true); }}
                        >
                            <FaCog style={{ color: 'dodgerblue' }} /> Settings
                        </NavDropdown.Item>
                        <NavDropdown.Item
                            onClick={() => { setShowLogout(true) }}
                        >
                            <FaSignOutAlt style={{ color: 'crimson' }} /> Sign out
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            );
        }
    }

    const refreshCustomer = async() => {
        if(props.loggedIn){
            const result = await medusaClient.store.customer.retrieve();
            setCustomer(result?.customer);
        }
    }

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-2">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-light">
                        CodeByCisse
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="main-navbar" />

                    <Navbar.Collapse id="main-navbar">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" className="text-light fw-semibold">
                                Products
                            </Nav.Link>

                            <NavDropdown
                                title={region?.region?.name || "Loading..."}
                                id="region-selector"
                                menuVariant="dark"
                                className="text-light"
                            >
                                {regions?.regions?.map((r) => (
                                    <NavDropdown.Item
                                        key={r.id}
                                        onClick={() => props.onRegionSelect(r.id)}
                                    >
                                        {r.name}
                                    </NavDropdown.Item>
                                ))}
                            </NavDropdown>
                        </Nav>
                        <div className="me-3 my-2 my-lg-0 w-100 w-lg-25">
                            <SearchBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                onSearch={handleSearch}
                            />
                        </div>

                        {getAuthContent()}
                        <Nav className="ms-auto d-flex align-items-center">
                            <Button as={Link} to="/cart" variant="success" className="d-flex align-items-center">
                                <FaShoppingCart className="me-2" />
                                <span>Cart</span>
                                <Badge bg="light" text="dark" className="ms-2">{cartCount}</Badge>
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <AuthModal show={showAuthModal} handleClose={() => setShowAuthModal(false)} tab={accountTab} setLoggedIn={props.setLoggedIn} />
            <LogoutModal
                show={showLogout}
                onHide={() => setShowLogout(false)}
                setLoggedIn={props.setLoggedIn}
            />
            {customer && <UserManagement
                show={userProfileModal}
                handleClose={() => setUserProfileModal(false)}
                customer={customer}
                selectedTab={userManagementSelectedTab}
                refreshCustomer={refreshCustomer}
            />}
        </>
    );
}
