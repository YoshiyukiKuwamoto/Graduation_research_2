// ==============================
// LUNÉ EC SITE - script.js
// ==============================

// カートの保存キー
const CART_KEY = "lune_cart";

// ==============================
// 1. ハンバーガーメニュー開閉
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
            document.body.style.overflow = "hidden"; // 背景スクロール防止
        });
    }

    if (menuClose && navOverlay) {
        menuClose.addEventListener("click", () => {
            navOverlay.classList.remove("is-active");
            navOverlay.setAttribute("aria-hidden", "true");
            if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = ""; // スクロール解除
        });
    }
});

// ==============================
// 2. カルーセル & スクロールアニメーション (fade-in-up)
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    // ヒーローイメージ カルーセル制御
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

    // スクロール時の Fade-in-up 制御 (重複を統合)
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
// 3. カート基本データ処理 (LocalStorage)
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

    // IDとカラーが両方一致する商品があるか確認
    const existingProduct = cart.find(
        item => item.id === product.id && item.color === product.color
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
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
// ==============================
// 4. カートページ表示・操作ロジック
// ==============================

function displayCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    if (!cartItemsContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>カートに商品がありません。</p>
                <a href="products.html">PRODUCTSを見る</a>
            </div>
        `;
        updateCartSummary();
        return;
    }

    // 各アイテムの価格表示を ¥--,--- に統一
    // ※ color が無い古いデータにも対応するため (item.color || 'Black') を渡します
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemColor = item.color || "Black";
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name} (${itemColor})</h3>
                    <p>¥--,---</p>
                    <div class="quantity-control">
                        <button class="quantity-button" type="button" onclick="changeQuantity('${item.id}', '${itemColor}', -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-button" type="button" onclick="changeQuantity('${item.id}', '${itemColor}', 1)">+</button>
                    </div>
                    <button class="remove-button" type="button" onclick="removeFromCart('${item.id}', '${itemColor}')">取消</button>
                </div>
            </div>
        `;
    }).join("");

    updateCartSummary();
}

function changeQuantity(productId, color, amount) {
    const cart = getCart();
    // colorの揺らぎ（undefinedや'Black'）に対応した比較判定
    const targetColor = color || "Black";
    const product = cart.find(item => item.id === productId && (item.color || "Black") === targetColor);

    if (!product) return;

    product.quantity += amount;

    // 数量が 0 以下になった場合は削除処理を呼び出す
    if (product.quantity <= 0) {
        removeFromCart(productId, targetColor);
        return;
    } else {
        saveCart(cart);
    }

    displayCart();
    updateCartCount();
}

function removeFromCart(productId, color) {
    const cart = getCart();
    const targetColor = color || "Black";

    // 対象のIDおよびカラー（未定義の場合は'Black'扱い）と一致する商品を確実に除外
    const updatedCart = cart.filter(item => {
        const itemColor = item.color || "Black";
        return !(item.id === productId && itemColor === targetColor);
    });

    saveCart(updatedCart);
    displayCart();
    updateCartCount();
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
// 5. Product Hero ・ バリアント選択 ・ 飛ぶ円アニメーション
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const colorButtons = document.querySelectorAll(".color-button");
    const colorRing = document.getElementById("colorRing");
    const colorName = document.getElementById("colorName");
    const productImage = document.getElementById("productImage");
    const addCartButtons = document.querySelectorAll(".add-cart-button");

    if (colorRing && colorButtons.length > 0) {
        // 白枠リングの位置合わせ関数
        function moveRingTo(button) {
            const wrapper = button.closest(".color-options-wrapper");
            const wrapperRect = wrapper.getBoundingClientRect();
            const btnRect = button.getBoundingClientRect();

            const x = btnRect.left - wrapperRect.left - (36 - btnRect.width) / 2;
            const y = btnRect.top - wrapperRect.top - (36 - btnRect.height) / 2;

            colorRing.style.transform = `translate(${x}px, ${y}px)`;
        }

        // 初期位置の適用
        const initialActive = document.querySelector(".color-button.active");
        if (initialActive) {
            setTimeout(() => moveRingTo(initialActive), 50);
        }

        // カラー切り替えイベント（押した瞬間の即時移動を防ぐ遅延処理付き）
        let isTransitioning = false;

        colorButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (button.classList.contains("active") || isTransitioning) return;

                isTransitioning = true;

                // 200msの間を置いてからぬーっと動く
                setTimeout(() => {
                    colorButtons.forEach((btn) => btn.classList.remove("active"));
                    button.classList.add("active");

                    moveRingTo(button);

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

    // ==============================
    // ADD TO CART（タップ位置からの飛翔アニメーション）
    // ==============================

    addCartButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // デフォルトの画面遷移・フォーム送信を確実に防止

            // 1. カートデータの保存処理
            const activeColorBtn = document.querySelector(".color-button.active");
            const selectedColor = activeColorBtn ? activeColorBtn.dataset.name : "Black";
            const selectedImg = activeColorBtn ? activeColorBtn.dataset.img : "img/headphone-black.png";

            const productData = {
                id: "lune-one",
                name: "LUNÉ ONE",
                price: 48000,
                image: selectedImg,
                color: selectedColor
            };

            addToCart(productData);

            // 2. カートアイコンの取得
            const cartIcon = document.querySelector(".header-icon-cart") || document.querySelector(".cart-icon");
            if (!cartIcon) return;

            // 3. 始点座標の計算（指で実際に押したタッチ座標）
            const btnRect = btn.getBoundingClientRect();
            const startX = (e.clientX || (btnRect.left + btnRect.width / 2)) - 8;
            const startY = (e.clientY || (btnRect.top + btnRect.height / 2)) - 8;

            // 4. 終点座標の計算（カートアイコン中心）
            const cartRect = cartIcon.getBoundingClientRect();
            const targetX = cartRect.left + cartRect.width / 2 - 8;
            const targetY = cartRect.top + cartRect.height / 2 - 8;

            const moveX = targetX - startX;
            const moveY = targetY - startY;

            // 5. 飛ぶ粒の生成
            const ball = document.createElement("div");
            ball.className = "flying-ball";
            ball.style.left = `${startX}px`;
            ball.style.top = `${startY}px`;
            document.body.appendChild(ball);

            requestAnimationFrame(() => {
                ball.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.3)`;
                ball.style.opacity = "0.1";
            });

            // 6. 到着後の跳ね演出（ページ遷移なし）
            setTimeout(() => {
                ball.remove();

                cartIcon.style.transition = "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                cartIcon.style.transform = "scale(1.25)";

                setTimeout(() => {
                    cartIcon.style.transform = "scale(1)";
                }, 250);

            }, 900);
        });
    });
});

// ==============================
// チェックアウトボタン & モーダル制御
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const checkoutBtn = document.getElementById("checkout-button");
    const surveyModal = document.getElementById("surveyModal");
    const modalClose = document.getElementById("modalClose");

    if (checkoutBtn && surveyModal) {
        // 購入（CHECKOUT）ボタンクリック時
        checkoutBtn.addEventListener("click", () => {
            // タップアニメーションの余韻を見せるため、わずかに遅延（0.15秒）させてモーダル表示
            setTimeout(() => {
                surveyModal.classList.add("is-active");
                surveyModal.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden"; // 背景スクロール固定
            }, 150);
        });
    }

    // モーダルを閉じる処理
    if (modalClose && surveyModal) {
        modalClose.addEventListener("click", () => {
            surveyModal.classList.remove("is-active");
            surveyModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = ""; // スクロール解除
        });

        // モーダル外側の暗がりをタップした時も閉じる
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
// 6. 初期化
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    updateCartCount();
});