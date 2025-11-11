// cart.js — отрисовка корзины, изменение кол-ва, удаление, очистка

document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'merch_cart_v1';

  const root = document.getElementById('cart-root');
  const actions = document.getElementById('cart-actions');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const clearBtn = document.getElementById('clear-btn');
  const headerCountEl = document.getElementById('cart-count');

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    render();
    updateHeaderCount();
  }
  function updateHeaderCount() {
    if (!headerCountEl) return;
    const total = readCart().reduce((s, it) => s + (it.qty || 0), 0);
    headerCountEl.textContent = total;
  }

  function formatPrice(n) {
    return Number(n).toLocaleString('ru-RU') + ' ₽';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function render() {
    const cart = readCart();
    if (!root) return;

    root.innerHTML = '';

    if (!cart.length) {
      actions?.classList.add('hidden');
      root.innerHTML = `
        <div class="empty">
          <p class="small">Ваша корзина пуста.</p>
          <p style="margin-top:12px;"><a href="index.html" class="btn">Вернуться к покупкам</a></p>
        </div>
      `;
      totalEl && (totalEl.textContent = formatPrice(0));
      updateHeaderCount();
      return;
    }

    actions?.classList.remove('hidden');

    cart.forEach(item => {
      const itemWrap = document.createElement('div');
      itemWrap.className = 'cart-item';
      itemWrap.dataset.id = item.id;

      itemWrap.innerHTML = `
        <img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name)}" />
        <div class="meta">
          <h4>${escapeHtml(item.name)}</h4>
          <p class="price">${formatPrice(item.price)}</p>
          <div class="qty-control">
            <button class="btn qty-decrease" data-id="${escapeHtml(item.id)}">−</button>
            <span class="small">Кол-во: <strong class="item-qty">${item.qty}</strong></span>
            <button class="btn qty-increase" data-id="${escapeHtml(item.id)}">+</button>
            <button class="remove-btn" data-id="${escapeHtml(item.id)}" style="margin-left:8px;">Удалить</button>
          </div>
        </div>
        <div style="min-width:90px;text-align:right;">
          <p class="small">Сумма</p>
          <p style="font-weight:700; margin:6px 0;">${formatPrice(item.price * item.qty)}</p>
        </div>
      `;

      root.appendChild(itemWrap);
    });

    const total = cart.reduce((s, it) => s + it.price * (it.qty || 0), 0);
    totalEl && (totalEl.textContent = formatPrice(total));
    updateHeaderCount();
  }

  // Делегирование: обработка кликов + / - / Удалить в корневом элементе
  root?.addEventListener('click', (e) => {
    const inc = e.target.closest('.qty-increase');
    const dec = e.target.closest('.qty-decrease');
    const rem = e.target.closest('.remove-btn');

    if (inc) {
      const id = inc.dataset.id;
      changeQty(id, +1);
    } else if (dec) {
      const id = dec.dataset.id;
      changeQty(id, -1);
    } else if (rem) {
      const id = rem.dataset.id;
      removeItem(id);
    }
  });

  function changeQty(id, delta) {
    const cart = readCart();
    const idx = cart.findIndex(it => String(it.id) === String(id));
    if (idx === -1) return;
    cart[idx].qty = Math.max(0, (cart[idx].qty || 0) + delta);
    if (cart[idx].qty === 0) cart.splice(idx, 1);
    writeCart(cart);
  }

  function removeItem(id) {
    const cart = readCart().filter(it => String(it.id) !== String(id));
    writeCart(cart);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    render();
    updateHeaderCount();
  }

  checkoutBtn?.addEventListener('click', () => {
    const cart = readCart();
    if (!cart.length) {
      alert('Корзина пуста');
      return;
    }
    alert('Спасибо! Это демо — здесь должна быть форма заказа и платёж.');
    // Если хотите — очистим корзину после "заказа":
    // clearCart();
  });

  clearBtn?.addEventListener('click', () => {
    if (confirm('Очистить корзину?')) clearCart();
  });

  // Если localStorage изменился в другой вкладке — перерендерим
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) render();
  });

  // первый рендер
  render();
});
