import { MedusaProduct } from "./MedusaProduct";
import { medusaClient } from "../../utils/client";
import React from 'react';
export class MedusaCategory {
    constructor(
        id = '',
        handle = '',
        label = 'All Products',
        href = '/',
        value = 'all',
        description = '',
        parent_category_id = '',
        parent_category = null,
        category_children = null,
        metadata = null,
        created_at = '',
        updated_at = '',
    ) {
        this._id = id || '';
        this._handle = handle || '';
        this._label = label || '';
        this._href = href || '';
        this._value = value || '';
        this._description = description || '';
        this._parent_category_id = parent_category_id || '';
        this._parent_category = parent_category || '';
        this._category_children = category_children || null;
        this._metadata = metadata || null;
        this._created_at = created_at || '';
        this._updated_at = updated_at || '';
        this._products = null;
        this._productsCount = 0;

    }

    async fetchAllMedusaProducts(region_id) {
        try {
            const allProducts = [];
            const query = { region_id: region_id };
            if (this && this._value !== 'all' && this._id && this._id !== '') {
                query['category_id'] = this._id;
            }
            const offsetCount = 0;
            const totalCount = 0;
            const hasMorePages = true
            

            while (hasMorePages) {
                const { products: pageProducts, count } = await medusaClient.store.product.list({ limit: 100, offset: offsetCount, ...query });
                allProducts.push(...pageProducts);
                totalCount = count; // Total count is returned by the first page
                offsetCount += pageProducts.length;
                hasMorePages = pageProducts.length === 100 && offsetCount < totalCount;
            }

            this._productsCount = allProducts?.length;
            if (this._productsCount > 0) {
                this._products = null;
                this._products = [];
                for (let i = 0; i < this._productsCount; i++) {
                    const tempProduct = new MedusaProduct(
                        allProducts[i]?.id,
                        allProducts[i]?.title,
                        allProducts[i]?.handle,
                        allProducts[i]?.thumbnail,
                        [...allProducts[i]?.variants],
                        [...allProducts[i]?.categories],
                        allProducts[i]?.description,
                        allProducts[i]?.images
                    ) || null;
                    if(tempProduct){
                        this._products.push(tempProduct);
                    }
                    
                }
            }
        } catch (error) {
            console.error('Error fetching all products for count:', error);
            this._products = [];
        }
    }
    getProductCount(){
        return this._productsCount;
    }

}