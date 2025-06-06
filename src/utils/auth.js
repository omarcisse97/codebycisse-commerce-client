import { medusaClient } from '../utils/client'; // Adjust path if needed

/**
 * Authenticates a customer.
 * @param {string} email - The customer's email.
 * @param {string} password - The customer's password.
 * @returns {Promise<Object>} The customer object on successful login.
 * @throws {Error} If login fails.
 */
export const login = async (email, password) => {
    try {
        const token = await medusaClient.auth.login(
            "customer",
            "emailpass",
            {
                email: email,
                password: password

            });
        const customer = await medusaClient.store.customer.retrieve();
        if(customer?.customer.has_account === true && customer?.customer.id !== null){
                    localStorage.setItem('loggedIn', "true");
                    return true;
                }

        return false;
    } catch (error) {
        console.error('Login failed:', error);
        // Re-throw the error so the calling component can catch it
        throw error;
    }
};

export const logout = async () => {
    const result = await medusaClient.auth.logout();
    localStorage.setItem('loggedIn', "false");
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
export const register = async (fullName, email, password) => {
    try {
        // Medusa's createCustomer expects first_name and last_name
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const token = await medusaClient.auth.register(
            "customer",
            "emailpass",
            {
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName
            }
        );
        await medusaClient.store.customer.create(
            {
                "email": email,
                "first_name": firstName,
                "last_name": lastName
            },
            {},
            {
                Authorization: `Bearer ${token}`
            }
        );
        return await login(email, password);
    } catch (error) {
        console.error('Registration failed:', error);
        // Re-throw the error so the calling component can catch it
        throw error;
    }
};