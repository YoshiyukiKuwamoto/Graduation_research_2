// ==============================
// LUNÉ EC SITE - script.js
// ==============================

const CART_KEY = "lune_cart";

// ==============================
// 1. ページフェードイン・フェードアウト & ロゴ遷移
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => {
        document.body.classList.add("is-loaded");
    });

    const logoLinks = document.querySelectorAll(".logo");
    logoLinks.forEach((logo) => {
        logo.addEventListener("click", (e) => {
            const targetUrl = logo.getAttribute("href");
            if (targetUrl && !targetUrl.startsWith("#")) {
                e.preventDefault();
                document.body.classList.remove("is-loaded");
                document.body.classList.add("page-fade-out");
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 400);
            }
        });
    });
});

window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-fade-out");
    document.body.classList.add("is-loaded");
});

// ==============================
// 2. ハンバーガーメニュー開閉
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("menu-close");
    const navOverlay = document.getElementById("nav-overlay");

    if (menuToggle && navOverlay) {
        menuToggle.addEventListener("click", () => {
            navOverlay.classList.add("is-active");
            navOverlay.setAttribute("aria-hidden", "false");
            menuToggle.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        });
    }

    if (menuClose && navOverlay) {
        menuClose.addEventListener("click", () => {
            navOverlay.classList.remove("is-active");
            navOverlay.setAttribute("aria-hidden", "true");
            if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        });
    }
});

// ==============================
// 3. カルーセル & スクロールアニメーション (fade-in-up)
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".carousel-dots .dot");

    if (slides.length > 0) {
        let currentIndex = 0;
        let autoSlideTimer = null;

        function showSlide(index) {
            slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
            dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
            currentIndex = index;
        }

        function nextSlide() {
            showSlide((currentIndex + 1) % slides.length);
        }

        function startAutoSlide() {
            autoSlideTimer = setInterval(nextSlide, 3000);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                showSlide(index);
                clearInterval(autoSlideTimer);
                startAutoSlide();
            });
        });

        startAutoSlide();
    }

    const fadeElements = document.querySelectorAll(".fade-in-up");
    if (fadeElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");

                    if (entry.target.classList.contains("feature-card-invert")) {
                        let delayTime = 1200;
                        if (entry.target.classList.contains("delay-1")) delayTime += 400;
                        if (entry.target.classList.contains("delay-2")) delayTime += 800;

                        setTimeout(() => {
                            entry.target.classList.add("is-inverted");
                        }, delayTime);
                    }
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach((el) => observer.observe(el));
    }
});

// ==============================
// 4. カート基本データ処理 (LocalStorage)
// ==============================

function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existingProduct = cart.find(
        item => item.id === product.id && item.color === product.color
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price || "¥--,---",
            image: product.image,
            color: product.color || "Black",
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach((element) => {
        element.textContent = totalQuantity;
    });
}

function displayCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    if (!cartItemsContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
                        <circle cx="7.5" cy="18.5" r="1.5" />
                        <circle cx="16.5" cy="18.5" r="1.5" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h2l.6 3m0 0L7 15h10l2-7H5.6z" />
                    </svg>
                </div>
                <h2>カートに商品がありません</h2>
                <p class="empty-cart-text">お気に入りの商品を見つけて、<br>あなただけの音を見つけましょう。</p>
                <a href="products.html" class="primary-button empty-cart-btn">
                    PRODUCTSを見る
                </a>
            </div>
        `;
        updateCartSummary();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => {
        const itemColor = item.color || "Black";
        return `
            <div class="cart-item" data-id="${item.id}" data-color="${itemColor}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name} (${itemColor})</h3>
                    <p>¥--,---</p>
                    <div class="quantity-control">
                        <button class="quantity-button" type="button" onclick="changeQuantity('${item.id}', '${itemColor}', -1, event)">−</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-button" type="button" onclick="changeQuantity('${item.id}', '${itemColor}', 1, event)">+</button>
                    </div>
                    <button class="remove-button" type="button" onclick="removeFromCart('${item.id}', '${itemColor}', event)">取消</button>
                </div>
            </div>
        `;
    }).join("");

    updateCartSummary();
}

function changeQuantity(productId, color, amount, event) {
    const cart = getCart();
    const targetColor = color || "Black";
    const product = cart.find(item => item.id === productId && (item.color || "Black") === targetColor);

    if (!product) return;

    product.quantity += amount;

    if (product.quantity <= 0) {
        removeFromCart(productId, targetColor, event);
        return;
    } else {
        saveCart(cart);
    }

    displayCart();
    updateCartCount();
}

function removeFromCart(productId, color, event) {
    const cart = getCart();
    const targetColor = color || "Black";

    let itemElement = null;
    if (event && event.target) {
        itemElement = event.target.closest(".cart-item");
    }
    if (!itemElement) {
        itemElement = document.querySelector(`.cart-item[data-id="${productId}"][data-color="${targetColor}"]`);
    }

    const executeDelete = () => {
        const updatedCart = cart.filter(item => {
            const itemColor = item.color || "Black";
            return !(item.id === productId && itemColor === targetColor);
        });

        saveCart(updatedCart);
        displayCart();
        updateCartCount();
    };

    if (itemElement) {
        itemElement.classList.add("fade-out");
        setTimeout(executeDelete, 400);
    } else {
        executeDelete();
    }
}

function updateCartSummary() {
    const subtotalElement = document.getElementById("subtotal");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");

    if (subtotalElement) subtotalElement.textContent = "¥--,---";
    if (shippingElement) shippingElement.textContent = "FREE";
    if (totalElement) totalElement.textContent = "¥--,---";
}

// ==============================
// 5. Product Hero & 飛翔アニメーション
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const colorButtons = document.querySelectorAll(".product-option .color-button");
    const colorRing = document.getElementById("colorRing");
    const colorName = document.getElementById("colorName");
    const productImage = document.getElementById("productImage");
    const addCartButtons = document.querySelectorAll(".add-cart-button");

    const stickyCartBar = document.getElementById("stickyCartBar");
    const stickyCartButton = document.getElementById("stickyCartButton");
    const firstCartButton = document.getElementById("addCartBtn");
    const footer = document.querySelector(".footer");

    const productModal = document.getElementById("productModal");
    const productModalClose = document.getElementById("productModalClose");
    const modalImage = document.getElementById("modalProductImage");
    const modalColorName = document.getElementById("modalColorName");
    const modalColorRing = document.getElementById("modalColorRing");
    const modalColorButtons = document.querySelectorAll(".product-modal-color .color-button");
    const modalAddCartButton = document.getElementById("modalAddCartButton");

    function moveRingTo(ring, button) {
        if (!ring || !button) return;
        const wrapper = button.closest(".color-options-wrapper");
        if (!wrapper) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();

        const x = btnRect.left - wrapperRect.left - (36 - btnRect.width) / 2;
        const y = btnRect.top - wrapperRect.top - (36 - btnRect.height) / 2;

        ring.style.transform = `translate(${x}px, ${y}px)`;
    }

    if (colorRing && colorButtons.length > 0) {
        const initialActive = document.querySelector(".product-option .color-button.active");
        if (initialActive) {
            setTimeout(() => moveRingTo(colorRing, initialActive), 50);
        }

        let isTransitioning = false;

        colorButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (button.classList.contains("active") || isTransitioning) return;
                isTransitioning = true;

                setTimeout(() => {
                    colorButtons.forEach((btn) => btn.classList.remove("active"));
                    button.classList.add("active");
                    moveRingTo(colorRing, button);

                    if (colorName) colorName.textContent = button.dataset.name;

                    if (productImage && button.dataset.img) {
                        productImage.classList.add("switching");
                        setTimeout(() => {
                            productImage.src = button.dataset.img;
                            productImage.classList.remove("switching");
                        }, 300);
                    }

                    setTimeout(() => {
                        isTransitioning = false;
                    }, 900);
                }, 200);
            });
        });
    }

    // 黄色の飛翔アニメーション処理
    function animateCart(button, event) {
        const cartIcon = document.querySelector(".header-icon-cart") || document.querySelector(".cart-icon");
        if (!cartIcon) return;

        const btnRect = button.getBoundingClientRect();
        const startX = (event && event.clientX ? event.clientX : btnRect.left + btnRect.width / 2) - 8;
        const startY = (event && event.clientY ? event.clientY : btnRect.top + btnRect.height / 2) - 8;

        const cartRect = cartIcon.getBoundingClientRect();
        const targetX = cartRect.left + cartRect.width / 2 - 8;
        const targetY = cartRect.top + cartRect.height / 2 - 8;

        const moveX = targetX - startX;
        const moveY = targetY - startY;

        const ball = document.createElement("div");
        ball.className = "flying-ball";
        ball.style.left = `${startX}px`;
        ball.style.top = `${startY}px`;
        document.body.appendChild(ball);

        requestAnimationFrame(() => {
            ball.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.3)`;
            ball.style.opacity = "0.1";
        });

        setTimeout(() => {
            ball.remove();
            cartIcon.classList.remove("cart-icon-bounce");
            void cartIcon.offsetWidth;
            cartIcon.classList.add("cart-icon-bounce");

            setTimeout(() => {
                cartIcon.classList.remove("cart-icon-bounce");
            }, 600);
        }, 900);
    }

    addCartButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();

            const activeColorBtn = document.querySelector(".product-option .color-button.active");
            const selectedColor = activeColorBtn ? activeColorBtn.dataset.name : "Black";
            const selectedImg = activeColorBtn ? activeColorBtn.dataset.img : "img/headphone-black.webp";

            const productData = {
                id: "lune-one",
                name: "LUNÉ ONE",
                price: "¥--,---",
                image: selectedImg,
                color: selectedColor
            };

            addToCart(productData);
            animateCart(btn, event);
        });
    });

    if (stickyCartBar && stickyCartButton && productModal) {
        let firstButtonVisible = true;
        let footerVisible = false;

        function updateStickyButton() {
            const shouldShow = !firstButtonVisible && !footerVisible && !productModal.classList.contains("is-active");
            stickyCartBar.classList.toggle("is-visible", shouldShow);
        }

        if (firstCartButton) {
            const firstButtonObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    firstButtonVisible = entry.isIntersecting;
                    updateStickyButton();
                });
            }, { threshold: 0.01 });
            firstButtonObserver.observe(firstCartButton);
        } else {
            firstButtonVisible = false;
        }

        if (footer) {
            const footerObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    footerVisible = entry.isIntersecting;
                    updateStickyButton();
                });
            }, { threshold: 0.01 });
            footerObserver.observe(footer);
        }

        updateStickyButton();

        let selectedModalColor = { name: "Black", image: "img/headphone-black.webp" };

        function openProductModal() {
            const activeMainColor = document.querySelector(".product-option .color-button.active");
            if (activeMainColor) {
                selectedModalColor = {
                    name: activeMainColor.dataset.name,
                    image: activeMainColor.dataset.img
                };
            }

            modalColorButtons.forEach((button) => {
                button.classList.toggle("active", button.dataset.name === selectedModalColor.name);
            });

            if (modalImage) modalImage.src = selectedModalColor.image;
            if (modalColorName) modalColorName.textContent = selectedModalColor.name;

            const activeModalColor = document.querySelector(".product-modal-color .color-button.active");
            if (activeModalColor) {
                setTimeout(() => moveRingTo(modalColorRing, activeModalColor), 50);
            }

            productModal.classList.add("is-active");
            productModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            updateStickyButton();
        }

        stickyCartButton.addEventListener("click", openProductModal);

        modalColorButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (button.classList.contains("active")) return;
                modalColorButtons.forEach((btn) => btn.classList.remove("active"));
                button.classList.add("active");

                selectedModalColor = {
                    name: button.dataset.name,
                    image: button.dataset.img
                };

                moveRingTo(modalColorRing, button);
                if (modalColorName) modalColorName.textContent = selectedModalColor.name;

                if (modalImage) {
                    modalImage.classList.add("switching");
                    setTimeout(() => {
                        modalImage.src = selectedModalColor.image;
                        modalImage.classList.remove("switching");
                    }, 250);
                }
            });
        });

        function closeProductModal() {
            productModal.classList.remove("is-active");
            productModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
            updateStickyButton();
        }

        if (productModalClose) productModalClose.addEventListener("click", closeProductModal);

        productModal.addEventListener("click", (event) => {
            if (event.target === productModal) closeProductModal();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && productModal.classList.contains("is-active")) {
                closeProductModal();
            }
        });

        if (modalAddCartButton) {
            modalAddCartButton.addEventListener("click", (event) => {
                const productData = {
                    id: "lune-one",
                    name: "LUNÉ ONE",
                    price: "¥--,---",
                    image: selectedModalColor.image,
                    color: selectedModalColor.name
                };
                addToCart(productData);
                animateCart(modalAddCartButton, event);
                // モーダルを閉じずに開いたまま維持
            });
        }
    }
});

// ==============================
// 6. チェックアウトボタン & アンケートモーダル制御
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const checkoutBtn = document.getElementById("checkout-button");
    const surveyModal = document.getElementById("surveyModal");
    const modalClose = document.getElementById("modalClose");

    if (checkoutBtn && surveyModal) {
        checkoutBtn.addEventListener("click", () => {
            setTimeout(() => {
                surveyModal.classList.add("is-active");
                surveyModal.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";
            }, 150);
        });
    }

    if (modalClose && surveyModal) {
        modalClose.addEventListener("click", () => {
            surveyModal.classList.remove("is-active");
            surveyModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        });

        surveyModal.addEventListener("click", (e) => {
            if (e.target === surveyModal) {
                surveyModal.classList.remove("is-active");
                surveyModal.setAttribute("aria-hidden", "true");
                document.body.style.overflow = "";
            }
        });
    }
});

// ==============================
// 7. 初期表示処理
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    updateCartCount();
});