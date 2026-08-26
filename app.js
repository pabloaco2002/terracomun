/**
 * TERRA COMÚN - INTERACTIVE APPLICATION JAVASCRIPT
 * Modern UI/UX implementation with reactive shopping cart, 
 * WhatsApp checkout builder, ecological calculator, and lightbox.
 */

// --- 1. PRODUCT CATALOG DATA ---
const PRODUCTS_DATA = [
  {
    id: "kit-inicial",
    title: "Kit Inicial Terra Común",
    category: "kits",
    categoryLabel: "Kit con Canasta",
    description: "Canasta soporte permanente reutilizable + 2 pastillas desinfectantes botánicas sólidas (fórmula natural con hojas de limón, mandarina, romero, bicarbonato, aceite de coco y glicerina). La opción más completa para comenzar.",
    price: 4500,
    priceFormatted: "$4.500",
    badge: "Más Recomendado",
    image: "kit-inicial-2-pastillas.webp"
  },
  {
    id: "kit-comun",
    title: "Kit Común Terra Común",
    category: "kits",
    categoryLabel: "Kit con Canasta",
    description: "Canasta soporte permanente reutilizable + 1 pastilla desinfectante botánica artesanal de fórmula combinada (limón, mandarina, romero, bicarbonato y aceite de coco). Ideal para probar la experiencia Zero Waste.",
    price: 2500,
    priceFormatted: "$2.500",
    badge: "Esencial",
    image: "kit-comun-1-pastilla.webp"
  },
  {
    id: "kit-reposicion",
    title: "Kit de Reposición (3 Pastillas)",
    category: "reposicion",
    categoryLabel: "Pack Reposición",
    description: "3 pastillas desinfectantes sólidas artesanales de larga duración (+450 descargas en total). Fórmula combinada con hojas de limón, mandarina, romero, bicarbonato, aceite de coco y glicerina vegetal.",
    price: 6000,
    priceFormatted: "$6.000",
    badge: "Pack Ahorro",
    image: "kit-reposicion-3-pastillas.webp"
  }
];

// --- 2. SHOPPING CART STATE ---
let cart = JSON.parse(localStorage.getItem("terraComunCart") || "[]");

// --- 3. DOM ELEMENTS ---
const productsContainer = document.getElementById("productsContainer");
const catalogFilters = document.getElementById("catalogFilters");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalPrice = document.getElementById("cartTotalPrice");
const cartCountBadge = document.getElementById("cartCountBadge");
const checkoutWhatsappBtn = document.getElementById("checkoutWhatsappBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const toastContainer = document.getElementById("toastContainer");
const navbar = document.getElementById("navbar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");

// Intro Screen DOM Elements
const brandIntro = document.getElementById("brandIntro");
const enterSiteBtn = document.getElementById("enterSiteBtn");
const skipIntroBtn = document.getElementById("skipIntroBtn");
const replayIntroBtn = document.getElementById("replayIntroBtn");

// Calculator DOM elements
const peopleSlider = document.getElementById("peopleSlider");
const monthsSlider = document.getElementById("monthsSlider");
const peopleCountDisplay = document.getElementById("peopleCountDisplay");
const monthsCountDisplay = document.getElementById("monthsCountDisplay");
const plasticSavedVal = document.getElementById("plasticSavedVal");
const waterLitresVal = document.getElementById("waterLitresVal");

// --- 4. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initBrandIntro();
  renderProducts("all");
  updateCartUI();
  initCalculator();
  initFAQ();
  initScrollEffects();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// --- 5. RENDER PRODUCTS ---
function renderProducts(filterCategory = "all") {
  if (!productsContainer) return;

  const filtered = filterCategory === "all" 
    ? PRODUCTS_DATA 
    : PRODUCTS_DATA.filter(p => p.category === filterCategory);

  productsContainer.innerHTML = filtered.map(product => {
    return `
      <article class="product-card" data-id="${product.id}">
        ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ""}
        
        <div class="product-img-wrapper" onclick="openLightbox('${product.image}')">
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
          <div class="product-quick-view" title="Ver imagen ampliada">
            <i data-lucide="maximize-2"></i>
          </div>
        </div>

        <div class="product-body">
          <span class="product-category">${product.categoryLabel}</span>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-desc">${product.description}</p>

          <div class="product-formula-badge">
            <i data-lucide="sparkles"></i>
            <span>Fórmula Botánica Única (Limón, Mandarina, Romero, Bicarbonato, Aceite de Coco y Glicerina)</span>
          </div>

          <div class="product-footer">
            <div class="product-price-wrapper">
              <span class="price-unit">Precio por unidad</span>
              <span class="product-price">${product.priceFormatted}</span>
            </div>
            <button 
              class="btn btn-primary btn-add-cart" 
              onclick="addToCart('${product.id}')"
            >
              <i data-lucide="plus"></i>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Filter tabs handler
if (catalogFilters) {
  catalogFilters.addEventListener("click", (e) => {
    const tab = e.target.closest(".filter-tab");
    if (!tab) return;

    catalogFilters.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const filter = tab.dataset.filter;
    renderProducts(filter);
  });
}

// --- 6. CART MANAGEMENT ---
window.addToCart = function(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const cartItemId = product.id;

  const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      cartItemId: cartItemId,
      id: product.id,
      title: product.title,
      price: product.price,
      priceFormatted: product.priceFormatted,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`¡"${product.title}" añadido al pedido!`);
  openCartDrawer();
};

function updateQuantity(cartItemId, change) {
  const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    updateCartUI();
  }
}
window.updateQuantity = updateQuantity;

function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCart();
  updateCartUI();
  showToast("Producto eliminado del pedido");
}
window.removeFromCart = removeFromCart;

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  showToast("Carrito vaciado");
}

function saveCart() {
  localStorage.setItem("terraComunCart", JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartCountBadge) {
    cartCountBadge.textContent = totalCount;
  }

  if (cartTotalPrice) {
    cartTotalPrice.textContent = `$${totalPrice.toLocaleString("es-AR")}`;
  }

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <i data-lucide="shopping-bag"></i>
        <h4>Tu carrito está vacío</h4>
        <p>Explora nuestro catálogo y agrega pastillas o kits ecológicos para comenzar.</p>
      </div>
    `;
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-scent"><i data-lucide="sparkles"></i> Fórmula Multi-esencia</div>
          <div class="cart-item-bottom">
            <span class="cart-item-price">$${(item.price * item.quantity).toLocaleString("es-AR")}</span>
            <div class="cart-qty-controls">
              <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', -1)" aria-label="Disminuir cantidad">-</button>
              <span class="qty-number">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQuantity('${item.cartItemId}', 1)" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- 7. CART DRAWER CONTROLS ---
function openCartDrawer() {
  if (cartDrawer && cartBackdrop) {
    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeCartDrawer() {
  if (cartDrawer && cartBackdrop) {
    cartDrawer.classList.remove("open");
    cartBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }
}

if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);
if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);

// --- 8. WHATSAPP ORDER BUILDER ---
if (checkoutWhatsappBtn) {
  checkoutWhatsappBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Agrega al menos un producto a tu pedido.");
      return;
    }

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let message = `🌱 *NUEVO PEDIDO - TERRA COMÚN* 🌱\n\n`;
    message += `Hola! Quisiera realizar el siguiente pedido ecológico:\n\n`;

    cart.forEach((item, idx) => {
      message += `${idx + 1}. *${item.quantity}x ${item.title}*\n`;
      message += `   └ Fórmula: _Combinación Botánica Multi-esencia_\n`;
      message += `   └ Subtotal: $${(item.price * item.quantity).toLocaleString("es-AR")}\n\n`;
    });

    message += `──────────────────────\n`;
    message += `📦 *Total de artículos:* ${totalCount}\n`;
    message += `💰 *Monto Total Estimado:* $${totalPrice.toLocaleString("es-AR")}\n\n`;
    message += `¿Podrían indicarme formas de pago (transferencia/efectivo) y tiempos de entrega/retiro? ¡Muchas gracias!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5493884861994?text=${encodedMsg}`;

    window.open(whatsappUrl, "_blank");
  });
}

// --- 9. ECOLOGICAL IMPACT CALCULATOR ---
function initCalculator() {
  if (!peopleSlider || !monthsSlider) return;

  function calculate() {
    const people = parseInt(peopleSlider.value, 10);
    const months = parseInt(monthsSlider.value, 10);

    peopleCountDisplay.textContent = `${people} ${people === 1 ? 'persona' : 'personas'}`;
    const yearsText = months >= 12 ? ` (${(months / 12).toFixed(1).replace('.0', '')} ${months === 12 ? 'año' : 'años'})` : '';
    monthsCountDisplay.textContent = `${months} meses${yearsText}`;

    // Calculation formulas:
    // Avg traditional disposable hanger plastic discarded: 1 per person per month
    const plasticSaved = Math.round(people * months * 1.0);
    // Avg toilet water flush freed from toxic synthetic bleaches/chlorine: ~300 liters/person/month
    const waterSaved = Math.round(people * months * 300);

    if (plasticSavedVal) plasticSavedVal.textContent = plasticSaved.toLocaleString("es-AR");
    if (waterLitresVal) waterLitresVal.textContent = waterSaved.toLocaleString("es-AR");

    // Dynamic formula detail breakdown
    const plasticFormulaLive = document.getElementById("plasticFormulaLive");
    const plasticFormulaResult = document.getElementById("plasticFormulaResult");
    const waterFormulaLive = document.getElementById("waterFormulaLive");
    const waterFormulaResult = document.getElementById("waterFormulaResult");

    if (plasticFormulaLive) {
      plasticFormulaLive.textContent = `${people} pers. × ${months} meses × 1 canastilla/mes`;
    }
    if (plasticFormulaResult) {
      plasticFormulaResult.textContent = `${plasticSaved} envases`;
    }
    if (waterFormulaLive) {
      waterFormulaLive.textContent = `${people} pers. × ${months} meses × 300 L/mes`;
    }
    if (waterFormulaResult) {
      waterFormulaResult.textContent = `${waterSaved.toLocaleString("es-AR")} litros`;
    }
  }

  peopleSlider.addEventListener("input", calculate);
  monthsSlider.addEventListener("input", calculate);
  calculate();
}

// --- 10. FAQ ACCORDION ---
function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      
      // Close other items
      faqItems.forEach(other => {
        other.classList.remove("active");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// --- 11. LIGHTBOX MODAL ---
window.openLightbox = function(imageSrc) {
  const modal = document.getElementById("lightboxModal");
  const modalImg = document.getElementById("lightboxImg");
  if (modal && modalImg) {
    modalImg.src = imageSrc;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById("lightboxModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
    closeCartDrawer();
  }
});

// --- 12. TOAST NOTIFICATIONS ---
function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i data-lucide="check-circle"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --- 13. NAVBAR & MOBILE MENU ---
function initScrollEffects() {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (navbar) {
          if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
          } else {
            navbar.classList.remove("scrolled");
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });

    mainNav.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
      });
    });
  }
}

// --- 14. BRAND INTRO & LEAF UNVEIL CONTROLLER ---
function initBrandIntro() {
  if (!brandIntro) return;

  // Prevent browser from restoring middle-of-page scroll position on reload
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Ensure page starts at the very top (header) and body cannot scroll while intro is visible
  window.scrollTo(0, 0);
  document.body.style.overflow = "hidden";

  // Function to open site with leaf curtain animation
  function openSite() {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    brandIntro.classList.add("unveiling");
    document.body.style.overflow = "";

    // Keep page at the top when body unlock takes effect
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);

    // Micro-toast welcoming the user
    setTimeout(() => {
      showToast("🌿 ¡Bienvenido a Terra Común! « Cuidar nos une »");
    }, 600);

    // Completely remove intro from render tree after animation to prevent Android scroll/touch interference
    setTimeout(() => {
      if (brandIntro.classList.contains("unveiling")) {
        brandIntro.style.display = "none";
      }
    }, 1200);
  }

  if (enterSiteBtn) {
    enterSiteBtn.addEventListener("click", openSite);
  }

  if (skipIntroBtn) {
    skipIntroBtn.addEventListener("click", openSite);
  }

  // Allow replaying intro from navbar
  if (replayIntroBtn) {
    replayIntroBtn.addEventListener("click", () => {
      brandIntro.style.display = "flex";
      // Trigger reflow before removing class
      void brandIntro.offsetWidth;
      window.scrollTo({ top: 0, behavior: "smooth" });
      brandIntro.classList.remove("unveiling");
      document.body.style.overflow = "hidden";
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }
}

