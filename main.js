goog.provide('labs.widget.Map');

// Unfortunately required to make the compiler not warn in closure
// library files
goog.require('goog.debug.ErrorHandler');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');

// Our requirements
goog.require('goog.crypt.hash32');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.net.Jsonp');
goog.require('goog.style');
goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.uri.utils');


/**
 * Overlays recent visitors on top of a map.
 * 
 * Uses these APIs:
 * @see http://chartbeat.pbworks.com/recent
 *
 * @param {string|Element} element Element to render the widget in.
 * @param {string} host Hostname to show data for.
 * @param {string} apiKey API key to use.
 * 
 * @constructor
 */
labs.widget.Map = function(element, host, apiKey) {
  /**
   * @type {Element}
   * @private
   */
  this.element_ = goog.dom.getElement(element);

  /**
   * @type {string}
   * @private
   */
  this.host_ = host;

  /**
   * @type {string}
   * @private
   */
  this.apiKey_ = apiKey;

  /**
   * Update interval for background data (ms)
   * @type {number}
   * @const
   * @private
   */
  this.updateInterval_ = 10000;

  /**
   * Timestamp of the last seen entry in the backend data.
   * @type {number}
   * @private
   */
  this.lastSeen_ = 0;

  /**
   * Number of pages to retrieve from backend API.
   * @type {number}
   * @private
   */
  this.numPages_ = 10;

  this.initMap_();
};


/**
 * Initializes the map display.
 *
 * @private
 */
labs.widget.Map.prototype.initMap_ = function() {
  // Base URL template for loading tiles
  var tileTemplate = 'http://{s}.tiles.mapbox.com/v3/chartbeat.chartbeat/{z}/{x}/{y}.png';

  // Tile information
  var tiles = new L.TileLayer(tileTemplate, {
    'attribution': 'Map data © OpenStreetMap, Imagery © MapBox',
    'minZoom': 2,
    'maxZoom': 8,
    'subdomains': 'abcd',
    // Performance shiz
    'unloadInvisibleTiles': true,
    'reuseTiles': true
  });

  // Create map and set default view
  this.map_ = new L.Map(this.element_);

  // Default view over NYC at a distant zoom. Should be sufficient.
  this.map_.setView(new L.LatLng(40.7141667, -74.0063889), 3);
  this.map_.addLayer(tiles);
};


/**
 * Starts fetching of the backend data, and the main widget
 * functionality.
 */
labs.widget.Map.prototype.start = function() {
  var uri = new goog.Uri('http://api.chartbeat.com/recent/');
  uri.setParameterValue('host', this.host_);
  uri.setParameterValue('apikey', this.apiKey_);
  uri.setParameterValue('limit', this.numPages_);

  /**
   * The server channel used to communicate with the backend server.
   * @type {goog.net.Jsonp}
   * @private
   */
  this.server_ = new goog.net.Jsonp(uri, 'jsonp');

  // Start fetching data
  goog.global.setInterval(goog.bind(this.update_, this), this.updateInterval_);
  this.update_();
};


/**
 * Update the backend data.
 *
 * @param {goog.events.Event=} event
 *
 * @private
 */
labs.widget.Map.prototype.update_ = function(event) {
  this.server_.send({}, goog.bind(this.onData_, this));
};


/**
 * Returns a data uri for a marker.
 *
 * @param {number} size Icon size (px).
 * @param {number} seed Choose color consistently using this "seed".
 * @return {L.Icon}
 *
 * @private
 */
labs.widget.Map.prototype.getIcon_ = function(size, seed) {
  var center = Math.floor(size / 2);
  var radius = center - 1;
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  var context = canvas.getContext('2d');
  context.strokeStyle = 'black';
  context.fillStyle = 'hsl(' + (seed % 360) + ', 78%, 63%)';

  context.beginPath();
  context.arc(center, center, radius, 0, 2 * Math.PI * 2);
  context.closePath();
  context.fill();

  context.beginPath();
  context.arc(center, center, radius, 0, 2 * Math.PI * 2);
  context.closePath();
  context.stroke();

  // TODO: move to separate class
  var icon = new L.Icon(canvas.toDataURL());
  icon.iconSize = new L.Point(size, size);
  icon.shadowSize = icon.iconSize;
  icon.iconAnchor = new L.Point(center, center);
  icon.popupAnchor = new L.Point(0, -center);

  return icon;
};


/**
 * Show a marker and an info window on the map for the given data
 * entry. The marker and window is removed automatically again after a
 * given delay.
 *
 * @param {Object} entry Data object from /recent call.
 * @param {number} delay Delay before showing marker and window (ms).
 * @param {number} infoRemoveDelay Delay before closing window (ms).
 * @param {number} removeDelay Delay before removing marker (ms).
 *
 * @private
 */
labs.widget.Map.prototype.showMarker_ = function(entry, delay, infoRemoveDelay, removeDelay) {
  var map = this.map_;
  var pos = new L.LatLng(entry['lat'], entry['lng']);
  var title = entry['i'];
  var hash = goog.crypt.hash32.encodeString(entry['p']);
  var icon = this.getIcon_(16, hash);
  var marker = new L.Marker(pos,
                            {
                              'icon': icon
                            });
  var content = [];
  content.push('<div><b>' + title + '</b>');
  content.push('<br/>Load time: ' + Math.round(entry['b'] / 1000) + 's');
  content.push(', ' + (entry['n'] == 1 ? 'new' : 'returning'));
  if (entry['r']) {
    var domain = new goog.Uri(entry['r']).getDomain();
    content.push('<br/>From: ' + domain);
  }
  content.push('</div>');
  marker.bindPopup(content.join(''));
  goog.Timer.callOnce(function() {
                        console.log("marker: " + pos);
                        map.addLayer(marker);
                        marker.openPopup();
                      }, delay, this);
  goog.Timer.callOnce(function() {
                        map.removeLayer(marker);
                      }, delay + removeDelay);
};


/**
 * Called when new data is received from the backend.
 *
 * @param {Array.<Object>} data Data received from server
 *
 * @private
 */
labs.widget.Map.prototype.onData_ = function(data) {
  if (!data || !data.length) {
    return;
  }

  var removeDelay = this.updateInterval_ * 3;
  var delta = Math.floor(this.updateInterval_ / this.numPages_);
  var delay = 0;
  for (var i = data.length - 1; i >= 0 ; --i) {
    var entry = data[i];
    if (entry['utc'] <= this.lastSeen_) {
      continue;
    }
    this.showMarker_(entry, delay, delta, removeDelay);
    delay += delta;
  }
  this.lastSeen_ = data[0]['utc'];
};


/**
 * Initializes the widget, and generally kicks off things on the page.
 *
 * @param {string|Element} element Element to render the widget in.
 * @param {string} host Hostname to show data for.
 * @param {string} apiKey API key to use.
 */
function init(element, host, apiKey) {
  var params = goog.global.location && goog.global.location.search;
  if (params) {
    var val = goog.uri.utils.getParamValue(params, 'host');
    if (val) {
      host = val;
    }
    val = goog.uri.utils.getParamValue(params, 'apikey');
    if (val) {
      apiKey = val;
    }
  }

  var widget = new labs.widget.Map(element, host, apiKey);
  widget.start();
}

goog.exportSymbol('init', init);
