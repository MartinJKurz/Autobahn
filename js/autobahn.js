
App = new Class({
	SERVER: 'http://intense-crag-5544.herokuapp.com/schilder',
	cb_script: document.createElement('script'),
	first: true,
	curPosition: null,
	
	initialize: function() {
		"use strict";
		console.log('Hossa');
		document.getElementsByTagName('head')[0].appendChild(this.cb_script);
		this.markers = [];
		
		this.getLocation();
	},
	
	getLocation: function() {
		"use strict";
		var geolocationError, displayPosition, displayError, timeoutVal, maximumAgeVal, that;
		
		that = this;
		
		getPosition = function (geopos) {
			"use strict";
			console.log('geolocation Success');
			that.curPosition = new google.maps.LatLng(geopos.coords.latitude, geopos.coords.longitude);
			if (that.first) {
				that.first = false;
				that.showMap();
				that.loadList();
			} else {
				that.centerMap();
				that.loadList();
			}
		};
		geolocationError = function (err) {
			"use strict";
			switch(err.code) {
			case err.PERMISSION_DENIED:
				console.log('geolocation Error: PERMISSION_DENIED');
			case err.POSITION_UNAVAILABLE:
				console.log('geolocation Error: POSITION_UNAVAILABLE');
			case err.TIMEOUT:
				console.log('geolocation Error: TIMEOUT');
			default:
				console.log('geolocation: unknown Error');
			}
			console.log(err);
		};
		timeoutVal = Infinity;
		maximumAgeVal = 30000;
		
		if (navigator.geolocation) {
			navigator.geolocation.watchPosition(
					getPosition, 
					geolocationError,
				{ enableHighAccuracy: true, timeout: timeoutVal, maximumAge: maximumAgeVal }
			);
		} else {
			console.err('navigator.geolocation not available');
		}
	},
	
	centerMap: function() {
		"use strict";
		this.map.panTo(this.curPosition);
	},
	
	showMap: function() {
		"use strict";
		var myOptions, map_div, that, allowUserDrag;
		
		that = this;

		/*
			Note: even with allowUserDrag = true, the map will be recentered with every gps update
		*/
		allowUserDrag = false;
		
		if (allowUserDrag) {
			myOptions = {
				zoom: 11,
				center: this.curPosition,
				// mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeId: google.maps.MapTypeId.TERRAIN,
				scrollwheel: true,					// allow scroll wheel zoom
			};
		} else {
			myOptions = {
				zoom: 11,
				center: this.curPosition,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				//mapTypeId: google.maps.MapTypeId.TERRAIN,

				// Map should not be moved by the user
				draggable: false,					// disable mouse / touch drag
				disableDoubleClickZoom: true,		// 
				keyboardShortcuts: false,			// neither with keyboard
				scrollwheel: true,					// allow scroll wheel zoom
			};
		}
		map_div = new Element('div', {style: 'width:100%; height:100%'});
		document.body.appendChild(map_div);
		this.map = new google.maps.Map(map_div, myOptions);

		if (allowUserDrag) {
			// nothing special
		} else {
			// after scroll wheel zoom, the center might have moved, so recenter
			google.maps.event.addListener(this.map, 'center_changed', function() {
				that.centerMap();
			});
		}
	},
	
	updatePosition: function() {
		"use strict";
		console.log('UPDA');
		this.getLocation();
	},

	loadList: function () {
		"use strict";
		var url, radius = 50;
		url = this.SERVER + '/';
		url += '/';
		url	+= this.curPosition.lat();
		url += '/';
		url += this.curPosition.lng();
		url += '/';
		url += radius;
		
		url += '?callback=app.listFromServer';
		
		document.getElementsByTagName('head')[0].removeChild(this.cb_script);

		this.cb_script = document.createElement('script'),
		this.cb_script.src = url;

		document.getElementsByTagName('head')[0].appendChild(this.cb_script);
	},
	
	listFromServer: function (result) {
		"use strict";
		var i, idx, m;
		console.log('Results: ' + result.length);
		
		this.removeAllMarkers();

		for (i=0; i<result.length; i++) {
			console.log('1 ' + result[i].name);

			result[i].linkInfo = result[i].name.replace(/.*\[\[/, '').replace(/\]\].*/, '').replace(/\|.*/, '');
			result[i].name = result[i].name.replace('[[', '').replace(']]', '').replace('|', ', ');
			
			console.log(result[i].name);
			console.log(result[i].linkInfo);
			
			m = this.addSign(result[i]);
			m.data = result[i];
		}
	},

	removeAllMarkers: function () {
		"use strict";
		var i, m;
		var tt = this.markers.length;
		for (i=0; i<this.markers.length; i++) {
			m = this.markers[i];
			// m.marker.setMap(null);
			m.setMap(null);
		}
		this.markers = [];
	},
	
	addSign: function (data) {
		"use strict";
		var m;
		m = this.createMarker(new google.maps.LatLng(data.lat, data.lng), data.name, data.km);
		m.setDraggable(false);
		this.markers.push(m);
		this.updateMarker(m);
		return m;
	},
	updateMarker: function (marker) {
		"use strict";
		// for existing: reflect position update
		marker.setMap(null);
		marker.setMap(this.map);
	},
	
	formatText: function (text) {
		"use strict";
		var words, i, l, lines, line, j, maxLength;
		maxLength = 20;
		l = text.length;
		lines = [];
		words = text.split('\\s*');
		line = words[0];
		for (i = 1, j = 0; i < words.length; i++) {
			if (line.length + 1 + words[i].length <= maxLength) {
				line += ' ' + words[i];
			} else {
				lines.push(line);
				j++;
				line = word[i];
			}
		}
		lines.push(line);
		text = "";
		for (i = 0; i < lines.length; i++) {
			text += lines[i];
			if (i < lines.length - 1) {
				text += '<br>';
			}
		}
		return text;
	},

	createMarker: function (latLng, text, km) {
		"use strict";
		var marker, that, shape, markerImg, markerShadowImg, styledcontent, formattedText;
		that = this;
		
		markerImg = new google.maps.MarkerImage('images/beachflag.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(20, 32),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
			new google.maps.Point(0, 32));
		
		markerShadowImg = new google.maps.MarkerImage('images/beachflag_shadow.png',
			// The shadow image is larger in the horizontal dimension
			// while the position and offset are the same as for the main image.
			new google.maps.Size(37, 32),
			new google.maps.Point(0,0),
			new google.maps.Point(0, 32));
			
		// Shapes define the clickable region of the icon.
		// The type defines an HTML <area> element 'poly' which
		// traces out a polygon as a series of X,Y points. The final
		// coordinate closes the poly by connecting to the first
		// coordinate. 
		shape = {
			coord: [1, 1, 1, 20, 18, 20, 18 , 1],
			type: 'poly'
		};
		
		
		formattedText = this.formatText(text);
		formattedText += '<br>km: ' + km;
		marker = new MarkerWithLabel({
			position: latLng,
			title: text,
			draggable: true,
			icon: markerImg,
			shadow: markerShadowImg,
			// content: styledcontent, // ???
			shape: shape,
			animation: google.maps.Animation.DROP,
			
			labelContent: formattedText,
			labelAnchor: new google.maps.Point(22, 0),
			labelClass: "labels", // the CSS class for the label
			labelStyle: {opacity: 0.75}
		});
		
		//marker.index = index;
		// google.maps.event.addListener(marker, 'mousedown', this.dragStart.bind(this, marker));
		// google.maps.event.addListener(marker, 'drag', this.dragCallback.bind(this, marker));
		google.maps.event.addListener(marker, 'click', this.clickCallback.bind(this, marker));
		
		return marker;
	},
	
	clickCallback: function(marker) {
		"use strict";
		// console.log(marker.data.name + ' >>>>>>>> ' + marker.data.linkInfo);
		console.log('http://de.wikipedia.org/wiki/' + marker.data.linkInfo.replace(' ', '_'));
		window.open('http://de.wikipedia.org/wiki/' + marker.data.linkInfo.replace(' ', '_'));
	}
	
});


var app;
window.addEvent('domready', function () {
	app = new App();
});
