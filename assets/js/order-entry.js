/* Order Entry page: unit converter, add-on helper, knowledge check. */
(function () {
  "use strict";

  function money(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function num(id) { var v = parseFloat(document.getElementById(id).value); return isFinite(v) && v >= 0 ? v : 0; }
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function noSubmit(form) { form.addEventListener("submit", function (e) { e.preventDefault(); }); }

  /* ---- Feet → spools ---- */
  var cv = document.getElementById("convert");
  function renderConvert() {
    var qty = num("cv-qty"), len = num("cv-len"), price = num("cv-price");
    var out = document.getElementById("cv-result");
    if (!len) { out.innerHTML = '<p class="muted">Enter the feet per spool (check the item description).</p>'; return; }
    var spools = qty / len;
    var perSpool = round2(price * len);
    var whole = Math.abs(spools - Math.round(spools)) < 1e-9;
    out.innerHTML =
      '<table class="so-lines"><thead><tr><th>Enter in</th><th class="amt">Value</th></tr></thead><tbody>' +
      '<tr><td>Ordered</td><td class="amt">' + (whole ? Math.round(spools) : spools.toFixed(2)) + ' spools</td></tr>' +
      '<tr><td>Rate</td><td class="amt">' + money(perSpool) + '</td></tr>' +
      '<tr><td>Amount</td><td class="amt">' + money(round2((whole ? Math.round(spools) : spools) * perSpool)) + '</td></tr>' +
      '</tbody></table>' +
      (whole ? '' : '<p class="small" style="color:var(--mark)">That isn\'t a whole number of spools. Check the spool length, and ask before entering.</p>');
  }
  if (cv) { noSubmit(cv); cv.addEventListener("input", renderConvert); renderConvert(); }

  /* ---- MINORD / CRECAR helper ---- */
  var ad = document.getElementById("addons");
  function renderAddons() {
    var total = num("ad-total");
    var min = parseFloat(document.getElementById("ad-cust").value);
    var card = document.getElementById("ad-card").checked;
    var rows = [];
    var running = total;
    if (total < min) { rows.push(["MINORD", "Minimum order fee (under " + money(min) + ")", 25]); running += 25; }
    if (card) {
      var fee = round2(running * 0.025);
      rows.push(["CRECAR", "2.5% × " + money(running), fee]); running += fee;
    }
    var out = document.getElementById("ad-result");
    if (!rows.length) {
      out.innerHTML = '<p><strong>No extra lines needed.</strong> <span class="muted">The order meets the ' + money(min) + ' minimum and isn\'t paid by card.</span></p>';
      return;
    }
    out.innerHTML =
      '<p class="small muted">Add these lines to the Sales Order:</p>' +
      '<table class="so-lines"><thead><tr><th>Item</th><th>Why</th><th class="amt">Rate</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="amt">' + money(r[2]) + '</td></tr>'; }).join("") +
      '</tbody></table>' +
      '<p>New order total <span class="big" style="margin-left:.4rem">' + money(running) + '</span></p>' +
      (card ? '<p class="small">Remember to write <span class="redpen">C/C</span> in red on the PO.</p>' : '');
  }
  if (ad) { noSubmit(ad); ad.addEventListener("input", renderAddons); ad.addEventListener("change", renderAddons); renderAddons(); }

  /* ---- Knowledge check ---- */
  var QUESTIONS = [
    {
      q: "A McMaster-Carr PO asks for 2,400 FT of item 42250 (50' spools) at $.114 per FT. What goes on the Sales Order?",
      a: ["Ordered 2,400, Rate $0.114", "Ordered 48, Rate $5.70", "Ordered 48, Rate $0.114", "Ordered 1, Rate $273.60"],
      c: 1,
      why: "Always enter spools and price per spool: 2,400 ÷ 50 = 48 spools, and $.114 × 50 = $5.70."
    },
    {
      q: "A regular customer's order comes to $150. What do you add?",
      a: ["Nothing", "A CRECAR line", "A MINORD line ($25)", "Write EC on the PO"],
      c: 2,
      why: "The standard minimum is $200, so the order gets the $25 MINORD fee."
    },
    {
      q: "A Fastenal order comes to $75. Does it need MINORD?",
      a: ["Yes, it's under $200", "No, Fastenal's minimum is $50"],
      c: 1,
      why: "MSC, McMaster-Carr, Fastenal and Wesco have a $50 minimum."
    },
    {
      q: "A customer is paying a $400.00 order by credit card. What rate goes on the CRECAR line?",
      a: ["$4.00", "$10.00", "$25.00", "$40.00"],
      c: 1,
      why: "$400.00 × 0.025 = $10.00. Then write C/C in red on the PO."
    },
    {
      q: "Who verifies the prices on an order for a house account (rep 16, 19 or 20)?",
      a: ["You do, before entering the order", "The customer's dedicated rep", "Nobody, the PO price is always right"],
      c: 0,
      why: "House accounts don't have a rep checking prices up front, so you verify them. Julie checks the printed sales order."
    },
    {
      q: "The PO says the customer will arrange and pay for freight with their own carrier. What's the FOB?",
      a: ["Manteno, IL", "Collect / 3rd Party", "FFA"],
      c: 1,
      why: "Collect/3rd Party means the customer arranges and pays. Ship with the carrier they named."
    },
    {
      q: "After Save & New, QuickBooks asks if you want to change the customer's Ship Via permanently. What do you do?",
      a: ["Click Yes, it saves time next order", "Don't change it permanently without permission"],
      c: 1,
      why: "Never change a customer's defaults permanently without permission."
    },
    {
      q: "A dialog says the customer has exceeded their credit limit. What do you write on the paperwork?",
      a: ["C/C", "CIA", "EC", "MINORD"],
      c: 2,
      why: "Write EC at the top of the PO, and on the sales order after printing."
    }
  ];

  var form = document.getElementById("quiz-form");
  var scoreEl = document.getElementById("quiz-score");
  var answered = {};

  function renderQuiz() {
    answered = {};
    form.innerHTML = QUESTIONS.map(function (item, qi) {
      return '<fieldset class="q" id="q' + qi + '"><legend><span>Q' + (qi + 1) + '</span>' + item.q + '</legend><div class="opts">' +
        item.a.map(function (opt, oi) {
          var id = "q" + qi + "o" + oi;
          return '<label class="opt" for="' + id + '"><input type="radio" id="' + id + '" name="q' + qi + '" value="' + oi + '"><span>' + opt + '</span></label>';
        }).join("") +
        '</div><p class="q__fb" hidden></p></fieldset>';
    }).join("");
    updateScore();
  }

  function updateScore() {
    var n = Object.keys(answered).length;
    var right = Object.keys(answered).filter(function (k) { return answered[k]; }).length;
    scoreEl.textContent = n ? right + " / " + QUESTIONS.length + " correct" : "0 / " + QUESTIONS.length + " answered";
  }

  if (form) {
    noSubmit(form);
    form.addEventListener("change", function (e) {
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
})();
