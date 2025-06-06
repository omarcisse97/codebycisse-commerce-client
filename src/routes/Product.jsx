import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form'; // 🔥 Added for dropdowns
import { medusaClient } from '../utils/client.js';

const getFormattedPrice = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

export default function Product(props) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [regionid, setRegionid] = useState(props.regionid);
  const [region, setRegion] = useState({});
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const savedRegion = props.regionid || localStorage.getItem('region');
    if (savedRegion) {
      setRegionid(savedRegion);
    }
  }, [props.regionid]);

  useEffect(() => {
    if (!regionid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [regionRes, productRes] = await Promise.all([
          medusaClient.store.region.retrieve(regionid),
          medusaClient.store.product.retrieve(id, {
            fields: `*variants.calculated_price`,
            region_id: regionid,
          }),
        ]);
        setRegion(regionRes);
        setProduct(productRes.product);
        setMainImage(productRes.product.thumbnail);
      } catch (err) {
        console.error('Failed to load product or region:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [regionid, id]);

  useEffect(() => {
    if (product?.title) {
      document.title = product.title;
    }
  }, [product]);

  useEffect(() => {
    if (!product || !product.variants) return;

    const matchingVariant = product.variants.find(variant => {
      return variant.options.every(opt => {
        return selectedOptions[opt.option_id] === opt.value;
      });
    });

    setSelectedVariant(matchingVariant || null);
  }, [selectedOptions, product]);

  const handleOptionChange = (optionId, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const price = getFormattedPrice(
    selectedVariant?.calculated_price?.calculated_amount ||
      product?.variants?.[0]?.calculated_price?.calculated_amount ||
      0,
    region?.region?.currency_code || 'USD'
  );

  const allImages = [
    product?.thumbnail,
    ...(product?.images?.filter(img => img.url !== product?.thumbnail).map(img => img.url) || [])
  ];

  if (loading && !product) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <img
          src="https://placehold.co/500x500?text=Loading..."
          alt="Loading placeholder"
          className="mb-4"
          style={{
            width: '300px',
            height: '300px',
            objectFit: 'contain',
            borderRadius: '12px',
            opacity: 0.7,
          }}
        />
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading product...</p>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="text-center my-5">
        <h2>Product not found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
      </Container>
    );
  }

  return (
    <main className="py-5">
      <Container>
        <Row className="align-items-start g-5">
          <Col md={6}>
            <img
              src={mainImage}
              alt={product.title}
              className="img-fluid rounded"
              style={{ objectFit: 'cover', width: '100%', maxHeight: '500px' }}
            />
            <Row className="mt-3 gx-2">
              {allImages.length > 0 ? (
                allImages.map((imgUrl, idx) => (
                  <Col key={idx} xs={3} sm={2}>
                    <img
                      src={imgUrl}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '75px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: mainImage === imgUrl ? '2px solid #28a745' : '1px solid #ddd',
                        cursor: 'pointer',
                      }}
                      onClick={() => setMainImage(imgUrl)}
                    />
                  </Col>
                ))
              ) : (
                <p className="text-muted mt-2">No additional images</p>
              )}
            </Row>
          </Col>

          <Col md={6}>
            <h1 className="mb-3">{product.title}</h1>
            <h3 className="text-success fw-bold mb-4">{price}</h3>
            <p className="mb-4 text-muted">{product.description}</p>

            <Button
              variant="success"
              size="lg"
              className="px-4 mb-4"
              onClick={() => console.log('Add to cart', selectedVariant)}
              disabled={!selectedVariant}
            >
              🛒 Add to Cart
            </Button>

            <div className="mb-4 p-3 border rounded bg-light">
              <h5>Options</h5>
              {product.options?.length > 0 ? (
                product.options.map(option => (
                  <Form.Group key={option.id} className="mb-3">
                    <Form.Label>{option.title}</Form.Label>
                    <Form.Select
                      value={selectedOptions[option.id] || ''}
                      onChange={e => handleOptionChange(option.id, e.target.value)}
                    >
                      <option value="">Choose a {option.title}</option>
                      {option.values.map(value => (
                        <option key={value.id} value={value.value}>
                          {value.value}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                ))
              ) : (
                <p className="text-muted">No options available</p>
              )}
            </div>

            <div className="p-3 border rounded bg-light">
              <h5>Variants</h5>
              {selectedVariant ? (
                <p className="text-success">
                  Selected Variant: {selectedVariant.title}
                </p>
              ) : (
                <p className="text-danger">No matching variant found for selected options</p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
