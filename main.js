/**
 * Site interactions: sticky header, mobile nav, smooth anchors, developer tabs.
 */
const header = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

function closeMobileNav() {
  if (!mobileNav || !navToggle) return;
  mobileNav.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

function openMobileNav() {
  if (!mobileNav || !navToggle) return;
  mobileNav.hidden = false;
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close menu");
}

function initMobileNav() {
  if (!navToggle || !mobileNav) return;

  navToggle.addEventListener("click", () => {
    if (mobileNav.hidden) {
      openMobileNav();
    } else {
      closeMobileNav();
    }
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMobileNav());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      closeMobileNav();
      navToggle.focus();
    }
  });
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });
}

function initTabs() {
  const root = document.querySelector("[data-tabs]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

  function activate(tab, { focus = false } = {}) {
    const name = tab.dataset.tab;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const match = panel.dataset.panel === name;
      panel.hidden = !match;
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      activate(next, { focus: true });
    });
  });
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
initMobileNav();
initSmoothAnchors();
initTabs();
