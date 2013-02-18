// Steven DuBois <srd2725@rit.edu>
// API mashup using Meetup, WeatherUnderground and Google Maps.

// Take meetup search data, send to google maps and Map it. Also
// display current weather conditions based on user input.

function makeSearch ( postalCode ){
  var weatherUri = "http://api.wunderground.com/api/a77789cc25991766/conditions/q/" + postalCode + ".json?callback=?";
  $.getJSON( weatherUri,
    function( data ) {
      processWeather( data );
  });

  var fullUri = "https://api.meetup.com/2/open_events?key=5bf6022584e38d156507d2cfdd&sign=true&zip=" + postalCode + "&page=20&callback=?";
  $.getJSON( fullUri,
    function( data ) {
      processSearch( data );
  });
}

function clearNode( thisNode ) {
  while( thisNode.firstChild ) {
    thisNode.removeChild( thisNode.firstChild );
  }
}

function processWeather( data ){
	clearNode(document.getElementById("weather"));
	var weatherObject = {
		tempF: data['current_observation']['temp_f'],
		tempC : data['current_observation']['temp_c'],
		weather : data['current_observation']['weather'],
		humidity : data['current_observation']['relative_humidity'],
		wind : data['current_observation']['wind_string'],
		icon :  data['current_observation']['icon_url'],
		uri: data['current_observation']['forecast_url'],
	}
	$("#weather").css({"border-width": "red", "border-style": "solid", "border-color": "#C80000", "border-radius": "10px"});
	$('#weather').append('<strong>Current Weather</strong>' +
		'<br/>' +
		'<img src="' + weatherObject['icon'] + '"/>' +
		weatherObject['tempF'] + "F | " + weatherObject['tempC'] + "C" +
		'<br/>' +
		weatherObject['weather'] + 
		'<br/>' +
		'Humidity: ' + weatherObject['humidity'] 
	);
}

function processSearch ( data ){
	map.clearMarkers();
	var results  = data['results'];
	if (results == undefined){
		alert("Invalid postal code!");
	}
	
	for(var i=0; i < results.length; i++){
		var thisObject = results[i];
		var eventData = {
			description: thisObject['description'],
			event_url: thisObject['event_url'],
			name: thisObject['name'],
			lat: thisObject['group']['group_lat'],
			lng: thisObject['group']['group_lon'],
		};
		
		// Object is built, now add marker
		var latLng = new google.maps.LatLng(eventData['lat'], eventData['lng']);
		addMarker(latLng, map, thisObject);
		// Recenter map
		if(i == 0){
			map.panTo(latLng);
		}
			}

}

// Map code

google.maps.Map.prototype.markers = new Array();

google.maps.Map.prototype.addMarker = function(marker) {
    this.markers[this.markers.length] = marker;
};

google.maps.Map.prototype.getMarkers = function() {
    return this.markers
};

google.maps.Map.prototype.clearMarkers = function() {
    for(var i=0; i<this.markers.length; i++){
        this.markers[i].setMap(null);
    }
    this.markers = new Array();
};

var markers = new Array();		// global is usually bad, but I think we need it here...
var map;
var myLatLang = new google.maps.LatLng(31.783333, 35.216667);
function initialize() {
	var mapOptions = {
		zoom: 12,
		center: myLatLang,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	
	
}

// Given a map and coords, add a marker to the map. Also pass the whole Object, just in case.
function addMarker(latLang, map, thisObject){
	infowindow = new google.maps.InfoWindow({});
	var marker = new google.maps.Marker({
		position: latLang,
		title: thisObject['name']
	});
	// Add and style the infowindow

	google.maps.event.addListener(marker, 'click', function(){
		infowindow.setContent(
			thisObject['name'] + 
			"<br/>" +
			'<a href="' + thisObject['event_url'] + '">' + "Event page" + '</a>' +
			thisObject['description']
		
		);
		infowindow.open(map, marker);
		
	});
	marker.setMap(map);
}