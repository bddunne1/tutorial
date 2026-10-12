/* Check Pricing page: "which method?" picker. */
(function () {
  "use strict";

  // For each thing the trainee has: which methods apply, and what to do next.
  var PLAN = {
    theirs: { use: { 1: "Start here. The list shows our part # too." }, note: "With only their part #, the price list is the way in. If they don't have a list, ask." },
    ours:   { use: { 1: "Use if they have a price list.", 2: "Works for any item we've sold them before." }, note: "Either works. The price list is faster when the customer has one." },
    desc:   { use: { 3: "Start here to find our item #.", 2: "Then use this to get the price." }, note: "Find the item first (method 3), then check its price history (method 2)." }
  };

  var picker = document.getElementById("picker");
  if (!picker) return;
  var cards = Array.prototype.slice.call(picker.querySelectorAll("[data-method]"));
  var note = document.getElementById("picker-note");

  function render() {
    var checked = picker.querySelector("input[name='have']:checked");
    var plan = PLAN[checked ? checked.value : "ours"];
    cards.forEach(function (c) {
      var then = plan.use[c.getAttribute("data-method")];
      var tag = c.querySelector("[data-then]");
      c.classList.toggle("is-pick", !!then);
      c.classList.toggle("is-dim", !then);
      tag.hidden = !then;
      tag.textContent = then || "";
    });
    note.textContent = plan.note;
  }
  picker.addEventListener("change", render);
  render();
})();
