import { medusaClient } from '../utils/client';

export const updateName = async (name) => {
    const [first_name = '', last_name = ''] = name.trim().split(' ');

    try {
        const result = await medusaClient.store.customer.update({
            first_name: first_name,
            last_name: last_name
        });

        return result;
    } catch (error) {
        console.error('Unable to update user first name. error -> ', error);
    }
}
export const updateCompany = async (company_name) => {
    try {
        const result = await medusaClient.store.customer.update( {
            company_name: company_name,
        });
        return result;
    } catch (error) {
        console.error('Unable to update user company name. error -> ', error);
    }
}
export const updatePhone = async (phone) => {
    try {
        const result = await medusaClient.store.customer.update({
            phone: phone,
        });
        return result;
    } catch (error) {
        console.error('Unable to update user phone. error -> ', error);
    }
}
export const updateCustomerDetails = async (data) => {
    try {
        const results = [];

        for (let field in data) {
            switch (field) {
                case 'name':
                    const nameResult = await updateName(data.name);
                    results.push(nameResult)
                    break;
                case 'company_name':
                    const companyResult = await updateCompany(data.company_name);
                    results.push(companyResult);
                    break;
                case 'phone':
                    const phoneResult = await updatePhone(data.phone);
                    results.push(phoneResult);
                    break;
                default:
                    console.error('Cannot find update field -> ', field);
                    break;
            }
        }

        return results;

    } catch (error) {
        console.error('an error occured. Please check details -> ', error);
    }
};
