class NewsletterPopup extends HTMLElement {
  constructor() {
    super();
    this.popup = this.querySelector("div");
    this.closeButton = this.querySelector("#close-newsletter");
    this.init();
  }

  init() {
    // Check local storage to see if the pop-up should be shown
    if (localStorage.getItem("newsletterDismissed")) {
      this.popup.removeAttribute("open");
      return;
    }

    // if ?customer_posted=true#contact_form in the url dismiss the pop up
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("customer_posted") === "true") {
      this.popup.removeAttribute("open");
      localStorage.setItem("newsletterDismissed", "true");
      return;
    }

    // Automatically open the popup when the page loads
    setTimeout(() => {
      this.popup.setAttribute("open", "true");
    }, 500); // Delay slightly to ensure smooth transition

    // Close button logic
    this.closeButton.addEventListener("click", () => {
      this.popup.removeAttribute("open");
      // local storage after 5 seconds
      setTimeout(() => {
        localStorage.setItem("newsletterDismissed", "true");
      }, 500);
    });
  }
}

// Define the custom element
customElements.define("newsletter-popup", NewsletterPopup);

class AccordionElement extends HTMLElement {
  constructor() {
    super();
    this.details = this.closest("details");
    this.summary = this.details.querySelector("summary");

    this._resetHeight();

    // Bind event handlers
    this.onClick = this.onClick.bind(this);
    this.onResize = this.onResize.bind(this);

    // bind onclick to summary element
    this.summary.addEventListener("click", this.onClick);

    // Listen for window resize event
    window.addEventListener("resize", this.onResize);
  }

  _open() {
    this.details.setAttribute("data-opening", "true");
    this.details.setAttribute("open", "true");

    this.details.style.height = `${
      this.summary.scrollHeight + this.scrollHeight
    }px`;
  }

  _resetHeight() {
    this.details.style.height = `${this.summary.scrollHeight}px`;
  }

  _close() {
    this.details.removeAttribute("data-opening");
    this.details.setAttribute("data-closing", "true");

    setTimeout(() => {
      this.details.removeAttribute("open");
      this.details.removeAttribute("data-closing");
    }, 300);

    this.details.style.height = `${this.summary.scrollHeight}px`;
  }

  onClick(e) {
    e.preventDefault();
    if (!this.details.open) {
      this._open();
    } else {
      this._close();
    }
  }

  onResize() {
    if (this.details.open) {
      this.details.style.height = `${
        this.summary.scrollHeight + this.scrollHeight
      }px`;
    } else {
      this._resetHeight();
    }
  }

  // Clean up event listener when element is removed from the DOM
  disconnectedCallback() {
    window.removeEventListener("resize", this.onResize);
  }
}

if (!customElements.get("accordion-element")) {
  customElements.define("accordion-element", AccordionElement);
}

class QuickAddToCart extends HTMLElement {
  constructor() {
    super();
    this.variantId = this.getAttribute("data-variant-id");
    this.onClick = this.onClick.bind(this);
    this.addEventListener("click", this.onClick);
  }

  async onClick(e) {
    e.preventDefault();
    const res = await fetch("/cart/add", {
      method: "post",
      body: new URLSearchParams({
        id: this.variantId,
        quantity: 1,
      }),
    });

    // update cart
    const text = await res.text();
    const html = document.createElement("div");
    html.innerHTML = text;

    const cartDrawer = document.getElementById("cart");
    cartDrawer.innerHTML = html.querySelector("#cart").innerHTML;

    cartDrawer.openDrawer();
  }
}

if (!customElements.get("quick-add")) {
  customElements.define("quick-add", QuickAddToCart);
}

class SizeChart extends HTMLElement {
  constructor() {
    super();

    // Parse the JSON data from the `data-size-chart` attribute
    this.sizeChart = JSON.parse(this.getAttribute("data-size-chart") || "[]");

    // Create a shadow DOM for encapsulation
    const shadow = this.attachShadow({ mode: "open" });

    // Apply styles and add the table to the shadow DOM
    const style = document.createElement("style");
    style.textContent = `
  * {
    font-family: "Arial", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    letter-spacing: -0.24px;
    line-height: 13px;
    color: white;
    text-align: left;
  }

  .table-header,
  .table-header th {
    text-transform: uppercase;
  }

  table {
    width: 100%;
    border-radius: 8px;
    border-spacing: 0;
    outline: 0;
    background-color: black;
    border-collapse: collapse;
    padding: 10px; /* Added padding around the table */
  }

  th, td {
    width: 1%;
    padding: 15px; /* Increased padding inside each cell */
  }

  th {
    padding-bottom: 10px;
  }

  td {
    padding: 10px; /* Increased padding for better spacing */
  }

  tr:last-child td {
    padding-bottom: 10px;
  }

  .break {
    height: 0.5px;
    background-color: #D1D1D1;
  }
`;

    // Generate the table and append it to the shadow DOM
    const table = this.generateTable();
    shadow.appendChild(style);
    shadow.appendChild(table);
  }

  // Method to generate the table based on JSON data
  generateTable() {
    const table = document.createElement("table");

    // Create headers from the first item in the data array
    if (this.sizeChart.length > 0) {
      const headers = Object.values(this.sizeChart[0]);
      const thead = document.createElement("thead");
      thead.classList.add("table-header");

      const headerRow = document.createElement("tr");
      headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create table body with data
      const tbody = document.createElement("tbody");
      this.sizeChart.slice(1).forEach((rowData) => {
        const row = document.createElement("tr");

        Object.values(rowData).forEach((cellData) => {
          const cell = document.createElement("td");
          cell.textContent = cellData;
          row.appendChild(cell);
        });

        tbody.appendChild(row);
      });
      table.appendChild(tbody);
    }

    return table;
  }
}

// Define the custom element if it's not already defined
if (!customElements.get("size-chart")) {
  customElements.define("size-chart", SizeChart);
}

class MobileMenu extends HTMLElement {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);

    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    // get the menu button
    this.menuButton = this.querySelector("button[id='menu-button']");
    this.mobileMenu = this.querySelector("nav[id='mobile-menu']");
    this.closeButton = this.querySelector("button[id='close']");
    this.menuBg = this.querySelector("div[id='bg-menu']");

    console.log(this.menuButton);

    // bind the click event

    this.closeButton.addEventListener("click", this.onClick);
    this.menuButton.addEventListener("click", this.onClick);
  }

  onClick(e) {
    e.preventDefault();

    if (this.hasAttribute("open")) {
      document.body.style.overflow = "auto";
      this.closeMenu();
    } else {
      document.body.style.overflow = "hidden";
      this.openMenu();
    }
  }
  openMenu() {
    this.mobileMenu.setAttribute("open", "true");
    this.setAttribute("open", "true");
  }

  closeMenu() {
    this.removeAttribute("open");
    this.mobileMenu.removeAttribute("open");
  }
}

if (!customElements.get("mobile-menu")) {
  customElements.define("mobile-menu", MobileMenu);
}

class CartItem extends HTMLElement {
  constructor() {
    super();
    // bind click event to button id decrease
    this.decreaseButton = this.querySelector("button[id='decrease']");
    this.increaseButton = this.querySelector("button[id='increase']");
    // this.quantity = parseInt(this.querySelector("p[id='quantity']").innerHTML);

    this.pid = this.getAttribute("data-product-id");
    // this.handleQuantity = this.handleQuantity.bind(this);

    this.decreaseButton.addEventListener("click", this.handleQuantity);
    this.increaseButton.addEventListener("click", this.handleQuantity);
  }

  // async handleQuantity(e) {
  //   console.log(e.target.id);
  //   if (e.target.id === "decrease") {
  //     if (parseInt(this.quantity) === 1) {
  //       console.log("too low");
  //     }
  //     if (parseInt(this.quantity) > 1) {
  //       document
  //         .querySelector("cart-drawer")
  //         .updateQuantity(this.pid, this.quantity - 1);
  //       console.log("decrease it by 1 bro");
  //     }
  //   }
  //   if (e.target.id === "increase") {
  //     document
  //       .querySelector("cart-drawer")
  //       .updateQuantity(this.pid, this.quantity + 1);
  //   }
  //   e.preventDefault();
  //   console.log(this.pid, this.quantity);
  // }
}

if (!customElements.get("cart-item")) {
  customElements.define("cart-item", CartItem);
}

class ProductDescription extends HTMLElement {
  constructor() {
    super();

    this.toggleDescription = this.querySelector("#toggle-description");
    this.toggleShipping = this.querySelector("#toggle-shipping");
    this.toggleReturns = this.querySelector("#toggle-returns");

    this.descriptionContent = this.querySelector("#description-content");
    this.shippingContent = this.querySelector("#shipping-content");
    this.returnsContent = this.querySelector("#returns-content");

    this.tabs = {
      description: this.descriptionContent,
      shipping: this.shippingContent,
      returns: this.returnsContent,
    };

    this.buttons = {
      description: this.toggleDescription,
      shipping: this.toggleShipping,
      returns: this.toggleReturns,
    };

    if (this.querySelector("#toggle-sizing")) {
      this.toggleSizing = this.querySelector("#toggle-sizing");
      this.sizingContent = this.querySelector("#sizing-content");

      this.tabs.sizing = this.sizingContent;
      this.buttons.sizing = this.toggleSizing;
    }

    this.onClick = this.onClick.bind(this);
    this.addEventListener("click", this.onClick);

    this.switchTab("description");
  }

  onClick(e) {
    const targetId = e.target.id.replace("toggle-", "");
    console.log(targetId, this.tabs);
    if (this.tabs[targetId]) {
      this.switchTab(targetId);
    }
  }

  switchTab(selectedTab) {
    // Hide all content
    Object.values(this.tabs).forEach((tab) => tab.classList.add("hidden"));
    // Remove 'active' from all buttons
    Object.values(this.buttons).forEach((button) => {
      button.setAttribute("aria-selected", "false");
      button.classList.remove("active");
    });

    // Show selected content
    this.tabs[selectedTab].classList.remove("hidden");

    this.buttons[selectedTab].setAttribute("aria-selected", "true");
    this.buttons[selectedTab].classList.add("active");
  }
}
if (!customElements.get("product-description")) {
  customElements.define("product-description", ProductDescription);
}

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);

    this.addEventListener("click", this.onClick);
  }

  onClick(e) {
    // Close the cart if the user clicks outside of the cart
    const isCloseButton = e.target.closest("#close");

    if (e.target.id === "cart" || isCloseButton) {
      e.preventDefault();

      if (window.location.pathname === "/cart") {
        window.location.href = "/";
      } else {
        this.closeDrawer();
      }
    }
  }

  openDrawer() {
    this.setAttribute("open", "true");

    //disable scroll
    document.body.style.overflow = "hidden";
  }

  closeDrawer() {
    this.removeAttribute("open");

    //enable scroll
    document.body.style.overflow = "auto";
  }

  async updateQuantity(itemId, quantity) {
    await fetch("/cart/change", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: itemId,
        quantity: quantity,
      }),
    }).then((res) => {
      console.log(res);
    });
    // Update the cart drawer after the quantity change
    await this.update();
  }

  async update() {
    const res = await fetch("/?section_id=cart-drawer");
    const text = await res.text();
    const html = document.createElement("div");
    html.innerHTML = text;

    const cartDrawer = document.getElementById("cart");
    cartDrawer.innerHTML = html.querySelector("#cart").innerHTML;

    console.log(html);
  }

  async addToCart(form) {
    await fetch("/cart/add", {
      method: "post",
      body: new FormData(form),
    });
    // update cart
    await this.update().then(() => {
      this.openDrawer();
    });
  }
}

if (!customElements.get("cart-drawer")) {
  customElements.define("cart-drawer", CartDrawer);
}

class AddToCart extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector("button[id='atc']");
    this.quickCheckout = this.querySelector("button[id='quick-checkout']");
    this.onClick = this.onClick.bind(this);
    this.quickCheckout.addEventListener("click", this.onClickQuickCheckout);
    this.button.addEventListener("click", this.onClick);

    this.variants = this.querySelectorAll("div[id='variant']");
    this.setInitialVariant();
    this.activeVariant = this.activeVariant.bind(this);
    this.variants.forEach((variant) => {
      variant.addEventListener("click", (e) => {
        this.activeVariant(e);
      });
    });
  }

  setInitialVariant() {
    let activeVariant = this.querySelector("input[id='selected-variant-id']");
    this.variants.forEach((variant) => {
      if (variant.getAttribute("data-variant-id") === activeVariant.value) {
        variant.classList.add("selected");
      }
    });
  }

  async activeVariant(e) {
    let activeVariant = this.querySelector("input[id='selected-variant-id']");
    // highlight the selected variant
    this.variants.forEach((variant) => {
      variant.classList.remove("selected");
    });
    e.target.classList.add("selected");
    activeVariant.value = e.target.getAttribute("data-variant-id");

    // Also update the hidden input for the form
    const form = this.closest("form");
    if (form) {
      const formVariantInput = form.querySelector("input[name='id']");
      if (formVariantInput) {
        formVariantInput.value = e.target.getAttribute("data-variant-id");
      }
    }
  }

  async onClickQuickCheckout(e) {
    e.preventDefault();
    const form = this.closest("form");
    const variantId = form.querySelector("input[name='id']").value;
    let checkoutLink = `/cart/${variantId}:1`;
    window.open(checkoutLink, "_self");
  }

  async onClick(e) {
    e.preventDefault();
    const form = this.closest("form");
    document.querySelector("cart-drawer").addToCart(form);
  }
}

if (!customElements.get("cart-add")) {
  customElements.define("cart-add", AddToCart);
}

class HeaderCart extends HTMLElement {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
    this.addEventListener("click", this.onClick);
  }

  onClick(e) {
    e.preventDefault();
    document.querySelector("cart-drawer").openDrawer();
  }
}

if (!customElements.get("header-cart")) {
  customElements.define("header-cart", HeaderCart);
}

// Turn into a more abstracted component for the drawer
class RemoveButton extends HTMLElement {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
    this.addEventListener("click", this.onClick);
  }
  async onClick(e) {
    e.preventDefault();
    console.log(e.target.href);

    const form = this.closest("form");

    await fetch(e.target.href, {
      method: "post",
      body: new FormData(form),
    });

    document.querySelector("cart-drawer").update();
  }
}

if (!customElements.get("remove-button")) {
  customElements.define("remove-button", RemoveButton);
}

class Newsletter extends HTMLElement {
  constructor() {
    super();
    // elements are input with id email, button with id subscribe
    this.email = this.querySelector("input[id='email']");
    this.button = this.querySelector("button[id='subscribe']");
    this.onClick = this.onClick.bind(this);
    console.log(this.button);

    // if ?customer_posted=true#contact_form is in the url, show a success message
    const urlParams = new URLSearchParams(window.location.search);
    const customerPosted = urlParams.get("customer_posted");
    if (customerPosted === "true") {
      this.changeStatus("Thank you for subscribing");
    }
    this.button.addEventListener("click", this.onClick);
  }
  async onClick(e) {
    console.log(this.email.value);
    if (this.email.value.length < 5) {
      this.changeStatus("Please enter a valid email ");
    }
    // alert('yeas')
  }

  async changeStatus(text) {
    this.querySelector("p").textContent = text;
  }
}

if (!customElements.get("newsletter")) {
  customElements.define("newsletter-widget", Newsletter);
}

class SlideShow extends HTMLElement {
  constructor() {
    super();
    this.initSwiper();
  }

  initSwiper() {
    // Make sure Swiper only initializes when the swiper-container is present
    const swiperContainer = this;
    console.log(swiperContainer);
    if (swiperContainer) {
      const swiper = new Swiper(".swiper", {
        // Swiper options
        slidesPerView: 1, // Number of slides to show
        spaceBetween: 0, // Space between slides
        speed: 400,
        on: {
          init: this.updateProgressBar.bind(this), // Reference to class method
          slideChange: this.updateProgressBar.bind(this), // Reference to class method
        },
      });
      console.log(swiper);
    }
  }
  updateProgressBar() {
    this.querySelector("div[id='progress']").style.width = `${
      ((this.swiper.activeIndex + 1) / this.swiper.slides.length) * 100
    }%`;

    console.log(this.swiper.activeIndex + 1, this.swiper.slides.length);
  }
}

if (!customElements.get("product-slideshow")) {
  customElements.define("product-slideshow", SlideShow);
}

class SearchWidget extends HTMLElement {
  constructor() {
    super();
    this.searchPlaceholder = this.querySelector("#search-placeholder");
    this.searchInput = this.querySelector("#search");

    // Bind the event handlers
    this.toggleSearch = this.toggleSearch.bind(this);
    this.executeSearch = this.executeSearch.bind(this);

    // Click to show search input
    this.searchPlaceholder.addEventListener("click", this.toggleSearch);

    // Listen for Enter key in the input field
    this.searchInput.addEventListener("keydown", this.executeSearch);
  }

  toggleSearch() {
    this.searchPlaceholder.classList.add("hidden");
    this.searchInput.classList.remove("hidden");
    this.searchInput.focus();
  }

  executeSearch(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = this.searchInput.value.trim();

      if (query.length > 0) {
        // Redirect to the Shopify search page with the search query
        window.location.href = `/search?q=${encodeURIComponent(
          query
        )}&type=product`;
      }
    }
  }
}

// Define the custom element
if (!customElements.get("search-widget")) {
  customElements.define("search-widget", SearchWidget);
}
