const products = [
  { id: 1, name: "CPM ID指定垢", price: 200, img: "https://raw.githubusercontent.com/hackparking/iraisaito/main/images/product1.jpg" },
  { id: 2, name: "CPM コインチート", price: 300, img: "https://raw.githubusercontent.com/hackparking/iraisaito/main/images/product2.jpg" },
  { id: 3, name: "CPM 課金ハウス解放", price: 120, img: "https://raw.githubusercontent.com/hackparking/iraisaito/main/images/product3.jpg" },
  { id: 4, name: "CPM 課金エンジン解放", price: 380, img: "https://raw.githubusercontent.com/hackparking/iraisaito/main/images/product4.jpg" }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discordUser = null;

function showPage(page) {
  document.getElementById("shop-page").classList.add("hidden");
  document.getElementById("cart-page").classList.add("hidden");
  document.getElementById("confirm-page").classList.add("hidden");
  document.getElementById(`${page}-page`).classList.remove("hidden");

  if (page === "cart") renderCart();
  if (page === "shop") renderProducts();
}

function renderProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";
  products.forEach(p => {
    container.innerHTML += `
      <div class="product">
        <img src="${p.img}" alt="${p.name}">
        <div class="details">
          <h2 class="product-title">${p.name}</h2>
          <p class="product-price">¥${p.price}</p>
          <button class="button" onclick="addToCart(${p.id})">カートに追加</button>
        </div>
      </div>`;
  });
}

function addToCart(id) {
  const item = products.find(p => p.id === id);
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("カートに追加しました！");
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="details">
          <h2 class="product-title">${item.name}</h2>
          <p class="product-price">¥${item.price}</p>
        </div>
      </div>`;
  });

  totalElement.textContent = `¥${total}`;
}

function confirmOrder() {
  if (cart.length === 0) return alert("カートが空です！");
  if (!discordUser) return alert("Discordにログインしてください！");

  const name = document.getElementById("buyer-name").value.trim();
  const discordTag = discordUser.username + "#" + discordUser.discriminator;

  if (!name) return alert("名前を入力してください");

  let content = `🛍️ 新しい注文が届きました！\n\n購入者: ${name}\nDiscord: ${discordTag}\n\n`;
  let total = 0;
  cart.forEach(item => {
    content += `・${item.name}（¥${item.price}）\n`;
    total += item.price;
  });
  content += `\n合計: ¥${total}`;

  fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  }).then(() => {
    clearCart();
    showPage("confirm");
  }).catch(() => {
    alert("注文送信に失敗しました");
  });
}

function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
}

function fetchUser() {
  const code = new URLSearchParams(window.location.search).get("code");
  if (!code) return;

  fetch("/auth/discord", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        discordUser = data.user;
        document.getElementById("discord-login").innerText = `ようこそ、${discordUser.username}さん`;
      }
    })
    .catch(() => alert("ログインに失敗しました"));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchUser();
  renderProducts();
});
