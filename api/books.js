const { isAdminAuthorized, supabaseRequest } = require('./_supabase');

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  try {
    const isAdmin = isAdminAuthorized(req);

    if (req.method === 'GET') {
      const query = isAdmin
        ? '/rest/v1/books?select=*&order=created_at.asc'
        : '/rest/v1/books?select=*&hidden=is.false&order=created_at.asc';
      const books = await supabaseRequest(query, { method: 'GET' });
      return sendJson(res, 200, { books });
    }

    if (!isAdmin) {
      return sendJson(res, 401, { error: 'Admin authorization required.' });
    }

    if (req.method === 'POST') {
      const payload = req.body?.book;
      if (!payload) {
        return sendJson(res, 400, { error: 'Missing book payload.' });
      }

      const created = await supabaseRequest('/rest/v1/books', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload)
      });

      return sendJson(res, 201, { book: created?.[0] || null });
    }

    if (req.method === 'PATCH') {
      const id = req.query?.id;
      const payload = req.body?.book;
      if (!id || !payload) {
        return sendJson(res, 400, { error: 'Missing id or book payload.' });
      }

      const updated = await supabaseRequest(`/rest/v1/books?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload)
      });

      return sendJson(res, 200, { book: updated?.[0] || null });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id) {
        return sendJson(res, 400, { error: 'Missing id.' });
      }

      await supabaseRequest(`/rest/v1/books?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    return sendJson(res, error.status || 500, {
      error: error.message || 'Unexpected server error.',
      details: error.payload || null
    });
  }
};
