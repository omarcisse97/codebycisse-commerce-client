import React, { useState, useEffect, useRef } from 'react';
import { FormControl, InputGroup, ListGroup, Button, Spinner } from 'react-bootstrap';
import { medusaClient } from '../utils/client';
import { useNavigate } from 'react-router-dom';


const TRENDING_ITEMS = ['Search something'];

export default function SearchBar({ searchTerm, setSearchTerm, onSearch }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const navigate = useNavigate();
    const debounceTimeout = useRef(null);
    const ref = useRef();

    useEffect(() => {
        if (!searchTerm) {
            setSuggestions([]);
            setShowDropdown(true); // Show recent/trending even if input is empty
            return;
        }

        setIsLoading(true);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const result = await medusaClient.store.product.list({
                    q: searchTerm.toLowerCase(),
                    limit: 5
                });
                setSuggestions(result.products);
            } catch (error) {
                console.error('Error fetching products:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
                setShowDropdown(true);
            }
        }, 400);

        return () => clearTimeout(debounceTimeout.current);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            triggerSearch(searchTerm);
        }
    };

    const triggerSearch = (term) => {
        if (!term.trim()) return;
        setRecentSearches(prev => {
            const updated = [term, ...prev.filter(item => item !== term)];
            return updated.slice(0, 5);
        });
        onSearch(term);
        setShowDropdown(false);
    };

   const handleRedirect = (type, productid = null) => {
    switch(type){
        case 'product':
            if(searchTerm.trim()){
                navigate(`/products/${encodeURIComponent(productid)}`);
            }
            break;
        case 'search' : 
            if(searchTerm.trim()){
                navigate(`/products/search?query=${encodeURIComponent(searchTerm)}`);
            }
            break;
        default: break;
    }
}


    const renderSuggestionItems = () => {
        if (isLoading) {
            return (
                <ListGroup.Item className="text-center">
                    <Spinner animation="border" size="sm" /> Searching...
                </ListGroup.Item>
            );
        }

        if (searchTerm && suggestions.length > 0) {
            return suggestions.map((item, idx) => (
                <>
                    <ListGroup.Item
                        key={item.id}
                        action
                        onClick={() => {
                            setSearchTerm(item.title);
                            triggerSearch(item.title);
                            handleRedirect('product', item.id)

                        }}
                        style={itemStyle(idx !== suggestions.length - 1)}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f1f3f5')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                    >
                        {item.thumbnail ? (
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    borderRadius: '0.25rem',
                                }}
                            />
                        ) : (
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#eaeaea' }} />
                        )}
                        <span>{item.title}</span>
                    </ListGroup.Item>
                    
                </>
            ));
        }

        if (searchTerm && suggestions.length === 0 && !isLoading) {
            return <ListGroup.Item className="text-center text-muted">No results found.</ListGroup.Item>;
        }

        // Show recent + trending when input is focused but empty
        return (
            <>
                {recentSearches.length > 0 && (
                    <>
                        <ListGroup.Item className="text-muted" style={{ backgroundColor: '#f8f9fa' }}>
                            Recent Searches
                        </ListGroup.Item>
                        {recentSearches.map((term, idx) => (
                            <ListGroup.Item
                                key={`recent-${idx}`}
                                action
                                onClick={() => {
                                    setSearchTerm(term);
                                    triggerSearch(term);
                                }}
                                style={itemStyle(idx !== recentSearches.length - 1)}
                            >
                                {term}
                            </ListGroup.Item>
                        ))}
                    </>
                )}
                <>
                    <ListGroup.Item className="text-muted" style={{ backgroundColor: '#f8f9fa' }}>
                        Trending
                    </ListGroup.Item>
                    {TRENDING_ITEMS.map((term, idx) => (
                        <ListGroup.Item
                            key={`trending-${idx}`}
                            action
                            onClick={() => {
                                setSearchTerm(term);
                                triggerSearch(term);
                            }}
                            style={itemStyle(idx !== TRENDING_ITEMS.length - 1)}
                        >
                            {term}
                        </ListGroup.Item>
                    ))}
                </>
            </>
        );
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <InputGroup>
                <FormControl
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                />
                <Button variant="success" onClick={() => triggerSearch(searchTerm)}>
                    Search
                </Button>
            </InputGroup>

            {showDropdown && (
                <ListGroup
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        maxHeight: '280px',
                        overflowY: 'auto',
                        border: '1px solid #dee2e6',
                        borderTop: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        backgroundColor: '#fff',
                        borderRadius: '0 0 0.375rem 0.375rem',
                    }}
                    variant="flush"
                >
                    {renderSuggestionItems()}
                    <ListGroup.Item
                        action
                        onClick={() => onSearch(searchTerm, { fullPage: true })}
                        style={{
                            padding: '0.85rem 1rem',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa',
                            fontWeight: '600',
                            color: '#0d6efd',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#e9ecef')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                    >
                        🔎 Search more results...
                    </ListGroup.Item>
                </ListGroup>
            )}
        </div>
    );
}

const itemStyle = (hasBottomBorder) => ({
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderBottom: hasBottomBorder ? '1px solid #f1f3f5' : 'none',
    transition: 'background-color 0.25s ease-in-out',
    backgroundColor: 'white',
});
