// Frontend constants and enums
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL', 'JPY'];

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile'
  }
};

export const APP_CONFIG = {
  NAME: 'SwapCycle',
  DEFAULT_CURRENCY: 'USD',
  MAX_FILE_SIZE: 16777216 // 16MB
};

export default { CURRENCIES, API_ENDPOINTS, APP_CONFIG };
