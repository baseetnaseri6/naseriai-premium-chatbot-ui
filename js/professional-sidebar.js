/*
  V27 Sidebar micro interaction
*/
(function(){
  function pulseActiveSidebar(){
    const active = document.querySelector(".sidebar .nav button.active");
    if (!active) return;
    active.classList.add("sidebar-pulse");
    setTimeout(() => active.classList.remove("sidebar-pulse"), 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pulseActiveSidebar);
  } else {
    pulseActiveSidebar();
  }
})();
