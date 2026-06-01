/*
  V29 Global Chat History
  Chat click opens history drawer without page reload.
  New Chat never gets stuck.
*/

(function(){
  function isChatPage(){
    const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    return page === "index.html" || page === "";
  }

  function getChats(){
    try{
      return JSON.parse(localStorage.getItem("novaChats") || "[]");
    }catch(e){
      return [];
    }
  }

  function escapeHtml(text){
    return String(text || "").replace(/[&<>"']/g, match => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    })[match]);
  }

  function createDrawer(){
    if (document.getElementById("globalChatPanel")) return;

    const overlay = document.createElement("div");
    overlay.className = "global-chat-overlay";
    overlay.id = "globalChatOverlay";

    const panel = document.createElement("aside");
    panel.className = "global-chat-panel";
    panel.id = "globalChatPanel";

    panel.innerHTML = `
      <div class="global-chat-head">
        <div>
          <h3>Chat History</h3>
          <p>Your previous conversations</p>
        </div>
        <button id="globalChatClose"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <button class="global-new-chat" id="globalNewChat">
        <i class="fa-solid fa-plus"></i>
        New Chat
      </button>

      <div class="global-history-list" id="globalHistoryList"></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    overlay.addEventListener("click", closeGlobalChatHistory);
    panel.querySelector("#globalChatClose").addEventListener("click", closeGlobalChatHistory);

    panel.querySelector("#globalNewChat").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      localStorage.removeItem("novaActiveChatId");
      localStorage.setItem("novaOpenNewChat", "1");

      closeGlobalChatHistory();
      closeOriginalHistory();

      if (isChatPage() && typeof window.resetToNewChat === "function") {
        window.resetToNewChat();
        return;
      }

      safeGoChat();
    });
  }

  function closeOriginalHistory(){
    document.getElementById("historyPanel")?.classList.remove("show");
    document.getElementById("historyOverlay")?.classList.remove("show");
  }

  function renderHistory(){
    createDrawer();

    const list = document.getElementById("globalHistoryList");
    const chats = getChats();

    if (!list) return;

    if (!chats.length){
      list.innerHTML = `
        <div class="global-history-empty">
          No chat history yet.<br>
          Send your first message in Chat.
        </div>
      `;
      return;
    }

    list.innerHTML = chats.map(chat => `
      <div class="global-history-item" data-id="${escapeHtml(chat.id)}">
        <strong>${escapeHtml(chat.title || "New Chat")}</strong>
        <span>${escapeHtml(chat.preview || chat.message || "")}</span>
      </div>
    `).join("");

    list.querySelectorAll(".global-history-item").forEach(item => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const id = item.dataset.id;
        localStorage.setItem("novaActiveChatId", id);
        localStorage.setItem("novaOpenHistoryChat", id);

        closeGlobalChatHistory();
        closeOriginalHistory();

        if (isChatPage() && typeof window.openChat === "function") {
          window.openChat(id, false);
          return;
        }

        safeGoChat();
      });
    });
  }

  function safeGoChat(){
    if (typeof window.safeChatHome === "function") {
      window.safeChatHome();
      return;
    }
    window.location.href = "index.html";
  }

  window.openGlobalChatHistory = function(event){
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }

    // On chat page use original history panel, but make New Chat safe.
    const originalPanel = document.getElementById("historyPanel");
    const originalOverlay = document.getElementById("historyOverlay");

    if (isChatPage() && originalPanel && originalOverlay) {
      originalPanel.classList.add("show");
      originalOverlay.classList.add("show");
      return false;
    }

    renderHistory();
    document.getElementById("globalChatPanel")?.classList.add("show");
    document.getElementById("globalChatOverlay")?.classList.add("show");
    return false;
  };

  window.closeGlobalChatHistory = function(){
    document.getElementById("globalChatPanel")?.classList.remove("show");
    document.getElementById("globalChatOverlay")?.classList.remove("show");
  };

  window.addEventListener("DOMContentLoaded", () => {
    createDrawer();
  });
})();
