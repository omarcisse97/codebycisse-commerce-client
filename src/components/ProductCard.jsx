import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { medusaClient } from '../utils/client';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';

export default function ProductCard(props) {
    const [region, setRegion] = useState(null);
    const [formattedPricet, setFormattedPricet] = useState('0.0');
    const formattedPrice = '0.0'



    useEffect(() => {
        const getRegionById = async () => {
            const temp = await medusaClient.store.region.retrieve(props.regionid);
            setRegion(temp);
        }

        getRegionById();
    }, [props.regionid]);

    useEffect(() => {
        const getCorrectFormat = (currency_, amount_) => {
            const currenciesWithSubunits = ["usd", "eur", "cad"];
            const normalizedCurrency = currency_.toLowerCase();

            const divisor = currenciesWithSubunits.includes(normalizedCurrency) ? 100 : 1;

            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: normalizedCurrency.toUpperCase(),
            }).format(amount_ / divisor);
        }
        if (region) {
            setFormattedPricet(null);
            setFormattedPricet(new Intl.NumberFormat('en-US', { style: 'currency', currency: region.region.currency_code }).format(props.price / 100))
            // setFormattedPricet(getCorrectFormat(region.region.currency_code,props.price));
        }


    }, [region])



    return (
        <Card className="h-100 shadow-sm product-card border-0">
            <Card.Img variant="top" src={props.thumbnail} alt={props.title} style={{ objectFit: 'cover', height: '200px' }} />
            <Card.Body className="d-flex flex-column justify-content-between">
                <Card.Title>{props.title}</Card.Title>
                <Card.Text className="text-success fw-bold">
                    {formattedPricet ?? formattedPrice}
                </Card.Text>
                <Link to={`/products/${props.productId}`} className="btn btn-sm btn-outline-dark mt-auto">
                    View Details
                </Link>
            </Card.Body>
        </Card>

    )
}

ProductCard.propTypes = {
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    productId: PropTypes.string.isRequired
};

