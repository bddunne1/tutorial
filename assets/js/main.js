/* Shared behavior for every procedure page:
   contents toggle + scrollspy, stage progress, image lightbox, tabs. */
(function () {
  "use strict";

  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  window.ProcStore = store;

  /* ---- Mobile contents toggle ---- */
  var rail = document.getElementById("rail");
  var toggle = document.getElementById("toc-toggle");
  if (rail && toggle) {
    toggle.addEventListener("click", function () {
      var open = rail.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    rail.addEventListener("click", function (e) {
      if (e.target.closest("a")) { rail.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Scrollspy ---- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  var targets = tocLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if ("IntersectionObserver" in window && targets.length) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      for (var i = 0; i < targets.length; i++) { if (visible[targets[i].id]) { current = targets[i].id; break; } }
      if (!current) return;
      tocLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + current); });
    }, { rootMargin: "-20% 0px -65% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- Stage progress (saved per procedure, per browser) ---- */
  var key = "proc-progress:" + (document.body.getAttribute("data-procedure") || location.pathname);
  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-complete]"));
  var done = store.get(key) || {};
  function renderProgress() {
    var n = 0;
    boxes.forEach(function (b) {
      var id = b.getAttribute("data-complete");
      b.checked = !!done[id];
      if (done[id]) n++;
      document.querySelectorAll("[data-stage='" + id + "']").forEach(function (el) { el.classList.toggle("is-done", !!done[id]); });
    });
    var count = document.getElementById("progress-count");
    var fill = document.getElementById("progress-fill");
    if (count) count.textContent = n + " of " + boxes.length;
    if (fill) fill.style.width = (boxes.length ? (n / boxes.length) * 100 : 0) + "%";
  }
  boxes.forEach(function (b) {
    b.addEventListener("change", function () { done[b.getAttribute("data-complete")] = b.checked; store.set(key, done); renderProgress(); });
  });
  var reset = document.getElementById("progress-reset");
  if (reset) reset.addEventListener("click", function () { done = {}; store.set(key, done); renderProgress(); });
  renderProgress();

  /* ---- Lightbox ---- */
  var lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = document.getElementById("lightbox-img");
    var lbCap = document.getElementById("lightbox-cap");
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-zoom]");
      if (!btn) return;
      var img = btn.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      var cap = btn.parentElement.querySelector("figcaption");
      lbCap.textContent = cap ? cap.textContent : "";
      lb.showModal();
    });
    document.getElementById("lightbox-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---- Tabs (WAI-ARIA pattern) ---- */
  document.querySelectorAll("[role='tablist']").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role='tab']"));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
        if (j === null) return;
        var next = tabs[(j + tabs.length) % tabs.length];
        next.focus(); select(next); e.preventDefault();
      });
    });
  });
})();
