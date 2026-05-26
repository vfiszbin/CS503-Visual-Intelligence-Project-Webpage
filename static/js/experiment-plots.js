(function() {
  var EXPERIMENTS = [
    {
      id: 'augmentation-level',
      title: 'Augmentation level',
      description: 'Validation median distance across training epochs for image-only augmentation settings. Lower is better.',
      trainCsv: './data/augmentation-level/train_flow_loss.csv',
      validationCsv: './data/augmentation-level/validate_mode_error_distance.csv',
      testCsv: './data/augmentation-level/test_mode_error_distance.csv',
      trainXColumn: 'training/epoch',
      validationXColumn: 'validation/epoch',
      trainMetric: 'training/flow_loss',
      validationMetric: 'validation/mode_median_distance_km',
      testMetric: 'test/mode/median_km',
      trainYAxisTitle: 'Flow loss',
      validationYAxisTitle: 'Median distance (km)',
      series: [
        {
          key: 'plonk_local_fm_r2_image_only_aug_aggressive_seed42',
          label: 'Aggressive',
          color: '#2563eb'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_moderate_seed42',
          label: 'Moderate',
          color: '#059669'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_views8_seed42',
          label: 'Conservative',
          color: '#d97706'
        }
      ]
    },
    {
      id: 'augmentation-views',
      title: 'Augmentation views for a single image',
      description: 'Validation median distance across training epochs for conservative augmentation view counts. Lower is better.',
      trainCsv: './data/augmentation-views/train_flow_loss.csv',
      validationCsv: './data/augmentation-views/validate_mode_median_distance.csv',
      testCsv: './data/augmentation-views/test_mode_median_distance.csv',
      trainXColumn: 'training/epoch',
      validationXColumn: 'validation/epoch',
      trainMetric: 'training/flow_loss',
      validationMetric: 'validation/mode_median_distance_km',
      testMetric: 'test/mode/median_km',
      trainYAxisTitle: 'Flow loss',
      validationYAxisTitle: 'Median distance (km)',
      series: [
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_views0_seed42',
          label: '0 views',
          color: '#7c3aed'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_views1_seed42',
          label: '1 view',
          color: '#dc2626'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_views2_seed42',
          label: '2 views',
          color: '#d97706'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_views4_seed42',
          label: '4 views',
          color: '#059669'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_views8_seed42',
          label: '8 views',
          color: '#2563eb'
        }
      ]
    },
    {
      id: 'augmentation-fixed-compute',
      title: 'Fixed-compute augmentation views',
      description: 'Validation median distance across training epochs when view-count variants are compared with fixed compute. Lower is better.',
      trainCsv: './data/augmentation-fixed-compute/train_flow_loss.csv',
      validationCsv: './data/augmentation-fixed-compute/validation_mode_median_distance.csv',
      testCsv: './data/augmentation-fixed-compute/test_mode_median_distance.csv',
      trainXColumn: 'training/epoch',
      validationXColumn: 'validation/epoch',
      trainMetric: 'training/flow_loss',
      validationMetric: 'validation/mode_median_distance_km',
      testMetric: 'test/mode/median_km',
      trainYAxisTitle: 'Flow loss',
      validationYAxisTitle: 'Median distance (km)',
      series: [
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_fixedflops_views0_seed42',
          label: 'unaugmented',
          color: '#7c3aed'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_fixedflops_views1_seed42',
          label: '1 view',
          color: '#dc2626'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_fixedflops_views2_seed42',
          label: '2 views',
          color: '#d97706'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_fixedflops_views4_seed42',
          label: '4 views',
          color: '#059669'
        },
        {
          key: 'plonk_local_fm_r2_image_only_aug_conservative_fixedflops_views8_seed42',
          label: '8 views',
          color: '#2563eb'
        }
      ]
    },
  ];

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var character = text[i];
      var nextCharacter = text[i + 1];

      if (character === '"') {
        if (inQuotes && nextCharacter === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (character === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else if ((character === '\n' || character === '\r') && !inQuotes) {
        if (character === '\r' && nextCharacter === '\n') {
          i += 1;
        }
        row.push(field);
        if (row.some(function(value) { return value !== ''; })) {
          rows.push(row);
        }
        row = [];
        field = '';
      } else {
        field += character;
      }
    }

    if (field !== '' || row.length > 0) {
      row.push(field);
      if (row.some(function(value) { return value !== ''; })) {
        rows.push(row);
      }
    }

    if (!rows.length) {
      return [];
    }

    var headers = rows[0];
    return rows.slice(1).map(function(values) {
      var record = {};
      headers.forEach(function(header, index) {
        record[header] = values[index] || '';
      });
      return record;
    });
  }

  function fetchCsv(path) {
    return fetch(path).then(function(response) {
      if (!response.ok) {
        throw new Error('Could not load ' + path);
      }

      return response.text();
    }).then(parseCsv);
  }

  function toNumber(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function metricColumn(seriesKey, metricName) {
    return seriesKey + ' - ' + metricName;
  }

  function assertColumn(rows, columnName, sourceLabel) {
    if (!rows.length || Object.prototype.hasOwnProperty.call(rows[0], columnName)) {
      return;
    }

    throw new Error('Missing column "' + columnName + '" in ' + sourceLabel + '.');
  }

  function formatMetric(value, digits) {
    if (value === null || value === undefined) {
      return 'n/a';
    }

    return value.toFixed(digits);
  }

  function buildMetricTraces(experiment, rows, options) {
    assertColumn(rows, options.xColumn, options.csv);

    return experiment.series.map(function(series) {
      var columnName = metricColumn(series.key, options.metric);
      assertColumn(rows, columnName, options.csv);

      var xValues = [];
      var yValues = [];

      rows.forEach(function(row) {
        var x = toNumber(row[options.xColumn]);
        var y = toNumber(row[columnName]);

        if (x !== null && y !== null) {
          xValues.push(x);
          yValues.push(y);
        }
      });

      return {
        x: xValues,
        y: yValues,
        name: series.label,
        mode: 'lines+markers',
        type: 'scatter',
        line: {
          color: series.color,
          width: 3
        },
        marker: {
          color: series.color,
          size: 6
        },
        hovertemplate: 'Epoch %{x}<br>' + options.yAxisTitle + ': %{y:.4f}<extra>' + series.label + '</extra>'
      };
    });
  }

  function getLastMetricValue(rows, columnName) {
    for (var i = rows.length - 1; i >= 0; i--) {
      var value = toNumber(rows[i][columnName]);
      if (value !== null) {
        return value;
      }
    }

    return null;
  }

  function getXValues(traces) {
    var values = [];

    traces.forEach(function(trace) {
      trace.x.forEach(function(value) {
        if (values.indexOf(value) === -1) {
          values.push(value);
        }
      });
    });

    return values.sort(function(a, b) { return a - b; });
  }

  function getXTickValues(values) {
    var maxTickCount = window.innerWidth <= 480 ? 8 : 16;
    var step = Math.max(1, Math.ceil(values.length / maxTickCount));
    var ticks = values.filter(function(value, index) {
      return index % step === 0;
    });
    var lastValue = values[values.length - 1];

    if (ticks.indexOf(lastValue) === -1) {
      ticks.push(lastValue);
    }

    return ticks;
  }

  function buildSummaryRows(experiment, trainRows, validationRows, testRows) {
    return experiment.series.map(function(series) {
      var trainColumn = metricColumn(series.key, experiment.trainMetric);
      var validationColumn = metricColumn(series.key, experiment.validationMetric);
      var testColumn = metricColumn(series.key, experiment.testMetric);

      assertColumn(trainRows, trainColumn, experiment.trainCsv);
      assertColumn(validationRows, validationColumn, experiment.validationCsv);
      assertColumn(testRows, testColumn, experiment.testCsv);

      return {
        label: series.label,
        color: series.color,
        train: getLastMetricValue(trainRows, trainColumn),
        validation: getLastMetricValue(validationRows, validationColumn),
        test: getLastMetricValue(testRows, testColumn)
      };
    });
  }

  function createExperimentShell(experiment) {
    var card = document.createElement('article');
    card.className = 'experiment-card';

    var header = document.createElement('div');
    header.className = 'experiment-card-header';

    var title = document.createElement('h4');
    title.className = 'title is-5';
    title.textContent = experiment.title;

    var description = document.createElement('p');
    description.className = 'experiment-description';
    description.textContent = experiment.description;

    header.appendChild(title);
    header.appendChild(description);

    var plotGrid = document.createElement('div');
    var trainPanel = createPlotPanel('Training loss', 'experiment-train-plot-' + experiment.id);
    var validationPanel = createPlotPanel('Evaluation metric', 'experiment-validation-plot-' + experiment.id);

    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-container experiment-summary';

    plotGrid.className = 'experiment-plot-grid';
    plotGrid.appendChild(trainPanel.panel);
    plotGrid.appendChild(validationPanel.panel);

    card.appendChild(header);
    card.appendChild(plotGrid);
    card.appendChild(tableWrap);

    return {
      card: card,
      plotGrid: plotGrid,
      trainChart: trainPanel.chart,
      validationChart: validationPanel.chart,
      tableWrap: tableWrap
    };
  }

  function createPlotPanel(titleText, chartId) {
    var panel = document.createElement('div');
    var title = document.createElement('h5');
    var chart = document.createElement('div');

    panel.className = 'experiment-plot-panel';
    title.className = 'experiment-plot-title';
    title.textContent = titleText;
    chart.className = 'experiment-plot';
    chart.id = chartId;

    panel.appendChild(title);
    panel.appendChild(chart);

    return {
      panel: panel,
      chart: chart
    };
  }

  function renderSummaryTable(container, rows, experiment) {
    var table = document.createElement('table');
    table.className = 'table is-bordered is-striped is-narrow is-hoverable is-fullwidth';

    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    ['Run', 'Last train loss', 'Final validation', 'Test'].forEach(function(label) {
      var th = document.createElement('th');
      th.textContent = label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    var tbody = document.createElement('tbody');
    rows.forEach(function(row) {
      var tr = document.createElement('tr');
      var runCell = document.createElement('td');
      var swatch = document.createElement('span');
      var trainCell = document.createElement('td');
      var validationCell = document.createElement('td');
      var testCell = document.createElement('td');

      swatch.className = 'experiment-swatch';
      swatch.style.backgroundColor = row.color;

      runCell.appendChild(swatch);
      runCell.appendChild(document.createTextNode(row.label));
      trainCell.textContent = formatMetric(row.train, 4);
      validationCell.textContent = formatMetric(row.validation, 2);
      testCell.textContent = formatMetric(row.test, 2);

      tr.appendChild(runCell);
      tr.appendChild(trainCell);
      tr.appendChild(validationCell);
      tr.appendChild(testCell);
      tbody.appendChild(tr);
    });

    var caption = document.createElement('caption');
    caption.textContent = 'Last training flow loss plus final validation and test median distance.';

    table.appendChild(caption);
    table.appendChild(thead);
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
  }

  function renderPlot(target, traces, yAxisTitle) {
    if (!window.Plotly) {
      throw new Error('Plotly is not available. Check the Plotly CDN script in index.html.');
    }

    var xValues = getXValues(traces);
    var layout = {
      autosize: true,
      margin: {
        t: 18,
        r: 18,
        b: 58,
        l: 68
      },
      xaxis: {
        automargin: true,
        range: xValues.length ? [xValues[0], xValues[xValues.length - 1]] : undefined,
        title: 'Epoch',
        tickmode: xValues.length ? 'array' : 'auto',
        tickvals: xValues.length ? getXTickValues(xValues) : undefined,
        gridcolor: '#e5e7eb',
        zeroline: false
      },
      yaxis: {
        automargin: true,
        title: yAxisTitle,
        gridcolor: '#e5e7eb',
        zeroline: false
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.14
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: '#ffffff',
      hovermode: 'x unified',
      font: {
        family: 'Noto Sans, sans-serif',
        size: 13,
        color: '#374151'
      }
    };

    var config = {
      displayModeBar: false,
      responsive: true
    };

    return window.Plotly.newPlot(target, traces, layout, config);
  }

  function renderExperiment(dashboard, experiment) {
    var shell = createExperimentShell(experiment);
    dashboard.appendChild(shell.card);

    return Promise.all([
      fetchCsv(experiment.trainCsv),
      fetchCsv(experiment.validationCsv),
      fetchCsv(experiment.testCsv)
    ]).then(function(results) {
      var trainRows = results[0];
      var validationRows = results[1];
      var testRows = results[2];
      var trainTraces = buildMetricTraces(experiment, trainRows, {
        csv: experiment.trainCsv,
        xColumn: experiment.trainXColumn,
        metric: experiment.trainMetric,
        yAxisTitle: experiment.trainYAxisTitle
      });
      var validationTraces = buildMetricTraces(experiment, validationRows, {
        csv: experiment.validationCsv,
        xColumn: experiment.validationXColumn,
        metric: experiment.validationMetric,
        yAxisTitle: experiment.validationYAxisTitle
      });
      var summaryRows = buildSummaryRows(experiment, trainRows, validationRows, testRows);

      renderSummaryTable(shell.tableWrap, summaryRows, experiment);
      return Promise.all([
        renderPlot(shell.trainChart, trainTraces, experiment.trainYAxisTitle),
        renderPlot(shell.validationChart, validationTraces, experiment.validationYAxisTitle)
      ]);
    }).catch(function(error) {
      var errorMessage = document.createElement('div');

      console.error(error);
      shell.card.classList.add('has-error');
      errorMessage.className = 'experiment-status experiment-error';
      errorMessage.textContent = error.message;
      shell.plotGrid.innerHTML = '';
      shell.plotGrid.appendChild(errorMessage);
      shell.tableWrap.innerHTML = '';
    });
  }

  function initializeExperimentPlots() {
    var dashboard = document.getElementById('experiment-dashboard');

    if (!dashboard) {
      return;
    }

    dashboard.innerHTML = '';
    Promise.all(EXPERIMENTS.map(function(experiment) {
      return renderExperiment(dashboard, experiment);
    })).catch(function(error) {
      console.error('Experiment plots failed to render.', error);
    });
  }

  var sectionsReady = window.sectionsReady || Promise.resolve();
  sectionsReady.then(initializeExperimentPlots).catch(function(error) {
    console.error('Experiment section failed to initialize.', error);
  });
})();
