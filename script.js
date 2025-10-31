const ADMIN_USER = btoa("IRPANMAULANA");
const ADMIN_PASS = btoa("IRPANGG0");
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let users = JSON.parse(localStorage.getItem("users")) || [];

const API_URL = "https://darkgpt-backedd-production.up.railway.app/api/chat";

// ===== Sidebar =====
document.getElementById("openSidebar").onclick = () =>
  document.getElementById("sidebar").classList.add("active");
document.getElementById("closeSidebar").onclick = () =>
  document.getElementById("sidebar").classList.remove("active");

// ===== Login =====
document.getElementById("loginBtn").onclick = () => {
  const u = prompt("Username:");
  const p = prompt("Password:");
  if (!u || !p) return;

  if (btoa(u) === ADMIN_USER && btoa(p) === ADMIN_PASS) {
    currentUser = { user: u, admin: true, token: Infinity };
    alert("✅ Login sebagai ADMIN!");
  } else {
    const existing = users.find((x) => x.user === u);
    if (existing) {
      currentUser = existing;
    } else {
      currentUser = { user: u, admin: false, token: 10 };
      users.push(currentUser);
    }
    alert(`✅ Login berhasil! Kamu punya ${currentUser.token} token.`);
  }
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("users", JSON.stringify(users));
  updateSidebarVisibility();
  document.getElementById("chatContainer").innerHTML =
    "<div class='message'>Apa yang bisa dibantu?</div>";
};

// ===== Chat =====
document.getElementById("sendBtn").onclick = async () => {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;
  const chatBox = document.getElementById("chatContainer");
  chatBox.innerHTML += `<div class="message user">${input}</div>`;
  document.getElementById("userInput").value = "";

  if (!currentUser) {
    chatBox.innerHTML += `<div class="message">⚠️ Silakan login dulu.</div>`;
    return;
  }
  if (!currentUser.admin && currentUser.token <= 0) {
    chatBox.innerHTML += `<div class="message">❌ Token habis.</div>`;
    return;
  }

  chatBox.innerHTML += `<div class="message">💬 DarkGPT mengetik...</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5",
        messages: [{ role: "user", content: input }],
      }),
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ Error dari API.";
    chatBox.innerHTML += `<div class="message">${reply}</div>`;
  } catch (e) {
    chatBox.innerHTML += `<div class="message">⚠️ Gagal koneksi ke API.</div>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
  if (!currentUser.admin) {
    currentUser.token--;
    updateUser(currentUser);
  }
};

// ===== Admin Panel =====
document.getElementById("adminPanel").onclick = () => {
  if (!currentUser?.admin) return alert("Kamu bukan admin!");
  showUsers();
  document.getElementById("adminPanelDiv").style.display = "block";
};

function showUsers() {
  const list = document.getElementById("userList");
  list.innerHTML = "";
  users.forEach((u, i) => {
    list.innerHTML += `
      <div style='margin-bottom:10px;border-bottom:1px solid #333;padding-bottom:5px;'>
        👤 <b>${u.user}</b> — Token: ${u.token}
        <button onclick='addToken(${i})'>+ Token</button>
      </div>`;
  });
}

function addToken(i) {
  users[i].token += 10;
  localStorage.setItem("users", JSON.stringify(users));
  alert("✅ Token ditambah!");
  showUsers();
}

function updateUser(u) {
  const idx = users.findIndex((x) => x.user === u.user);
  if (idx >= 0) users[idx] = u;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(u));
}

function updateSidebarVisibility() {
  const adminLink = document.getElementById("adminPanel");
  if (currentUser?.admin) {
    adminLink.style.display = "block";
  } else {
    adminLink.style.display = "none";
  }
}
updateSidebarVisibility();