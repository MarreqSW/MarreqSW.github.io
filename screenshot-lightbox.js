/**
 * Accessible screenshot lightbox with prev/next and focus management.
 */
(function () {
  "use strict";

  const modal = document.getElementById("screenshotModal");
  if (!modal) return;

  const modalImage = document.getElementById("modalImage");
  const modalCaption = document.getElementById("lightbox-caption");
  const items = Array.from(document.querySelectorAll("[data-screenshot]"));
  const closeControls = modal.querySelectorAll("[data-lightbox-close]");
  const prevBtn = modal.querySelector("[data-lightbox-prev]");
  const nextBtn = modal.querySelector("[data-lightbox-next]");

  let index = 0;
  let lastFocus = null;

  function getItemData(item) {
    return {
      src: item.getAttribute("data-screenshot"),
      caption: item.getAttribute("data-caption") || "",
      alt: item.querySelector("img")?.getAttribute("alt") || item.getAttribute("data-caption") || "Screenshot",
    };
  }

  function render() {
    const data = getItemData(items[index]);
    modalImage.src = data.src;
    modalImage.alt = data.alt;
    modalCaption.textContent = data.caption;
  }

  function open(startIndex) {
    index = startIndex;
    lastFocus = document.activeElement;
    render();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    (modal.querySelector(".lightbox__close") || modal).focus();
  }

  function close() {
    modal.hidden = true;
    modalImage.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function keepFocusInside(event) {
    if (event.key !== "Tab" || modal.hidden) return;
    const controls = Array.from(modal.querySelectorAll("button:not([disabled])"));
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function showNext(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  items.forEach((item, itemIndex) => {
    item.addEventListener("click", () => open(itemIndex));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open(itemIndex);
      }
    });
  });

  closeControls.forEach((el) => {
    el.addEventListener("click", close);
  });

  if (prevBtn) prevBtn.addEventListener("click", () => showNext(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => showNext(1));

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    keepFocusInside(event);
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") showNext(-1);
    if (event.key === "ArrowRight") showNext(1);
  });
})();
