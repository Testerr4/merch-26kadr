// main.js — для index.html
// Добавляет товар в localStorage и обновляет счётчик в шапке

document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'merch_cart_v1';

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const cart = readCart();
    const total = cart.reduce((s, i) => s + (i.qty || 0), 0);
    el.textContent = total;
  }

  function addToCart(productEl) {
    const id = productEl.dataset.id;
    const name = productEl.dataset.name || productEl.querySelector('h3')?.textContent || 'Товар';
    const price = Number(productEl.dataset.price || productEl.querySelector('.price')?.textContent.replace(/\D/g,'') || 0);
    const image = productEl.dataset.image || productEl.querySelector('img')?.src || '';
    if (!id) return;

    const cart = readCart();
    const idx = cart.findIndex(it => String(it.id) === String(id));
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    } else {
      cart.push({ id: String(id), name, price, image, qty: 1 });
    }
    writeCart(cart);
  }

  // Обработчик клика на кнопки "В корзину"
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    const product = btn.closest('.product');
    if (!product) return;

    addToCart(product);

    // краткая визуальная подсказка
    btn.classList.add('btn--tapped');
    setTimeout(() => btn.classList.remove('btn--tapped'), 180);
  });

  // Обновление при изменениях localStorage в других вкладках
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) updateCartCount();
  });

  // начальная установка счётчика
  updateCartCount();
});
