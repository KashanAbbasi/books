const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_USER = process.env.ADMIN_USER || 'kashanabbasi';
const ADMIN_PASS = process.env.ADMIN_PASS || 'kashanabbabb';

function getRequiredEnv() {
  if (!SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.');
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');
  }

  return {
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY
  };
}

function getAdminCredentials(req) {
  return {
    username: req.headers['x-admin-user'] || req.body?.username || '',
    password: req.headers['x-admin-pass'] || req.body?.password || ''
  };
}

function isAdminAuthorized(req) {
  const { username, password } = getAdminCredentials(req);
  return username === ADMIN_USER && password === ADMIN_PASS;
}

function createHeaders(extraHeaders = {}) {
  const { serviceRoleKey } = getRequiredEnv();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders
  };
}

async function supabaseRequest(path, options = {}) {
  const { supabaseUrl } = getRequiredEnv();
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: createHeaders(options.headers)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || 'Supabase request failed.');
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

module.exports = {
  getRequiredEnv,
  isAdminAuthorized,
  supabaseRequest
};
