(function() {
  var DATA_PATH = './static/data/canton-predictions.json';
  var GEOJSON_PATH = './static/data/swiss-cantons.geojson';
  var SWISS_LON_RANGE = [5.3, 11.2];
  var SWISS_LAT_RANGE = [45.4, 48.4];
  var CANTON_NUMBER_TO_ID = {
    '1': 'ZH',
    '2': 'BE',
    '3': 'LU',
    '4': 'UR',
    '5': 'SZ',
    '6': 'OW',
    '7': 'NW',
    '8': 'GL',
    '9': 'ZG',
    '10': 'FR',
    '11': 'SO',
    '12': 'BS',
    '13': 'BL',
    '14': 'SH',
    '15': 'AR',
    '16': 'AI',
    '17': 'SG',
    '18': 'GR',
    '19': 'AG',
    '20': 'TG',
    '21': 'TI',
    '22': 'VD',
    '23': 'VS',
    '24': 'NE',
    '25': 'GE',
    '26': 'JU'
  };

  function fetchJson(path) {
    return fetch(path).then(function(response) {
      if (!response.ok) {
        throw new Error('Could not load ' + path);
      }
      return response.json();
    });
  }

  function normalizeLabel(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function formatNumber(value, digits, fallback) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return fallback || 'n/a';
    }
    return Number(value).toFixed(digits);
  }

  function formatPercent(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return 'n/a';
    }
    return Math.round(Number(value) * 100) + '%';
  }

  function getRegionById(data) {
    var lookup = {};
    data.regions.forEach(function(region) {
      lookup[region.id] = region;
    });
    return lookup;
  }

  function getAliasLookup(data) {
    var lookup = {};
    data.regions.forEach(function(region) {
      var aliases = [region.id, region.name]
        .concat(region.aliases || [])
        .concat(region.boundary_aliases || []);
      aliases.forEach(function(alias) {
        lookup[normalizeLabel(alias)] = region.id;
      });
    });
    return lookup;
  }

  function featureCandidateValues(feature) {
    var properties = feature.properties || {};
    return [
      properties.canton_id,
      properties.id,
      properties.ID,
      properties.NAME,
      properties.name,
      properties.NAME_DE,
      properties.NAME_FR,
      properties.NAME_IT,
      properties.KANTONSFLA,
      properties.KANTONSNAME,
      properties.KUERZEL,
      properties.ABBREV,
      properties.abbrev,
      properties.KANTONSNUM
    ];
  }

  function prepareGeoJson(geojson, data) {
    var regionById = getRegionById(data);
    var aliasLookup = getAliasLookup(data);
    var cloned = JSON.parse(JSON.stringify(geojson));

    cloned.features = cloned.features.filter(function(feature) {
      var properties = feature.properties || {};
      var id = null;
      var candidates = featureCandidateValues(feature);

      for (var i = 0; i < candidates.length; i++) {
        var candidate = candidates[i];
        if (candidate === null || candidate === undefined || candidate === '') {
          continue;
        }
        var text = String(candidate);
        if (regionById[text]) {
          id = text;
          break;
        }
        if (CANTON_NUMBER_TO_ID[text]) {
          id = CANTON_NUMBER_TO_ID[text];
          break;
        }
        var normalized = normalizeLabel(text);
        if (aliasLookup[normalized]) {
          id = aliasLookup[normalized];
          break;
        }
      }

      if (!id || !regionById[id]) {
        return false;
      }

      properties.canton_id = id;
      properties.display_name = regionById[id].name;
      feature.properties = properties;
      return true;
    });

    return cloned;
  }

  function getRegion(data, id) {
    if (!id) {
      return null;
    }
    for (var i = 0; i < data.regions.length; i++) {
      if (data.regions[i].id === id) {
        return data.regions[i];
      }
    }
    return null;
  }

  function getSelectedRegions(data, cantonId) {
    if (!cantonId) {
      return data.regions;
    }
    var region = getRegion(data, cantonId);
    return region ? [region] : data.regions;
  }

  function flattenPoints(regions) {
    var points = [];
    regions.forEach(function(region) {
      (region.points || []).forEach(function(point) {
        points.push({
          region: region,
          point: point
        });
      });
    });
    return points;
  }

  function selectionSummary(data, cantonId) {
    var region = getRegion(data, cantonId);
    if (region) {
      return {
        label: region.name,
        count: region.count,
        median: region.median_mode_distance_km,
        mean: region.mean_mode_distance_km,
        acc25: region.accuracy_at_25km,
        acc100: region.accuracy_at_100km
      };
    }
    return {
      label: 'All cantons',
      count: data.meta.total_count,
      median: data.meta.median_mode_distance_km,
      mean: data.meta.mean_mode_distance_km,
      acc25: data.meta.accuracy_at_25km,
      acc100: data.meta.accuracy_at_100km
    };
  }

  function createShell(container) {
    var card = document.createElement('article');
    var header = document.createElement('div');
    var title = document.createElement('h4');
    var description = document.createElement('p');
    var metricGrid = document.createElement('div');
    var plotGrid = document.createElement('div');
    var mapPanel = document.createElement('div');
    var detailPanel = document.createElement('div');
    var mapTitle = document.createElement('h5');
    var detailTitle = document.createElement('h5');
    var mapChart = document.createElement('div');
    var detailChart = document.createElement('div');
    var attribution = document.createElement('p');

    card.className = 'canton-map-card';
    header.className = 'canton-map-header';
    title.className = 'title is-5';
    description.className = 'canton-map-description';
    metricGrid.className = 'canton-map-metrics';
    plotGrid.className = 'canton-map-grid';
    mapPanel.className = 'canton-map-panel';
    detailPanel.className = 'canton-map-panel';
    mapTitle.className = 'canton-map-panel-title';
    detailTitle.className = 'canton-map-panel-title';
    mapChart.className = 'canton-map-chart canton-map-chart-main';
    detailChart.className = 'canton-map-chart canton-map-chart-detail';
    attribution.className = 'canton-map-attribution';

    title.textContent = 'Canton Prediction Map';
    description.textContent = 'FM checkpoint ground-truth and mode prediction distribution by Swiss canton.';
    mapTitle.textContent = 'Median mode distance by canton';
    detailTitle.textContent = 'Ground truth vs mode prediction';
    attribution.innerHTML = 'Boundaries: <a href="https://opendata.swiss/en/dataset/swissboundaries3d-kantonsgrenzen">swisstopo swissBOUNDARIES3D</a>; GeoJSON conversion: <a href="https://labs.karavia.ch/swiss-boundaries-geojson/">swiss-boundaries-geojson</a>.';

    header.appendChild(title);
    header.appendChild(description);
    mapPanel.appendChild(mapTitle);
    mapPanel.appendChild(mapChart);
    detailPanel.appendChild(detailTitle);
    detailPanel.appendChild(detailChart);
    plotGrid.appendChild(mapPanel);
    plotGrid.appendChild(detailPanel);
    card.appendChild(header);
    card.appendChild(metricGrid);
    card.appendChild(plotGrid);
    card.appendChild(attribution);

    container.innerHTML = '';
    container.appendChild(card);

    return {
      metricGrid: metricGrid,
      mapChart: mapChart,
      detailChart: detailChart,
      detailTitle: detailTitle
    };
  }

  function renderMetrics(target, data, cantonId) {
    var summary = selectionSummary(data, cantonId);
    var metrics = [
      ['Selection', summary.label],
      ['Examples', String(summary.count || 0)],
      ['Median error', formatNumber(summary.median, 1) + ' km'],
      ['Mean error', formatNumber(summary.mean, 1) + ' km'],
      ['Within 25 km', formatPercent(summary.acc25)],
      ['Within 100 km', formatPercent(summary.acc100)]
    ];

    target.innerHTML = '';
    metrics.forEach(function(metric) {
      var item = document.createElement('div');
      var label = document.createElement('span');
      var value = document.createElement('strong');
      item.className = 'canton-map-metric';
      label.textContent = metric[0];
      value.textContent = metric[1];
      item.appendChild(label);
      item.appendChild(value);
      target.appendChild(item);
    });
  }

  function baseGeoLayout() {
    return {
      bgcolor: 'rgba(0,0,0,0)',
      projection: {
        type: 'mercator'
      },
      lonaxis: {
        range: SWISS_LON_RANGE,
        showgrid: false
      },
      lataxis: {
        range: SWISS_LAT_RANGE,
        showgrid: false
      },
      showframe: false,
      showcoastlines: false,
      showcountries: false,
      showland: true,
      landcolor: '#f8fafc',
      showlakes: true,
      lakecolor: '#e0f2fe',
      visible: false
    };
  }

  function plotConfig() {
    return {
      displayModeBar: false,
      responsive: true
    };
  }

  function renderCantonMap(target, data, geojson, activeId) {
    var locations = data.regions.map(function(region) { return region.id; });
    var values = data.regions.map(function(region) {
      return region.median_mode_distance_km === null ? 0 : region.median_mode_distance_km;
    });
    var customData = data.regions.map(function(region) {
      return [
        region.name,
        region.count,
        formatNumber(region.median_mode_distance_km, 1),
        formatNumber(region.mean_mode_distance_km, 1),
        formatPercent(region.accuracy_at_25km)
      ];
    });

    var baseTrace = {
      type: 'choropleth',
      geojson: geojson,
      featureidkey: 'properties.canton_id',
      locations: locations,
      z: values,
      customdata: customData,
      colorscale: [
        [0, '#dbeafe'],
        [0.45, '#bbf7d0'],
        [0.75, '#fde68a'],
        [1, '#ef4444']
      ],
      marker: {
        line: {
          color: '#ffffff',
          width: 1.1
        }
      },
      colorbar: {
        title: 'km',
        thickness: 12,
        len: 0.78
      },
      hovertemplate: '<b>%{customdata[0]}</b><br>n=%{customdata[1]}<br>median=%{customdata[2]} km<br>mean=%{customdata[3]} km<br>within 25 km=%{customdata[4]}<extra></extra>'
    };
    var highlightTrace = {
      type: 'choropleth',
      geojson: geojson,
      featureidkey: 'properties.canton_id',
      locations: activeId ? [activeId] : [],
      z: activeId ? [1] : [],
      colorscale: [
        [0, 'rgba(17,24,39,0.18)'],
        [1, 'rgba(17,24,39,0.18)']
      ],
      marker: {
        line: {
          color: '#111827',
          width: 2.4
        }
      },
      showscale: false,
      hoverinfo: 'skip'
    };
    var layout = {
      autosize: true,
      margin: {
        t: 8,
        r: 8,
        b: 8,
        l: 8
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      geo: baseGeoLayout(),
      font: {
        family: 'Noto Sans, sans-serif',
        size: 12,
        color: '#374151'
      }
    };

    return window.Plotly.react(target, [baseTrace, highlightTrace], layout, plotConfig());
  }

  function connectorCoordinates(pointEntries) {
    var lon = [];
    var lat = [];
    pointEntries.forEach(function(entry) {
      lon.push(entry.point.gt_lon, entry.point.mode_lon, null);
      lat.push(entry.point.gt_lat, entry.point.mode_lat, null);
    });
    return {
      lon: lon,
      lat: lat
    };
  }

  function renderDetailPlot(target, titleTarget, data, geojson, cantonId) {
    var selectedRegions = getSelectedRegions(data, cantonId);
    var pointEntries = flattenPoints(selectedRegions);
    var showPredictions = Boolean(cantonId);
    var connectors = showPredictions ? connectorCoordinates(pointEntries) : { lon: [], lat: [] };
    var selectedIds = {};
    if (showPredictions) {
      selectedRegions.forEach(function(region) {
        selectedIds[region.id] = true;
      });
    }

    var backgroundTrace = {
      type: 'choropleth',
      geojson: geojson,
      featureidkey: 'properties.canton_id',
      locations: data.regions.map(function(region) { return region.id; }),
      z: data.regions.map(function(region) { return selectedIds[region.id] ? 1 : 0; }),
      zmin: 0,
      zmax: 1,
      colorscale: [
        [0, '#eef2f7'],
        [0.98, '#eef2f7'],
        [1, '#fef3c7']
      ],
      marker: {
        line: {
          color: '#cbd5e1',
          width: 0.8
        }
      },
      showscale: false,
      hoverinfo: 'skip'
    };
    var connectorTrace = {
      type: 'scattergeo',
      mode: 'lines',
      lon: connectors.lon,
      lat: connectors.lat,
      line: {
        color: 'rgba(107, 114, 128, 0.25)',
        width: 0.8
      },
      hoverinfo: 'skip',
      showlegend: false
    };
    var gtTrace = {
      type: 'scattergeo',
      mode: 'markers',
      name: 'Ground truth',
      lon: pointEntries.map(function(entry) { return entry.point.gt_lon; }),
      lat: pointEntries.map(function(entry) { return entry.point.gt_lat; }),
      customdata: pointEntries.map(function(entry) {
        return [entry.region.name, entry.point.city || entry.point.sub_region || '', formatNumber(entry.point.distance_km, 1)];
      }),
      marker: {
        color: '#dc2626',
        size: 7,
        opacity: 0.82,
        line: {
          color: '#ffffff',
          width: 0.45
        }
      },
      hovertemplate: '<b>Ground truth</b><br>%{customdata[0]}<br>%{customdata[1]}<br>mode error=%{customdata[2]} km<extra></extra>'
    };
    var predictionTrace = {
      type: 'scattergeo',
      mode: 'markers',
      name: 'Mode prediction',
      lon: pointEntries.map(function(entry) { return entry.point.mode_lon; }),
      lat: pointEntries.map(function(entry) { return entry.point.mode_lat; }),
      customdata: pointEntries.map(function(entry) {
        return [entry.region.name, entry.point.city || entry.point.sub_region || '', formatNumber(entry.point.distance_km, 1)];
      }),
      marker: {
        color: '#2563eb',
        size: 8,
        symbol: 'x',
        opacity: 0.9,
        line: {
          color: '#2563eb',
          width: 1.2
        }
      },
      hovertemplate: '<b>Mode prediction</b><br>%{customdata[0]}<br>%{customdata[1]}<br>mode error=%{customdata[2]} km<extra></extra>'
    };
    var summary = selectionSummary(data, cantonId);
    var traces = showPredictions
      ? [backgroundTrace, connectorTrace, gtTrace, predictionTrace]
      : [backgroundTrace, gtTrace];
    var layout = {
      autosize: true,
      margin: {
        t: 8,
        r: 8,
        b: 8,
        l: 8
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      geo: baseGeoLayout(),
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.02
      },
      font: {
        family: 'Noto Sans, sans-serif',
        size: 12,
        color: '#374151'
      }
    };

    titleTarget.textContent = showPredictions
      ? summary.label + ' ground truth vs mode prediction'
      : 'All cantons ground truth positions';
    return window.Plotly.react(target, traces, layout, plotConfig());
  }

  function renderError(container, message) {
    var errorMessage = document.createElement('div');
    errorMessage.className = 'experiment-status experiment-error';
    errorMessage.textContent = message;
    container.innerHTML = '';
    container.appendChild(errorMessage);
  }

  function renderDashboard(container, data, rawGeoJson) {
    if (!window.Plotly) {
      throw new Error('Plotly is not available. Check the Plotly CDN script in index.html.');
    }

    var geojson = prepareGeoJson(rawGeoJson, data);
    var shell = createShell(container);
    var state = {
      hoverId: null,
      pinnedId: null
    };

    function activeId() {
      return state.pinnedId || state.hoverId || null;
    }

    function renderActive() {
      var id = activeId();
      renderMetrics(shell.metricGrid, data, id);
      return Promise.all([
        renderCantonMap(shell.mapChart, data, geojson, id),
        renderDetailPlot(shell.detailChart, shell.detailTitle, data, geojson, id)
      ]);
    }

    renderActive().then(function() {
      shell.mapChart.on('plotly_hover', function(event) {
        var point = event.points && event.points[0];
        if (!point || state.pinnedId) {
          return;
        }
        state.hoverId = point.location;
        renderActive();
      });

      shell.mapChart.on('plotly_unhover', function() {
        if (state.pinnedId) {
          return;
        }
        state.hoverId = null;
        renderActive();
      });

      shell.mapChart.on('plotly_click', function(event) {
        var point = event.points && event.points[0];
        if (!point) {
          return;
        }
        state.pinnedId = state.pinnedId === point.location ? null : point.location;
        state.hoverId = null;
        renderActive();
      });
    });
  }

  function initializeCantonPredictionMap() {
    var container = document.getElementById('canton-prediction-dashboard');

    if (!container) {
      return;
    }

    container.innerHTML = '<div class="experiment-status">Loading canton prediction map...</div>';
    Promise.all([fetchJson(DATA_PATH), fetchJson(GEOJSON_PATH)])
      .then(function(results) {
        renderDashboard(container, results[0], results[1]);
      })
      .catch(function(error) {
        console.error(error);
        renderError(container, error.message);
      });
  }

  var sectionsReady = window.sectionsReady || Promise.resolve();
  sectionsReady.then(initializeCantonPredictionMap).catch(function(error) {
    console.error('Canton prediction map failed to initialize.', error);
  });
})();
