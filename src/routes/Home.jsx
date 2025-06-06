import React, { useEffect, useState, useMemo, useCallback } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Placeholder from "react-bootstrap/Placeholder";

import ProductCard from "../components/ProductCard";
import { medusaClient } from "../utils/client.js";
import { getPriceFormat, convertFromUSD, createRange, priceRangeFilterLoad } from '../utils/pricing';

// Custom hook for debouncing values
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

// Skeleton loading component
const SkeletonCard = () => (
    <Card>
        <Card.Img variant="top" as="div" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
            <Placeholder as="div" animation="glow" style={{ height: '100%' }}>
                <Placeholder xs={12} style={{ height: '100%' }} />
            </Placeholder>
        </Card.Img>
        <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={8} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={6} />
            </Placeholder>
            <Placeholder.Button variant="primary" xs={4} />
        </Card.Body>
    </Card>
);

export default function Home(props) {
    // State management
    const [products, setProducts] = useState([]);
    const [regionid, setRegionid] = useState(props.regionid);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState([]);
    const [regionObj, setRegionObj] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const [filters, setFilters] = useState({
        category: { name: "", id: "" },
        price: "*",
        sortBy: "",
    });

    const limit = 12;
    
    // Debounce filters to reduce API calls
    const debouncedFilters = useDebounce(filters, 300);
    
    // Memoized price ranges
    const priceRangeFilter = useMemo(() => {
        return regionObj ? priceRangeFilterLoad(regionObj) : [];
    }, [regionObj]);

    // Effect to set the initial region ID from props or localStorage
    useEffect(() => {
        const savedRegion = props.regionid || localStorage.getItem("region");
        if (savedRegion) {
            setRegionid(savedRegion);
        } else {
            setError("No region found. Please select a region.");
            setLoading(false);
        }
    }, [props.regionid]);

    // Effect to load region object and categories when regionid changes
    useEffect(() => {
        if (!regionid) return;

        const controller = new AbortController();
        
        const loadRegionData = async () => {
            setError(null);
            try {
                const result = await medusaClient.store.region.retrieve(regionid, {
                    signal: controller.signal
                });
                setRegionObj(result?.region);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Failed to load region:", err);
                    setError("Failed to load region data.");
                }
            }
        };

        const loadCategories = async () => {
            try {
                const { product_categories } = await medusaClient.store.category.list({
                    signal: controller.signal
                });
                setCategories(product_categories);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Failed to load categories:", err);
                    setError("Failed to load categories.");
                }
            }
        };

        loadRegionData();
        loadCategories();
        localStorage.setItem("region", regionid);
        
        return () => controller.abort();
    }, [regionid]);

    // Effect to reset products and fetch new ones when filters change
    useEffect(() => {
        if (!regionid || !regionObj) return;

        setProducts([]);
        setPage(0);
        setHasMore(true);
        fetchProducts(0, false);
    }, [debouncedFilters, regionid, regionObj]);

    // Memoized product processing functions
    const processProducts = useCallback((fetchedProducts) => {
        let processedProducts = [...fetchedProducts];

        // Client-side Price Filtering
        if (debouncedFilters.price && debouncedFilters.price !== "*") {
            const [minDollars, maxDollarsStr] = debouncedFilters.price.split('-');
            const minCents = Number(minDollars) * 100;
            const maxCents = maxDollarsStr === "" ? Number.MAX_SAFE_INTEGER : Number(maxDollarsStr) * 100;

            processedProducts = processedProducts.filter(product => {
                return product.variants.some(variant => {
                    const price = variant.calculated_price?.calculated_amount;
                    return price !== undefined && price >= minCents && price <= maxCents;
                });
            });
        }

        // Client-side Sorting
        if (debouncedFilters.sortBy && debouncedFilters.sortBy !== "") {
            processedProducts.sort((a, b) => {
                const priceA = a.variants[0]?.calculated_price?.calculated_amount || 0;
                const priceB = b.variants[0]?.calculated_price?.calculated_amount || 0;

                switch (debouncedFilters.sortBy) {
                    case "price-asc":
                        return priceA - priceB;
                    case "price-desc":
                        return priceB - priceA;
                    default:
                        return 0;
                }
            });
        }

        return processedProducts;
    }, [debouncedFilters]);

    // Fetch products with applied filters & pagination
    const fetchProducts = useCallback(async (pageToFetch, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const offset = pageToFetch * limit;
            const query = {
                fields: "*variants.calculated_price",
                region_id: regionid,
                limit,
                offset,
            };

            if (debouncedFilters.category && debouncedFilters.category.id) {
                query.category_id = debouncedFilters.category.id;
            }

            const { products: fetchedProducts } = await medusaClient.store.product.list(query);
            const processedProducts = processProducts(fetchedProducts);

            setHasMore(fetchedProducts.length === limit);

            if (pageToFetch === 0) {
                setProducts(processedProducts);
            } else {
                setProducts(prev => [...prev, ...processedProducts]);
            }
            
            // Reset retry count on successful fetch
            setRetryCount(0);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Failed to load products. Please try again later.");
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [regionid, debouncedFilters, processProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setProducts([]);
        setPage(0);
        setHasMore(true);
        fetchProducts(0, false);
    };

    // Optimized filter handlers
    const handleFilterChangePrice = useCallback((e) => {
        const newValue = e.target.value;
        setFilters(prev => prev.price !== newValue ? { ...prev, price: newValue } : prev);
    }, []);

    const handleCategoryClick = useCallback((cat) => {
        setFilters(prev => {
            const newCategory = cat.name === "all" ? { name: "", id: "" } : cat;
            return prev.category.name !== newCategory.name ? { ...prev, category: newCategory } : prev;
        });
    }, []);

    const handleFilterChangeSort = useCallback((e) => {
        const newValue = e.target.value;
        setFilters(prev => prev.sortBy !== newValue ? { ...prev, sortBy: newValue } : prev);
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="bg-dark text-white text-center py-5">
                <Container>
                    <h1 className="display-4 fw-bold">Welcome to CodeByCisse Store</h1>
                    <p className="lead">Shop exclusive deals & discover unique products from around the world.</p>
                </Container>
            </section>

            {/* Product Grid + Filters */}
            <Container className="py-5">
                <h2 className="mb-4 text-center">All Products</h2>
                <Row>
                    {/* Sidebar Filters */}
                    <Col md={3}>
                        <h5>Categories</h5>
                        <Row className="mb-3">
                            <Col xs="auto" className="mb-2">
                                <Button
                                    variant={filters.category.name === "" ? "dark" : "outline-dark"}
                                    onClick={() => handleCategoryClick({ name: "all", id: "" })}
                                    size="sm"
                                >
                                    All
                                </Button>
                            </Col>
                            {categories?.map((cat) => (
                                <Col key={cat?.id} xs="auto" className="mb-2">
                                    <Button
                                        variant={filters.category.name === cat.name ? "dark" : "outline-dark"}
                                        onClick={() => handleCategoryClick(cat)}
                                        size="sm"
                                    >
                                        {cat?.name?.charAt(0).toUpperCase() + cat?.name?.slice(1)}
                                    </Button>
                                </Col>
                            ))}
                        </Row>

                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Price Range</Form.Label>
                                <Form.Select 
                                    name="price" 
                                    value={filters.price} 
                                    onChange={handleFilterChangePrice}
                                    disabled={loading && products.length === 0}
                                >
                                    <option value="*">All</option>
                                    {priceRangeFilter?.map((prf, index) => (
                                        <option key={index} value={prf.value}>{prf.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Sort By</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Default"
                                        name="sortBy"
                                        value=""
                                        checked={filters.sortBy === ""}
                                        onChange={handleFilterChangeSort}
                                        disabled={loading && products.length === 0}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Price: Low to High"
                                        name="sortBy"
                                        value="price-asc"
                                        checked={filters.sortBy === "price-asc"}
                                        onChange={handleFilterChangeSort}
                                        disabled={loading && products.length === 0}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Price: High to Low"
                                        name="sortBy"
                                        value="price-desc"
                                        checked={filters.sortBy === "price-desc"}
                                        onChange={handleFilterChangeSort}
                                        disabled={loading && products.length === 0}
                                    />
                                </div>
                            </Form.Group>
                        </Form>
                    </Col>

                    {/* Product Grid */}
                    <Col md={9}>
                        {loading && products.length === 0 && (
                            <Row xs={1} sm={2} md={2} lg={3} className="g-4">
                                {Array(6).fill().map((_, i) => (
                                    <Col key={i}>
                                        <SkeletonCard />
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {error && (
                            <Alert variant="danger" className="text-center my-4">
                                <Alert.Heading>Oops! Something went wrong</Alert.Heading>
                                <p>{error}</p>
                                <Button 
                                    variant="outline-danger" 
                                    onClick={handleRetry}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Retrying...
                                        </>
                                    ) : (
                                        `Try Again ${retryCount > 0 ? `(${retryCount})` : ''}`
                                    )}
                                </Button>
                            </Alert>
                        )}

                        {!loading && products.length === 0 && !error && (
                            <Alert variant="info" className="text-center my-4">
                                <Alert.Heading>No products found</Alert.Heading>
                                <p>Try adjusting your filters or browse all categories.</p>
                                <Button 
                                    variant="outline-info" 
                                    onClick={() => setFilters({
                                        category: { name: "", id: "" },
                                        price: "*",
                                        sortBy: "",
                                    })}
                                >
                                    Clear Filters
                                </Button>
                            </Alert>
                        )}

                        {products.length > 0 && (
                            <Row xs={1} sm={2} md={2} lg={3} className="g-4">
                                {products.map((product) => {
                                    const variant = product.variants?.[0];
                                    const price = variant?.calculated_price?.calculated_amount || 0;
                                    return (
                                        <Col key={product.id}>
                                            <ProductCard
                                                title={product.title}
                                                productId={product.id}
                                                price={price}
                                                currencyCode={regionObj?.currency_code}
                                                thumbnail={product.thumbnail}
                                                regionid={regionid}
                                            />
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}

                        {hasMore && products.length > 0 && (
                            <div className="text-center mt-4">
                                <Button
                                    variant="outline-dark"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More'
                                    )}
                                </Button>
                            </div>
                        )}

                        {!hasMore && products.length > 0 && (
                            <div className="text-center mt-4">
                                <p className="text-muted mb-3">You've reached the end. Time to check your cart? 😉</p>
                                <Button 
                                    variant="outline-primary" 
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                >
                                    Back to Top
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}