import React from 'react';
import { MedusaVariant } from './MedusaVariant';
import { MedusaCategory } from './MedusaCategory';
export class MedusaProduct {
    constructor(id, title, handle, thumbnail, variants, categories, description = '', images = []) {
        this._id = id || '';
        this._title = title || '';
        this._handle = handle || '';
        this._thumbnail = thumbnail || '';
        this._variants = [];
        this._categories = [];
        this._description = description;
        this._images = [...images];

        if (variants && Array.isArray(variants) && variants?.length > 0) {
            for (let i = 0; i < variants.length; i++) {
                const variant = new MedusaVariant(variants[i]) || null;
                if (variant) {
                    this._variants.push(variant);
                }
            }
        }
        if (categories && Array.isArray(categories) && categories?.length > 0) {
            for (let i = 0; i < categories?.length; i++) {
                const category = new MedusaCategory(
                    categories[i]?.id,
                    categories[i]?.handle,
                    categories[i]?.name,
                    `/${categories[i]?.handle}`,
                    categories[i]?.handle,
                    categories[i]?.description
                ) || null;
                if (category) {
                    this._categories.push(category);
                }

            }
        }
    }

    getVariantBy(type = 'id', field) {
        switch (type.toLowerCase()) {
            case 'id': return this.getVariantByID(field);
            case 'index': return this.getVariantByIndex(field);
            default: return null;
        }
    }

    getVariantByID(id) {
        if (this._variants && Array.isArray(this._variants)) {
            const variant = this._variants.find(items => items?.id === id);
            if (variant) {
                return variant;
            }
        }
        return 'Unavailable';
    }
    getVariantByIndex(idx) {
        if (this._variants && Array.isArray(this._variants) && this._variants?.length > 0) {
            return this._variants[idx];
        }
       
        return 'Unavailable';
    }

    getVariantFormattedPriceByIndex(idx = 0) {
        return this.getVariantByIndex(idx)?.fetchFormattedPrice();
    }

    getVariantFormattedPriceByVariantId(id) {
        return this.getVariantByID(id)?.fetchFormattedPrice();
    }
    getVariantFormattedPrice(type, field) {
        return this.getVariantBy(type, field)?.fetchFormattedPrice();
    }
    getVariantsWithPrices() {
        if (this._variants && Array.isArray(this._variants)) {
            const variantsWithPrices = this._variants.filter(
                variant => variant._prices?.some(price => price.havePrice())
            );

            return variantsWithPrices || [];
        }
    }
    havePrice() {
        return this.getVariantsWithPrices()?.length > 0;
    }
}