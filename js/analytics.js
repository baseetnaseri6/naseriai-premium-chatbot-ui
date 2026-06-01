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

const tooltip = document.getElementById("chartTooltip");
const chart = document.getElementById("revenueChart");

document.querySelectorAll(".chart-points circle").forEach((point) => {
  point.addEventListener("mouseenter", (event) => {
    const month = point.dataset.month;
    const revenue = point.dataset.revenue;
    tooltip.textContent = `${month} — Revenue ${revenue}`;
    tooltip.style.opacity = "1";
  });

  point.addEventListener("mousemove", (event) => {
    const rect = chart.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.left}px`;
    tooltip.style.top = `${event.clientY - rect.top}px`;
  });

  point.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });
});

document.getElementById("exportData")?.addEventListener("click", () => {
  const data = "Analytics Export\nMonthly Revenue: $98,000\nAPI Requests: 2.4M\nActive Subscriptions: 4,820\nSystem Uptime: 99.97%";
  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics-data.txt";
  a.click();
  URL.revokeObjectURL(url);
});
