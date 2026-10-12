/* Order Entry page: unit converter and add-on helper. */
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

})();
