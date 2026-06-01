const navButtons = document.querySelectorAll(".nav button");
const input = document.getElementById("promptInput");
const app = document.getElementById("app");
const loader = document.getElementById("pageLoader");

const heroSection = document.getElementById("heroSection");
const orbStage = document.getElementById("orbStage");
const chatView = document.getElementById("chatView");
const chatNav = document.getElementById("chatNav");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const userMessage = document.getElementById("userMessage");
const assistantTopic = document.getElementById("assistantTopic");
const composerZone = document.querySelector(".composer-zone");

const optionsBtn = document.getElementById("optionsBtn");
const optionsMenu = document.getElementById("optionsMenu");
const exportChatBtn = document.getElementById("exportChat");
const shareChatBtn = document.getElementById("shareChat");
const clearCurrentChatBtn = document.getElementById("clearCurrentChat");

const downloadsToggle = document.getElementById("downloadsToggle");
const downloadsPanel = document.getElementById("downloadsPanel");
const closeDownloads = document.getElementById("closeDownloads");
const downloadsList = document.getElementById("downloadsList");
const downloadCount = document.getElementById("downloadCount");

const newChatBtn = document.getElementById("newChatBtn");
const historyPanel = document.getElementById("historyPanel");
const historyOverlay = document.getElementById("historyOverlay");
const closeHistory = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");
const historyNewChat = document.getElementById("historyNewChat");
const clearHistory = document.getElementById("clearHistory");

const voiceScreen = document.getElementById("voiceScreen");
const openVoice = document.getElementById("openVoice");
const voiceExit = document.getElementById("voiceExit");
const deleteRecord = document.getElementById("deleteRecord");
const stopRecord = document.getElementById("stopRecord");
const sendRecord = document.getElementById("sendRecord");
const recordTimer = document.getElementById("recordTimer");
const recordingText = document.getElementById("recordingText");

let timerInterval = null;
let seconds = 0;
let isPaused = false;

let chats = JSON.parse(localStorage.getItem("novaChats") || "[]");
let activeChatId = localStorage.getItem("novaActiveChatId") || null;
let generatedFiles = JSON.parse(localStorage.getItem("novaFiles") || "[]");

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("hide");
    app.classList.add("show");
  }, 1600);

  renderHistory();
  renderDownloads();

  if (activeChatId && chats.find((chat) => chat.id === activeChatId)) {
    openChat(activeChatId, false);
  }
});

function showToast(message) {
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

function saveChats() {
  localStorage.setItem("novaChats", JSON.stringify(chats));
  if (activeChatId) localStorage.setItem("novaActiveChatId", activeChatId);
}

function saveFiles() {
  localStorage.setItem("novaFiles", JSON.stringify(generatedFiles));
}

function createTitleFromMessage(message) {
  const clean = message.trim().replace(/\s+/g, " ");
  if (!clean) return "New Chat";
  return clean.length > 28 ? clean.slice(0, 28) + "..." : clean;
}

function createChat(message) {
  const chat = {
    id: Date.now().toString(),
    title: createTitleFromMessage(message),
    preview: message,
    message: message,
    createdAt: new Date().toISOString()
  };

  chats.unshift(chat);
  activeChatId = chat.id;
  saveChats();
  renderHistory();
  openChat(chat.id, false);
  generateAiFile(chat);
}

function openChat(chatId, closePanel = true) {
  const chat = chats.find((item) => item.id === chatId);
  if (!chat) return;

  activeChatId = chat.id;
  saveChats();

  heroSection.classList.add("chat-hidden");
  orbStage.classList.add("hide");
  chatView.classList.add("show");
  composerZone.classList.add("chat-active");

  userMessage.textContent = chat.message;
  assistantTopic.textContent = `"${chat.message}"`;

  renderHistory();

  if (closePanel) closeHistoryPanel();
}

function resetToNewChat() {
  activeChatId = null;
  localStorage.removeItem("novaActiveChatId");

  input.value = "";
  heroSection.classList.remove("chat-hidden");
  orbStage.classList.remove("hide");
  chatView.classList.remove("show");
  composerZone.classList.remove("chat-active");

  renderHistory();
}

function clearCurrentChat() {
  if (!activeChatId) {
    resetToNewChat();
    showToast("No active chat to clear");
    return;
  }

  chats = chats.filter((chat) => chat.id !== activeChatId);
  generatedFiles = generatedFiles.filter((file) => file.chatId !== activeChatId);
  activeChatId = null;

  localStorage.setItem("novaChats", JSON.stringify(chats));
  localStorage.setItem("novaFiles", JSON.stringify(generatedFiles));
  localStorage.removeItem("novaActiveChatId");

  resetToNewChat();
  renderDownloads();
  closeOptions();
  showToast("Chat cleared");
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!chats.length) {
    historyList.innerHTML = `
      <div class="history-empty">
        No chat history yet.<br>
        Send your first message and it will appear here.
      </div>
    `;
    return;
  }

  chats.forEach((chat) => {
    const item = document.createElement("div");
    item.className = "history-item" + (chat.id === activeChatId ? " active" : "");
    item.dataset.id = chat.id;

    item.innerHTML = `
      <div class="history-main">
        <span class="history-title">${escapeHtml(chat.title)}</span>
        <span class="history-preview">${escapeHtml(chat.preview)}</span>
      </div>

      <div class="history-controls">
        <button class="rename-chat" title="Rename">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button class="delete-chat" title="Delete">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;

    item.addEventListener("click", () => openChat(chat.id));

    item.querySelector(".rename-chat").addEventListener("click", (event) => {
      event.stopPropagation();
      startRename(item, chat.id);
    });

    item.querySelector(".delete-chat").addEventListener("click", (event) => {
      event.stopPropagation();
      deleteChat(chat.id);
    });

    historyList.appendChild(item);
  });
}

function startRename(item, chatId) {
  const chat = chats.find((item) => item.id === chatId);
  if (!chat) return;

  const titleArea = item.querySelector(".history-main");
  titleArea.innerHTML = `<input class="renaming-box" value="${escapeAttr(chat.title)}" />`;

  const renameInput = titleArea.querySelector("input");
  renameInput.focus();
  renameInput.select();

  function saveRename() {
    const newTitle = renameInput.value.trim();
    if (newTitle) {
      chat.title = newTitle;
      saveChats();
    }
    renderHistory();
  }

  renameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveRename();
    if (event.key === "Escape") renderHistory();
  });

  renameInput.addEventListener("blur", saveRename);
}

function deleteChat(chatId) {
  chats = chats.filter((chat) => chat.id !== chatId);
  generatedFiles = generatedFiles.filter((file) => file.chatId !== chatId);

  if (activeChatId === chatId) {
    resetToNewChat();
  }

  saveChats();
  saveFiles();
  renderHistory();
  renderDownloads();
}

function openHistoryPanel() {
  historyPanel.classList.add("show");
  historyOverlay.classList.add("show");
  renderHistory();
}

function closeHistoryPanel() {
  historyPanel.classList.remove("show");
  historyOverlay.classList.remove("show");
}

function openOptions() {
  optionsMenu.classList.add("show");
}

function closeOptions() {
  optionsMenu.classList.remove("show");
}

function toggleOptions(event) {
  event.stopPropagation();
  optionsMenu.classList.toggle("show");
}

function getActiveChat() {
  if (!activeChatId) return null;
  return chats.find((chat) => chat.id === activeChatId) || null;
}

function getChatExportText(chat) {
  if (!chat) return "No active chat.";
  return `NOVA AI Chat Export\n\nTitle: ${chat.title}\n\nUser:\n${chat.message}\n\nAI:\nI understand you're asking about "${chat.message}". I can help with data analysis, SQL queries, debugging, visualizations, performance optimization, and reports.`;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function exportActiveChat() {
  const chat = getActiveChat();
  if (!chat) {
    showToast("No active chat to export");
    closeOptions();
    return;
  }

  downloadTextFile(`${safeFileName(chat.title)}.txt`, getChatExportText(chat));
  closeOptions();
  showToast("Chat exported");
}

async function shareActiveChat() {
  const chat = getActiveChat();

  if (!chat) {
    showToast("No active chat to share");
    closeOptions();
    return;
  }

  const text = getChatExportText(chat);

  try {
    if (navigator.share) {
      await navigator.share({
        title: chat.title,
        text
      });
      showToast("Share opened");
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast("Chat copied to clipboard");
    } else {
      showToast("Sharing not supported");
    }
  } catch (error) {
    showToast("Share cancelled");
  }

  closeOptions();
}

function generateAiFile(chat) {
  const content = getChatExportText(chat);
  const file = {
    id: `file-${chat.id}`,
    chatId: chat.id,
    name: `${safeFileName(chat.title)}-ai-response.txt`,
    size: `${Math.max(1, Math.ceil(content.length / 1024))} KB`,
    content
  };

  generatedFiles = generatedFiles.filter((item) => item.id !== file.id);
  generatedFiles.unshift(file);
  saveFiles();
  renderDownloads();
}

function renderDownloads() {
  downloadsList.innerHTML = "";
  downloadCount.textContent = generatedFiles.length;

  if (!generatedFiles.length) {
    downloadsList.innerHTML = `<div class="downloads-empty">No files yet. Send a message to generate a downloadable file.</div>`;
    return;
  }

  generatedFiles.forEach((file) => {
    const item = document.createElement("div");
    item.className = "download-item";

    item.innerHTML = `
      <div class="file-info">
        <div class="file-icon">
          <i class="fa-regular fa-file-lines"></i>
        </div>

        <div class="file-meta">
          <span class="file-name">${escapeHtml(file.name)}</span>
          <span class="file-size">${escapeHtml(file.size)}</span>
        </div>
      </div>

      <button class="download-file-btn" title="Download">
        <i class="fa-solid fa-download"></i>
      </button>
    `;

    item.querySelector(".download-file-btn").addEventListener("click", () => {
      downloadTextFile(file.name, file.content);
      showToast("File downloaded");
    });

    downloadsList.appendChild(item);
  });
}

function safeFileName(name) {
  return String(name)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase() || "chat";
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[match]);
}

function escapeAttr(text) {
  return String(text).replace(/"/g, "&quot;");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    if (button === chatNav) {
      openHistoryPanel();
    }
  });
});

newChatBtn.addEventListener("click", resetToNewChat);
historyNewChat.addEventListener("click", () => {
  resetToNewChat();
  closeHistoryPanel();
});
closeHistory.addEventListener("click", closeHistoryPanel);
historyOverlay.addEventListener("click", closeHistoryPanel);

clearHistory.addEventListener("click", () => {
  chats = [];
  generatedFiles = [];
  activeChatId = null;
  localStorage.removeItem("novaChats");
  localStorage.removeItem("novaFiles");
  localStorage.removeItem("novaActiveChatId");
  resetToNewChat();
  renderHistory();
  renderDownloads();
});

optionsBtn.addEventListener("click", toggleOptions);
exportChatBtn.addEventListener("click", exportActiveChat);
shareChatBtn.addEventListener("click", shareActiveChat);
clearCurrentChatBtn.addEventListener("click", clearCurrentChat);

document.addEventListener("click", (event) => {
  if (!optionsMenu.contains(event.target) && !optionsBtn.contains(event.target)) {
    closeOptions();
  }
});

downloadsToggle.addEventListener("click", () => {
  downloadsPanel.classList.toggle("show");
});

closeDownloads.addEventListener("click", () => {
  downloadsPanel.classList.remove("show");
});

function formatTime(totalSeconds) {
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function startVoiceRecording() {
  clearInterval(timerInterval);
  seconds = 0;
  isPaused = false;

  recordTimer.textContent = "00:00";
  recordingText.textContent = "Recording in progress...";
  stopRecord.innerHTML = '<i class="fa-regular fa-circle-stop"></i> Stop';
  voiceScreen.classList.remove("paused");

  timerInterval = setInterval(() => {
    seconds++;
    recordTimer.textContent = formatTime(seconds);
  }, 1000);
}

function openVoiceScreen() {
  voiceScreen.classList.add("show");
  document.body.style.overflow = "hidden";
  startVoiceRecording();
}

function closeVoiceScreen() {
  voiceScreen.classList.remove("show");
  voiceScreen.classList.remove("paused");
  clearInterval(timerInterval);
  document.body.style.overflow = "hidden";
}

openVoice.addEventListener("click", openVoiceScreen);
voiceExit.addEventListener("click", closeVoiceScreen);

deleteRecord.addEventListener("click", () => {
  input.value = "";
  closeVoiceScreen();
});

stopRecord.addEventListener("click", () => {
  if (!isPaused) {
    isPaused = true;
    clearInterval(timerInterval);
    voiceScreen.classList.add("paused");
    recordingText.textContent = "Recording paused";
    stopRecord.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
  } else {
    isPaused = false;
    voiceScreen.classList.remove("paused");
    recordingText.textContent = "Recording in progress...";
    stopRecord.innerHTML = '<i class="fa-regular fa-circle-stop"></i> Stop';

    timerInterval = setInterval(() => {
      seconds++;
      recordTimer.textContent = formatTime(seconds);
    }, 1000);
  }
});

sendRecord.addEventListener("click", () => {
  input.value = `Voice message recorded (${recordTimer.textContent})`;
  closeVoiceScreen();
});

// ENTER should NOT send. It keeps the text inside input.
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    input.focus();
  }
});

document.getElementById("sendMessage").addEventListener("click", () => {
  const message = input.value.trim();

  if (!message) {
    input.focus();
    return;
  }

  if (activeChatId) {
    const chat = chats.find((item) => item.id === activeChatId);
    if (chat) {
      chat.message = message;
      chat.preview = message;
      if (!chat.title || chat.title === "New Chat") {
        chat.title = createTitleFromMessage(message);
      }
      saveChats();
      openChat(chat.id, false);
      generateAiFile(chat);
    }
  } else {
    createChat(message);
  }

  input.value = "";
});

fullscreenBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await app.requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Exit Fullscreen';
    } else {
      await document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
    }
  } catch (error) {
    console.log("Fullscreen is not available:", error);
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
  }
});


/* ===== V13 MOBILE DRAWER JS ===== */
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");
const mobileDrawerOverlay = document.getElementById("mobileDrawerOverlay");
const closeMobileDrawer = document.getElementById("closeMobileDrawer");
const mobileNewChat = document.getElementById("mobileNewChat");
const mobileChatNav = document.getElementById("mobileChatNav");

function openMobileDrawer(){
  mobileDrawer.classList.add("show");
  mobileDrawerOverlay.classList.add("show");
}

function closeMobileDrawerPanel(){
  mobileDrawer.classList.remove("show");
  mobileDrawerOverlay.classList.remove("show");
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileDrawer);
if (closeMobileDrawer) closeMobileDrawer.addEventListener("click", closeMobileDrawerPanel);
if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener("click", closeMobileDrawerPanel);

if (mobileNewChat) {
  mobileNewChat.addEventListener("click", () => {
    resetToNewChat();
    closeMobileDrawerPanel();
  });
}

if (mobileChatNav) {
  mobileChatNav.addEventListener("click", () => {
    closeMobileDrawerPanel();
    openHistoryPanel();
  });
}

document.querySelectorAll(".mobile-nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mobile-nav button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});


/* ===== V16 PROFILE MENU ===== */
(function v16ProfileMenu(){
  const profileBtn = document.getElementById("profileBtn");
  const profileMenu = document.getElementById("profileMenu");
  const optionsBtn = document.getElementById("optionsBtn");
  const optionsMenu = document.getElementById("optionsMenu");

  if (profileBtn && profileMenu) {
    profileBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (optionsMenu) optionsMenu.classList.remove("show");
      profileMenu.classList.toggle("show");
    });
  }

  document.addEventListener("click", (event) => {
    if (profileMenu && profileBtn && !profileMenu.contains(event.target) && !profileBtn.contains(event.target)) {
      profileMenu.classList.remove("show");
    }
  });

  if (optionsBtn && optionsMenu && profileMenu) {
    optionsBtn.addEventListener("click", () => {
      profileMenu.classList.remove("show");
    });
  }
})();


/* ===== V17 CLEAN FULLSCREEN MODE JS ===== */
(function cleanFullscreenMode(){
  const app = document.getElementById("app");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  if (!app || !fullscreenBtn) return;

  function updateFullscreenUI(){
    if (document.fullscreenElement) {
      app.classList.add("fullscreen-mode");
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Exit';
    } else {
      app.classList.remove("fullscreen-mode");
      fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
    }
  }

  fullscreenBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      if (!document.fullscreenElement) {
        await app.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      updateFullscreenUI();
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  }, true);

  document.addEventListener("fullscreenchange", updateFullscreenUI);
})();


/* ===== V18 FULLSCREEN VOICE + CHAT FIX ===== */
(function fullscreenVoiceChatFix(){
  const app = document.getElementById("app");
  const voiceScreen = document.getElementById("voiceScreen");
  const openVoice = document.getElementById("openVoice");
  const sendMessage = document.getElementById("sendMessage");
  const input = document.getElementById("promptInput");

  if (!app || !voiceScreen) return;

  // Important: when app is fullscreen, only children of app are visible.
  // Move the voice screen inside app so it displays in fullscreen too.
  if (voiceScreen.parentElement !== app) {
    app.appendChild(voiceScreen);
  }

  if (openVoice) {
    openVoice.addEventListener("click", () => {
      if (voiceScreen.parentElement !== app) {
        app.appendChild(voiceScreen);
      }
    }, true);
  }

  // Extra guarantee: in fullscreen, sending text must show chat view.
  if (sendMessage) {
    sendMessage.addEventListener("click", () => {
      const chatView = document.getElementById("chatView");
      const orbStage = document.getElementById("orbStage");
      const heroSection = document.getElementById("heroSection");

      setTimeout(() => {
        if (document.fullscreenElement && chatView) {
          chatView.classList.add("show");
          if (orbStage) orbStage.classList.add("hide");
          if (heroSection) heroSection.classList.add("chat-hidden");
        }
      }, 30);
    }, true);
  }

  // Enter should still not send in fullscreen.
  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    }, true);
  }
})();


/* ===== V26 OPEN CHAT FROM GLOBAL HISTORY ===== */
window.addEventListener("load", () => {
  setTimeout(() => {
    const requestedChatId = localStorage.getItem("novaOpenHistoryChat");
    const openNewChat = localStorage.getItem("novaOpenNewChat");

    if (requestedChatId && typeof openChat === "function") {
      localStorage.removeItem("novaOpenHistoryChat");
      openChat(requestedChatId, false);
      return;
    }

    if (openNewChat && typeof resetToNewChat === "function") {
      localStorage.removeItem("novaOpenNewChat");
      resetToNewChat();
    }
  }, 250);
});


/* ===== V29 CHAT GLOBAL ACCESS + PENDING ACTION FIX ===== */
setTimeout(() => {
  if (typeof openChat === "function") window.openChat = openChat;
  if (typeof resetToNewChat === "function") window.resetToNewChat = resetToNewChat;

  const requestedChatId = localStorage.getItem("novaOpenHistoryChat");
  const openNewChat = localStorage.getItem("novaOpenNewChat");

  if (requestedChatId && typeof openChat === "function") {
    localStorage.removeItem("novaOpenHistoryChat");
    openChat(requestedChatId, false);
  } else if (openNewChat && typeof resetToNewChat === "function") {
    localStorage.removeItem("novaOpenNewChat");
    resetToNewChat();
  }
}, 350);


/* ===== V30 LOADER FALLBACK FIX ===== */
window.addEventListener("load", () => {
  setTimeout(() => {
    if (typeof window.hidePossibleLoaders === "function") {
      window.hidePossibleLoaders();
    }

    document.querySelectorAll(".loading-screen, #loadingScreen, .preloader, #preloader, .page-loader, #pageLoader").forEach((loader) => {
      loader.classList.add("hide", "loaded");
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
      loader.style.pointerEvents = "none";
      setTimeout(() => loader.style.display = "none", 500);
    });
  }, 900);
});
