window.onload = function() {
	$(".error").hide();
	checkItemsInCache();
	getGeolocation();
	setCurrentTime();

	$( "#form-dateOfWorkOrder" ).datepicker();
	$( "#form-dateOfWorkOrder" ).datepicker('setDate', new Date());
	$(".form-possibleInput").hide();
	
	$("#submitForm").click(function(e) {
		e.preventDefault();
		var foundErrors = false;
		
		if($("#form-firstName").val().length < 2) {			
			$("#firstNameError").show();
			$("#firstNameError").text("First name length is invalid. Must be at least 2 characters.");
			foundErrors = true;
		}
		else{$("#firstNameError").hide();}

		if($("#form-lastName").val().length < 2) {			
			$("#lastNameError").show();
			$("#lastNameError").text("Last name length is invalid. Must be at least 2 characters.");
			foundErrors = true;
		}
		else{$("#lastNameError").hide();}

		if($("#form-dateOfWorkOrder").val().length < 10) {			
			$("#dateError").show();
			$("#dateError").text("That's not a valid date!");
			foundErrors = true;
		}
		else{$("#dateError").hide();}

		if($("#form-incidentType").val() == null) {	//null here is the disabled "select one" option
			$("#incidentError").show();
			$("#incidentError").text("Please Pick an Incident Type");
			foundErrors = true;
		} 
		else{$("#incidentError").hide();}

		if($("#form-workOrderSeverity").val() == null) {	//null here is the disabled "select one" option
			$("#severityError").show();
			$("#severityError").text("Please Pick a Severity");
			foundErrors = true;
		} 
		 else{$("#severityError").hide();}

		if($("#form-incidentType").val() == "Other") {
			if(document.getElementById("form-workOrderDescription").value.trim().replace(/\s+/gi, ' ').split(' ').length <= 1) {	
				$("#workDescriptionError").show();
				$("#workDescriptionError").text("You chose 'Other' For incident type, please enter at least a short description (min. 2 words) of the work that is to be done.");
				foundErrors = true;
				console.log(document.getElementById("form-workOrderDescription").value.trim().replace(/\s+/gi, ' ').split(' ').length);
			}else{$("#workDescriptionError").hide();}
		}else{$("#workDescriptionError").hide();}

		

		if($("#form-StreetAddress").is(':required') && $("#form-StreetAddress").val() == "" ){
			$("#addressError").show();
			$("#addressError").text("Please Enter The Street Address");
			foundErrors = true;
		}
		else{$("#addressError").hide();}

		if($("#form-ZipCode").is(':required') && $("#form-ZipCode").val() == "" ){
			$("#zipError").show();
			$("#zipError").text("Please Enter The Street Address");
			foundErrors = true;
		}
		else{$("#zipError").hide();}

		if($("#form-City").is(':required') && $("#form-City").val() == "" ){
			$("#cityError").show();
			$("#cityError").text("Please Enter The City Name");
			foundErrors = true;
		}
		else{$("#cityError").hide();}

		if($("#form-State").is(':required') && $("#form-State").val() == "" ){
			$("#stateError").show();
			$("#stateError").text("Please Enter The State");
			foundErrors = true;
		}
		else{$("#stateError").hide();}

		$("#storedData").hide();
		$("#sentData").hide();

		if(foundErrors == false)
		{
			$(".error").hide();

			
			var data = {};
			data.FirstName = $("#form-firstName").val();
			data.LastName = $("#form-lastName").val();
			data.DateOfWorkOrder = $("#form-dateOfWorkOrder").val();
			data.timeOfIncident = $("#form-currentTime").val();
			data.IncidentType = $("#form-incidentType").val();
			data.Severity = $("#form-workOrderSeverity").val();
			data.Description = $("#form-workOrderDescription").val();
			data.Latitude = $("#form-latitude").val();
			data.Longitude = $("#form-longitude").val();
			if($("#form-altitude").val() === "not_available"){
				data.Altitude = "Altitude_not_available_on_device_used.";
			}else{
				data.Altitude = $("#form-altitude").val();
			}	
			if($("#form-heading").val() === "not_available"){
				data.Heading = "Heading_not_available_on_device_used.";
			}else{
				data.Heading = $("#form-heading").val();
			}
			data.StreetAddress = $("#form-StreetAddress").val();
			data.ZipCode = $("#form-ZipCode").val();
			data.City = $("#form-City").val();
			data.State = $("#form-State").val(); 

			
			var foundCachedData = localStorage['cachedFormData'];
			if(navigator.onLine == false) {
				addToCache(foundCachedData, data);
				$("#storedData").show("slow").delay(4000).hide("slow");
			} else {
				checkItemsInCache();
				ProcessFormData(data, function(){ $("#sentData").show("slow").delay(4000).hide("slow");}, function(){$("#storedData").show("slow").delay(4000).hide("slow");});
			}
			var firstname =  $("#form-firstName").val();
			var lastname =  $("#form-lastName").val();
			CreateOrderForm.reset();
			$("#form-firstName").val(firstname);
			$("#form-lastName").val(lastname);
			$( "#form-dateOfWorkOrder" ).datepicker('setDate', new Date());
			geoRefresh();
		}
	});
}

function setCurrentTime(){
	var currentTime = new Date();
	var h = currentTime.getHours();
	var m = currentTime.getMinutes();
	var s = currentTime.getSeconds();
	$('#form-currentTime').val(h+":"+m+":"+s);
	setTimeout(setCurrentTime,1000);
}

function addToCache(foundCachedData, data){
	if(foundCachedData == null || foundCachedData == "") {
					localStorage['cachedFormData'] = JSON.stringify([data]);
				} else {
					var localData = JSON.parse(foundCachedData);
					localData.push(data);
					
					localStorage['cachedFormData'] = JSON.stringify(localData);
					
				}
}

function checkItemsInCache() {
	var foundCachedData = localStorage['cachedFormData'];
	
	if(foundCachedData != null && navigator.onLine == true) {
		var itemsFromCache = JSON.parse(foundCachedData);
		for(var i = 0; i < itemsFromCache.length; i++) {
			ProcessFormData(itemsFromCache[i],function(){
				if($("#sentStoredData").is(":hidden")){
					$("#sentStoredData").show("slow").delay(4000).hide("slow");
				}});
		}
		localStorage.clear();

	}
}

function getGeolocation(refreshButton) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(insertGeolocationPosition, showGeolocationError);
    } else { 
		alert("Geolocation is not supported by this browser.");
    }
}

var geoRefresh = function() {
    getGeolocation(refreshButton);
    refreshButton.disabled = true;
    refreshButton.innerHTML = "Our refreshing experts are at work...."
    setTimeout(function() {
    	refreshButton.disabled = false;
    	refreshButton.innerHTML = "Refresh your Location"
	},2000); 
}

var retryGeolocate = function(){
	getGeolocation(refreshButton);
    retryButton.disabled = true;
	retryButton.innerHTML = "Retrying Geolocation...."
    	setTimeout(function() {
    		retryButton.disabled = false;
    		retryButton.innerHTML = "Or Click Here To Retry Geolocation Services"
		},2000);
}

var switchToStreet = function() {
	if($(".geoform-row").is(":hidden")){
		$(".geoform-row").show();
		$(".form-possibleInput").hide();
	}else{
		$(".geoform-row").hide();
		$(".form-possibleInput").show();	
	}
	switchToStreetButton.disabled = true;
	switchToStreetButton.innerHTML = "Switching Stuff Up, Yo..."
    setTimeout(function() {
    	switchToStreetButton.disabled = false;
    	switchToStreetButton.innerHTML = "Click Here To Switch Location Input Type"
	},2000); 

 }

 var startTime = function (){
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds(); 
		return [ h, m, s ].join(':') 
}

function insertGeolocationPosition(position) {
	$("#retryButton").hide();
	timestamp.innerHTML = "*Location last recieved at " + startTime();
	$("#form-StreetAddress").prop('required',false);
    $("#form-ZipCode").prop('required',false);
    $("#form-City").prop('required',false);
    $("#form-State").prop('required',false);
    refreshButton.disabled = false;
    refreshButton.innerHTML = "Refresh your Location"
    switchToStreetButton.disabled = false;
    switchToStreetButton.innerHTML = "Click Here To Switch Location Input Type";
    $(".geoform-row").show();
    $(".form-possibleInput").hide();
    document.getElementById('form-latitude').value = position.coords.latitude;
    document.getElementById('form-longitude').value = position.coords.longitude;
    if (position.coords.altitude !== null && position.coords.altitude !== 0){ //null for safari, 0 for firefox
    	document.getElementById('form-altitude').value = position.coords.altitude;
    }else{
    	document.getElementById('form-altitude').value = "not_available";
    	getAltitude(position.coords.latitude,position.coords.longitude);
    }
    if (position.coords.heading !== null && position.coords.heading !== "" && !isNaN(position.coords.heading)){ 
    	document.getElementById('form-heading').value = position.coords.heading;
    }else{
    	document.getElementById('form-heading').value = "not_available";
    }
    $("#form-StreetAddress").prop('required',false);
    $("#form-ZipCode").prop('required',false);
    $("#form-City").prop('required',false);
    $("#form-State").prop('required',false);
    setTimeout(function() {
    	switchToStreetButton.disabled = false;
    	switchToStreetButton.innerHTML = "Click Here To Switch Location Input Type"
	},2000); 
	
}

var getAltitude = function(position){
	//
	//Use google api to send lat and long from 
	//position object and get back the altitude
	//of the location for when the device does not
	//support altitude services
}

function showGeolocationError(error) {
	refreshButton.innerHTML = "Or Click Here To Retry Geolocation Services"
    switch(error.code) {
        case error.PERMISSION_DENIED:
            $("#geoError1").show("slow").delay(4000).hide("slow");
            break;
        case error.POSITION_UNAVAILABLE:
            $("#geoError2").show("slow").delay(4000).hide("slow");
            break;
        case error.TIMEOUT:
            $("#geoError3").show("slow").delay(4000).hide("slow");
            break;
        case error.UNKNOWN_ERROR:
            $("#geoError4").show("slow").delay(4000).hide("slow");
            break;
    
    }
    $("#retryButton").show();
    $("#form-StreetAddress").prop('required',true);
    $("#form-ZipCode").prop('required',true);
    $("#form-City").prop('required',true);
    $("#form-State").prop('required',true);
    $(".geoform-row").hide();
	$(".form-possibleInput").show();
	switchToStreetButton.disabled = true;
	switchToStreetButton.innerHTML = "GeoLocation Services Unavailable, Please Manually Enter the Location Below"
	document.getElementById('form-latitude').value = "Unavailable_At_Time_Of_Incident_Submission";
    document.getElementById('form-longitude').value = "Unavailable_At_Time_Of_Incident_Submission";
    document.getElementById('form-altitude').value = "Unavailable_At_Time_Of_Incident_Submission";
    document.getElementById('form-heading').value = "Unavailable_At_Time_Of_Incident_Submission";
}

function workOrderDescriptionValid() {
	var description = document.getElementById("form-workOrderDescription");
    var regex = /\s+/gi;
    var wordCount = description.value.trim().replace(regex, ' ').split(' ').length;
	
	console.log(wordCount);
	if(wordCount > 300) {
		description.oldValue = description.value!=description.oldValue?description.value:description.oldValue;
		description.value = description.oldValue?description.oldValue:"";
	}
}

function ProcessFormData(data, success, error) {
	$.ajax({
		url: 'http://localhost:3333/CreateWorkOrder',
		dataType: 'text',
		type: 'post',
		contentType: 'application/x-www-form-urlencoded',
		data: {
			FirstName: data.FirstName,
			LastName: data.LastName,
			DateOfWorkOrder: data.DateOfWorkOrder,
			TimeOfIncident: data.timeOfIncident,
			IncidentType: data.IncidentType,
			Severity: data.Severity,
			Description: data.Description,
			Latitude: data.Latitude,
			Longitude: data.Longitude,
			Altitude: data.Altitude,
			Heading: data.Heading,
			StreetAddress: data.StreetAddress,
			ZipCode: data.ZipCode,
			City: data.City,
			State: data.State,
		},
		success: function( data, textStatus, jQxhr ){
			console.log("WE GOOD");
			if(success!= null){
				success();
				// geoRefresh();
			}	
		},
		error: function( jqXhr, textStatus, errorThrown ){
			console.log("Server Error, storing locally.");
			addToCache(localStorage['cachedFormData'], data);
			if(error != null)
				error();
				// geoRefresh();
		}
	});
}
