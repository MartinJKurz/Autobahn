
App = new Class({
	SERVER: 'http://intense-crag-5544.herokuapp.com/schilder',
	cb_script: document.createElement('script'),
	
	curPosition: null,
	
	initialize: function() {
		console.log('Hossa');
		document.getElementsByTagName('head')[0].appendChild(this.cb_script);
		this.markers = [];
		
		// this.test_getFirstLocation();
		
		this.getLocation();
	},
	
	first: true,
	
	getLocation: function() {
		var displayPosition, displayError, timeoutVal, maximumAgeVal, that;
		
		that = this;
		
		getPosition = function (geopos) {
			console.log('geolocation Success');
			that.curPosition = new google.maps.LatLng(geopos.coords.latitude, geopos.coords.longitude);
			if (that.first) {
				that.first = false;
				that.showMap();
				that.loadList();
			} else {
				that.centerMap();
			}
		};
		geolocationError = function (err) {
			switch(err.code) {
			case err.PERMISSION_DENIED:
				console.log('geolocation Error: PERMISSION_DENIED');
			case err.POSITION_UNAVAILABLE:
				console.log('geolocation Error: POSITION_UNAVAILABLE');
			case err.TIMEOUT:
				console.log('geolocation Error: TIMEOUT');
			}
			if(err.code == 1) {
				alert("Error: Access is denied!");
			} else if( err.code == 2) {
				alert("Error: Position is unavailable!");
			}
			console.log(err);
		};
		//timeoutVal = 15000;
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

	test_getFirstLocation: function() {
		var displayPosition, displayError, timeoutVal, that;
		
		that = this;
		
		getPosition1 = function (geopos) {
			console.log('geolocation Success 1');
			that.curPosition = new google.maps.LatLng(geopos.coords.latitude, geopos.coords.longitude);
			if (that.first) {
				that.first = false;
				that.showMap();
				that.loadList();
			} else {
				that.centerMap();
			}
		};
		geolocationError1 = function (e) {
			console.log(e);
		};
		timeoutVal = 5000;
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
					getPosition1, 
					geolocationError1,
				{ enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
			);
		} else {
			console.err('navigator.geolocation not available');
		}
	},

	
	centerMap: function() {
		this.map.panTo(this.curPosition);
	},
	
	showMap: function() {
		var myOptions, map_div, that;
		
		that = this;
		
		myOptions = {
			zoom: 11,
			center: this.curPosition,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map_div = new Element('div', {style: 'width:100%; height:100%'});
		document.body.appendChild(map_div);
		this.map = new google.maps.Map(map_div, myOptions);

		// add some functionality
		// TEST: set new curPosition
		google.maps.event.addListener(this.map, 'click', function (ev) {
			var lat, lng;
			lat = ev.latLng.lat();
			lng = ev.latLng.lng();
			// that.setPosition(lat, lng);
			that.curPosition = new google.maps.LatLng(lat, lng);
			that.centerMap();
		});
		/*
		google.maps.event.addListener(this.map, 'mousemove', function (ev) {
			var lat, lng, it, dist;
			lat = ev.latLng.lat();
			lng = ev.latLng.lng();
			// console.log(lat + ' ' + lng);
			
			if (that.curSelected) {
				if (that.curSelected.index > 0) {
					it = that.itemsFromServer[that.curSelected.index-1];
					if (it.myLatlng) {
						dist = google.maps.geometry.spherical.computeDistanceBetween(ev.latLng, it.myLatlng);
						that.showDistanceToLast(dist);
					}
				}
			}
		}
		*/
		
		/*
		this.updatePositionButton = new Element('button', {text: 'update Position'});
		this.updatePositionButton.setStyle('position', 'absolute');
		this.updatePositionButton.setStyle('left', '0');
		this.updatePositionButton.setStyle('top', '200px');
		this.updatePositionButton.addEvent('click', this.updatePosition.bind(this));
		document.body.appendChild(this.updatePositionButton);
		*/
	},
	
	updatePosition: function() {
		console.log('UPDA');
		this.getLocation();
	},

	loadList: function () {
		var radius = 50;
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
	/*
	loadList: function (lng, lat, radius) {
		url = this.SERVER + '/' + lng + '/' + lat + '/' + radius;
		url += '?callback=app.listFromServer';
		
		document.getElementsByTagName('head')[0].removeChild(this.cb_script);

		this.cb_script = document.createElement('script'),
		this.cb_script.src = url;

		document.getElementsByTagName('head')[0].appendChild(this.cb_script);
	},
	*/
	
	listFromServer: function (result) {
		var i, idx;
		console.log('Results: ' + result.length);
		
		this.removeAllMarkers();

		for (i=0; i<result.length; i++) {
			//console.log('Result: ' + result[i].name);
			// idx = result[i].name.indexOf('[[');
			// result[i].linkInfo = result[i].name.substring(idx+2, result[i].name.length - 2);
			// result[i].name = result[i].name.substring(0, idx).trim();

			// result[i].linkInfo = result[i].name.replace(/[^[]*[[()/, );
			result[i].name = result[i].name.replace('[[', '').replace(']]', '').replace('|', ', ');
			
			// console.log(result[i].name + '|' + result[i].linkInfo);
			//console.log(result[i].name);
			
			m = this.addSign(result[i]);
			m.data = result[i];
		}
		/*
		for (i=0; i<result.length; i++) {
			console.log('Result: ' + result[i].name);
			idx = result[i].name.indexOf('[[');
			result[i].linkInfo = result[i].name.substring(idx+2, result[i].name.length - 2);
			result[i].name = result[i].name.substring(0, idx).trim();
			
			console.log(result[i].name + '|' + result[i].linkInfo);
			
			this.addSign(result[i]);
		}
		*/
	},
	/*
	removeAllMarkers: function () {
		var i, el, it;
		if (null === this.itemElements) {
			return;
		}
		for (i = 0; i < this.itemElements.length; i++) {
			el = this.itemElements[i];
			if (el.marker) {
				el.marker.setMap(null);
			}
		}
	},
	*/
	removeAllMarkers: function () {
		var i, m;
		var tt = this.markers.length;
		for (i=0; i<this.markers.length; i++) {
			m = this.markers[i];
			// TODO
		}
	},
	
	addSign: function (data) {
		var m;
		m = this.createMarker(new google.maps.LatLng(data.lat, data.lng), data.name, data.km);
		this.markers.push(m);
		this.updateMarker(m);
		return m;
	},
	updateMarker: function (marker) {
		// for existing: reflect position update
		marker.setMap(null);
		marker.setMap(this.map);
	},
	/*
	updateMarker: function (el) {
		// for existing: reflect position update
		el.marker.setMap(null);
		el.marker.setMap(this.map);
	},
	*/
	
	formatText: function (text) {
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
	// createMarker: function (index, latLng, text, km) {
	createMarker: function (latLng, text, km) {
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
		console.log(marker.data.name);
	}
	
});


var app;
window.addEvent('domready', function () {
	app = new App();
});
