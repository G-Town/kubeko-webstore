// Modified function to open popups - closes any other open popups first
function openPopup(popupId) {
  // First close all popups
  const popups = document.querySelectorAll('#shipping-popup, #size-guide-popup, #materials-popup, #shipping-popup-mobile, #size-guide-popup-mobile, #materials-popup-mobile');
  popups.forEach(popup => {
    popup.classList.add('hidden');
  });
  
  const overlay = document.getElementById('popup-overlay');
  overlay.classList.remove('hidden');
  
  const popup = document.getElementById(popupId);
  if (!popup) return;

  popup.classList.remove('hidden');
  document.body.classList.add('popup-active');
  
  // On mobile devices, scroll to popup position for visibility
  if (window.innerWidth < 768) {
    // Store the current scroll position before opening popup
    window.lastScrollPosition = window.pageYOffset;
    
    // Small delay to ensure the popup is rendered before calculating position
    setTimeout(() => {
      // Get the popup's position
      const popupRect = popup.getBoundingClientRect();
      
      // Calculate the optimal scroll position - account for top navigation and 48px offset
      // const headerHeight = 12; // Adjusted to account for the 48px offset
      const headerHeight = 45;
      const scrollToY = Math.max(0, window.pageYOffset + popupRect.top - headerHeight);
      
      // Use smooth scrolling
      window.scrollTo({
        top: scrollToY,
        behavior: 'smooth'
      });
    }, 50);
  }
}
ProductUtils.registerAction('open-popup', (btn) => {
  openPopup(btn.dataset.popupId);
});

// Modified function to close popups
function closePopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.classList.add('hidden');
    
    // Hide the overlay
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.add('hidden');
    
    // Remove the active popup class from the body
    document.body.classList.remove('popup-active');
    
    // On mobile, restore previous scroll position if it exists
    if (window.innerWidth < 768 && typeof window.lastScrollPosition !== 'undefined') {
      setTimeout(() => {
        window.scrollTo({
          top: window.lastScrollPosition,
          behavior: 'smooth'
        });
      }, 50);
    }
  }
}
ProductUtils.registerAction('close-popup', (btn) => {
  closePopup(btn.dataset.popupId);
});

function closeAllPopups() {
  const popups = document.querySelectorAll('#shipping-popup, #size-guide-popup, #materials-popup, #shipping-popup-mobile, #size-guide-popup-mobile, #materials-popup-mobile');
  popups.forEach(popup => {
    const popupId = popup.id;
    if (!popup.classList.contains('hidden')) {
      closePopup(popupId);
    }
  });
}

// Add click handler to overlay
const popupOverlay = document.getElementById('popup-overlay');
if (popupOverlay) {
  popupOverlay.addEventListener('click', function() {
    closeAllPopups();
  });
}

// Add click handlers for header elements on mobile
const mobileHeaderElements = ['site-header', 'header-overlay'].map(id => 
  document.querySelector('#' + id)
).filter(Boolean);

mobileHeaderElements.forEach(element => {
  element.addEventListener('click', function() {
    if (window.innerWidth < 768) {
      closeAllPopups();
    }
  });
});

/* ============================================
  MOBILE GALLERY UTILITIES (Global Functions)
  GLOBAL UTILITIES
============================================ */

function updateActiveMobileThumbnail(activeIndex) {
  const currentThumbnails = document.querySelectorAll('.mobile-thumbnail');
  currentThumbnails.forEach((thumb, index) => {
    if (index === activeIndex) {
      thumb.classList.remove('opacity-30');
      thumb.classList.add('opacity-100');
    } else {
      thumb.classList.remove('opacity-100');
      thumb.classList.add('opacity-30');
    }
  });
}

function scrollToMobileImage(index) {
  const mobileGalleryContainer = document.getElementById('mobile-gallery-container');
  const currentSlides = document.querySelectorAll('.mobile-gallery-slide');
  
  if (!mobileGalleryContainer || index < 0 || index >= currentSlides.length) return;
  
  const containerWidth = mobileGalleryContainer.offsetWidth;
  const scrollPosition = index * containerWidth;

  mobileGalleryContainer.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });

  updateActiveMobileThumbnail(index);
}

// Expose globally
window.updateActiveMobileThumbnail = updateActiveMobileThumbnail;
window.scrollToMobileImage = scrollToMobileImage;

/* ===========================
  PRODUCT IMAGE MANAGER CLASS
=========================== */
class ProductImageManager {
  constructor({ variants = window.productVariants || [], allImages = window.allProductImages || [] } = {}) {
    this.variants = variants;
    this.allImages = allImages;
    this.currentVariant = null;
    // this.init();

    // Constants
    this.DESKTOP_WIDTHS = [1200, 1800];
    this.MOBILE_WIDTHS = [800, 1600];
    this.THUMBNAIL_WIDTH = 150;
    this.DESKTOP_SIZES = '35vw';
    this.MOBILE_SIZES = '100vw';
  }

  getImagesForVariant(variant) {
    return ProductUtils.getImagesForVariant(variant, this.allImages, this.variants);
  }

  _buildSizedUrl(url, width) {
    return ProductUtils.buildImageUrl(url, width);
  }

  _buildSrcset(url, widths) {
    return ProductUtils.buildSrcset(url, widths);
  }

  // Public: load a variant's images into the DOM
  // If force===true, re-load even if currently loaded.
  loadVariant(variant, { force = false } = {}) {
    if (!variant) return;
    if (!force && this.currentVariant && this.currentVariant.id === variant.id) return;

    const images = this.getImagesForVariant(variant);
    if (!images?.length) return;

    if (window.innerWidth >= 768) {
      this._updateDesktop(images);
    } else {
      this._updateMobile(images);
    }

    this.currentVariant = variant;
  }

  _updateDesktop(images) {
    const leftHero = document.getElementById('left-hero');
    const rightHero = document.getElementById('right-hero');
    const galleryContainer = document.getElementById('right-gallery-rest');
    const scrollContainer = document.getElementById('image-scroll-container');
    
    if (!leftHero) return;

    // Calculate which right gallery image is currently visible
    let visibleIndex = 0;
    if (scrollContainer) {
      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      visibleIndex = Math.round(scrollTop / containerHeight);
    }

    // Update left hero
    // TODO: temp edit to disable loader
    this._setImage(leftHero, images[0], this.DESKTOP_WIDTHS, this.DESKTOP_SIZES, false);
    // this._setImage(leftHero, images[0], this.DESKTOP_WIDTHS, this.DESKTOP_SIZES, true);

    // Update right hero
    if (rightHero && images[1]) {
      // TODO: temp edit to disable loader
      this._setImage(rightHero, images[1], this.DESKTOP_WIDTHS, this.DESKTOP_SIZES, false);
      // this._setImage(rightHero, images[1], this.DESKTOP_WIDTHS, this.DESKTOP_SIZES, visibleIndex === 0);
    }

    // Update or create the rest of right gallery images
    if (galleryContainer) {
      const galleryUrls = images.slice(2);
      const existingImgs = galleryContainer.querySelectorAll('img');
      
      existingImgs.forEach((img, i) => {
        if (galleryUrls[i]) {
          this._setImage(img, galleryUrls[i], this.DESKTOP_WIDTHS, this.DESKTOP_SIZES, visibleIndex === i + 1);
        } else {
          img.remove(); // Remove if no corresponding URL
        }
      });
      
      // Add new if needed
      for (let i = existingImgs.length; i < galleryUrls.length; i++) {
        const img = this._createImage(galleryUrls[i], this.DESKTOP_WIDTHS, this.DESKTOP_SIZES);
        galleryContainer.appendChild(img);
      }
    }
  }

  _updateMobile(images) {
    const mobileHero = document.getElementById('mobile-hero');
    const mobileContainer = document.getElementById('mobile-gallery-container');
    
    if (!mobileHero) return;

    // Capture current scroll position BEFORE updating
    let currentScrollIndex = 0;
    if (mobileContainer) {
      const containerWidth = mobileContainer.offsetWidth;
      const scrollPosition = mobileContainer.scrollLeft;
      currentScrollIndex = Math.round(scrollPosition / containerWidth);
    }

    // Update mobile hero
    this._setImage(mobileHero, images[0], this.MOBILE_WIDTHS, this.MOBILE_SIZES, currentScrollIndex === 0);

    // Update mobile gallery slides
    if (mobileContainer) {
      const existingSlides = Array.from(mobileContainer.querySelectorAll('.mobile-gallery-slide'));
      
      // First slide already exists in HTML (mobile-hero), skip it
      // Update additional slides
      existingSlides.slice(1).forEach((slide, i) => {
        const img = slide.querySelector('img');
        const urlIndex = i + 1; // Offset because first slide is index 0
        if (images[urlIndex] && img) {
          this._setImage(img, images[urlIndex], this.MOBILE_WIDTHS, this.MOBILE_SIZES, currentScrollIndex === i + 1);
        } else if (!images[urlIndex]) {
          slide.remove();
        }
      });
      
      // Add new slides if needed
      for (let i = existingSlides.length; i < images.length; i++) {
        const slide = this._createMobileSlide(images[i]);
        mobileContainer.appendChild(slide);
      }
    }
    
    // Update thumbnails
    this._updateMobileThumbnails(images);

    // Set active thumbnail based on current scroll position (not always 0)
    const maxIndex = images.length - 1;
    const targetIndex = Math.min(currentScrollIndex, maxIndex); // Cap if fewer images
    
    if (typeof window.updateActiveMobileThumbnail === 'function') {
      window.updateActiveMobileThumbnail(targetIndex);
    }
  }

  _updateMobileThumbnails(images) {
    const wrapper = document.querySelector('.mobile-thumbnail-wrapper .mobile-gallery');
    if (!wrapper) return;

    wrapper.innerHTML = ''; // Clear and rebuild
    
    images.forEach((url, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flex-shrink-0 h-[70px] w-[45.5px] mr-3 mobile-thumbnail bg-transparent border-0 p-0';
      btn.dataset.index = idx;
      btn.onclick = () => {
        if (window.scrollToMobileImage) window.scrollToMobileImage(idx);
      };

      const thumb = this._buildSizedUrl(url, 150);
      btn.innerHTML = `<img src="${thumb}" class="w-full h-full object-cover" loading="lazy" decoding="async">`;
      
      wrapper.appendChild(btn);
    });
    
    // Update active thumbnail
    if (typeof window.updateActiveMobileThumbnail === 'function') {
      window.updateActiveMobileThumbnail(0);
    }
  }

  _setImage(imgElement, url, widths, sizes, progressive = false) {
    console.log('_setImage', imgElement.id || imgElement.className, 'progressive:', progressive);
    if (progressive) {
      const highResUrl = ProductUtils.buildImageUrl(url, widths[0]);
      const testImg = new Image();
      testImg.onload = function() {
        if (testImg.complete && testImg.naturalWidth > 0) {
          // already cached, load directly
          imgElement.srcset = ProductUtils.buildSrcset(url, widths);
          imgElement.src = highResUrl;
          imgElement.sizes = sizes;
        } else {
          ProductUtils.setProgressiveImage(imgElement, url, widths, sizes);
        }
      };
      testImg.src = highResUrl;
      if (testImg.complete) {
        imgElement.srcset = ProductUtils.buildSrcset(url, widths);
        imgElement.src = highResUrl;
        imgElement.sizes = sizes;
      } else {
        ProductUtils.setProgressiveImage(imgElement, url, widths, sizes);
      }
    } else {
      imgElement.src = ProductUtils.buildImageUrl(url, widths[0]);
      imgElement.srcset = ProductUtils.buildSrcset(url, widths);
      imgElement.sizes = sizes;
    }
  }

  _createImage(url, widths, sizes) {
    const img = document.createElement('img');
    img.className = 'w-full h-full object-contain snap-center';
    img.loading = 'lazy';
    img.decoding = 'async';
    this._setImage(img, url, widths, sizes);
    return img;
  }

  _createMobileSlide(url) {
    const slide = document.createElement('div');
    slide.className = 'w-full h-full flex-shrink-0 snap-center mobile-gallery-slide relative';
    
    const img = document.createElement('img');
    img.className = 'w-full h-full object-contain';
    img.loading = 'lazy';
    img.decoding = 'async';
    this._setImage(img, url, this.MOBILE_WIDTHS, this.MOBILE_SIZES);
    
    slide.appendChild(img);
    return slide;
  }
}

/* =============================================
  VARIANT SELECTOR CLASS
============================================= */
class VariantSelector {
  constructor(productImageManager, variants) {
    this.imageManager = productImageManager;
    this.variants = variants;
    this.selections = {}; // Current option selections
    this.totalOptions = window.productTotalOptions;
  }

  init(initialVariant) {
    if (!initialVariant) return;
    
    // Set initial selection in the selections map
    if (initialVariant.option1) {
      this.selections['option1'] = initialVariant.option1;
    }
    // if (initialVariant.option2) {
    //   this.selections['option2'] = initialVariant.option2;
    // }
    
    // Update size availability for initial color
    if (initialVariant.option1 && this.totalOptions > 1) {
      this._updateSizeAvailability(initialVariant.option1);
    }

    // // Update buttons to reflect initial variant state
    // if (Object.keys(this.selections).length === this.totalOptions) {
    //   // All options are selected (e.g., color + size both set)
    //   updateAddToCartButtons(true, initialVariant);
    // } else {
    //   // Only partial selection (e.g., only color, no size yet)
    //   updateAddToCartButtons(false);
    // }
    
    // Update price display
    // TODO: add updateVariantPrice function to specify variant prices instead of first variant price
    // if (typeof window.updateVariantPrice === 'function') {
    //   window.updateVariantPrice(initialVariant);
    // }

    const matchingVariant = this._findMatchingVariant();

    this._updateFormAndButtons(matchingVariant);
  }

  // Main entry point (called from onclick handlers)
  selectOption(element, optionPosition, optionValue) {
    if (!this._isSelectable(element)) return;
    
    this._updateUI(element, optionPosition, optionValue);
    this._updateSelections(optionPosition, optionValue);
    
    const matchingVariant = this._findMatchingVariant();
    
    // Handle color change (load images immediately)
    if (optionPosition === "1") {
      this._handleColorChange(optionValue);
    }
    
    // Update form and buttons based on selection state
    this._updateFormAndButtons(matchingVariant);
  }

  _isSelectable(element) {
    const result = !element.disabled && 
          element.getAttribute('aria-disabled') !== 'true' &&
          !element.closest('.color-chip-container')?.classList.contains('active');
    return result;
  }

  _updateUI(element, optionPosition, optionValue) {
    // Clear previous selections for this option
    const selectableItems = document.querySelectorAll(
      `.variant-button[data-option-position="${optionPosition}"], 
      .color-chip[data-option-position="${optionPosition}"]`
    );
    selectableItems.forEach(item => {
      item.removeAttribute('data-selected');
      item.classList.remove('bg-[#D9D9D9]');
      // Clear active from chip containers
      item.closest('.color-chip-container')?.classList.remove('active');
    });

    // Mark new selection
    element.setAttribute('data-selected', 'true');
    if (element.classList.contains('variant-button') && !element.classList.contains('color-chip')) {
      element.classList.add('bg-[#D9D9D9]');
    }
    // Mark new chip container as active
    element.closest('.color-chip-container')?.classList.add('active');
  }

  _updateSelections(optionPosition, optionValue) {
    this.selections[`option${optionPosition}`] = optionValue;
  }

  _findMatchingVariant() {
    const allSelected = Object.keys(this.selections).length === this.totalOptions;
    
    if (!allSelected) return null;
    
    return this.variants.find(variant => {
      return Object.keys(this.selections).every(option => {
        const position = parseInt(option.replace('option', ''), 10);
        return variant[`option${position}`] === this.selections[`option${position}`];
      });
    });
  }

  _handleColorChange(colorValue) {
    // Find first variant with this color that has images
    const colorVariant = this.variants.find(v => v.option1 === colorValue && v.featured_image && v.available) ||
                        this.variants.find(v => v.option1 === colorValue && v.featured_image) ||
                        this.variants.find(v => v.option1 === colorValue);

    if (colorVariant && this.imageManager) {
      this.imageManager.loadVariant(colorVariant);
    }

    // Update size availability for this color
    if (this.totalOptions > 1) {
      this._updateSizeAvailability(colorValue);
    }
  }

  _updateSizeAvailability(colorValue) {
    const availableSizes = this.variants
      .filter(v => v.option1 === colorValue && v.available)
      .map(v => v.option2);

      // Reset out-of-stock state before evaluating new color
      document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.classList.remove('out-of-stock');
      });

    const sizeButtons = document.querySelectorAll('.variant-button[data-option-position="2"]');

    sizeButtons.forEach(btn => {
      const sizeValue = btn.getAttribute("data-value");
      if (!availableSizes.includes(sizeValue)) {
        btn.disabled = true;
        btn.classList.add("opacity-50");
      } else {
        btn.disabled = false;
        btn.classList.remove("opacity-50");
      }
    });

    // Disable add-to-cart if no sizes available
    if (availableSizes.length === 0) {
      updateAddToCartButtons(false, null, true);
    } else if (availableSizes.length === 1) { // TODO: fix auto select for one size available
      const matchingSizeBtns = [...sizeButtons].filter(
        btn => btn.getAttribute("data-value") === availableSizes[0]
      );
      
      // Clear all first, once
      [...sizeButtons].forEach(btn => {
        btn.removeAttribute('data-selected');
        btn.classList.remove('bg-[#D9D9D9]');
      });
      
      // Then highlight all matches
      matchingSizeBtns.forEach(btn => {
        btn.setAttribute('data-selected', 'true');
        btn.classList.add('bg-[#D9D9D9]');
      });
      
      this._updateSelections("2", availableSizes[0]);

      const matchingVariant = this._findMatchingVariant();
      this._updateFormAndButtons(matchingVariant);
    } else {
      updateAddToCartButtons(false);
    }
  }

  _updateFormAndButtons(matchingVariant) {
    const allSelected = Object.keys(this.selections).length === this.totalOptions;
    const isUnavailableCombination = allSelected && !matchingVariant;

    // Update hidden variant ID inputs
    if (matchingVariant) {
      const desktopId = document.getElementById('variant-id');
      const mobileId = document.getElementById('variant-id-mobile');
      if (desktopId) desktopId.value = matchingVariant.id;
      if (mobileId) mobileId.value = matchingVariant.id;
    }

    // Update add-to-cart buttons
    if (matchingVariant) {
      updateAddToCartButtons(true, matchingVariant);
    } else if (isUnavailableCombination) {
      updateAddToCartButtons(false, null, true);
    } else {
      updateAddToCartButtons(false);
    }
  }
}
ProductUtils.registerAction('select-variant-pdp', (btn) => {
  if (window.variantSelector) {
    window.variantSelector.selectOption(btn, btn.dataset.optionPosition, btn.dataset.value);
  }
});

/* ===========================
  MAIN INITIALIZATION
=========================== */

let productImageManager;
let variantSelector;

document.addEventListener('DOMContentLoaded', () => {
  const data = {
      variants: window.productVariants || [],
      allImages: window.allProductImages || []
  };

  productImageManager = new ProductImageManager(data);
  window.productImageManager = productImageManager;

  // Initialize VariantSelector (depends on productImageManager)
  variantSelector = new VariantSelector(
    productImageManager,
    window.productVariants || []
  );
  window.variantSelector = variantSelector;

  // Load initial variant
  const firstVariant = data.variants.find(v => v.available) || data.variants[0];

  if (firstVariant) {
    productImageManager.loadVariant(firstVariant);
    variantSelector.init(firstVariant);
    // variantSelector._updateSizeAvailability(firstVariant.option1);

    // TODO: update this hot fix of add to cart button, should be done in variant selector
    // const matchingVariant = variantSelector._findMatchingVariant();
    // variantSelector._updateFormAndButtons(matchingVariant);

    // UI: Mark selected color chip
    const colorBtn = document.querySelector(`.color-chip[data-value="${firstVariant.option1}"]`);
    if (colorBtn) {
      colorBtn.setAttribute("data-selected", "true");
      colorBtn.closest(".color-chip-container")?.classList.add("active");
    }
  }

  // mobile gallery scroll listener
  const mobileGalleryContainer = document.getElementById('mobile-gallery-container');
  if (mobileGalleryContainer) {
    let scrollTimeout;
    mobileGalleryContainer.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerWidth = mobileGalleryContainer.offsetWidth;
        const scrollPosition = mobileGalleryContainer.scrollLeft;
        const activeIndex = Math.round(scrollPosition / containerWidth);
        updateActiveMobileThumbnail(activeIndex);
      }, 50);
    }, { passive: true });
  }

  // Initialize all UI components
  initColorChips();
  initCartFormSubmission();
  initProductInfoHover();
  cleanupMaterialsContent();
});

function initColorChips() {
  // Desktop color chips
  const colorChipsContainer = document.getElementById('color-chips-container');
  const selectedColorName = document.getElementById('selected-color-name');
  let selectedColor = '';

  if (colorChipsContainer && selectedColorName) {
    const setInitialState = () => {
      const activeChip = colorChipsContainer.querySelector('.color-chip-container.active .color-chip');
      if (activeChip) {
        selectedColor = activeChip.dataset.colorName;
        selectedColorName.textContent = selectedColor;
      } else {
        const firstChip = colorChipsContainer.querySelector('.color-chip');
        if (firstChip) {
          selectedColor = firstChip.dataset.colorName;
          selectedColorName.textContent = selectedColor;
        }
      }
    };

    setInitialState();

    colorChipsContainer.addEventListener('mouseover', (event) => {
      const chip = event.target.closest('.color-chip');
      if (chip) {
        selectedColorName.textContent = chip.dataset.colorName;
      }
    });

    colorChipsContainer.addEventListener('mouseleave', () => {
      selectedColorName.textContent = selectedColor;
    });

    colorChipsContainer.addEventListener('click', (event) => {
      const chip = event.target.closest('.color-chip');
      if (chip) {
        selectedColor = chip.dataset.colorName;
        selectedColorName.textContent = selectedColor;

        // const allChipContainers = colorChipsContainer.querySelectorAll('.color-chip-container');
        // allChipContainers.forEach(container => container.classList.remove('active'));
        // chip.closest('.color-chip-container').classList.add('active');
      }
    });
  }

  // Mobile color chips
  const mobileColorChipsContainer = document.getElementById('mobile-color-chips-container');
  const mobileSelectedColorName = document.getElementById('mobile-selected-color-name');

  if (mobileColorChipsContainer && mobileSelectedColorName) {
    const setMobileInitialState = () => {
      const activeChip = mobileColorChipsContainer.querySelector('.color-chip-container.active .color-chip');
      if (activeChip) {
        mobileSelectedColorName.textContent = activeChip.dataset.colorName;
      } else {
        const firstChip = mobileColorChipsContainer.querySelector('.color-chip');
        if (firstChip) {
          mobileSelectedColorName.textContent = firstChip.dataset.colorName;
        }
      }
    };

    setMobileInitialState();

    mobileColorChipsContainer.addEventListener('click', (event) => {
      const chip = event.target.closest('.color-chip');
      if (chip) {
        mobileSelectedColorName.textContent = chip.dataset.colorName;

        // const allChipContainers = mobileColorChipsContainer.querySelectorAll('.color-chip-container');
        // allChipContainers.forEach(container => container.classList.remove('active'));
        // chip.closest('.color-chip-container').classList.add('active');
      }
    });
  }
}

function initCartFormSubmission() {
  const buttons = document.querySelectorAll('form .add-to-cart-btn');
  const addToCartForms = [];
  
  buttons.forEach(btn => {
    const form = btn.closest('form');
    if (form && !addToCartForms.includes(form)) {
      addToCartForms.push(form);
    }
  });
  
  addToCartForms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      try {
        const formData = new FormData(form);
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Add to cart failed');
        
        const result = await response.json();
        
        const cartResponse = await fetch('/cart.js');
        const cart = await cartResponse.json();
        
        updateCartCountDisplay(cart.item_count);
        
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { item_count: cart.item_count }
        }));
        
        const wasVariantsSelected = submitButton.classList.contains('variants-selected');
        
        submitButton.textContent = 'Added';
        submitButton.classList.remove('variants-selected');
        submitButton.classList.remove('container-hovered');
        submitButton.classList.add('success');
        
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.classList.remove('success');
          if (wasVariantsSelected) {
            submitButton.classList.add('variants-selected');
          }
          if (document.querySelector('.product-info-container.container-hover')) {
            submitButton.classList.add('container-hovered');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        submitButton.textContent = 'Error';
        submitButton.classList.add('error');
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.classList.remove('error');
        }, 2000);
      }
    });
  });
}

function updateCartCountDisplay(count) {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'block' : 'none';
  }
}

function initProductInfoHover() {
  // Only on desktop
  if (window.innerWidth < 768) return;

  const productInfoContainer = document.querySelector('.product-info-container');
  const productInfoItems = document.querySelectorAll('.product-info-item');
  const navContainer = document.querySelector('.nav-container');
  
  if (!productInfoContainer) return;

  function handleMouseEnter() {
    document.querySelectorAll('.variant-button[data-selected="true"]').forEach(button => {
      button.classList.add('bg-[#D9D9D9]');
    });
    
    productInfoContainer.classList.add('container-hover');
    
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.classList.add('container-hovered');
    });
    
    // Expand details container
    const detailsContainer = productInfoContainer.querySelector('.product-details-container');
    if (detailsContainer) {
      detailsContainer.style.maxHeight = '1000px';
    }
  }

  function handleMouseLeave() {
    productInfoItems.forEach(item => {
      item.style.backgroundColor = 'rgba(254,254,254,0.60)';
    });
    
    document.querySelectorAll('.variant-button[data-selected="true"]').forEach(button => {
      button.classList.remove('bg-[#D9D9D9]');
    });
    
    productInfoContainer.classList.remove('container-hover');
    
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.classList.remove('container-hovered');
    });

    if (navContainer) {
      navContainer.style.backgroundColor = 'rgba(254,254,254,0.60)';
    }
    
    // Collapse details container
    const detailsContainer = productInfoContainer.querySelector('.product-details-container');
    if (detailsContainer) {
      detailsContainer.style.maxHeight = '0';
    }
  }
  
  productInfoContainer.addEventListener('mouseenter', handleMouseEnter);
  productInfoContainer.addEventListener('mouseleave', handleMouseLeave);
  
  if (navContainer) {
    navContainer.addEventListener('mouseenter', handleMouseEnter);
    navContainer.addEventListener('mouseleave', handleMouseLeave);
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
      productInfoItems.forEach(item => {
        item.style.backgroundColor = 'rgba(254,254,254,0.60)';
      });
      
      if (navContainer) {
        navContainer.style.backgroundColor = 'rgba(254,254,254,0.60)';
      }
    }
  });
}

function cleanupMaterialsContent() {
  const materialsContentWrappers = document.querySelectorAll('.materials-content-wrapper');
  
  materialsContentWrappers.forEach(materialsContentWrapper => {
    const text = materialsContentWrapper.textContent.trim();
    
    if (text.startsWith('{') && text.includes('"type":"root"')) {
      try {
        const data = JSON.parse(text);
        materialsContentWrapper.innerHTML = '';
        
        if (data.type === 'root' && Array.isArray(data.children)) {
          data.children.forEach((item) => {
            if (item.type === 'paragraph' && Array.isArray(item.children)) {
              const p = document.createElement('p');
              p.className = 'text-[13px] leading-relaxed mb-[8px]';

              item.children.forEach((child) => {
                if (child.type === 'text' && typeof child.value === 'string') {
                  p.textContent += child.value;
                }
              });

              if (p.textContent.trim()) {
                materialsContentWrapper.appendChild(p);
              }
            }
          });
        }
      } catch (e) {
        console.error('Error parsing materials JSON:', e);
        
        const valueMatches = text.match(/"value":"([^"]+)"/g);
        if (valueMatches && valueMatches.length) {
          materialsContentWrapper.innerHTML = '';
          
          valueMatches.forEach(match => {
            const value = match.replace('"value":"', '').replace('"', '');
            if (value && value.trim()) {
              const p = document.createElement('p');
              p.className = 'text-[13px] leading-relaxed mb-[8px]';
              p.textContent = value.trim();
              materialsContentWrapper.appendChild(p);
            }
          });
        }
      }
    }
  });
}

function updateAddToCartButtons(allSelected, selectedVariant, isUnavailableCombination) {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  
  // Get inventory containers
  const desktopInventoryContainer = document.getElementById('desktop-inventory-status');
  const mobileInventoryContainer = document.getElementById('mobile-inventory-status');
  
  // Clear any existing inventory indicators
  if (desktopInventoryContainer) {
    desktopInventoryContainer.innerHTML = '';
    desktopInventoryContainer.style.display = 'none';
  }
  
  if (mobileInventoryContainer) {
    mobileInventoryContainer.innerHTML = '';
    mobileInventoryContainer.style.display = 'none';
  }
  
  if (allSelected && selectedVariant) {
    // Check if the variant is available
    if (selectedVariant.available) {
      // Variant is in stock
      addToCartButtons.forEach(button => {
        button.disabled = false;
        button.classList.add('variants-selected');
        button.classList.remove('out-of-stock');
        button.textContent = 'ADD TO CART';
      });
      
      // Display inventory level if tracking is enabled and quantity is low
      // if (selectedVariant.inventory_quantity !== null && selectedVariant.inventory_quantity <= 10 && selectedVariant.inventory_quantity > 0) {
      //   const inventoryMessage = `Only ${selectedVariant.inventory_quantity} left`;
        
      //   if (desktopInventoryContainer) {
      //     desktopInventoryContainer.innerHTML = inventoryMessage;
      //     desktopInventoryContainer.style.display = 'block';
      //   }
        
      //   if (mobileInventoryContainer) {
      //     mobileInventoryContainer.innerHTML = inventoryMessage;
      //     mobileInventoryContainer.style.display = 'block';
      //   }
      // }
    } else {
      // Variant is sold out
      addToCartButtons.forEach(button => {
        button.disabled = true;
        button.classList.remove('variants-selected');
        button.classList.add('out-of-stock');
        button.textContent = 'SOLD OUT';
      });
    }
  } else if (isUnavailableCombination) {
    // All options selected but no matching variant (unavailable combination)
    addToCartButtons.forEach(button => {
      button.disabled = true;
      button.classList.remove('variants-selected');
      button.classList.add('out-of-stock');
      button.textContent = 'SOLD OUT';
    });
  } else {
    // Not all variants selected yet — reset to neutral state
    addToCartButtons.forEach(button => {
      const wasOutOfStock = button.classList.contains('out-of-stock');

      button.disabled = true;
      button.classList.remove('variants-selected');

      if (wasOutOfStock) {
        // Preserve SOLD OUT state
        button.textContent = 'SOLD OUT';
      } else {
        button.classList.remove('out-of-stock');
        button.textContent = 'ADD TO CART';
      }
    });
    // NEW: Check if button already has out-of-stock state from Liquid
    // addToCartButtons.forEach(button => {
    //   const wasOutOfStock = button.classList.contains('out-of-stock');
      
    //   button.disabled = true;
    //   button.classList.remove('variants-selected');
      
    //   if (wasOutOfStock) {
    //     // Preserve SOLD OUT state
    //     button.textContent = 'SOLD OUT';
    //     // Keep the class
    //   } else {
    //     // Normal "not selected" state
    //     button.classList.remove('out-of-stock');
    //     button.textContent = 'ADD TO CART';
    //   }
    // });
  }
}