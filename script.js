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

    // 各要素の特定用に data-id, data-color を付与、buttonに event を渡すよう変更
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

    // 数量が 0 以下になった場合はアニメーション付き削除処理へ渡す
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

    // 押されたボタンの親要素（.cart-item）を取得、見つからなければ属性検索
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

    // 要素が存在すればクラスを付与し、アニメーション（400ms）完了後にDOMから削除
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

            // 6. 到着後の跳ね＆横揺れ演出（クラス着脱方式）
            setTimeout(() => {
                ball.remove();

                // 連続タップ時にアニメーションを最初から再再生させる処理
                cartIcon.classList.remove("cart-icon-bounce");
                void cartIcon.offsetWidth; // リフローを発生させてアニメーションをリセット

                // 横揺れアニメーションクラスを付与
                cartIcon.classList.add("cart-icon-bounce");

                // アニメーション完了後（0.6秒後）にクラスを削除
                setTimeout(() => {
                    cartIcon.classList.remove("cart-icon-bounce");
                }, 600);

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
// ページ開閉時のふわっとフェード制御 & ロゴ遷移
// ==============================

// A. ページ読み込み時：画面をふわっとフェードイン表示
document.addEventListener("DOMContentLoaded", () => {
    // DOM構築完了後にクラスを付与してフェードイン
    requestAnimationFrame(() => {
        document.body.classList.add("is-loaded");
    });

    // B. ロゴ（.logo）クリック時：ふわっとフェードアウトしてから遷移
    const logoLinks = document.querySelectorAll(".logo");

    logoLinks.forEach((logo) => {
        logo.addEventListener("click", (e) => {
            const targetUrl = logo.getAttribute("href");

            if (targetUrl && !targetUrl.startsWith("#")) {
                e.preventDefault(); // 即時遷移を防止

                // フェードアウトクラスを付与
                document.body.classList.remove("is-loaded");
                document.body.classList.add("page-fade-out");

                // アニメーション完了（0.4秒後）にページ遷移
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 400);
            }
        });
    });
});

// C. スマホの「戻る」ボタンで復帰した際もふわっとフェードイン
window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-fade-out");
    document.body.classList.add("is-loaded");
});

// ==============================
// 6. 初期化
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    updateCartCount();
});