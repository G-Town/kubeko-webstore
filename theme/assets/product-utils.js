window.ProductUtils = {
  _actionHandlers: {},

  registerAction(action, handler) {
    this._actionHandlers[action] = handler;
  },

  init() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const handler = this._actionHandlers[action];
      if (handler) handler(btn);
    });
  }
};

ProductUtils.getImagesForVariant = function(variant, allImages, allVariants) {
  if (!variant) return [];

  const featuredSrc = (variant.featured_image && (variant.featured_image.src || variant.featured_image)) || null;
  if (!featuredSrc) return [];

  const extractUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.src) return img.src;
    return '';
  };

  const urls = allImages.map(extractUrl);
  const startIndex = urls.findIndex(u => u && u.includes(featuredSrc.replace(/^\/\//, '')));

  if (startIndex === -1) return [featuredSrc];

  const result = [];
  for (let i = startIndex; i < urls.length; i++) {
    const u = urls[i];
    if (!u) continue;
    const isAnotherFeatured = allVariants.some(other => {
      if (!other.featured_image) return false;
      const otherSrc = (other.featured_image.src || other.featured_image);
      if (!otherSrc) return false;
      return otherSrc === u && otherSrc !== featuredSrc;
    });
    if (i > startIndex && isAnotherFeatured) break;
    result.push(extractUrl(allImages[i]));
  }

  return result.length ? result : [featuredSrc];
};

// careful here to exactly match the URL format of product-card-preloads
ProductUtils.buildImageUrl = function(url, width) {
  if (!url) return '';
  // const [base, v] = url.split('?');
  // const newUrl = `${base}?format=webp&${v}&width=${width}`
  // return newUrl;
  const u = new URL(url, window.location.origin);
  const v = u.searchParams.get('v');

  let query = 'format=webp&';
  if (v) query += `v=${v}&`;
  query += `width=${width}`;

  return `${u.origin}${u.pathname}?${query}`;
};

ProductUtils.buildSrcset = function(url, widths) {
  if (!url) return '';
  return widths
    .map(w => `${ProductUtils.buildImageUrl(url, w)} ${w}w`)
    .join(', ');
};

ProductUtils.setProgressiveImage = function(img, url, widths, sizes) {
  img.srcset = '';
  img.src = ProductUtils.buildImageUrl(url, 100);
  img.dataset.src = ProductUtils.buildImageUrl(url, widths[0]);
  img.dataset.srcset = ProductUtils.buildSrcset(url, widths);
  img.sizes = sizes;
  delete img.dataset.highResLoaded;
  img.classList.remove('blur-none');
  img.classList.add('blur-up', 'blur-sm');
  
  setTimeout(() => {
    window.loadHighResImage(img);
  }, 100);
};

document.addEventListener('DOMContentLoaded', () => {
  ProductUtils.init();

  document.addEventListener('click', function(event) {
    const chip = event.target.closest('.color-chip');
    if (!chip) return;

    const productCardElement = chip.closest('[data-product-card-id]');
    if (!productCardElement) return;
    
    event.stopPropagation();

    productCardElement.querySelectorAll('.color-chip-container').forEach(c => c.classList.remove('active'));
    chip.closest('.color-chip-container').classList.add('active');
  });
});