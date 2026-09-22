/** Site interactions: navigation, tabs, staged reveals, and active scene state. */
document.documentElement.classList.add("js");

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
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length) return;

    function activate(tab, { focus = false } = {}) {
      const name = tab.dataset.tab;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== name;
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
  });
}

function initStageMotion() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -6%" });

  items.forEach((item) => observer.observe(item));
}

function initStageProgress() {
  const stages = Array.from(document.querySelectorAll("[data-stage]"));
  const links = Array.from(document.querySelectorAll("[data-stage-link]"));
  const rail = document.querySelector("[data-stage-rail]");
  if (!stages.length || !links.length || !("IntersectionObserver" in window)) return;

  function activate(id, isDark) {
    links.forEach((link) => {
      const active = link.dataset.stageLink === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (rail) rail.classList.toggle("is-on-dark", isDark);
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const stage = visible.target;
    activate(stage.dataset.stage, stage.classList.contains("traceability") || stage.classList.contains("closing"));
  }, { threshold: [0.3, 0.5, 0.7], rootMargin: "-20% 0px -20%" });

  stages.forEach((stage) => observer.observe(stage));
  activate(stages[0].dataset.stage, false);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
initMobileNav();
initSmoothAnchors();
initTabs();
initStageMotion();
initStageProgress();
