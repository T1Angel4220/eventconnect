const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export { validateEmail, generateResetCode };
