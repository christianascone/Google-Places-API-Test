var types = ['accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar','beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store','courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment','finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor','geocode','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship','plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school','shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand','train_station','travel_agency','university','veterinary_care','zoo']

jQuery(function($) {
  var places,
    userLocation,
    currentPlace = 0,  
    currentTypes = ['bar','pub'],
    currentRadius = '1500',
    $input = $("input[type=search]"),
    $form = $("form"),
    $fuckingWaiting = $('#fucking-waiting');
    map = new google.maps.Map($('#fucking-map')[0], {
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{featureType: "all",stylers: [{ saturation: -100 }]}],
      mapTypeControl: false,
      panControl: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false
    }),
    userMarker =  new google.maps.Marker({map:map, icon: "pointer.png" }),
    placeMarker = new google.maps.Marker, 
    geocoder = new google.maps.Geocoder(),
    placesService = new google.maps.places.PlacesService(map),
    directionsService = new google.maps.DirectionsService({
      unitSystem: google.maps.DirectionsUnitSystem.METRIC
    }),
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        clickable: false,
        strokeColor: "#00ccff"
      }
    });
    autocomplete = new google.maps.places.Autocomplete($input[0], { 
      types: ['geocode'] 
    });

  directionsDisplay.bindTo('map', placeMarker);
  
  map.controls[google.maps.ControlPosition.RIGHT].push($('#fucking-sidebar')[0]);
  
  function fuckingFind(location){
    userLocation = location;
    map.setCenter(userLocation);
    map.setZoom(16);
    findPlaces(userLocation);
    userMarker.setPosition(userLocation);
  }
  
  // Try W3C Geolocation
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position) {
      fuckingFind(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
    });
  };
  
  $form.submit(function(event){
    event.preventDefault();
    var query = $input.val();
    if (query.length > 0) {
      geocoder.geocode({
        address: query
      }, function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
          fuckingFind(results[0].geometry.location);
        }
      })
    };
  });
  
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
      fuckingFind(place.geometry.location);
    };
  });
  
  var request;
  function findPlaces (location) {
    $('#fucking-nothing').hide();
    if (request) { return };
    request = true;
    places = []; 
    $fuckingWaiting.fadeToggle();
    placesService.search({
      location: location,
      radius: currentRadius,
      types: currentTypes
    }, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        places = results.sort(function() {return 0.5 - Math.random()}) ;
        currentPlace = 0;
        toggleFuckingView();
        showPlace(results[0]);
      }else{
        renderFallback();
      }
      request = null;
    });
  }
  
  function renderFallback (message) {
    $('#fucking-nothing').show();
    placeMarker.setMap();
    $fuckingWaiting.hide();
  }
  
  function showPlace (place) {
    placeMarker.setMap();
    
    placesService.getDetails({
      reference: place.reference
    }, function(data){
      $(" #fucking-location header a").replaceWith(
        '<a href="' + (data.website && data.website != "" ? data.website : data.url ) + '" target="_blank">' + 
        data.name + 
        '</a>'
      );

      var bounds = new google.maps.LatLngBounds(userMarker.position);
      placeMarker.setIcon("beer.png");
      placeMarker.setPosition(data.geometry.location);
      placeMarker.setMap(map);
      map.fitBounds(bounds.extend(data.geometry.location));


      directionsService.route({
        origin: userMarker.position,
        destination: placeMarker.position,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      }, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          var text = "<p><b>" + data.name + "</b>" + "<br>" 
            + data.vicinity + "<br>"
            +"<small>" + result.routes[0].legs[0].distance.text + "</small></p>";
          $('#fucking-sidebar').html(text);
          directionsDisplay.setDirections(result);
          if (data.rating) {
            var $fuckingRating = $('<div id="fucking-rating">'),
              $fuckingRate = $('<div id="fucking-rate">');
            $fuckingRating.append($fuckingRate);
            $fuckingRate.css({
              "width":  data.rating / 5 * 100 + "%" 
            });
            $('#fucking-sidebar').append($fuckingRating);
          };
        }
      });
      
      
      
    });
    
  };
  
  $('#fucking-next-location').click(function(event){
    event.preventDefault();
    currentPlace += 1;
    if (currentPlace < 0) { currentPlace = places.length; };
    if (currentPlace == places.length) { currentPlace = 0; };
    showPlace(places[currentPlace]);
  });
  
  $('#fucking-wrong').click(function(){
    places = [];
    $fuckingWaiting.show();
    toggleFuckingView();
  });
  
  function toggleFuckingView() {
    setTimeout(function(){
      $('#fucking-start').fadeToggle();
      $fuckingWaiting.hide();
    }, 500);
  };

});