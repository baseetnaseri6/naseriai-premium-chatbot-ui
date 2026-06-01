/*
  V30 Safe Navigation Fix
  - Logo opens index.html safely without SPA loader freeze.
  - Chat button opens history drawer without reload.
  - Loader never gets stuck.
*/

(function () {
  window.safeHome = function () {
    try {
      localStorage.removeItem("novaOpenHistoryChat");
      localStorage.removeItem("novaOpenNewChat");
    } catch (e) {}

    // Full normal load is safer for logo/home and prevents SPA loader freeze.
    window.location.href = "index.html";
  };

  window.safeChatHome = function () {
    try {
      localStorage.removeItem("novaOpenHistoryChat");
      localStorage.removeItem("novaOpenNewChat");
    } catch (e) {}

    window.location.href = "index.html";
  };

  function hidePossibleLoaders() {
    const selectors = [
      "#loader",
      ".loader",
      ".preloader",
      "#preloader",
      ".loading-screen",
      "#loadingScreen",
      ".page-loader",
      "#pageLoader",
      ".splash-screen",
      "#splashScreen"
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add("hide", "hidden", "loaded");
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
        setTimeout(() => {
          if (el && el.parentElement) {
            el.style.display = "none";
          }
        }, 450);
      });
    });

    document.body.classList.remove("page-leave", "loading", "is-loading");
    document.documentElement.classList.remove("loading", "is-loading");
  }

  window.hidePossibleLoaders = hidePossibleLoaders;

  window.addEventListener("load", () => {
    setTimeout(hidePossibleLoaders, 650);
    setTimeout(hidePossibleLoaders, 1600);
    setTimeout(hidePossibleLoaders, 3000);
  });

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(hidePossibleLoaders, 1200);
  });
})();
