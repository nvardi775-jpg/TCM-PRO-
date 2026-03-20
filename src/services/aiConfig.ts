export const getGeminiApiKey = () => {
  return localStorage.getItem('GEMINI_EXTERNAL_KEY') || process.env.GEMINI_API_KEY || '';
};

export const updateGeminiApiKey = (key: string) => {
  localStorage.setItem('GEMINI_EXTERNAL_KEY', key);
  window.location.reload();
};

export const resetGeminiApiKey = () => {
  localStorage.removeItem('GEMINI_EXTERNAL_KEY');
  window.location.reload();
};

export const getSuperAdminPassword = () => {
  return localStorage.getItem('SUPER_ADMIN_PASSWORD') || '';
};

export const setSuperAdminPassword = (password: string) => {
  localStorage.setItem('SUPER_ADMIN_PASSWORD', password);
};

export const checkSuperAdminPassword = (password: string) => {
  const stored = getSuperAdminPassword();
  if (!stored) return true; // If no password set, allow access
  return stored === password;
};
