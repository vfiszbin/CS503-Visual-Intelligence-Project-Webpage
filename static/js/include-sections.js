(function () {
  function formatNumber(value, suffix) {
    if (value === null || value === undefined) {
      return "-";
    }
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: 2
    }) + suffix;
  }

  async function includeSections() {
    var targets = Array.from(document.querySelectorAll("[data-include]"));
    await Promise.all(targets.map(async function (target) {
      var source = target.getAttribute("data-include");
      try {
        var response = await fetch(source);
        if (!response.ok) {
          throw new Error(response.status + " " + response.statusText);
        }
        target.innerHTML = await response.text();
      } catch (error) {
        target.innerHTML = '<section class="section"><div class="container is-max-desktop"><p class="has-text-danger">Could not load ' + source + ".</p></div></section>";
        console.error("Failed to include section", source, error);
      }
    }));
  }

  async function renderMetrics() {
    var tableBody = document.getElementById("metrics-table-body");
    var bars = document.getElementById("mode-distance-bars");
    if (!tableBody || !bars) {
      return;
    }

    try {
      var response = await fetch("./static/data/metrics.json");
      var metrics = await response.json();
      var maxDistance = Math.max.apply(null, metrics.map(function (row) {
        return row.modeMedianKm;
      }));

      tableBody.innerHTML = metrics.map(function (row) {
        return "<tr>" +
          "<td>" + row.method + "</td>" +
          "<td>" + formatNumber(row.modeMedianKm, " km") + "</td>" +
          "<td>" + formatNumber(row.cantonAccuracyPct, "%") + "</td>" +
          "<td>" + formatNumber(row.meanEntropy, "") + "</td>" +
          "<td>" + row.note + "</td>" +
        "</tr>";
      }).join("");

      bars.innerHTML = metrics.map(function (row) {
        var width = Math.max(4, row.modeMedianKm / maxDistance * 100);
        return '<div class="metric-bar-row">' +
          '<span class="metric-bar-label">' + row.method + "</span>" +
          '<div class="metric-bar-track"><span style="width: ' + width + '%"></span></div>' +
          '<span class="metric-bar-value">' + formatNumber(row.modeMedianKm, " km") + "</span>" +
        "</div>";
      }).join("");
    } catch (error) {
      tableBody.innerHTML = '<tr><td colspan="5">Could not load metrics.</td></tr>';
      console.error("Failed to load metrics", error);
    }
  }

  document.addEventListener("DOMContentLoaded", async function () {
    await includeSections();
    await renderMetrics();

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }

    if (window.location.hash) {
      var target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView();
      }
    }
  });
})();
