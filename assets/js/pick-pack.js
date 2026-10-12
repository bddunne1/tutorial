/* Pick & Pack page: To Fulfill Qty practice sheet. */
(function () {
  "use strict";

  // Practice order: items and open quantities from the worksheet screenshots, plus the 45150III example.
  var LINES = [
    { item: "00804III", ordered: 56, circled: 56 },
    { item: "00825III", ordered: 300, circled: null },
    { item: "00826III", ordered: 20, circled: 20 },
    { item: "00829III", ordered: 720, circled: null },
    { item: "19304III", ordered: 12, circled: 3 },
    { item: "45150III", ordered: 312, circled: 144 }
  ];

  var form = document.getElementById("practice");
  if (!form) return;
  var rows = document.getElementById("practice-rows");
  var result = document.getElementById("practice-result");

  rows.innerHTML = LINES.map(function (l, i) {
    return '<tr><td class="item">' + l.item + '</td><td class="num">' + l.ordered + '</td><td>' +
      (l.circled === null ? '<span class="nocircle">no circle</span>' : '<span class="circled">' + l.circled + '</span>') +
      '</td><td><label class="visually-hidden" for="pf-' + i + '">To Fulfill Qty for ' + l.item + '</label>' +
      '<input id="pf-' + i + '" type="number" min="0" step="1" inputmode="numeric"><div class="why" hidden></div></td></tr>';
  }).join("");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var right = 0;
    LINES.forEach(function (l, i) {
      var input = document.getElementById("pf-" + i);
      var why = input.nextElementSibling;
      var want = l.circled === null ? 0 : l.circled;
      var ok = input.value !== "" && Number(input.value) === want;
      if (ok) right++;
      input.classList.toggle("is-right", ok);
      input.classList.toggle("is-wrong", !ok);
      why.hidden = ok;
      why.textContent = ok ? "" : (l.circled === null ? "No circle: not shipping, enter 0." : "Enter the circled quantity: " + want + ".");
    });
    result.textContent = right === LINES.length ? "All " + right + " correct." : right + " of " + LINES.length + " correct.";
  });

  document.getElementById("practice-reset").addEventListener("click", function () {
    LINES.forEach(function (l, i) {
      var input = document.getElementById("pf-" + i);
      input.value = ""; input.classList.remove("is-right", "is-wrong");
      input.nextElementSibling.hidden = true;
    });
    result.textContent = "";
  });
})();
