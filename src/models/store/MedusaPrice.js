export class MedusaPrice{
    constructor(calculated_price){
        this._amount = calculated_price?.calculated_amount || 0;
        this._currency_code = calculated_price?.currency_code || 'usd';
    }
    havePrice(){
        if(this._amount && this._currency_code){
            return true;
        }
    
        return false;
    }

    formatPrice() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this._currency_code,
        }).format(this._amount / 100);
    }
    getFormattedPriceValue(){
        
        return this.havePrice() === true? this.formatPrice() :'Unavailable'
    }
    
}