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

  function setStatus(message, tone = 'info') {
    const el = $('#adminStatus');
    if (!el.length) return;
    el
      .removeClass('d-none alert-info alert-danger alert-success alert-warning')
      .addClass(`alert alert-${tone}`)
      .text(message);
  }

  function clearStatus() {
    $('#adminStatus').addClass('d-none').text('');
  }

  function findBook(id) {
    return books.find((book) => book.id === id);
  }

  function resetForm() {
    $('#bookForm')[0].reset();
    $('#bookId').val('');
    $('#formTitle').text('Add New Book');
    $('#cancelEdit').addClass('d-none');
  }

  function renderTable() {
    const rows = books.map((b) => `
      <tr>
        <td>
          <strong>${escapeHtml(b.title)}</strong><br>
          <small class="text-muted">${escapeHtml(b.author)}</small>
        </td>
        <td>${escapeHtml(b.category)}</td>
        <td>$${escapeHtml(b.price)}</td>
        <td>${b.hidden ? '<span class="badge text-bg-secondary">Hidden</span>' : '<span class="badge text-bg-success">Visible</span>'}</td>
        <td>
          <div class="d-flex flex-wrap gap-1">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${escapeHtml(b.id)}">Edit</button>
            <button class="btn btn-sm btn-outline-warning toggle-btn" data-id="${escapeHtml(b.id)}">${b.hidden ? 'Show' : 'Hide'}</button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${escapeHtml(b.id)}">Remove</button>
          </div>
        </td>
      </tr>
    `).join('');

    $('#adminBookTable').html(rows || '<tr><td colspan="5" class="text-muted">No books found.</td></tr>');
  }

  function showDashboard() {
    $('#adminLoginWrap').addClass('d-none');
    $('#adminDashboard').removeClass('d-none');
    renderTable();
  }

  function showLogin() {
    $('#adminDashboard').addClass('d-none');
    $('#adminLoginWrap').removeClass('d-none');
  }

  function isAuthenticated() {
    return Boolean(window.bookStoreApi.getAdminSession());
  }

  function getPayloadFromForm(existingBook) {
    return {
      title: $('#title').val().trim(),
      author: $('#author').val().trim(),
      price: Number($('#price').val()),
      rating: Number($('#rating').val()),
      category: $('#category').val().trim(),
      cover: $('#cover').val().trim(),
      pdf: $('#pdf').val().trim(),
      description: $('#description').val().trim(),
      hidden: existingBook?.hidden ?? false
    };
  }

  async function loadBooks() {
    setStatus('Loading inventory from Supabase...', 'info');
    books = await window.bookStoreApi.fetchBooks({ admin: true });
    renderTable();
    clearStatus();
  }

  async function startAdminSession(username, password) {
    window.bookStoreApi.setAdminSession({ username, password });

    try {
      await loadBooks();
      $('#loginError').addClass('d-none');
      $('#adminLoginForm')[0].reset();
      showDashboard();
    } catch (error) {
      window.bookStoreApi.clearAdminSession();
      throw error;
    }
  }

  $(document).ready(function () {
    if (isAuthenticated()) {
      startAdminSession(
        window.bookStoreApi.getAdminSession().username,
        window.bookStoreApi.getAdminSession().password
      ).catch((error) => {
        console.error(error);
        showLogin();
        setStatus(error.message || 'Unable to load inventory from Supabase.', 'danger');
      });
    } else {
      showLogin();
    }

    $('#adminLoginForm').on('submit', async function (e) {
      e.preventDefault();
      const username = $('#adminUsername').val().trim();
      const password = $('#adminPassword').val();

      try {
        await startAdminSession(username, password);
      } catch (error) {
        console.error(error);
        $('#loginError').removeClass('d-none').text(error.message || 'Invalid admin credentials.');
      }
    });

    $('#logoutBtn').on('click', function () {
      window.bookStoreApi.clearAdminSession();
      clearStatus();
      showLogin();
    });

    $('#bookForm').on('submit', async function (e) {
      e.preventDefault();
      const id = $('#bookId').val();
      const existingBook = id ? findBook(id) : null;
      const payload = getPayloadFromForm(existingBook);

      try {
        setStatus(id ? 'Updating book in Supabase...' : 'Creating book in Supabase...', 'info');
        if (id) {
          await window.bookStoreApi.updateBook(id, payload);
        } else {
          await window.bookStoreApi.createBook(payload);
        }

        await loadBooks();
        resetForm();
        setStatus('Inventory saved to Supabase.', 'success');
      } catch (error) {
        console.error(error);
        setStatus(error.message || 'Unable to save book to Supabase.', 'danger');
      }
    });

    $(document).on('click', '.edit-btn', function () {
      const book = findBook($(this).data('id'));
      if (!book) return;
      $('#formTitle').text('Edit Book');
      $('#cancelEdit').removeClass('d-none');
      $('#bookId').val(book.id);
      Object.entries(book).forEach(([k, v]) => {
        if ($('#' + k).length) $('#' + k).val(v);
      });
    });

    $(document).on('click', '.toggle-btn', async function () {
      const id = $(this).data('id');
      const book = findBook(id);
      if (!book) return;

      try {
        setStatus('Updating visibility in Supabase...', 'info');
        await window.bookStoreApi.updateBook(id, { hidden: !book.hidden });
        await loadBooks();
        setStatus('Visibility updated in Supabase.', 'success');
      } catch (error) {
        console.error(error);
        setStatus(error.message || 'Unable to update visibility.', 'danger');
      }
    });

    $(document).on('click', '.delete-btn', async function () {
      const id = $(this).data('id');
      try {
        setStatus('Deleting book from Supabase...', 'warning');
        await window.bookStoreApi.deleteBook(id);
        await loadBooks();
        setStatus('Book deleted from Supabase.', 'success');
      } catch (error) {
        console.error(error);
        setStatus(error.message || 'Unable to delete book.', 'danger');
      }
    });

    $('#cancelEdit').on('click', resetForm);
  });
})();
