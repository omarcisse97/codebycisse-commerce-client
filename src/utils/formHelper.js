/**
 * Validates a full name.
 * Checks if the name is not empty and contains at least two words (suggesting first and last name).
 * @param {string} fullName - The full name string to validate.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === "") {
    return { status: false, errorMsg: "Full name cannot be empty." };
  }

  // Check if it contains at least two words (e.g., "John Doe")
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return { status: false, errorMsg: "Please enter both first and last name." };
  }

  // Optional: Check for invalid characters (e.g., numbers, special symbols)
  // This regex allows letters, spaces, hyphens, and apostrophes.
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(fullName)) {
    return { status: false, errorMsg: "Full name can only contain letters, spaces, hyphens, and apostrophes." };
  }

  return { status: true, errorMsg: "" };
};

/**
 * Validates an email address using a basic regex pattern.
 * @param {string} email - The email string to validate.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { status: false, errorMsg: "Email address cannot be empty." };
  }

  // A common regex for email validation. More robust patterns exist but this is good for most cases.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: false, errorMsg: "Please enter a valid email address (e.g., user@example.com)." };
  }

  return { status: true, errorMsg: "" };
};

/**
 * Validates a password and confirms it against a confirmation password.
 * Checks for minimum length, and requires confirmation password to match.
 * @param {string} password - The password string to validate.
 * @param {string} confirmPassword - The confirmation password string.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validatePassword = (password, confirmPassword = "") => {
  if (!password || password.trim() === "") {
    return { status: false, errorMsg: "Password cannot be empty." };
  }

  // Minimum length check
  const minLength = 8;
  if (password.length < minLength) {
    return { status: false, errorMsg: `Password must be at least ${minLength} characters long.` };
  }

  // Optional: Add complexity requirements (uncomment as needed)
  // if (!/[A-Z]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one uppercase letter." };
  // }
  // if (!/[a-z]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one lowercase letter." };
  // }
  // if (!/[0-9]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one number." };
  // }
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   return { status: false, errorMsg: "Password must contain at least one special character." };
  // }

  // Confirm password check (only if confirmPassword is provided)
  if (confirmPassword !== undefined && confirmPassword !== null) {
    if (password !== confirmPassword) {
      return { status: false, errorMsg: "Passwords do not match." };
    }
  }

  return { status: true, errorMsg: "" };
};
/**
 * Validates a phone number.
 * Accepts various common international formats but checks for at least 10 digits.
 * @param {string} phone - The phone number to validate.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || phone.trim() === "") {
    return { status: false, errorMsg: "Phone number cannot be empty." };
  }

  // Remove common formatting characters and check if it contains at least 10 digits
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return { status: false, errorMsg: "Phone number must contain at least 10 digits." };
  }

  // Optional: Validate common international format (+, numbers, space, dash, parentheses)
  if (!/^[+]?[\d\s()-]{10,20}$/.test(phone)) {
    return { status: false, errorMsg: "Phone number format is invalid." };
  }

  return { status: true, errorMsg: "" };
};
/**
 * Validates a company name.
 * Checks if the name is not empty and contains only valid characters.
 * @param {string} companyName - The company name string to validate.
 * @returns {{ status: boolean, errorMsg: string }} An object with validation status and error message.
 */
export const validateCompany = (companyName) => {
  if (!companyName || companyName.trim() === "") {
    return { status: false, errorMsg: "Company name cannot be empty." };
  }

  // Optional: Validate allowed characters (letters, numbers, spaces, &, ., -, and apostrophes)
  if (!/^[a-zA-Z0-9\s&.'-]+$/.test(companyName)) {
    return { status: false, errorMsg: "Company name contains invalid characters." };
  }

  return { status: true, errorMsg: "" };
};
