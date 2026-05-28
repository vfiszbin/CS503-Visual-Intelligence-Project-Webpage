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

  var METRIC_DASHBOARDS = [
    {
      containerId: 'classifier-conditioning-dashboard',
      title: 'Classifier probability conditioning',
      eyebrow: 'Test split summary',
      description: 'Comparison of image-only, canton-probability-only, and concatenated conditioning variants.',
      metrics: [
        {
          key: 'medianDistance',
          label: 'Median error',
          unit: 'km',
          digits: 1,
          direction: 'lower',
          csv: './static/data/classifier_probability_conditioning/test_mode_median_km.csv',
          wandbMetric: 'test/mode/median_km'
        },
        {
          key: 'regionAccuracy',
          label: 'Canton accuracy',
          unit: '%',
          digits: 1,
          multiplier: 100,
          direction: 'higher',
          csv: './static/data/classifier_probability_conditioning/test_region_accuracy.csv',
          wandbMetric: 'test/mode/admin_accuracy/region'
        },
        {
          key: 'entropy',
          label: 'Entropy',
          unit: '',
          digits: 2,
          direction: 'lower',
          csv: './static/data/classifier_probability_conditioning/test_mean_heatmap_entropy.csv',
          wandbMetric: 'test/uncertainty/mean_heatmap_entropy'
        }
      ],
      runs: [
        {
          key: 'plonk_local_fm_r2_layernorm_cfg0_100epochs_seed42',
          label: 'Image only',
          color: '#60a5fa'
        },
        {
          key: 'plonk_local_fm_r2_layernorm_cfg0_region_probs_only_100epochs_seed42',
          label: 'Canton probs',
          color: '#34d399'
        },
        {
          key: 'plonk_local_fm_r2_layernorm_cfg0_image_region_probs_concat_100epochs_seed42',
          label: 'Image + canton',
          color: '#f59e0b'
        }
      ]
    }
  ];

  var SINGLE_METRIC_DASHBOARDS = [
    {
      containerId: 'caption-conditioning-summary',
      title: 'Caption conditioning',
      eyebrow: 'Test split median localization error',
      description: 'Comparison of image-only inference against free-form and structured textual caption conditioning.',
      csv: './static/data/caption_conditioning/test_mode_median_km.csv',
      metric: 'eval/test/mode_median_km__MIN',
      label: 'Median error',
      unit: 'km',
      digits: 1,
      direction: 'lower',
      baselineRunKey: 'image_only_seed42',
      runs: [
        {
          key: 'image_only_seed42',
          label: 'Image only',
          color: '#60a5fa'
        },
        {
          key: 'image_text_free_seed42',
          label: 'Image + free caption',
          color: '#34d399'
        },
        {
          key: 'image_text_structured_full_seed42',
          label: 'Image + structured caption',
          color: '#f59e0b'
        }
      ]
    }
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

  function formatDashboardValue(value, metric) {
    if (value === null || value === undefined) {
      return 'n/a';
    }

    var scaledValue = value * (metric.multiplier || 1);
    var formatted = scaledValue.toFixed(metric.digits);

    return metric.unit ? formatted + metric.unit : formatted;
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

  function metricValueForRun(rows, runKey, wandbMetric) {
    var columnName = metricColumn(runKey, wandbMetric);

    assertColumn(rows, columnName, wandbMetric);
    return getLastMetricValue(rows, columnName);
  }

  function getMetricExtent(runs, metric) {
    var values = runs.map(function(run) {
      return run.metrics[metric.key];
    }).filter(function(value) {
      return value !== null && value !== undefined;
    });

    if (!values.length) {
      return {
        min: 0,
        max: 1
      };
    }

    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);

    if (min === max) {
      return {
        min: min - 0.5,
        max: max + 0.5
      };
    }

    return {
      min: min,
      max: max
    };
  }

  function metricPosition(value, extent) {
    if (value === null || value === undefined) {
      return 50;
    }

    var span = extent.max - extent.min;
    var normalized = span === 0 ? 0.5 : (value - extent.min) / span;

    return Math.max(0, Math.min(100, normalized * 100));
  }

  function isBestMetricValue(value, runs, metric) {
    if (value === null || value === undefined) {
      return false;
    }

    var values = runs.map(function(run) {
      return run.metrics[metric.key];
    }).filter(function(candidate) {
      return candidate !== null && candidate !== undefined;
    });
    var bestValue = metric.direction === 'lower'
      ? Math.min.apply(Math, values)
      : Math.max.apply(Math, values);

    return Math.abs(value - bestValue) < 1e-10;
  }

  function createMetricHeader(metric) {
    var header = document.createElement('div');
    var label = document.createElement('div');
    var hint = document.createElement('div');

    header.className = 'metric-dashboard-header-cell';
    label.className = 'metric-dashboard-metric-label';
    hint.className = 'metric-dashboard-metric-hint';
    label.textContent = metric.label;
    hint.textContent = metric.direction === 'lower' ? 'lower is better' : 'higher is better';

    header.appendChild(label);
    header.appendChild(hint);

    return header;
  }

  function createRunLabel(run) {
    var label = document.createElement('div');
    var marker = document.createElement('span');
    var text = document.createElement('div');
    var name = document.createElement('div');

    label.className = 'metric-dashboard-run';
    marker.className = 'metric-dashboard-run-marker';
    marker.style.backgroundColor = run.color;
    text.className = 'metric-dashboard-run-text';
    name.className = 'metric-dashboard-run-name';
    name.textContent = run.label;

    text.appendChild(name);
    label.appendChild(marker);
    label.appendChild(text);

    return label;
  }

  function createMetricCell(run, metric, extent, runs) {
    var value = run.metrics[metric.key];
    var cell = document.createElement('div');
    var track = document.createElement('div');
    var axis = document.createElement('div');
    var dot = document.createElement('span');
    var valueLabel = document.createElement('span');
    var position = metricPosition(value, extent);
    var isBest = isBestMetricValue(value, runs, metric);

    cell.className = 'metric-dashboard-cell';
    track.className = 'metric-dashboard-track';
    axis.className = 'metric-dashboard-axis';
    dot.className = 'metric-dashboard-dot' + (isBest ? ' is-best' : '');
    valueLabel.className = 'metric-dashboard-value';
    if (position < 8) {
      valueLabel.className += ' is-left-edge';
    } else if (position > 92) {
      valueLabel.className += ' is-right-edge';
    }

    dot.style.left = position + '%';
    dot.style.backgroundColor = run.color;
    valueLabel.style.left = position + '%';
    valueLabel.textContent = formatDashboardValue(value, metric);
    dot.title = run.label + ': ' + metric.label + ' ' + formatDashboardValue(value, metric);

    track.appendChild(axis);
    track.appendChild(dot);
    track.appendChild(valueLabel);
    cell.appendChild(track);

    return cell;
  }

  function buildDashboardRuns(config, metricRowsByKey) {
    return config.runs.map(function(run) {
      var metrics = {};

      config.metrics.forEach(function(metric) {
        metrics[metric.key] = metricValueForRun(metricRowsByKey[metric.key], run.key, metric.wandbMetric);
      });

      return {
        key: run.key,
        label: run.label,
        color: run.color,
        metrics: metrics
      };
    });
  }

  function renderMetricDashboard(container, config, runs) {
    var card = document.createElement('article');
    var header = document.createElement('div');
    var eyebrow = document.createElement('div');
    var title = document.createElement('h4');
    var description = document.createElement('p');
    var grid = document.createElement('div');
    var runHeader = document.createElement('div');
    var extents = {};

    config.metrics.forEach(function(metric) {
      extents[metric.key] = getMetricExtent(runs, metric);
    });

    card.className = 'metric-dashboard-card';
    header.className = 'metric-dashboard-card-header';
    eyebrow.className = 'metric-dashboard-eyebrow';
    title.className = 'title is-5';
    description.className = 'metric-dashboard-description';
    grid.className = 'metric-dashboard-grid';
    grid.style.setProperty('--metric-count', config.metrics.length);
    runHeader.className = 'metric-dashboard-run-header';

    eyebrow.textContent = config.eyebrow;
    title.textContent = config.title;
    description.textContent = config.description;
    runHeader.textContent = 'Variant';

    header.appendChild(eyebrow);
    header.appendChild(title);
    header.appendChild(description);

    grid.appendChild(runHeader);
    config.metrics.forEach(function(metric) {
      grid.appendChild(createMetricHeader(metric));
    });

    runs.forEach(function(run) {
      grid.appendChild(createRunLabel(run));
      config.metrics.forEach(function(metric) {
        grid.appendChild(createMetricCell(run, metric, extents[metric.key], runs));
      });
    });

    card.appendChild(header);
    card.appendChild(grid);

    container.innerHTML = '';
    container.appendChild(card);
  }

  function renderMetricDashboardConfig(config) {
    var container = document.getElementById(config.containerId);

    if (!container) {
      return Promise.resolve();
    }

    var fetches = config.metrics.map(function(metric) {
      return fetchCsv(metric.csv).then(function(rows) {
        return {
          key: metric.key,
          rows: rows
        };
      });
    });

    return Promise.all(fetches).then(function(results) {
      var metricRowsByKey = {};
      var runs;

      results.forEach(function(result) {
        metricRowsByKey[result.key] = result.rows;
      });

      runs = buildDashboardRuns(config, metricRowsByKey);
      renderMetricDashboard(container, config, runs);
    }).catch(function(error) {
      console.error(error);
      container.innerHTML = '';
      var errorMessage = document.createElement('div');
      errorMessage.className = 'experiment-status experiment-error';
      errorMessage.textContent = error.message;
      container.appendChild(errorMessage);
    });
  }

  function initializeMetricDashboards() {
    return Promise.all(METRIC_DASHBOARDS.map(renderMetricDashboardConfig));
  }

  function buildSingleMetricRows(config, rows) {
    var metric = {
      key: 'value',
      direction: config.direction
    };
    var baselineValue = null;
    var rankedRows = config.runs.map(function(run) {
      var value = metricValueForRun(rows, run.key, config.metric);

      if (run.key === config.baselineRunKey) {
        baselineValue = value;
      }

      return {
        key: run.key,
        label: run.label,
        color: run.color,
        value: value,
        metrics: {
          value: value
        }
      };
    });

    rankedRows.sort(function(a, b) {
      if (a.value === null || a.value === undefined) {
        return 1;
      }

      if (b.value === null || b.value === undefined) {
        return -1;
      }

      return config.direction === 'lower' ? a.value - b.value : b.value - a.value;
    });

    return rankedRows.map(function(row) {
      row.deltaFromBaseline = baselineValue === null || baselineValue === undefined || row.value === null || row.value === undefined
        ? null
        : row.value - baselineValue;
      row.isBest = isBestMetricValue(row.value, rankedRows, metric);
      return row;
    });
  }

  function formatDelta(value, config) {
    if (value === null || value === undefined || Math.abs(value) < 1e-10) {
      return 'baseline';
    }

    var sign = value > 0 ? '+' : '-';
    return sign + Math.abs(value).toFixed(config.digits) + ' ' + config.unit + ' vs baseline';
  }

  function createSingleMetricRow(row, extent, config) {
    var item = document.createElement('div');
    var label = document.createElement('div');
    var marker = document.createElement('span');
    var name = document.createElement('span');
    var plot = document.createElement('div');
    var axis = document.createElement('div');
    var stem = document.createElement('span');
    var dot = document.createElement('span');
    var value = document.createElement('span');
    var delta = document.createElement('span');
    var position = metricPosition(row.value, extent);
    var formattedValue = formatDashboardValue(row.value, config);

    item.className = 'single-metric-row';
    label.className = 'single-metric-label';
    marker.className = 'metric-dashboard-run-marker';
    name.className = 'single-metric-name';
    plot.className = 'single-metric-plot';
    axis.className = 'single-metric-axis';
    stem.className = 'single-metric-stem';
    dot.className = 'metric-dashboard-dot' + (row.isBest ? ' is-best' : '');
    value.className = 'single-metric-value';
    delta.className = 'single-metric-delta';

    marker.style.backgroundColor = row.color;
    name.textContent = row.label;
    stem.style.width = position + '%';
    dot.style.left = position + '%';
    dot.style.backgroundColor = row.color;
    value.style.left = position + '%';
    value.textContent = formattedValue;
    delta.textContent = formatDelta(row.deltaFromBaseline, config);
    dot.title = row.label + ': ' + config.label + ' ' + formattedValue;

    if (position < 8) {
      value.className += ' is-left-edge';
    } else if (position > 92) {
      value.className += ' is-right-edge';
    }

    if (row.deltaFromBaseline === null || row.deltaFromBaseline === undefined || Math.abs(row.deltaFromBaseline) < 1e-10) {
      delta.className += ' is-baseline';
    } else if (
      (config.direction === 'lower' && row.deltaFromBaseline < 0) ||
      (config.direction === 'higher' && row.deltaFromBaseline > 0)
    ) {
      delta.className += ' is-better';
    } else {
      delta.className += ' is-worse';
    }

    label.appendChild(marker);
    label.appendChild(name);
    plot.appendChild(axis);
    plot.appendChild(stem);
    plot.appendChild(dot);
    plot.appendChild(value);
    item.appendChild(label);
    item.appendChild(plot);
    item.appendChild(delta);

    return item;
  }

  function renderSingleMetricDashboard(container, config, rows) {
    var card = document.createElement('article');
    var header = document.createElement('div');
    var eyebrow = document.createElement('div');
    var title = document.createElement('h4');
    var description = document.createElement('p');
    var body = document.createElement('div');
    var axisHint = document.createElement('div');
    var metric = {
      key: 'value',
      direction: config.direction
    };
    var extent = getMetricExtent(rows, metric);

    card.className = 'metric-dashboard-card single-metric-card';
    header.className = 'metric-dashboard-card-header';
    eyebrow.className = 'metric-dashboard-eyebrow';
    title.className = 'title is-5';
    description.className = 'metric-dashboard-description';
    body.className = 'single-metric-body';
    axisHint.className = 'single-metric-axis-hint';

    eyebrow.textContent = config.eyebrow;
    title.textContent = config.title;
    description.textContent = config.description;
    axisHint.textContent = config.label + ' (' + config.unit + '), ' +
      (config.direction === 'lower' ? 'lower is better' : 'higher is better');

    header.appendChild(eyebrow);
    header.appendChild(title);
    header.appendChild(description);
    body.appendChild(axisHint);

    rows.forEach(function(row) {
      body.appendChild(createSingleMetricRow(row, extent, config));
    });

    card.appendChild(header);
    card.appendChild(body);

    container.innerHTML = '';
    container.appendChild(card);
  }

  function renderSingleMetricDashboardConfig(config) {
    var container = document.getElementById(config.containerId);

    if (!container) {
      return Promise.resolve();
    }

    return fetchCsv(config.csv).then(function(rows) {
      renderSingleMetricDashboard(container, config, buildSingleMetricRows(config, rows));
    }).catch(function(error) {
      console.error(error);
      container.innerHTML = '';
      var errorMessage = document.createElement('div');
      errorMessage.className = 'experiment-status experiment-error';
      errorMessage.textContent = error.message;
      container.appendChild(errorMessage);
    });
  }

  function initializeSingleMetricDashboards() {
    return Promise.all(SINGLE_METRIC_DASHBOARDS.map(renderSingleMetricDashboardConfig));
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
  sectionsReady.then(function() {
    return Promise.all([
      initializeSingleMetricDashboards(),
      initializeMetricDashboards(),
      initializeExperimentPlots()
    ]);
  }).catch(function(error) {
    console.error('Experiment section failed to initialize.', error);
  });
})();
