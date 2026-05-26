window.ProductCardObject = window.ProductCardObject || {
  productDataCache: {},
  scrollbarCache: {},
  slideCountCache: {},

  buildImageUrl: function (baseUrl, width) {
    return ProductUtils.buildImageUrl(baseUrl, width);
  },

  buildSrcset: function (baseUrl) {
    return ProductUtils.buildSrcset(baseUrl, [500, 700, 900]);
  },

  getImagesForVariant: function (variant, allImages, allVariants) {
    return ProductUtils.getImagesForVariant(variant, allImages, allVariants);
  },

  buildSlide: function (imageUrl, altText, index, productId, sizes) {
    // const gallery = document.getElementById(`gallery-${productId}`);

    const slide = document.createElement("div");
    slide.className = "product-card-slide";

    // Force exact integer pixel width to prevent sub-pixel alignment issues
    // if (gallery) {
    //   slide.style.width = `${Math.round(gallery.clientWidth)}px`;
    // }

    const img = document.createElement("img");
    img.id = `gallery-image-${index}-${productId}`;
    img.alt = altText;
    img.sizes = sizes;
    img.srcset = this.buildSrcset(imageUrl);
    img.src = this.buildImageUrl(imageUrl, 500);
    img.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(img);
    return slide;
  },

  appendPreviewSlides: function (productId, images, altText, sizes) {
    console.log("🚀 ~ appendPreviewSlides called")
    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return;

    if (gallery.dataset.previewLoaded) return;
    gallery.dataset.previewLoaded = 'true';

    // append at most the next 2 slides
    const previewCount = Math.min(images.length, 3);

    for (let i = 1; i < previewCount; i++) {
      const slide = this.buildSlide(images[i], altText, i, productId, sizes);
      gallery.appendChild(slide);
    }

    // set value according to total variant images
    gallery.dataset.slideCount = images.length;
    this.setupScrollbar(productId);
  },

  appendDeferredSlides: function(productId, images, altText, sizes) {
    console.log("🚀 ~ appendDeferredSlides called")
    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return;

    // prevent duplicate full hydration
    if (gallery.dataset.fullLoaded === 'true') return;

    const existingSlides = gallery.querySelectorAll('.product-card-slide');
    const existingCount = existingSlides.length;

    // nothing to do
    if (existingCount >= images.length) {
      gallery.dataset.fullLoaded = 'true';
      return;
    }

    for (let i = existingCount; i < images.length; i++) {
      const slide = this.buildSlide(images[i], altText, i, productId, sizes);
      gallery.appendChild(slide);
    }

    gallery.dataset.fullLoaded = 'true';

    this.setupScrollbar(productId);
  },

  updateCardImages: function (productId, images) {
    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return;

    const slides = gallery.querySelectorAll(".product-card-slide");
    gallery.dataset.slideCount = images.length;
    console.log("🚀 ~ gallery.dataset.slideCount:", gallery.dataset.slideCount)

    images.forEach((url, i) => {
      let slide = slides[i];

      // If slide doesn't exist yet, create it
      if (!slide) {
        slide = this.buildSlide(url, "", i, productId, "");
        gallery.appendChild(slide);
      }

      const img = slide.querySelector("img");

      // Only update if different (prevents unnecessary work)
      const newSrc = ProductUtils.buildImageUrl(url, 500);
      if (img.src !== newSrc) {
        img.srcset = ProductUtils.buildSrcset(url, [500, 700, 900]);
        img.src = newSrc;
      }
    });

    // Remove extra slides if new variant has fewer images
    for (let i = images.length; i < slides.length; i++) {
      slides[i].remove();
    }

    gallery.scrollLeft = 0;
    this.setupScrollbar(productId);
    // this.updateScrollbar(productId);
  },

  updatePriceDisplay: function (productCardElement, isAvailable) {
    const priceEl = productCardElement.querySelector(".product-card-price");
    const soldOutEl = productCardElement.querySelector(".stock-status-block");
    if (!priceEl || !soldOutEl) return;

    priceEl.style.display = isAvailable ? "" : "none";
    soldOutEl.style.display = isAvailable ? "none" : "";
    // priceEl.style.visibility = isAvailable ? '' : 'hidden';
    // soldOutEl.style.visibility = isAvailable ? 'hidden' : '';
  },

  getScrollbarElements: function(productId) {
    if (this.scrollbarCache[productId]) {
      return this.scrollbarCache[productId];
    }

    const gallery = document.getElementById(`gallery-${productId}`);
    if (!gallery) return null;

    const productCardLink = gallery.closest('.product-card-link');
    if (!productCardLink) return null;

    const elements = {
      gallery,
      productCardLink,
      track: productCardLink.querySelector('.product-card-scrollbar-track'),
      thumb: document.getElementById(`scrollbar-thumb-${productId}`),
      arrowLeft: document.getElementById(`arrow-left-${productId}`),
      arrowRight: document.getElementById(`arrow-right-${productId}`)
    };

    if (!elements.track || !elements.thumb) return null;

    this.scrollbarCache[productId] = elements;

    return elements;
  },

  scrollGallery: function (event, productId, direction) {
    event.preventDefault();
    event.stopPropagation();

    const elements = this.getScrollbarElements(productId);
    if (!elements) return;

    const { gallery } = elements;

    gallery.scrollTo({
      left: gallery.scrollLeft + (direction * gallery.clientWidth),
      behavior: 'smooth'
    });
  },

  setupScrollbar: function(productId) {
    const elements = this.getScrollbarElements(productId);
    if (!elements) return;

    const {
      gallery,
      track,
      thumb,
      arrowLeft,
      arrowRight
    } = elements;

    const totalSlides = gallery.dataset.slideCount;

    // no scrollbar for 1 slide
    if (totalSlides <= 1) {
      track.style.opacity = '0';
      arrowLeft?.classList.add('hidden');
      arrowRight?.classList.add('hidden');
      return;
    }

    // calc track width
    const PX_PER_SLIDE = 28;
    const MIN_TRACK_WIDTH = 48;
    const MAX_TRACK_WIDTH = 180;

    const trackWidth = Math.min(
      Math.max(totalSlides * PX_PER_SLIDE, MIN_TRACK_WIDTH),
      MAX_TRACK_WIDTH
    );

    // set track and thumb styles
    track.style.width = `${trackWidth}px`;
    track.style.left = '50%';
    track.style.transform = 'translateX(-50%)';
    track.style.opacity = '1';
    thumb.style.width = `${100 / totalSlides}%`;

    this.updateScrollbar(productId);
  },

  updateScrollbar: function(productId) {
    const elements = this.getScrollbarElements(productId);
    if (!elements) return;

    const {
      gallery,
      thumb
    } = elements;

    // const track = productCardLink.querySelector('.product-card-scrollbar-track');
    // const arrowLeft = document.getElementById(`arrow-left-${productId}`);
    // const arrowRight = document.getElementById(`arrow-right-${productId}`);

    const scrollLeft = gallery.scrollLeft;
    const clientWidth = gallery.clientWidth;
    const scrollWidth = gallery.scrollWidth;

    const maxScroll = scrollWidth - clientWidth;
    const scrollProgress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

    const totalSlides = gallery.dataset.slideCount;
    const maxTranslate = 100 * (totalSlides - 1);
    const translateX = scrollProgress * maxTranslate;

    thumb.style.transform = `translateX(${translateX}%)`;

    // arrowLeft?.classList.toggle('hidden', scrollLeft <= 0);
    // arrowRight?.classList.toggle('hidden', scrollLeft >= maxScroll - 1);
  },

  getProductData: function (productId, element) {
    if (this.productDataCache[productId]) {
      return this.productDataCache[productId];
    }

    let productCardElement;
    if (element) {
      productCardElement = element.closest(
        `[data-product-card="${productId}"]`,
      );
    }
    if (!productCardElement) {
      productCardElement = document.querySelector(
        `[data-product-card="${productId}"]`,
      );
    }
    if (!productCardElement) return null;

    const productDataElem = productCardElement.querySelector(
      "[data-product-json]",
    );
    if (!productDataElem) return null;

    try {
      const productData = JSON.parse(
        productDataElem.getAttribute("data-product-json"),
      );
      this.productDataCache[productId] = productData;
      return productData;
    } catch (error) {
      console.error(
        "Error parsing product data for product ID:",
        productId,
        error,
      );
      return null;
    }
  },

  selectVariant: function (button, productId, optionPosition, optionValue) {
    const productCardElement = button.closest(
      `[data-product-card="${productId}"]`,
    );
    if (!productCardElement) return;

    const productData = this.getProductData(productId, button);
    if (!productData) return;

    // Clear previous selection for this option group
    productCardElement
      .querySelectorAll(
        `.variant-button[data-option-position="${optionPosition}"]`,
      )
      .forEach((btn) => {
        btn.classList.remove("selected");
      });

    button.classList.add("selected");

    // Update inline styles for all variant buttons in this card
    productCardElement
      .querySelectorAll(".variant-button.selected")
      .forEach((btn) => {
        // btn.style.backgroundColor = 'rgba(217, 217, 217, 0.9)';
        // btn.style.color = 'black';
        // btn.style.fontWeight = '500';
        btn.classList.add("selected");
      });
    productCardElement
      .querySelectorAll(".variant-button:not(.selected)")
      .forEach((btn) => {
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.style.fontWeight = "";
      });

    const selections = {};
    productCardElement
      .querySelectorAll(".variant-button.selected")
      .forEach((selectedBtn) => {
        const pos = selectedBtn.getAttribute("data-option-position");
        const val = selectedBtn.getAttribute("data-value");
        selections[`option${pos}`] = val;
      });

    const totalOptions = productData.options.length;
    const allSelected = Object.keys(selections).length === totalOptions;

    // Update images when color is selected
    if (optionPosition === "1" && optionValue) {
      const colorVariant = productData.variants.find(
        (v) => v.option1 === optionValue,
      );
      if (colorVariant) {
        const variantImages = this.getImagesForVariant(
          colorVariant,
          productData.images,
          productData.variants,
        );
        this.updateCardImages(productId, variantImages);
      }

      const anyAvailable = productData.variants.some(
        (v) => v.option1 === optionValue && v.available,
      );
      this.updatePriceDisplay(productCardElement, anyAvailable);
    }

    // Find matching variant
    let matchingVariant = null;
    if (allSelected) {
      matchingVariant = productData.variants.find((variant) =>
        Object.keys(selections).every(
          (optionKey) => variant[optionKey] === selections[optionKey],
        ),
      );
    }

    if (matchingVariant) {
      const variantInput = productCardElement.querySelector('input[name="id"]');
      if (variantInput) {
        variantInput.value = matchingVariant.id;
        variantInput.setAttribute("data-selected-variant", matchingVariant.id);
        variantInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // handling appearance of ADD TO CART
      const addButton = productCardElement.querySelector(".add-to-cart-button");
      if (addButton) {
        const isAvailable = matchingVariant.available;
        const inventory = matchingVariant.inventory_quantity;

        if (isAvailable) {
          addButton.disabled = false;
          addButton.classList.add("active");
          addButton.classList.remove("out-of-stock");
          addButton.textContent = "ADD TO CART";

          if (inventory > 0 && inventory <= 10) {
            let inventoryIndicator = productCardElement.querySelector(
              ".inventory-indicator",
            );
            if (!inventoryIndicator) {
              inventoryIndicator = document.createElement("div");
              inventoryIndicator.className = "inventory-indicator text-xs mt-1";
              addButton.parentNode.appendChild(inventoryIndicator);
            }
            inventoryIndicator.textContent = `Only ${inventory} left`;
          } else {
            const inventoryIndicator = productCardElement.querySelector(
              ".inventory-indicator",
            );
            if (inventoryIndicator) inventoryIndicator.remove();
          }
        } else {
          addButton.disabled = true;
          addButton.classList.remove("active");
          addButton.classList.add("out-of-stock");
          addButton.textContent = "SOLD OUT";
          const inventoryIndicator = productCardElement.querySelector(
            ".inventory-indicator",
          );
          if (inventoryIndicator) inventoryIndicator.remove();
        }
      }
    } else {
      productCardElement
        .querySelectorAll(".add-to-cart-button")
        .forEach((btn) => {
          if (!productData.has_only_default_variant) {
            btn.disabled = true;
            btn.classList.remove("active");
            if (Object.keys(selections).length === totalOptions) {
              btn.classList.add("out-of-stock");
              btn.textContent = "SOLD OUT";
            } else {
              btn.classList.remove("out-of-stock");
              btn.textContent = "ADD TO CART";
            }
            const inventoryIndicator = productCardElement.querySelector(
              ".inventory-indicator",
            );
            if (inventoryIndicator) inventoryIndicator.remove();
          }
        });
    }
  },

  handleProductCardClick: function (event, productId) {
    if (!event) return;

    const productLink = event.target.closest(".product-card-link");
    if (!productLink) return;

    if (productLink) {
      window.location.href = productLink.href;
    }
  },

  // TODO: make sure default variant is not included, bc its already displayed
  preloadCardVariants: function (productId, card) {
    console.log("🚀 ~ preloadCardVariants called")
    const productData = this.getProductData(productId, card);
    if (!productData) return;

    const seenColors = new Set();
    const selectedBtn = card.querySelector(
      '.variant-button.selected[data-option-position="1"]',
    );
    const currentColor = selectedBtn ? selectedBtn.dataset.value : null;

    productData.variants.forEach((variant) => {
      const color = variant.option1;
      if (!color || seenColors.has(color)) return;
      if (color === currentColor) return;

      seenColors.add(color);

      const images = this.getImagesForVariant(
        variant,
        productData.images,
        productData.variants,
      );

      if (!images.length) return;

      const firstImage = images[0];

      const img = new Image();
      // use larger size from srcset to cover all cases, may be downscaled
      img.src = ProductUtils.buildImageUrl(firstImage, 900);
    });
  },

  initPage: function () {
    document.querySelectorAll("[data-product-card]").forEach((card) => {
      this.initCard(card);
    });
  },

  initCard: function (card) {
    const productId = card.getAttribute("data-product-card");
    const productData = this.getProductData(productId, card);
    if (!productData) return;

    const gallery = document.getElementById(`gallery-${productId}`);
    const firstImg = gallery
      ? gallery.querySelector(".product-card-slide img")
      : null;
    const sizes = firstImg ? firstImg.sizes : "";

    if (gallery) {
      // Fix first slide width to exact integer pixels on resize
      const resizeObserver = new ResizeObserver(() => {
        const containerWidth = Math.round(gallery.clientWidth);
        if (containerWidth === 0) return;

        const slides = gallery.querySelectorAll(".product-card-slide");

        slides.forEach((slide) => {
          slide.style.width = `${containerWidth}px`;
        });

        ProductCardObject.updateScrollbar(productId);
      });
      resizeObserver.observe(gallery);

      let ticking = false;

      gallery.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateScrollbar(productId);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      card.addEventListener(
        "mouseenter",
        () => {
          this.preloadCardVariants(productId, card);
        },
        { once: true },
      );
    }

    const defaultVariant =
      productData.variants.find((v) => v.available) || productData.variants[0];

    if (defaultVariant && gallery) {
      const variantImages = this.getImagesForVariant(
        defaultVariant,
        productData.images,
        productData.variants,
      );

      const hydrateGallery = () => {
        this.appendDeferredSlides(
          productId,
          variantImages,
          productData.title,
          sizes
        );
      };

      const arrowLeft = document.getElementById(`arrow-left-${productId}`);
      const arrowRight = document.getElementById(`arrow-right-${productId}`);

      arrowLeft?.addEventListener('click', hydrateGallery, { once: true });
      arrowRight?.addEventListener('click', hydrateGallery, { once: true });

      gallery.addEventListener(
        'scroll',
        hydrateGallery,
        {
          once: true,
          passive: true
        }
      );

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.appendPreviewSlides(
                productId,
                variantImages,
                productData.title,
                sizes,
              );
              obs.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "300px",
        },
      );

      observer.observe(card);
    }

    if (productData.has_only_default_variant) {
      const forms = card.querySelectorAll(
        `form[data-product-form="${productId}"]`,
      );
      forms.forEach((form) => {
        const addButton = form.querySelector(".add-to-cart-button");
        if (addButton) {
          const defaultVariant = productData.variants[0];
          if (defaultVariant && defaultVariant.available) {
            addButton.disabled = false;
            addButton.classList.add("active");
            if (
              defaultVariant.inventory_quantity <= 10 &&
              defaultVariant.inventory_quantity > 0 &&
              defaultVariant.inventory_management === "shopify"
            ) {
              const inventoryIndicator = document.createElement("div");
              inventoryIndicator.className = "inventory-indicator text-xs mt-1";
              inventoryIndicator.textContent = `Only ${defaultVariant.inventory_quantity} left`;
              addButton.parentNode.appendChild(inventoryIndicator);
            }
          } else {
            addButton.disabled = true;
            addButton.classList.add("out-of-stock");
            addButton.textContent = "OUT OF STOCK";
          }
        }
      });
    }
  },

  checkCardVisibility: function () {
    return;
  },
};

ProductUtils.registerAction("select-variant-card", (btn) => {
  ProductCardObject.selectVariant(
    btn,
    btn.dataset.productId,
    btn.dataset.optionPosition,
    btn.dataset.value,
  );
});

window.handleProductCardClick =
  ProductCardObject.handleProductCardClick.bind(ProductCardObject);

document.addEventListener("DOMContentLoaded", function () {
  ProductCardObject.initPage();

  document.addEventListener("click", function (event) {
    if (window.innerWidth >= 767) return;

    const expandedCards = document.querySelectorAll(".mobile-expanded");
    if (expandedCards.length === 0) return;

    let clickedOutside = true;
    for (const card of expandedCards) {
      if (card.contains(event.target)) {
        clickedOutside = false;
        break;
      }
    }

    if (clickedOutside) {
      expandedCards.forEach((card) => {
        card.classList.remove("mobile-expanded");
        const productId = card.getAttribute("data-product-card");
        const thumbnailToggle = document.getElementById(
          `thumbnail-toggle-${productId}`,
        );
        if (thumbnailToggle) thumbnailToggle.classList.add("mobile-hidden");
        const dropdown = card.querySelector(".product-dropdown");
        if (dropdown) {
          dropdown.classList.remove("mobile-dropdown-visible");
          dropdown.classList.add("mobile-dropdown-hidden");
        }
      });
    }
  });

  window.addEventListener("resize", function () {
    document.querySelectorAll("[data-product-card]").forEach((card) => {
      const productId = card.getAttribute("data-product-card");
      const gallery = document.getElementById(`gallery-${productId}`);
      if (!gallery) return;

      const containerWidth = Math.round(gallery.clientWidth);
      gallery.querySelectorAll(".product-card-slide").forEach((slide) => {
        slide.style.width = `${containerWidth}px`;
      });

      ProductCardObject.updateScrollbar(productId);
    });
  });
});
