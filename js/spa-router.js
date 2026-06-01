/*
  NOVA AI SPA Router
  Keeps navigation smooth without a full browser refresh.
*/

(function () {
  const pageCache = new Map();
  const localPages = new Set([
    "index.html",
    "dashboard.html",
    "content-tools.html",
    "analytics.html",
    "subscription.html",
    "settings.html"
  ]);

  function normalizeUrl(url) {
    if (!url || url === "#") return null;

    const clean = String(url).replace("./", "").trim();
    if (clean === "/" || clean === "") return "index.html";

    const file = clean.split("/").pop().split("?")[0].split("#")[0];
    return localPages.has(file) ? file : null;
  }

  function pageNameFromPath() {
    const current = window.location.pathname.split("/").pop();
    return current || "index.html";
  }

  function ensureStyles(targetDoc) {
    const targetLinks = Array.from(targetDoc.querySelectorAll('link[rel="stylesheet"]'));

    targetLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const alreadyExists = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .some((existing) => existing.getAttribute("href") === href);

      if (!alreadyExists) {
        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.href = href;
        document.head.appendChild(newLink);
      }
    });
  }

  function runBodyScripts() {
    const scripts = Array.from(document.body.querySelectorAll("script"));

    scripts.forEach((oldScript) => {
      const src = oldScript.getAttribute("src");

      if (src && src.includes("spa-router.js")) return;

      const newScript = document.createElement("script");

      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (!src) {
        newScript.textContent = oldScript.textContent;
      }

      oldScript.replaceWith(newScript);
    });
  }

  async function loadPage(url, push = true) {
    const target = normalizeUrl(url);
    if (!target) return;

    const current = pageNameFromPath();

    if (target === current) {
      document.body.classList.remove("page-leave"); if (window.hidePossibleLoaders) window.hidePossibleLoaders(); if (window.hidePossibleLoaders) window.hidePossibleLoaders(); return;
    }

    try {
      document.body.classList.add("page-leave");

      let htmlText;

      if (pageCache.has(target)) {
        htmlText = pageCache.get(target);
      } else {
        const response = await fetch(target, { cache: "no-store" });
        if (!response.ok) throw new Error("Page not found: " + target);
        htmlText = await response.text();
        pageCache.set(target, htmlText);
      }

      const parser = new DOMParser();
      const targetDoc = parser.parseFromString(htmlText, "text/html");

      setTimeout(() => {
        ensureStyles(targetDoc);

        document.title = targetDoc.title || document.title;
        document.body.className = targetDoc.body.className;
        document.body.innerHTML = targetDoc.body.innerHTML;

        if (push) {
          history.pushState({ page: target }, "", target);
        }

        window.scrollTo({ top: 0, behavior: "instant" });

        runBodyScripts();

        setTimeout(() => {
          if (typeof window.openGlobalChatHistory === "function") {
            // Drawer script is ready. Do not auto-open; just ensure it can initialize.
          }
        }, 30);

        setTimeout(() => {
          document.body.classList.remove("page-leave"); if (window.hidePossibleLoaders) window.hidePossibleLoaders();
        }, 40);
      }, 180);
    } catch (error) {
      console.error("SPA navigation failed:", error);
      document.body.classList.remove("page-leave"); if (window.hidePossibleLoaders) window.hidePossibleLoaders(); window.location.href = target;
    }
  }

  window.goPage = function (url) {
    loadPage(url, true);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const target = normalizeUrl(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    loadPage(target, true);
  });

  window.addEventListener("popstate", () => {
    loadPage(pageNameFromPath(), false);
  });
})();
