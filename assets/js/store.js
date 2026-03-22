(function () {
  let books = [];

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('\"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setStatus(message, tone) {
    const el = $('#storeStatus');
    if (!el.length) return;
    el
      .removeClass('d-none alert-info alert-danger alert-success')
      .addClass(`alert alert-${tone}`)
      .text(message);
  }

  function renderBooks() {
    const search = $('#searchInput').val().toLowerCase().trim();
    const selectedCategory = $('#categoryFilter').val();

    const filtered = books.filter((b) => {
      const passVisibility = !b.hidden;
      const passSearch = b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search);
      const passCategory = selectedCategory === 'all' || b.category === selectedCategory;
      return passVisibility && passSearch && passCategory;
    });

    const html = filtered.length
      ? filtered.map((book) => `
        <div class="col-md-6 col-xl-4">
          <div class="book-card h-100 shadow-sm">
            <img src="${escapeHtml(book.cover)}" class="w-100 book-cover" alt="${escapeHtml(book.title)}">
            <div class="p-3 d-flex flex-column">
              <h5 class="mb-1">${escapeHtml(book.title)}</h5>
              <small class="text-muted mb-2">${escapeHtml(book.author)} • ${escapeHtml(book.category)}</small>
              <p class="small text-muted flex-grow-1">${escapeHtml(book.description)}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="price-tag">$${escapeHtml(book.price)}</span>
                <span>⭐ ${escapeHtml(book.rating)}/5</span>
              </div>
              <div class="d-grid mt-3 gap-2">
                <button class="btn btn-brand buy-btn" data-id="${escapeHtml(book.id)}">Buy & Download</button>
                <a class="btn btn-outline-secondary" href="${escapeHtml(book.pdf)}" target="_blank" rel="noopener noreferrer">Preview PDF</a>
              </div>
            </div>
          </div>
        </div>
      `).join('')
      : '<p class="text-muted">No books match your filters.</p>';

    $('#bookGrid').html(html);
  }

  function renderCategories() {
    const categories = [...new Set(books.map((b) => b.category))];
    const options = ['<option value="all">All Categories</option>']
      .concat(categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`))
      .join('');
    $('#categoryFilter').html(options);
  }

  async function loadBooks() {
    try {
      setStatus('Loading books from Supabase...', 'info');
      books = await window.bookStoreApi.fetchBooks();
      renderCategories();
      renderBooks();
      $('#storeStatus').addClass('d-none');
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Unable to load books from Supabase.', 'danger');
      $('#bookGrid').html('<p class="text-danger mb-0">Unable to load books right now.</p>');
    }
  }

  $(document).ready(function () {
    $('#year').text(new Date().getFullYear());

    $('#searchInput, #categoryFilter').on('input change', renderBooks);

    $(document).on('click', '.buy-btn', function () {
      const id = $(this).data('id');
      const book = books.find((item) => item.id === id);
      if (!book) return;
      $('#checkoutContent').html(`
        <p>Thank you for purchasing <strong>${escapeHtml(book.title)}</strong>.</p>
        <p>Total paid: <strong>$${escapeHtml(book.price)}</strong></p>
        <p><a href="${escapeHtml(book.pdf)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-brand">Download eBook PDF</a></p>
      `);
      new bootstrap.Modal('#checkoutModal').show();
    });

    loadBooks();
  });
})();
