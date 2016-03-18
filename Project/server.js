var http = require('http');
var dispatcher = require('httpdispatcher');
var qs = require('querystring');
var fs = require('fs');
var path = require('path');
const PORT=3333; 

//Listen to post data on this link
dispatcher.onPost("/CreateWorkOrder", function(req, res) {
    res.writeHead(200, 
	{
		"access-control-allow-origin": "*",
		"access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
		"access-control-allow-headers": "content-type, accept",
		"access-control-max-age": 10
	});
    res.end("Success");
});


//Create a server
var server = http.createServer(function (request, response) {
	console.log(request.url);
	if(request.method == 'GET')
	{
		var filePath = '.' + request.url;
		if (filePath == './')
			filePath = './index.html';

		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
			case '.json':
				contentType = 'application/json';
				break;
			case '.png':
				contentType = 'image/png';
				break;      
			case '.jpg':
				contentType = 'image/jpg';
				break;
			case '.wav':
				contentType = 'audio/wav';
				break;
		}

		fs.readFile(filePath, function(error, content) {
			if (error) {
				if(error.code == 'ENOENT'){
					fs.readFile('./404.html', function(error, content) {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					});
				}
				else {
					response.writeHead(500);
					response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
					response.end(); 
				}
			}
			else {
				response.writeHead(200, { 'Content-Type': contentType });
				response.end(content, 'utf-8');
			}
		});
	} else {
		var body = '';
		var POSTDATA = null; 
		
		if(request.method = 'POST')
		{
			request.on('data', function (data) {
				body += data;
				if (body.length > 1e6) { 
					request.connection.destroy();
				}
				//console.log(body);
				console.log("First name:-------- " + body.substring(body.indexOf("FirstName=")+10,body.indexOf("&LastName=")));
				console.log("LastName:---------- " + body.substring(body.indexOf("LastName=")+9,body.indexOf("&DateOfWorkOrder=")));
				console.log("DateOfWorkOrder:--- " + convertDate(body.substring(body.indexOf("DateOfWorkOrder=")+16,body.indexOf("&TimeOfIncident="))));
				console.log("Time of Incident:-- " + decodeURIComponent(body.substring(body.indexOf("TimeOfIncident=")+15,body.indexOf("&IncidentType="))));
				console.log("Incident Type:----- " + body.substring(body.indexOf("IncidentType=")+13,body.indexOf("&Severity=")));
				console.log("Action Request:---- " + body.substring(body.indexOf("Severity=")+9,body.indexOf("&Description=")));
				if(body.substring(body.indexOf("Description=")+12,body.indexOf("&Latitude=")) != ""){
					console.log("Description:------- " + body.substring(body.indexOf("Description=")+12,body.indexOf("&Latitude=")));
				}else{console.log("Description:------- " + "No_Description_Given");}
				console.log("Latitude:---------- " + body.substring(body.indexOf("Latitude=")+9,body.indexOf("&Longitude=")));
				console.log("Longitude:--------- " + body.substring(body.indexOf("Longitude=")+10,body.indexOf("&Altitude=")));
				console.log("Altitude:---------- " + body.substring(body.indexOf("Altitude=")+9,body.indexOf("&Heading=")));
				console.log("Heading:----------- " + body.substring(body.indexOf("Heading=")+8,body.indexOf("&StreetAddress=")));
				if(body.substring(body.indexOf("StreetAddress=")+14,body.indexOf("&Zip")) != ""){
					console.log("StreetAddress:----- " + body.substring(body.indexOf("StreetAddress=")+14,body.indexOf("&Zip")));}
				if(body.substring(body.indexOf("ZipCode=")+8,body.indexOf("&City")) != ""){
					console.log("ZipCode:----------- " + body.substring(body.indexOf("ZipCode=")+8,body.indexOf("&City")));}
				if(body.substring(body.indexOf("City=")+5,body.indexOf("&State")) != ""){
					console.log("City:-------------- " + body.substring(body.indexOf("City=")+5,body.indexOf("&State")));}
				if(body.substring(body.indexOf("State=")+6,body.length) != ""){
					console.log("State:------------- " + body.substring(body.indexOf("State=")+6,body.length));}
				console.log('\nlistening for next order...')

			});
		}
		var convertDate = function(date){
			var month = date.substring(0,2);
			var day = date.substring(5,7);
			var year = date.substring(10,14);
			return month + "/" + day + "/" + year;
		}
		var prettifyDescription = function(description){
			return description.replace(/,/g , "!");
		}
		
		try {
			dispatcher.dispatch(request, response);
		} catch(err) {
			console.log(err);
		}
	
	}
});

//Lets start our server
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});