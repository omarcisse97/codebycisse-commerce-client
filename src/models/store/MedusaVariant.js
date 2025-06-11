
import { MedusaPrice } from "./MedusaPrice";
export class MedusaVariant{
    constructor(variantObj){
        this._id = variantObj?.id || '';
        this._title = variantObj?.title || '';
        this._prices = [];
        if(variantObj?.calculated_price){
            const tempPrice = new MedusaPrice(variantObj?.calculated_price) || null;
            if(tempPrice){
                this._prices.push(tempPrice);
            }
        }
    }

    fetchFormattedPrice(){
        if(this._prices && this._prices[0]){
           
            return this._prices[0].getFormattedPriceValue();
        }
        return 'Unavailable';
    }
}