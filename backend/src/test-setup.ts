import 'dotenv/config';

// Ensure test environment defaults
process.env.DISABLE_LOGIN = 'true';
process.env.NODE_ENV = 'test';
