window.ProductCardObject = window.ProductCardObject || {

  productDataCache: {},

  buildImageUrl: function(baseUrl, width) {
    return ProductUtils.buildImageUrl(baseUrl, width);
  },

  buildSrcset: function(baseUrl) {
    return ProductUtils.buildSrcset(baseUrl, [300, 500, 700]);
  },

  getImagesForVariant: function(variant, allImages, allVariants) {
    return ProductUtils.getImagesForVariant(variant, allImages, allVariants);
  },

  buildSlide: function(imageUrl, altText, index, productId, sizes, progressive = false) {
    // const gallery = document.getElementById(`gallery-${productId}`);

    const slide = document.createElement('div');
    slide.className = 'product-card-slide';

    // Force exact integer pixel width to prevent sub-pixel alignment issues
    // if (gallery) {
    //   slide.style.width = `${Math.round(gallery.clientWidth)}px`;
    // }

    const img = document.createElement('img');
    img.id = `gallery-image-${index}-${productId}`;
    img.alt = altText;
    img.sizes = sizes;
    img.loading = index === 0 ? 'eager' : 'lazy';
    // img.srcset = this.buildSrcset(imageUrl);
    // img.src = this.buildImageUrl(imageUrl, 400);

    if (progressive) {
      img.src = ProductUtils.buildImageUrl(imageUrl, 40);
      img.dataset.src = ProductUtils.buildImageUrl(imageUrl, 400);
      img.dataset.srcset = ProductUtils.buildSrcset(imageUrl, [500, 700, 900]);
      img.classList.add('blur-up');
    } else {
      img.srcset = ProductUtils.buildSrcset(imageUrl, [500, 700, 900]);
      img.src = ProductUtils.buildImageUrl(imageUrl, 400);
    }

    slide.appendChild(img);
    return slide;
  },

  appendRemainingSlides: function(productId, images, altText, sizes) {
    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return;

    if (gallery.dataset.initialized) return;
    gallery.dataset.initialized = 'true';

    for (let i = 1; i < images.length; i++) {
      const slide = this.buildSlide(images[i], altText, i, productId, sizes);
      gallery.appendChild(slide);
    }

    this.updateScrollbar(productId);
  },

  updateCardImages: function(productId, images) {
    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return;

    const productCardElement = document.querySelector(`[data-product-card="${productId}"]`);
    if (!productCardElement) return;

    const productData = this.getProductData(productId, productCardElement);
    const altText = productData ? productData.title : '';
    const firstImg = gallery.querySelector('.product-card-slide img');
    const sizes = firstImg ? firstImg.sizes : '';

    gallery.innerHTML = '';

    for (let i = 0; i < images.length; i++) {
      const slide = this.buildSlide(images[i], altText, i, productId, sizes, false);
      gallery.appendChild(slide);
    }

    // handle first slide progressive loading
    const firstSlideImg = gallery.querySelector('.product-card-slide img');
    if (firstSlideImg) {
      const highResUrl = ProductUtils.buildImageUrl(images[0], 400);
      const testImg = new Image();
      testImg.src = highResUrl;

      if (testImg.complete) {
        // already cached, load directly
        firstSlideImg.src = highResUrl;
        firstSlideImg.srcset = ProductUtils.buildSrcset(images[0], [400, 600, 900, 1200]);
      } else {
        // not cached, use progressive loading
        firstSlideImg.src = ProductUtils.buildImageUrl(images[0], 20);
        firstSlideImg.dataset.src = highResUrl;
        firstSlideImg.dataset.srcset = ProductUtils.buildSrcset(images[0], [400, 600, 900, 1200]);
        firstSlideImg.classList.add('blur-up', 'blur-sm');
        firstSlideImg.addEventListener('load', function onPlaceholderLoad() {
          firstSlideImg.removeEventListener('load', onPlaceholderLoad);
          window.loadHighResImage(firstSlideImg);
        });
      }
    }

    gallery.scrollLeft = 0;
    gallery.dataset.initialized = 'true';
    this.updateScrollbar(productId);
  },

  updatePriceDisplay: function(productCardElement, isAvailable) {
    const priceEl = productCardElement.querySelector('.product-card-price');
    const soldOutEl = productCardElement.querySelector('.stock-status-block');
    if (!priceEl || !soldOutEl) return;

    priceEl.style.display = isAvailable ? '' : 'none';
    soldOutEl.style.display = isAvailable ? 'none' : '';
    // priceEl.style.visibility = isAvailable ? '' : 'hidden';
    // soldOutEl.style.visibility = isAvailable ? 'hidden' : '';
  },

  scrollGallery: function(event, productId, direction) {
    event.preventDefault();
    event.stopPropagation();

    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return;

    gallery.scrollLeft += direction * gallery.clientWidth;
  },

  updateScrollbar: function(productId) {
    const gallery = document.getElementById(`gallery-${productId}`);
    const productCardLink = gallery && gallery.closest('.product-card-link');
    const track = productCardLink && productCardLink.querySelector('.product-card-scrollbar-track');
    const thumb = document.getElementById(`scrollbar-thumb-${productId}`);
    const arrowLeft = document.getElementById(`arrow-left-${productId}`);
    const arrowRight = document.getElementById(`arrow-right-${productId}`);

    if (!gallery || !track || !thumb) return;

    const totalSlides = gallery.querySelectorAll('.product-card-slide').length;

    if (totalSlides <= 1) {
      track.style.opacity = '0';
      if (arrowLeft) arrowLeft.classList.add('hidden');
      if (arrowRight) arrowRight.classList.add('hidden');
      return;
    }

    // Derive track width from slide count, clamped between min and max
    const PX_PER_SLIDE = 28;
    const MIN_TRACK_WIDTH = 48;
    const MAX_TRACK_WIDTH = 180;
    const trackWidth = Math.min(Math.max(totalSlides * PX_PER_SLIDE, MIN_TRACK_WIDTH), MAX_TRACK_WIDTH);

    track.style.width = `${trackWidth}px`;
    track.style.left = '50%';
    track.style.transform = 'translateX(-50%)';

    // Thumb width as proportion of track
    const thumbWidthPct = (1 / totalSlides) * 100;
    thumb.style.width = `${thumbWidthPct}%`;

    // Thumb position based on scroll progress
    const scrollProgress = gallery.scrollLeft / (gallery.scrollWidth - gallery.clientWidth);
    const maxTranslate = 100 * (totalSlides - 1);
    thumb.style.transform = `translateX(${scrollProgress * maxTranslate}%)`;

    track.style.opacity = '1';

    // Update arrow visibility
    if (arrowLeft) {
      arrowLeft.classList.toggle('hidden', gallery.scrollLeft <= 0);
    }
    if (arrowRight) {
      arrowRight.classList.toggle('hidden', gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 1);
    }
  }, 

  getProductData: function(productId, element) {
    if (this.productDataCache[productId]) {
      return this.productDataCache[productId];
    }

    let productCardElement;
    if (element) {
      productCardElement = element.closest(`[data-product-card="${productId}"]`);
    }
    if (!productCardElement) {
      productCardElement = document.querySelector(`[data-product-card="${productId}"]`);
    }
    if (!productCardElement) return null;

    const productDataElem = productCardElement.querySelector('[data-product-json]');
    if (!productDataElem) return null;

    try {
      const productData = JSON.parse(productDataElem.getAttribute('data-product-json'));
      this.productDataCache[productId] = productData;
      return productData;
    } catch (error) {
      console.error('Error parsing product data for product ID:', productId, error);
      return null;
    }
  },

  selectVariant: function(button, productId, optionPosition, optionValue) {
    const productCardElement = button.closest(`[data-product-card="${productId}"]`);
    if (!productCardElement) return;

    const productData = this.getProductData(productId, button);
    if (!productData) return;

    // Clear previous selection for this option group
    productCardElement.querySelectorAll(`.variant-button[data-option-position="${optionPosition}"]`).forEach(btn => {
      btn.classList.remove('selected');
    });

    button.classList.add('selected');

    // Update inline styles for all variant buttons in this card
    productCardElement.querySelectorAll('.variant-button.selected').forEach(btn => {
      btn.style.backgroundColor = 'rgba(217, 217, 217, 0.9)';
      btn.style.color = 'black';
      btn.style.fontWeight = '500';
    });
    productCardElement.querySelectorAll('.variant-button:not(.selected)').forEach(btn => {
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.fontWeight = '';
    });

    const selections = {};
    productCardElement.querySelectorAll('.variant-button.selected').forEach(selectedBtn => {
      const pos = selectedBtn.getAttribute('data-option-position');
      const val = selectedBtn.getAttribute('data-value');
      selections[`option${pos}`] = val;
    });

    const totalOptions = productData.options.length;
    const allSelected = Object.keys(selections).length === totalOptions;

    // Update images when color is selected
    if (optionPosition === '1' && optionValue) {
      const colorVariant = productData.variants.find(v => v.option1 === optionValue);
      if (colorVariant) {
        const variantImages = this.getImagesForVariant(colorVariant, productData.images, productData.variants);
        this.updateCardImages(productId, variantImages);
      }

      const anyAvailable = productData.variants.some(v => v.option1 === optionValue && v.available);
      this.updatePriceDisplay(productCardElement, anyAvailable);
    }

    // Find matching variant
    let matchingVariant = null;
    if (allSelected) {
      matchingVariant = productData.variants.find(variant =>
        Object.keys(selections).every(optionKey =>
          variant[optionKey] === selections[optionKey]
        )
      );
    }

    if (matchingVariant) {
      const variantInput = productCardElement.querySelector('input[name="id"]');
      if (variantInput) {
        variantInput.value = matchingVariant.id;
        variantInput.setAttribute('data-selected-variant', matchingVariant.id);
        variantInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // handling appearance of ADD TO CART
      const addButton = productCardElement.querySelector('.add-to-cart-button');
      if (addButton) {
        const isAvailable = matchingVariant.available;
        const inventory = matchingVariant.inventory_quantity;

        if (isAvailable) {
          addButton.disabled = false;
          addButton.classList.add('active');
          addButton.classList.remove('out-of-stock');
          addButton.textContent = 'ADD TO CART';

          if (inventory > 0 && inventory <= 10) {
            let inventoryIndicator = productCardElement.querySelector('.inventory-indicator');
            if (!inventoryIndicator) {
              inventoryIndicator = document.createElement('div');
              inventoryIndicator.className = 'inventory-indicator text-xs mt-1';
              addButton.parentNode.appendChild(inventoryIndicator);
            }
            inventoryIndicator.textContent = `Only ${inventory} left`;
          } else {
            const inventoryIndicator = productCardElement.querySelector('.inventory-indicator');
            if (inventoryIndicator) inventoryIndicator.remove();
          }
        } else {
          addButton.disabled = true;
          addButton.classList.remove('active');
          addButton.classList.add('out-of-stock');
          addButton.textContent = 'SOLD OUT';
          const inventoryIndicator = productCardElement.querySelector('.inventory-indicator');
          if (inventoryIndicator) inventoryIndicator.remove();
        }
      }
    } else {
      productCardElement.querySelectorAll('.add-to-cart-button').forEach(btn => {
        if (!productData.has_only_default_variant) {
          btn.disabled = true;
          btn.classList.remove('active');
          if (Object.keys(selections).length === totalOptions) {
            btn.classList.add('out-of-stock');
            btn.textContent = 'SOLD OUT';
          } else {
            btn.classList.remove('out-of-stock');
            btn.textContent = 'ADD TO CART';
          }
          const inventoryIndicator = productCardElement.querySelector('.inventory-indicator');
          if (inventoryIndicator) inventoryIndicator.remove();
        }
      });

    }
  },

  handleProductCardClick: function(event, productId) {
    if (!event) return;

    const productLink = event.target.closest('.product-card-link');
    if (!productLink) return;

    if (productLink) {
      window.location.href = productLink.href;
    }
  },

  initPage: function() {
    document.querySelectorAll('[data-product-card]').forEach(card => {
      this.initCard(card);
    });
  },

  initCard: function(card) {
    const productId = card.getAttribute('data-product-card');
    const productData = this.getProductData(productId, card);
    if (!productData) return;

    const gallery = document.getElementById(`gallery-${productId}`);
    const firstImg = gallery ? gallery.querySelector('.product-card-slide img') : null;
    const sizes = firstImg ? firstImg.sizes : '';

    // Fix first slide width to exact integer pixels
    if (gallery) {
      const resizeObserver = new ResizeObserver(() => {
        const containerWidth = Math.round(gallery.clientWidth);
        if (containerWidth === 0) return;
        gallery.querySelectorAll('.product-card-slide').forEach(slide => {
          slide.style.width = `${containerWidth}px`;
        });
        ProductCardObject.updateScrollbar(productId);
      });
      resizeObserver.observe(gallery);
    }

    const defaultVariant = productData.variants.find(v => v.available) || productData.variants[0];

    if (defaultVariant && gallery) {
      const variantImages = this.getImagesForVariant(defaultVariant, productData.images, productData.variants);

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.appendRemainingSlides(productId, variantImages, productData.title, sizes);
            obs.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '300px'
      });

      observer.observe(card);
    }

    if (gallery) {
      gallery.addEventListener('scroll', () => {
        this.updateScrollbar(productId);
      }, { passive: true });
    }

    if (productData.has_only_default_variant) {
      const forms = card.querySelectorAll(`form[data-product-form="${productId}"]`);
      forms.forEach(form => {
        const addButton = form.querySelector('.add-to-cart-button');
        if (addButton) {
          const defaultVariant = productData.variants[0];
          if (defaultVariant && defaultVariant.available) {
            addButton.disabled = false;
            addButton.classList.add('active');
            if (defaultVariant.inventory_quantity <= 10 &&
                defaultVariant.inventory_quantity > 0 &&
                defaultVariant.inventory_management === 'shopify') {
              const inventoryIndicator = document.createElement('div');
              inventoryIndicator.className = 'inventory-indicator text-xs mt-1';
              inventoryIndicator.textContent = `Only ${defaultVariant.inventory_quantity} left`;
              addButton.parentNode.appendChild(inventoryIndicator);
            }
          } else {
            addButton.disabled = true;
            addButton.classList.add('out-of-stock');
            addButton.textContent = 'OUT OF STOCK';
          }
        }
      });
    }
  },

  checkCardVisibility: function() {
    return;
  }

};

ProductUtils.registerAction('select-variant-card', (btn) => {
  ProductCardObject.selectVariant(btn, btn.dataset.productId, btn.dataset.optionPosition, btn.dataset.value);
});

window.handleProductCardClick = ProductCardObject.handleProductCardClick.bind(ProductCardObject);

document.addEventListener('DOMContentLoaded', function() {
  ProductCardObject.initPage();

  document.addEventListener('click', function(event) {
    if (window.innerWidth >= 767) return;

    const expandedCards = document.querySelectorAll('.mobile-expanded');
    if (expandedCards.length === 0) return;

    let clickedOutside = true;
    for (const card of expandedCards) {
      if (card.contains(event.target)) {
        clickedOutside = false;
        break;
      }
    }

    if (clickedOutside) {
      expandedCards.forEach(card => {
        card.classList.remove('mobile-expanded');
        const productId = card.getAttribute('data-product-card');
        const thumbnailToggle = document.getElementById(`thumbnail-toggle-${productId}`);
        if (thumbnailToggle) thumbnailToggle.classList.add('mobile-hidden');
        const dropdown = card.querySelector('.product-dropdown');
        if (dropdown) {
          dropdown.classList.remove('mobile-dropdown-visible');
          dropdown.classList.add('mobile-dropdown-hidden');
        }
      });
    }
  });

  window.addEventListener('resize', function() {
    document.querySelectorAll('[data-product-card]').forEach(card => {
      const productId = card.getAttribute('data-product-card');
      const gallery = document.getElementById(`gallery-${productId}`);
      if (!gallery) return;

      const containerWidth = Math.round(gallery.clientWidth);
      gallery.querySelectorAll('.product-card-slide').forEach(slide => {
        slide.style.width = `${containerWidth}px`;
      });

      ProductCardObject.updateScrollbar(productId);
    });
  });

});