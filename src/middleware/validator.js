const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 special character (!@#$%^&* etc.)' };
  }
  return { valid: true, message: 'Password is valid' };
};

const validatePaymentData = (data) => {
  const required = ['museumHeader', 'date', 'nationality', 'nationalityPrice', 'document', 'documentNumber', 'totalPrice'];
  const missing = [];
  
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing: missing
  };
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema(req.body);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ' + result.missing.join(', ')
      });
    }
    
    next();
  };
};

module.exports = {
  validateEmail,
  validateOTP,
  validatePassword,
  validatePaymentData,
  validateRequest
};
