(function () {
  const config = window.APP_CONFIG || {};
  const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  function ensureClient() {
    if (!hasSupabaseConfig) {
      throw new Error('Missing Supabase configuration. Set window.APP_CONFIG.supabaseUrl and window.APP_CONFIG.supabaseAnonKey in assets/js/config.js.');
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase client library is not loaded.');
    }

    if (!window.supabaseClient) {
      window.supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    }

    return window.supabaseClient;
  }

  async function fetchBooks() {
    const client = ensureClient();
    const { data, error } = await client
      .from('books')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function createBook(payload) {
    const client = ensureClient();
    const { data, error } = await client
      .from('books')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function updateBook(id, payload) {
    const client = ensureClient();
    const { data, error } = await client
      .from('books')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function deleteBook(id) {
    const client = ensureClient();
    const { error } = await client
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  window.bookStoreApi = {
    hasSupabaseConfig,
    ensureClient,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook
  };
})();
