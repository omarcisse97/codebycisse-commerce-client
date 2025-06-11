import { medusaClient } from '../utils/client'; // Adjust path if needed

/**
 * Authenticates a customer.
 * @param {string} email - The customer's email.
 * @param {string} password - The customer's password.
 * @returns {Promise<Object>} The customer object on successful login.
 * @throws {Error} If login fails.
 */
export const login_ = async (email, password) => {
    try {
        const token = await medusaClient.auth.login(
            "customer",
            "emailpass",
            {
                email: email,
                password: password

            });
        const customer = await medusaClient.store.customer.retrieve();
        if (customer?.customer.has_account === true && customer?.customer.id !== null) {

            return true;
        }

        return false;
    } catch (error) {
        console.error('Login failed:', error);
        // Re-throw the error so the calling component can catch it
        throw error;
    }
};

export const logout_ = async () => {
    const result = await medusaClient.auth.logout();
    return result;
}

/**
 * Registers a new customer.
 * @param {string} fullName - The customer's full name.
 * @param {string} email - The customer's email.
 * @param {string} password - The customer's password.
 * @returns {Promise<Object>} The customer object on successful registration.
 * @throws {Error} If registration fails.
 */
export const register_ = async (firstName_,lastName_, email_, password_, phone_ = '') => {
    try {
        
        const fieldsCus = {
            email: email_,
            first_name: firstName_,
            last_name: lastName_,
            password: password_
        }
        if(phone_ !== ''){
            fieldsCus['phone'] = phone_;
        }
        
        const token = await medusaClient.auth.register(
            "customer",
            "emailpass",
            {...fieldsCus}
        );
        
        const etc =  {
            email: email_,
            first_name: firstName_,
            last_name: lastName_,
        }
        if(phone_ !== ''){
            etc['phone'] = phone_;
        }
        await medusaClient.store.customer.create(
            {
                ...etc
            },
            {},
            {
                Authorization: `Bearer ${token}`
            }
        );
        // return await login_(email, password);
        return true;
    } catch (error) {
        console.error('Registration failed:', error);
        // Re-throw the error so the calling component can catch it
        throw error;
    }
};