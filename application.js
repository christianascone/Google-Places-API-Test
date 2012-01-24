var types = ['accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar','beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store','courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment','finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor','geocode','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship','plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school','shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand','train_station','travel_agency','university','veterinary_care','zoo']

jQuery(function($) {
  var places,
    userPlace,
    currentPlace = 0,  
    currentType = 'bar',
    currentRadius = '500'  
    $input  = $("input[type=search]"),
    $prev = $('#prev'),
    $next = $('#next'),
    $map= $('#map'),
    $select = $('#select-type');
    $radius = $('#radius');
    map = new google.maps.Map($map[0], {
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
    userMarker =  new google.maps.Marker({map:map}),
    placeMarker = new google.maps.Marker, 
    infoWindow = new google.maps.InfoWindow,
    geocoder = new google.maps.Geocoder(),
    placesService = new google.maps.places.PlacesService(map),
    directionsService = new google.maps.DirectionsService({
      unitSystem: google.maps.DirectionsUnitSystem.METRIC
    }),
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });
    autocomplete = new google.maps.places.Autocomplete($input[0], { types: ['geocode'] });

  infoWindow.open(map, placeMarker);
  directionsDisplay.bindTo('map', placeMarker);
  
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    userPlace = autocomplete.getPlace();
    map.setCenter(userPlace.geometry.location);
    map.setZoom(16);
    findPlaces(userPlace);
    userMarker.setPosition(userPlace.geometry.location);
  });
  
  google.maps.event.addListener(placeMarker, 'click', function(marker) {
    infoWindow.open(map, placeMarker);
  });
  
  for(i in types){
    var $option = $("<option>",{
      value: types[i],
      text: types[i]
    });
    if (types[i] == currentType) {
      $option.attr("selected", "selected");
    };
    $select.append($option);
  }
  $select.bind("change",function(event) {
    currentType = this.value;
    userPlace && findPlaces(userPlace);
  });
  var timer;
  $radius.bind("change", function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      currentRadius = $radius.val();
      $('#label-radius span').text(currentRadius);
      userPlace && findPlaces(userPlace);
    }, 500);
  });
  
  function findPlaces (place) {
    placesService.search({
      location: place.geometry.location,
      radius: currentRadius,
      types: [currentType]
    }, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        places = results;
        currentPlace = 0;
        showPlace(results[0]);
      }else{
        renderFallback();
      }
    });
  }
  
  function renderFallback (message) {
    console.log(message || "No results");
    placeMarker.setMap();
  }
  
  function showPlace (place) {
    placesService.getDetails({
      reference: place.reference
    }, function(data){
      console.log(data);
    });

    placeMarker.setMap();
    var image = new google.maps.MarkerImage(
        place.icon, 
        new google.maps.Size(71, 71),
        new google.maps.Point(0, 0), new google.maps.Point(17, 34),
        new google.maps.Size(35, 35)
      ),
      bounds = new google.maps.LatLngBounds(userMarker.position);
    placeMarker.setIcon(image);
    placeMarker.setPosition(place.geometry.location);
    placeMarker.setMap(map);
    map.fitBounds(bounds.extend(place.geometry.location));
    
    directionsService.route({
      origin: userMarker.position,
      destination: placeMarker.position,
      travelMode: google.maps.TravelMode.WALKING,
      provideRouteAlternatives: false,
    }, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        infoWindow.setContent(
          "<b>" + place.name + "</b>" + "<br>" 
          + place.vicinity + "<br>"
          +"<small>" + result.routes[0].legs[0].distance.text + " entfernt.</small>"
        );
        directionsDisplay.setDirections(result);
      }
    });
  };
  
  var $prev = $('#prev'),
    $next = $('#next');
  
  function pagination (event) {
    if (event.target == $prev[0]) {
      paginate(-1);
    }else{
      paginate(1);
    }
  }
  
  function paginate (page) {
    currentPlace += page;
    if (currentPlace < 0) {
      currentPlace = places.length;
    };
    if (currentPlace == places.length) {
      currentPlace = 0;
    };
    showPlace(places[currentPlace]);
  }
  
  $('body').delegate("#prev, #next", "click", function(event){
    event.preventDefault();
    pagination(event);
  });

});