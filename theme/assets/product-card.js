window.ProductCardObject = window.ProductCardObject || {
  productDataCache: {},
  scrollbarCache: {},

  buildImageUrl: function (baseUrl, width) {
    return ProductUtils.buildImageUrl(baseUrl, width);
  },

  buildSrcset: function (baseUrl) {
    return ProductUtils.buildSrcset(baseUrl, [500, 700, 900]);
  },

  getImagesForVariant: function (variant, allImages, allVariants) {
    return ProductUtils.getImagesForVariant(variant, allImages, allVariants);
  },

  buildSlide: function (imageUrl, altText, index, width) {

    const slide = document.createElement("div");
    slide.className = "product-card-slide";
    slide.style.width = `${width}px`;

    const img = document.createElement("img");
    img.alt = altText;
    img.sizes = "(max-width: 767px) 50vw, (max-width: 1024px) 20vw, (max-width: 1536px) 12vw, 300px";
    img.srcset = this.buildSrcset(imageUrl);
    img.src = this.buildImageUrl(imageUrl, 500);
    img.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(img);
    return slide;
  },

  appendPreviewSlides: function (productCardId, images, altText) {
    // console.log("🚀 ~ appendPreviewSlides called");
    const gallery = document.getElementById(`gallery-${productCardId}`);
    if (!gallery) return;

    if (gallery.dataset.previewLoaded) return;
    gallery.dataset.previewLoaded = "true";

    // append at most the next 2 slides
    const previewCount = Math.min(images.length, 3);

    for (let i = 1; i < previewCount; i++) {
      const width = Math.round(gallery.clientWidth);

      const slide = this.buildSlide(
        images[i],
        altText,
        i,
        width,
      );

      gallery.appendChild(slide);
    }

    // set value according to total variant images
    gallery.dataset.slideCount = images.length;
    this.setupScrollbar(productCardId);
  },

  appendDeferredSlides: function (productCardId, images, altText) {
    console.log("🚀 ~ appendDeferredSlides called");
    const gallery = document.getElementById(`gallery-${productCardId}`);
    if (!gallery) return;

    // prevent duplicate full hydration
    if (gallery.dataset.fullLoaded === "true") return;

    const existingCount = gallery.children.length;

    // nothing to do
    if (existingCount >= images.length) {
      gallery.dataset.fullLoaded = "true";
      return;
    }
    
    const width = Math.round(gallery.clientWidth);

    for (let i = existingCount; i < images.length; i++) {

      const slide = this.buildSlide(
        images[i],
        altText,
        i,
        width,
      );

      gallery.appendChild(slide);
    }

    gallery.dataset.fullLoaded = "true";

    this.setupScrollbar(productCardId);
  },

  updateCardImages: function (productCardId, images) {
    const gallery = document.getElementById(`gallery-${productCardId}`);
    if (!gallery) return;

    const slides = gallery.querySelectorAll(".product-card-slide");
    gallery.dataset.slideCount = images.length;
    console.log("🚀 ~ gallery.dataset.slideCount:", gallery.dataset.slideCount);

    // new gallery - reset hydration state
    gallery.dataset.previewLoaded = "true";
    gallery.dataset.fullLoaded = "true";

    const width = Math.round(gallery.clientWidth);

    images.forEach((url, i) => {
      let slide = slides[i];

      // If slide doesn't exist yet, create it
      if (!slide) {
        slide = this.buildSlide(
          url,
          "",
          i,
          width);
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
    this.setupScrollbar(productCardId);
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

  getScrollbarElements: function (productCardId) {
    if (this.scrollbarCache[productCardId]) {
      return this.scrollbarCache[productCardId];
    }

    const gallery = document.getElementById(`gallery-${productCardId}`);
    if (!gallery) return null;

    const productCardLink = gallery.closest("[data-product-card-link]");
    if (!productCardLink) return null;

    const elements = {
      gallery,
      productCardLink,
      track: productCardLink.querySelector(".product-card-scrollbar-track"),
      thumb: document.getElementById(`scrollbar-thumb-${productCardId}`),
      arrowLeft: document.getElementById(`arrow-left-${productCardId}`),
      arrowRight: document.getElementById(`arrow-right-${productCardId}`),
    };

    if (!elements.track || !elements.thumb) return null;

    this.scrollbarCache[productCardId] = elements;

    return elements;
  },

  getGalleryState: function (gallery) {
    return {
      previewLoaded: gallery.dataset.previewLoaded === "true",
      fullLoaded: gallery.dataset.fullLoaded === "true",
      slideCount: Number(gallery.dataset.slideCount || 1),
    };
  },

  scrollGallery: function (event, productCardId, direction) {
    event.preventDefault();
    event.stopPropagation();

    const elements = this.getScrollbarElements(productCardId);
    if (!elements) return;

    const { gallery } = elements;

    gallery.scrollTo({
      left: gallery.scrollLeft + direction * gallery.clientWidth,
      behavior: "smooth",
    });
  },

  setupScrollbar: function (productCardId) {
    const elements = this.getScrollbarElements(productCardId);
    if (!elements) return;

    const { gallery, track, thumb, arrowLeft, arrowRight } = elements;
    const { slideCount } = this.getGalleryState(gallery);

    // no scrollbar for 1 slide
    if (slideCount <= 1) {
      track.style.opacity = "0";
      arrowLeft?.classList.add("hidden");
      arrowRight?.classList.add("hidden");
      return;
    }

    // calc track width
    const PX_PER_SLIDE = 28;
    const MIN_TRACK_WIDTH = 48;
    const MAX_TRACK_WIDTH = 180;

    const trackWidth = Math.min(
      Math.max(slideCount * PX_PER_SLIDE, MIN_TRACK_WIDTH),
      MAX_TRACK_WIDTH,
    );

    // set track and thumb styles
    track.style.width = `${trackWidth}px`;
    track.style.left = "50%";
    track.style.transform = "translateX(-50%)";
    track.style.opacity = "1";
    thumb.style.width = `${100 / slideCount}%`;

    this.updateScrollbar(productCardId);
  },

  updateScrollbar: function (productCardId) {
    const elements = this.getScrollbarElements(productCardId);
    if (!elements) return;

    const { gallery, thumb } = elements;
    const { slideCount } = this.getGalleryState(gallery);

    // const track = productCardLink.querySelector('.product-card-scrollbar-track');
    // const arrowLeft = document.getElementById(`arrow-left-${productId}`);
    // const arrowRight = document.getElementById(`arrow-right-${productId}`);

    const scrollLeft = gallery.scrollLeft;
    const clientWidth = gallery.clientWidth;
    const scrollWidth = gallery.scrollWidth;

    const maxScroll = scrollWidth - clientWidth;
    const scrollProgress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

    const maxTranslate = 100 * (slideCount - 1);
    const translateX = scrollProgress * maxTranslate;

    thumb.style.transform = `translateX(${translateX}%)`;

    // arrowLeft?.classList.toggle('hidden', scrollLeft <= 0);
    // arrowRight?.classList.toggle('hidden', scrollLeft >= maxScroll - 1);
  },

  getProductData: function (productCardId, element) {
    if (this.productDataCache[productCardId]) {
      return this.productDataCache[productCardId];
    }

    let productCardElement;
    if (element) {
      productCardElement = element.closest(
        `[data-product-card-id="${productCardId}"]`,
      );
    }
    if (!productCardElement) {
      productCardElement = document.querySelector(
        `[data-product-card-id="${productCardId}"]`,
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
      this.productDataCache[productCardId] = productData;
      return productData;
    } catch (error) {
      // TODO: need this try catch block?
      console.error(
        "Error parsing product data for product-card ID:",
        productCardId,
        error,
      );
      return null;
    }
  },

  selectColor: function (button, productCardId, colorValue) {
    const productCardElement = button.closest(
      `[data-product-card-id="${productCardId}"]`,
    );
    if (!productCardElement) return;

    const productData = this.getProductData(productCardId, button);
    if (!productData || !colorValue) return;

    const colorVariant = productData.variants.find(
      (variant) => variant.option1 === colorValue,
    );

    if (colorVariant) {
      const variantImages = this.getImagesForVariant(
        colorVariant,
        productData.images,
        productData.variants,
      );
      this.updateCardImages(productCardId, variantImages);
    }

    const anyAvailable = productData.variants.some(
      (variant) => variant.option1 === colorValue && variant.available,
    );
    this.updatePriceDisplay(productCardElement, anyAvailable);
  },

  handleProductCardClick: function (event, productCardId) {
    if (!event) return;

    const productLink = event.target.closest("[data-product-card-link]");
    if (!productLink) return;

    if (productLink) {
      window.location.href = productLink.href;
    }
  },

  // TODO: make sure default variant is not included, bc it's already displayed
  preloadCardVariants: function (productCardId, card) {
    // console.log("🚀 ~ preloadCardVariants called");
    const productData = this.getProductData(productCardId, card);
    if (!productData) return;

    const seenColors = new Set();
    const activeChip = card.querySelector(".color-chip-container.active .color-chip");
    const currentColor = activeChip ? activeChip.dataset.value : null;

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
    document.querySelectorAll("[data-product-card-id]").forEach((card) => {
      this.initCard(card);
    });
  },

  initCard: function (card) {
    const productCardId = card.getAttribute("data-product-card-id");
    const productData = this.getProductData(productCardId, card);
    if (!productData) return;

    const gallery = document.getElementById(`gallery-${productCardId}`);

    if (gallery) {
      // Fix first slide width to exact integer pixels on resize
      const resizeObserver = new ResizeObserver(() => {
        const containerWidth = Math.round(gallery.clientWidth);
        if (containerWidth === 0) return;

        const slides = gallery.querySelectorAll(".product-card-slide");

        slides.forEach((slide) => {
          slide.style.width = `${containerWidth}px`;
        });

        ProductCardObject.updateScrollbar(productCardId);
      });
      resizeObserver.observe(gallery);

      let ticking = false;

      gallery.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              this.updateScrollbar(productCardId);
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true },
      );

      card.addEventListener(
        "mouseenter",
        () => {
          this.preloadCardVariants(productCardId, card);
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
          productCardId,
          variantImages,
          productData.title,
        );
      };

      const arrowLeft = document.getElementById(`arrow-left-${productCardId}`);
      const arrowRight = document.getElementById(`arrow-right-${productCardId}`);

      arrowLeft?.addEventListener("click", hydrateGallery, { once: true });
      arrowRight?.addEventListener("click", hydrateGallery, { once: true });

      if (window.innerWidth < 767) {
        gallery.addEventListener("scroll", hydrateGallery, {
          once: true,
          passive: true,
        });
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.appendPreviewSlides(
                productCardId,
                variantImages,
                productData.title,
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
  },

  checkCardVisibility: function () {
    return;
  },
};

ProductUtils.registerAction("select-color-card", (btn) => {
  const card = btn.closest("[data-product-card-id]");
  const productCardId = card?.getAttribute("data-product-card-id");
  if (!productCardId) return;

  ProductCardObject.selectColor(
    btn,
    productCardId,
    btn.dataset.value,
  );
});

window.handleProductCardClick =
  ProductCardObject.handleProductCardClick.bind(ProductCardObject);

document.addEventListener("DOMContentLoaded", function () {
  ProductCardObject.initPage();
});
