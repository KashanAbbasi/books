(function () {
  const ADMIN_STORAGE_KEY = 'shah_writes_admin_session';

  function getAdminSession() {
    const raw = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setAdminSession(credentials) {
    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(credentials));
  }

  function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  async function request(path, options) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  async function fetchBooks({ admin = false } = {}) {
    const session = admin ? getAdminSession() : null;
    const headers = session
      ? {
          'x-admin-user': session.username,
          'x-admin-pass': session.password
        }
      : {};

    const data = await request('/api/books', { method: 'GET', headers });
    return data.books || [];
  }

  async function createBook(payload) {
    const session = getAdminSession();
    const data = await request('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-user': session?.username || '',
        'x-admin-pass': session?.password || ''
      },
      body: JSON.stringify({ book: payload })
    });
    return data.book;
  }

  async function updateBook(id, payload) {
    const session = getAdminSession();
    const data = await request(`/api/books?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-user': session?.username || '',
        'x-admin-pass': session?.password || ''
      },
      body: JSON.stringify({ book: payload })
    });
    return data.book;
  }

  async function deleteBook(id) {
    const session = getAdminSession();
    await request(`/api/books?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'x-admin-user': session?.username || '',
        'x-admin-pass': session?.password || ''
      }
    });
  }

  window.bookStoreApi = {
    getAdminSession,
    setAdminSession,
    clearAdminSession,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook
  };
})();
