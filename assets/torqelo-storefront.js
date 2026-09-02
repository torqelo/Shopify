(() => {
  const KEY = 'torqeloRecentlyViewed';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } };
  const esc = (value) => { const node = document.createElement('div'); node.textContent = value || ''; return node.innerHTML; };
  const productUrl = document.querySelector('meta[property="og:type"][content="product"]') && location.pathname;
  if (productUrl) {
    const product = { url: productUrl, title: document.querySelector('meta[property="og:title"]')?.content || document.title, image: document.querySelector('meta[property="og:image"]')?.content || '', price: document.querySelector('meta[property="og:price:amount"]')?.content || '', currency: document.querySelector('meta[property="og:price:currency"]')?.content || '' };
    localStorage.setItem(KEY, JSON.stringify([product, ...read().filter((item) => item.url !== product.url)].slice(0, 12)));
  }
  document.querySelectorAll('[data-recently-viewed-section]').forEach((section) => {
    const items = read().filter((item) => item.url !== location.pathname).slice(0, Number(section.dataset.limit || 5));
    if (!items.length) return;
    section.querySelector('[data-recently-viewed-grid]').innerHTML = items.map((item) => `<article class="torqelo-recent-card"><a href="${esc(item.url)}">${item.image ? `<img src="${esc(item.image)}" alt="" loading="lazy" width="320" height="320">` : ''}<h3>${esc(item.title)}</h3>${item.price ? `<p>${esc(item.currency)} ${esc(item.price)}</p>` : ''}</a></article>`).join('');
    section.hidden = false;
  });
})();
