goog.provide('labs.widget.Map');

// Unfortunately required to make the compiler not warn in closure
// library files
goog.require('goog.debug.ErrorHandler');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');

// Our requirements
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.net.Jsonp');
goog.require('goog.style');
goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.uri.utils');

/**
 * Mapping from country code to country.
 * @const
 */
var COUNTRIES = {
'AF': 'Afghanistan',
'AX': 'Aland Islands',
'AL': 'Albania',
'DZ': 'Algeria',
'AD': 'Andorra',
'AO': 'Angola',
'AI': 'Anguilla',
'AG': 'Antigua And Barbuda',
'AR': 'Argentina',
'AM': 'Armenia',
'AW': 'Aruba',
'AU': 'Australia',
'AT': 'Austria',
'AZ': 'Azerbaijan',
'BS': 'Bahamas',
'BH': 'Bahrain',
'BD': 'Bangladesh',
'BB': 'Barbados',
'BY': 'Belarus',
'BE': 'Belgium',
'BZ': 'Belize',
'BJ': 'Benin',
'BM': 'Bermuda',
'BT': 'Bhutan',
'BO': 'Bolivia',
'BA': 'Bosnia And Herzegovina',
'BW': 'Botswana',
'BR': 'Brazil',
'BN': 'Brunei Darussalam',
'BG': 'Bulgaria',
'BF': 'Burkina Faso',
'BI': 'Burundi',
'KH': 'Cambodia',
'CM': 'Cameroon',
'CA': 'Canada',
'CV': 'Cape Verde',
'CF': 'Central African Republic',
'TD': 'Chad',
'CL': 'Chile',
'CN': 'China',
'CO': 'Colombia',
'KM': 'Comoros',
'CG': 'Republic Of Congo',
'CD': 'The Democratic Republic Of The Congo',
'CR': 'Costa Rica',
'HR': 'Croatia',
'CU': 'Cuba',
'CY': 'Cyprus',
'CZ': 'Czech Republic',
'DK': 'Denmark',
'DJ': 'Djibouti',
'DM': 'Dominica',
'DO': 'Dominican Republic',
'EC': 'Ecuador',
'EG': 'Egypt',
'SV': 'El Salvador',
'GQ': 'Equatorial Guinea',
'ER': 'Eritrea',
'EE': 'Estonia',
'ET': 'Ethiopia',
'FO': 'Faeroe Islands',
'FK': 'Falkland Islands',
'FJ': 'Fiji',
'FI': 'Finland',
'FR': 'France',
'GF': 'French Guiana',
'GA': 'Gabon',
'GE': 'Georgia',
'DE': 'Germany',
'GH': 'Ghana',
'GR': 'Greece',
'GL': 'Greenland',
'GD': 'Grenada',
'GP': 'Guadeloupe',
'GT': 'Guatemala',
'GN': 'Guinea',
'GY': 'Guyana',
'HT': 'Haiti',
'HN': 'Honduras',
'HK': 'Hong Kong',
'HU': 'Hungary',
'IS': 'Iceland',
'IN': 'India',
'ID': 'Indonesia',
'IR': 'Iran',
'IQ': 'Iraq',
'IE': 'Ireland',
'IL': 'Israel',
'IT': 'Italy',
'JM': 'Jamaica',
'JP': 'Japan',
'JO': 'Jordan',
'KZ': 'Kazakhstan',
'KE': 'Kenya',
'KP': 'North Korea',
'KR': 'South Korea',
'KV': 'Kosovo',
'KW': 'Kuwait',
'KG': 'Kyrgyzstan',
'LV': 'Latvia',
'LB': 'Lebanon',
'LS': 'Lesotho',
'LR': 'Liberia',
'LY': 'Libya',
'LI': 'Liechtenstein',
'LT': 'Lithuania',
'LU': 'Luxembourg',
'MK': 'Macedonia',
'MG': 'Madagascar',
'MW': 'Malawi',
'MY': 'Malaysia',
'ML': 'Mali',
'MT': 'Malta',
'MQ': 'Martinique',
'MR': 'Mauritania',
'MU': 'Mauritius',
'MX': 'Mexico',
'MD': 'Moldova',
'MN': 'Mongolia',
'ME': 'Montenegro',
'MS': 'Montserrat',
'MA': 'Morocco',
'MZ': 'Mozambique',
'MM': 'Myanmar',
'NA': 'Namibia',
'NP': 'Nepal',
'NL': 'Netherlands',
'NC': 'New Caledonia',
'NZ': 'New Zealand',
'NI': 'Nicaragua',
'NE': 'Niger',
'NG': 'Nigeria',
'NO': 'Norway',
'OM': 'Oman',
'PK': 'Pakistan',
'PW': 'Palau',
'PS': 'Palestinian Territories',
'PA': 'Panama',
'PG': 'Papua New Guinea',
'PY': 'Paraguay',
'PE': 'Peru',
'PH': 'Philippines',
'PL': 'Poland',
'PT': 'Portugal',
'PR': 'Puerto Rico',
'QA': 'Qatar',
'RE': 'Reunion',
'RO': 'Romania',
'RU': 'Russian Federation',
'RW': 'Rwanda',
'KN': 'Saint Kitts And Nevis',
'LC': 'Saint Lucia',
'WS': 'Samoa',
'ST': 'Sao Tome And Principe',
'SA': 'Saudi Arabia',
'SN': 'Senegal',
'RS': 'Serbia',
'SL': 'Sierra Leone',
'SG': 'Singapore',
'SK': 'Slovakia',
'SI': 'Slovenia',
'SB': 'Solomon Islands',
'SO': 'Somalia',
'ZA': 'South Africa',
'GS': 'South Georgia And The South Sandwich Islands',
'ES': 'Spain',
'LK': 'Sri Lanka',
'SD': 'Sudan',
'SR': 'Suriname',
'SJ': 'Svalbard And Jan Mayen',
'SZ': 'Swaziland',
'SE': 'Sweden',
'CH': 'Switzerland',
'SY': 'Syrian Arab Republic',
'TW': 'Taiwan',
'TJ': 'Tajikistan',
'TZ': 'Tanzania',
'TH': 'Thailand',
'TG': 'Togo',
'TO': 'Tonga',
'TT': 'Trinidad And Tobago',
'TN': 'Tunisia',
'TR': 'Turkey',
'TM': 'Turkmenistan',
'TC': 'Turks And Caicos Islands',
'UG': 'Uganda',
'UA': 'Ukraine',
'AE': 'United Arab Emirates',
'GB': 'United Kingdom',
'US': 'United States',
'UY': 'Uruguay',
'UZ': 'Uzbekistan',
'VU': 'Vanuatu',
'VE': 'Venezuela',
'VN': 'Viet Nam',
'EH': 'Western Sahara',
'YE': 'Yemen',
'ZM': 'Zambia',
'ZW': 'Zimbabwe'
};

/**
 * Map from state abbreviations to states.
 * @const
 */
var STATES = {
'AL': 'Alabama',
'AK': 'Alaska',
'AZ': 'Arizona',
'AR': 'Arkansas',
'CA': 'California',
'CO': 'Colorado',
'CT': 'Connecticut',
'DE': 'Delaware',
'DC': 'District of Columbia',
'FL': 'Florida',
'GA': 'Georgia',
'HI': 'Hawaii',
'ID': 'Idaho',
'IL': 'Illinois',
'IN': 'Indiana',
'IA': 'Iowa',
'KS': 'Kansas',
'KY': 'Kentucky',
'LA': 'Louisiana',
'ME': 'Maine',
'MD': 'Maryland',
'MA': 'Massachusetts',
'MI': 'Michigan',
'MN': 'Minnesota',
'MS': 'Mississippi',
'MO': 'Missouri',
'MT': 'Montana',
'NE': 'Nebraska',
'NV': 'Nevada',
'NH': 'New Hampshire',
'NJ': 'New Jersey',
'NM': 'New Mexico',
'NY': 'New York',
'NC': 'North Carolina',
'ND': 'North Dakota',
'OH': 'Ohio',
'OK': 'Oklahoma',
'OR': 'Oregon',
'PA': 'Pennsylvania',
'RI': 'Rhode Island',
'SC': 'South Carolina',
'SD': 'South Dakota',
'TN': 'Tennessee',
'TX': 'Texas',
'UT': 'Utah',
'VT': 'Vermont',
'VA': 'Virginia',
'WA': 'Washington',
'WV': 'West Virginia',
'WI': 'Wisconsin',
'WY': 'Wyoming' };


/**
 * Overlays recent visitors on top of a map.
 * 
 * Uses these APIs:
 * @see http://chartbeat.pbworks.com/recent
 *
 * @param {string|Element} element Element to render the widget in.
 * @param {string} host Hostname to show data for.
 * @param {string} apiKey API key to use.
 * @param {string=} opt_mediaUrl Optional media url
 * 
 * @constructor
 */
labs.widget.Map = function(element, host, apiKey, opt_mediaUrl) {
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
   * @type {string}
   * @private
   */
  this.mediaUrl_ = opt_mediaUrl || '';

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

  // TODO: fix
  // var hostLabel = goog.dom.getElement('hostContainer');
  // hostLabel.innerHTML = host;

  this.initMap_();
};


/**
 * Initializes the map display.
 *
 * @private
 */
labs.widget.Map.prototype.initMap_ = function() {
  // Base URL template for loading tiles
  var templatePath = '/v3/chartbeat.chartbeat/{z}/{x}/{y}.png';
  var tileTemplate = (goog.global.location.protocol === 'https:' ?
      'https://dnv9my2eseobd.cloudfront.net' : 'http://{s}.tiles.mapbox.com') + templatePath;

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
  var uri = new goog.Uri('//api.chartbeat.com/recent/');
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
 * Returns an icon for the marker.
 *
 * @return {L.Icon}
 * @private
 */
labs.widget.Map.prototype.getIcon_ = function() {
  // TODO: move to separate class
  var icon = new L.Icon(this.mediaUrl_ + 'images/labs/map/red-pin.png');
  icon.iconSize = new L.Point(26, 29);
  icon.shadowSize = icon.iconSize;
  icon.iconAnchor = new L.Point(26, 29);
  icon.popupAnchor = new L.Point(-17, -29);

  return icon;
};


/**
 * Get the popup content for a given data entry.
 *
 * @param {Object} entry Data object from /recent call
 * @return {string}
 *
 * @private
 */
labs.widget.Map.prototype.getContent_ = function(entry) {
  var title = entry['i'];
  var newReturning = entry['n'] == 1 ? 'new' : 'returning';

  var content = [];
  content.push('<div class="content">');
  content.push('<div class="visitType ' + newReturning + '">');
  content.push('<span class="icon">' + newReturning + '</span>');
  content.push('</div> <!-- end .visitType -->');
  content.push('<div class="data">');
  content.push('<h2>' + title + '</h2>');
  content.push('<div class="meta">');

  // Show either location or page load if we don't have it
  if (entry['country'] && entry['region']) {
    var region = (entry['country'] == 'US') ? STATES[entry['region']] : entry['region'];
    content.push('<div class="item locality">');
    content.push('<span class="label">Visited from </span>');
    content.push('<span class="value">' + region + ', ' + COUNTRIES[entry['country']] + '</span>');
    content.push('</div> <!-- end .locality -->');
  } else {
    content.push('<div class="item pageLoad">');
    content.push('<span class="label">Page load took </span>');
    content.push('<span class="value">' + Math.round(entry['b'] / 1000) + 's</span>');
    content.push('</div> <!-- end .pageLoad -->');
  }

  content.push('</div> <!-- End .meta -->');
  content.push('</div> <!-- End .data -->');

  // Find important referrer
  var knownDomains = {
    'facebook.com': 'facebook',
    'm.facebook.com': 'facebook',
    'twitter.com': 'twitter',
    't.co': 'twitter',
    'digg.com': 'digg',
    'reddit.com': 'reddit',
    'stumbleupon.com': 'stumbleupon',
    'yahoo.com': 'yahoo',
    'search.yahoo.com': 'yahoo',
    'google.com': 'google',
    'news.google.com': 'google'
  };
  if (entry['r']) {
    var domain = new goog.Uri(entry['r']).getDomain();
    // TODO: remove www.
    if (!!knownDomains[domain]) {
      content.push('<div class="referrer ' + knownDomains[domain] + '">');
      content.push('</div> <!-- end .referrer -->');
    }
  }

  content.push('</div> <!-- End .content -->');

  return content.join('');
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
  if (!('lat' in entry) || !('lng' in entry)) {
    return;
  }
  var pos = new L.LatLng(entry['lat'], entry['lng']);
  var icon = this.getIcon_();
  var marker = new L.Marker(pos, {'icon': icon});
  marker.bindPopup(this.getContent_(entry));

  goog.Timer.callOnce(function() {
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
