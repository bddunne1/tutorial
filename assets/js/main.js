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

  /* ---- Knowledge check ----
     Questions live in the page as <script type="application/json" id="quiz-data">
     [{ "q": question, "a": [options], "c": index of correct option, "why": explanation }] */
  var quizForm = document.getElementById("quiz-form");
  var quizData = document.getElementById("quiz-data");
  if (quizForm && quizData) {
    var QUESTIONS = JSON.parse(quizData.textContent);
    var scoreEl = document.getElementById("quiz-score");
    var answered = {};
    var renderQuiz = function () {
      answered = {};
      quizForm.innerHTML = QUESTIONS.map(function (item, qi) {
        return '<fieldset class="q" id="q' + qi + '"><legend><span>Q' + (qi + 1) + '</span>' + item.q + '</legend><div class="opts">' +
          item.a.map(function (opt, oi) {
            var id = "q" + qi + "o" + oi;
            return '<label class="opt" for="' + id + '"><input type="radio" id="' + id + '" name="q' + qi + '" value="' + oi + '"><span>' + opt + '</span></label>';
          }).join("") +
          '</div><p class="q__fb" hidden></p></fieldset>';
      }).join("");
      updateScore();
    };
    var updateScore = function () {
      var keys = Object.keys(answered);
      var right = keys.filter(function (k) { return answered[k]; }).length;
      scoreEl.textContent = keys.length ? right + " / " + QUESTIONS.length + " correct" : "0 / " + QUESTIONS.length + " answered";
    };
    quizForm.addEventListener("submit", function (e) { e.preventDefault(); });
    quizForm.addEventListener("change", function (e) {
      var input = e.target;
      if (input.type !== "radio") return;
      var qi = parseInt(input.name.slice(1), 10);
      if (qi in answered) return; // first answer counts
      var item = QUESTIONS[qi];
      var pick = parseInt(input.value, 10);
      var ok = pick === item.c;
      answered[qi] = ok;
      var fs = document.getElementById("q" + qi);
      fs.querySelectorAll("input").forEach(function (r) {
        r.disabled = true;
        var v = parseInt(r.value, 10);
        if (v === item.c) r.parentElement.classList.add("is-right");
        else if (v === pick) r.parentElement.classList.add("is-wrong");
      });
      var fb = fs.querySelector(".q__fb");
      fb.className = "q__fb " + (ok ? "is-right" : "is-wrong");
      fb.innerHTML = "<b>" + (ok ? "Correct." : "Not quite.") + "</b> " + item.why;
      fb.hidden = false;
      updateScore();
    });
    document.getElementById("quiz-reset").addEventListener("click", renderQuiz);
    renderQuiz();
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
