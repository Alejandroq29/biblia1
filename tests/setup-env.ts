const env = process.env as Record<string, string | undefined>;

env.NODE_ENV = 'test';
env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/biblia_kids_test';
env.REDIS_URL = 'redis://localhost:6379';
env.APP_BASE_URL = 'http://localhost:3000';
env.OAUTH_PROVIDER_NAME = 'test-provider';
env.OAUTH_AUTHORIZATION_URL = 'https://example.com/oauth/authorize';
env.OAUTH_TOKEN_URL = 'https://example.com/oauth/token';
env.OAUTH_ISSUER = 'https://example.com';
env.OAUTH_CLIENT_ID = 'client-id';
env.OAUTH_CLIENT_SECRET = 'client-secret';
env.OAUTH_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
env.SESSION_SECRET = '12345678901234567890123456789012';
env.BYPASS_AUTH = 'false';
env.BYPASS_ACCESS_CONTROL = 'false';
