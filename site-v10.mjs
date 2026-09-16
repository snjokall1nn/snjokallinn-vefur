const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

function setMenu(open) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  const use = menuButton.querySelector("use");
  if (use) use.setAttribute("href", open ? "./icons.svg#close" : "./icons.svg#menu");
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setMenu(false);
    menuButton?.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 780) setMenu(false);
});
