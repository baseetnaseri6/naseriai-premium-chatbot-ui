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

const tabs = document.querySelectorAll(".filter-tabs button");
const cards = document.querySelectorAll(".group-card");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    const filter = tab.dataset.filter;

    cards.forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

const searchInputs = [
  document.getElementById("toolSearch"),
  document.getElementById("bigToolSearch")
].filter(Boolean);

function searchTools(value){
  const query = value.toLowerCase().trim();

  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? "block" : "none";
  });
}

searchInputs.forEach((input) => {
  input.addEventListener("input", () => searchTools(input.value));
});

document.getElementById("listViewBtn")?.addEventListener("click", () => {
  document.getElementById("toolGroups").classList.toggle("list-mode");
});
