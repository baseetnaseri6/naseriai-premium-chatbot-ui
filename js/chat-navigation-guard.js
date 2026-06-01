/*
  V29 Chat Guard
  Stops Chat sidebar buttons from changing page or freezing UI.
*/
(function(){
  document.addEventListener("click", function(event){
    const btn = event.target.closest('button[data-label="Chat"], button#mobileChatNav');
    if (!btn) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    if (typeof window.openGlobalChatHistory === "function") {
      window.openGlobalChatHistory(event);
    }

    return false;
  }, true);
})();
