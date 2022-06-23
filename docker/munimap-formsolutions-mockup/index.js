var appUrl = undefined;
var appBaseUrl = undefined;


// TODO change this
/**
 * Allowed message actions:
 *  1) CREATE: Enables create mode which allows to create a new
 *     (multi)-geometry
 *  2) UPDATE: Enables update mode which allows to update or delete
 *     an existing (multi)-geometry
 */
var messageActions = [
  'finishGeoEditing',
  'zoomToBBox',
  'zoomToGeom',
  'centerOnCoord',
  'printGeoEditing'
];
var popup;
var iframe;
var clientIsReady = false;
var messageToSendOnReady = null;
var openAs = 'iframe';

// TODO change this
/**
 * Handle message events from the munimap application:
 *  1) Validate the message origin to only allow messages from the
 *     munimap popup
 *  2) Save the transmitted geometry, in this case to a simple HMTL
 *     table
 */
function receiveMessage(event) {
  console.log('Message from popup: ', event.data);

  // MUST-HAVE: Validate the origin of messages
  if (event.origin !== appBaseUrl) {
    console.warn('Invalid postMessage origin. Aborting.')
    return;
  }

  // The munimap client sends a message with 'munimapReady' when it's
  // ready to accept messages
  if (event.data.action === 'munimapReady') {
    // Now the client is ready.
    clientIsReady = true;

    if (messageToSendOnReady) {
      console.log('Client is ready! Sending initial message: ', messageToSendOnReady);
      sendMessage(messageToSendOnReady);
      messageToSendOnReady = null;
    }
  }

  // Store the received geometries in a HTML table
  var table = document.getElementById('cmsTable');
  var row = table.insertRow(table.rows.length);

  // TODO add additional cols as soon as the api is propely defined
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

  cell1.innerHTML = event.data.action;
  cell2.innerHTML = '<pre>' + JSON.stringify(event.data.value, null, 2) + '</pre>';
  cell3.innerHTML = new Date().toLocaleTimeString();
}

/**
 *  Open the munimap application as a new popup
 */
// function openMunimapApp(messageData) {
function openMunimapApp() {

  if (popup) {
    console.log('A munimap popup has been openend already.');

    if (clientIsReady) {
      console.log('The client is open and ready. Sending message.');
      // sendMessage(messageData);
    }

    return;
  }

  if (iframe) {
    console.log('A munimap iframe has been openend already.');

    if (clientIsReady) {
      console.log('The client is open and ready. Sending message.');
      // sendMessage(messageData);
    }

    return;
  }

  var appUrlField = document.getElementById('appUrlField');
  appUrl = appUrlField.value;
  appBaseUrl = new URL(appUrl).origin;

  if (openAs === 'iframe') {
    var munimapContainer = document.getElementById('iframe-container');
    var el = document.createElement('iframe');
    el.setAttribute('src', appUrl);
    el.setAttribute('title', 'munimap');
    munimapContainer.appendChild(el);
    iframe = el.contentWindow;
  } else {
    popup = window.open(appUrl);
  }

  // if (!clientIsReady) {
  //   console.log('Popup isn\'t ready yet. Waiting with execution ' +
  //     'of the initial message: ', messageData);
  //   messageToSendOnReady = messageData;
  // }

  // Workaround to detect when the cross-origin popup is closed
  if (openAs === 'window') {
    var timer = setInterval(function () {
      if (popup.closed) {
        clearInterval(timer);
        clientIsReady = false;
        popup = null;
      }
    }, 1000);
  }
}

function submitForm() {
  sendMessage({
    action: 'finishGeoEditing',
    value: undefined
  });
}

function zoomToBBox() {
  var zoomToBBoxField = document.getElementById('zoomToBBoxField');
  sendMessage({
    action: 'zoomToBBox',
    value: {
      extent: zoomToBBoxField.value.split(',').map(Number),
      srs: 'EPSG:4326'
    }
  });
}

function zoomToGeom() {
  var zoomToGeomField = document.getElementById('zoomToGeomField');
  sendMessage({
    action: 'zoomToGeom',
    value: JSON.parse(zoomToGeomField.value)
  });
}

function centerOnCoord() {
  var centerOnCoordField = document.getElementById('centerOnCoordField');
  var vals = centerOnCoordField.value.split(',').map(Number);
  var coord = [vals[0], vals[1]];
  var zoom = vals[2];
  sendMessage({
    action: 'centerOnCoord',
    value: {
      coord: coord,
      zoom: zoom,
      srs: 'EPSG:4326'
    }
  });
}

function print() {
  var layout = document.getElementById('printLayout').value;
  var margin = parseInt(document.getElementById('printMargin').value, 10);
  var outputFormat = document.getElementById('printFormat').value;
  var minScale = parseInt(document.getElementById('printMinScale').value, 10);
  sendMessage({
    action: 'printGeoEditing',
    value: {
      layout: layout,
      margin: margin,
      outputFormat: outputFormat,
      minScale: minScale
    }
  });
}

/**
 * Helper function to send a message to munimap via window.postMessage()
 * Documentation for postMessage is available at
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 */
function sendMessage(message) {
  if (openAs === 'window' && !popup) { // Check if a popup has been opened
    console.error('No popup found! Did you call `openLandPlan()?`');
    return;
  }

  if (!messageActions.includes(message.action)) {
    console.error('No valid message action provided!`');
    return;
  }

  if (openAs === 'window') {
    popup.postMessage(message, appUrl);
  } else {
    iframe.postMessage(message, appUrl);
  }
}

/**
 *  Close any previously opened munimap instances When the FormSolutions mockup is reloaded / closed
 */
function onUnload() {
  if (popup) {
    popup.close();
  }
}

// Add listener that fires before reload / close
window.addEventListener('beforeunload', onUnload, false);

// Add listener that fires on received messages to handle responses from the popup
window.addEventListener('message', receiveMessage, false);

var openBtn = document.getElementById('openMunimap');

openBtn.addEventListener('click', openMunimapApp, false);

var openAsBtn = document.getElementById('open-app-as');
openAsBtn.addEventListener('change', function (evt) {
  openAs = evt.target.value;
}, false);

var submitBtn = document.getElementById('submitForm');
submitBtn.addEventListener('click', submitForm, false);

var zoomToBBoxBtn = document.getElementById('zoomToBBox');
zoomToBBoxBtn.addEventListener('click', zoomToBBox, false);

var zoomToGeomBtn = document.getElementById('zoomToGeom');
zoomToGeomBtn.addEventListener('click', zoomToGeom, false);

var centerOnCoordBtn = document.getElementById('centerOnCoord');
centerOnCoordBtn.addEventListener('click', centerOnCoord, false);

var printBtn = document.getElementById('print');
printBtn.addEventListener('click', print, false);
