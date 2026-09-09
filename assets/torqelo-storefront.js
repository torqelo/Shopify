class TorqeloStorefront {
  constructor() {
    this.bindProductCards();
    this.bindCheckoutIntent();
    this.bindMobileBuyBar();
  }

  emit(name, detail = {}) {
    document.dispatchEvent(new CustomEvent(`torqelo:${name}`, { detail }));
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: `torqelo_${name}`, ...detail });
    }
  }

  bindProductCards() {
    document.addEventListener('click', (event) => {
      const productLink = event.target.closest('.card-wrapper a[href*="/products/"]');
      if (productLink) {
        this.emit('product_click', {
          product_url: productLink.pathname,
          source: document.querySelector('main[data-template]')?.dataset.template || 'storefront'
        });
      }

      const addButton = event.target.closest('product-form button[name="add"], quick-add-modal button[name="add"]');
      if (addButton) {
        const card = addButton.closest('.card-wrapper');
        this.emit('add_to_cart_intent', {
          product_title: card?.querySelector('.card__heading')?.textContent.trim() || document.querySelector('.product__title')?.textContent.trim() || '',
          source: card ? 'product_card' : 'product_page'
        });
      }
    });
  }

  bindCheckoutIntent() {
    document.addEventListener('click', (event) => {
      const checkout = event.target.closest('[name="checkout"], #checkout, .cart__checkout-button');
      if (checkout) this.emit('checkout_intent', { source: checkout.closest('cart-drawer') ? 'cart_drawer' : 'cart_page' });
    });
  }

  bindMobileBuyBar() {
    const bar = document.querySelector('[data-torqelo-mobile-buy]');
    const productForm = document.querySelector('product-info product-form');
    const primaryButton = productForm?.querySelector('button[name="add"]');
    if (!bar || !primaryButton) return;

    const barButton = bar.querySelector('button');
    barButton?.addEventListener('click', () => primaryButton.click());

    const observer = new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(primaryButton);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TorqeloStorefront(), { once: true });
} else {
  new TorqeloStorefront();
}

(() => {
  const key = 'torqeloRecentlyViewed';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
  };
  const write = (items) => {
    try { localStorage.setItem(key, JSON.stringify(items)); } catch (_) { /* Storage can be disabled. */ }
  };
  const escapeHtml = (value) => {
    const node = document.createElement('div');
    node.textContent = value || '';
    return node.innerHTML;
  };
  const productUrl = document.querySelector('meta[property="og:type"][content="product"]') && location.pathname;
  if (productUrl) {
    const product = {
      url: productUrl,
      title: document.querySelector('meta[property="og:title"]')?.content || document.title,
      image: document.querySelector('meta[property="og:image"]')?.content || '',
      price: document.querySelector('meta[property="og:price:amount"]')?.content || '',
      currency: document.querySelector('meta[property="og:price:currency"]')?.content || ''
    };
    write([product, ...read().filter((item) => item.url !== product.url)].slice(0, 12));
  }
  document.querySelectorAll('[data-recently-viewed-section]').forEach((section) => {
    const items = read().filter((item) => item.url !== location.pathname).slice(0, Number(section.dataset.limit || 5));
    if (!items.length) return;
    const grid = section.querySelector('[data-recently-viewed-grid]');
    if (!grid) return;
    grid.innerHTML = items.map((item) => `<article class="torqelo-recent-card"><a href="${escapeHtml(item.url)}">${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" width="320" height="320">` : ''}<h3>${escapeHtml(item.title)}</h3>${item.price ? `<p>${escapeHtml(item.currency)} ${escapeHtml(item.price)}</p>` : ''}</a></article>`).join('');
    section.hidden = false;
  });
})();
