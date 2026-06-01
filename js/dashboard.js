const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileDrawer = document.getElementById("mobileDrawer");
const closeMobileDrawer = document.getElementById("closeMobileDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileDrawer.classList.add("show");
    drawerOverlay.classList.add("show");
  });
}

function closeDrawer(){
  mobileDrawer.classList.remove("show");
  drawerOverlay.classList.remove("show");
}

if (closeMobileDrawer) closeMobileDrawer.addEventListener("click", closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);
