let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const apiBaseUrl = 'https://fakestoreapi.com';
const content = document.getElementById("content");

function updateNavbar() {
    if (currentUser) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('signupBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-block';
    } else {
        document.getElementById('loginBtn').style.display = 'inline-block';
        document.getElementById('signupBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

function loginUser(email, password) {
    if (email && password) {
        currentUser = { email, password };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateNavbar();
        loadProducts();
    }
}

function signupUser(email, password) {
    if (email && password) {
        alert("Signup successful!");
        loginUser(email, password);
    }
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    updateNavbar();
    content.innerHTML = `<h2>Please log in to continue shopping.</h2>`;
}

async function loadProducts() {
    const response = await fetch(`${apiBaseUrl}/products`);
    const products = await response.json();
    renderProductList(products);
}

function renderProductList(products) {
    const productList = document.createElement('div');
    productList.classList.add('product-list');
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product');
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productList.appendChild(productItem);
    });
    content.innerHTML = '';
    content.appendChild(productList);
}

function addToCart(productId) {
    if (!currentUser) {
        alert("Please log in to add items to the cart.");
        return;
    }

    fetch(`${apiBaseUrl}/products/${productId}`)
        .then(res => res.json())
        .then(product => {
            const existingProduct = cart.find(item => item.id === product.id);
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push({ 
                    id: product.id, 
                    title: product.title, 
                    price: product.price, 
                    image: product.image, 
                    quantity: 1 
                });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
        });
}


function renderCart() {
    if (!currentUser) {
        alert("Please log in to view the cart.");
        return;
    }

    if (cart.length === 0) {
        content.innerHTML = `<h3>Your cart is empty.</h3>`;
        return;
    }

    let cartContent = '<h3>Your Cart:</h3><div class="cart-list">';
    cart.forEach(item => {
        cartContent += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>$${item.price} x ${item.quantity}</p>
                <div class="cart-controls">
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    });
    cartContent += '</div>';
    content.innerHTML = cartContent;
}



function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function updateQuantity(productId, quantityChange) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity += quantityChange;
        if (product.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        }
    }
}

document.getElementById("homeBtn").addEventListener("click", () => loadProducts());
document.getElementById("cartBtn").addEventListener("click", renderCart);
document.getElementById("logoutBtn").addEventListener("click", logoutUser);

document.getElementById("loginBtn").addEventListener("click", () => {
    content.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" placeholder="Email" id="loginEmail" required>
            <input type="password" placeholder="Password" id="loginPassword" required>
            <button type="submit">Login</button>
        </form>
    `;
    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        loginUser(email, password);
    });
});

document.getElementById("signupBtn").addEventListener("click", () => {
    content.innerHTML = `
        <h2>Signup</h2>
        <form id="signupForm">
            <input type="email" placeholder="Email" id="signupEmail" required>
            <input type="password" placeholder="Password" id="signupPassword" required>
            <button type="submit">Signup</button>
        </form>
    `;
    document.getElementById("signupForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        signupUser(email, password);
    });
});


updateNavbar();
if (currentUser) loadProducts();
else content.innerHTML = `<h2>Please log in to continue shopping.</h2>`;
