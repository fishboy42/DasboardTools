// Best to encapsulate your plugin in a closure, although not required.
(function()
{
	// create variable to track dimple plugins so that a unique Id can be assigned to each instance
	// making sure that more than one dimple widget can be on the screen at the same time. Freeboard
	// handles ids in the same way.
	var d3GeoId = 0;
	freeboard.addStyle('.dimple-title, .dimple-axis text, .dimple-legend-text', "fill: #B88F51;");
	freeboard.addStyle('.domain, .dimple-axis .tick line', "stroke: #999 !important;");
	freeboard.addStyle('.graticule { fill: none; stroke: #ccc; stroke-opacity: .5; stroke-width: .5px; }');
	freeboard.addStyle('.land {fill: #b88f51; fill-opacity: 0.3; stroke: #b88f51}'); //url(#grad1)
	freeboard.addStyle('.landshadow { transform: translateX(1px); transform: translateY(1px); fill: #666; stroke: #666; stroke-width: 2px; stroke-opacity: .5; }');
	freeboard.addStyle('.boundary { fill: none; stroke: #bbb; stroke-width: .5px; }');
	freeboard.addStyle('.city{ fill: red; opacity: 0.5; }');
	freeboard.addStyle('.frame{ fill: #2a2a2a; }');
	freeboard.addStyle('.night{ fill-opacity:.3;}')

	// ## D3 Geo Globe
	freeboard.loadWidgetPlugin({
		// Same stuff here as with datasource plugin.
		"type_name": "d3-geo",
		"display_name": "D3 Geo",
		"description": "Some sort of description <strong>with optional html!</strong>",
		"external_scripts": [
			"./lib/js/thirdparty/d3.geo.projection.v0.min.js",
			"./lib/js/thirdparty/topojson.v1.min.js",
			"./lib/js/thirdparty/queue.v1.min.js"
		],
		"fill_size": false,
		"settings": [
				{
					"name": "title",
					"display_name": "Title",
					"type": "text"
				},
				{
					"name": "data",
					"display_name": "Data",
					"type": "calculated"
				},
				{
					"name": "longitude",
					"display_name": "Longitude Field",
					"type": "text"
				},
				{
					"name": "latitude",
					"display_name": "Latitude Field",
					"type": "text"
				},
				{
					"name": "projection",
					"display_name": "Projection",
					"type": "option",
					"options": [
							{ "name": "Mercator", "value": "mercator" },
							{ "name": "Natural Earth", "value" : "naturalEarth" },
							{ "name": "Equirectangular", "value": "equirectangular" }]
				},
				{
					"name": "count",
					"display_name": "Count Field",
					"type": "text"
				},
				{
					"name": "size",
					"display_name": "Size",
					"type": "option",
					"options": [
						{
							"name": "Regular",
							"value": "regular"
						},
						{
							"name": "Big",
							"value": "big"
						}
					]
				}
		],

		// Same as with datasource plugin, but there is no updateCallback parameter in this case.
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new d3Geo(settings));
		}
	});

	// ### Widget Implementation
	//
	// -------------------
	// Here we implement the actual widget plugin. We pass in the settings;
	var d3Geo = function (settings) {
		var self = this;
		var currentSettings = settings;
		var thisD3GeoId = "d3Geo-" + d3GeoId++;

		var projection, night, path, circle, svg; // globe variables

		// element to hold the display.
		var myTextElement = $("<div id='" + thisD3GeoId + "'><div class='d3GeoChartTitle'></div><div class='d3GeoChart'></div></div>");

		self.render = function (containerElement) {
			// Here we append our text element to the widget container element.
			$(containerElement).append(myTextElement);

			if (svg == null) {
				self.drawChart();
			}
		}

		// the height is not in pixels, but in blocks. A block in freeboard is currently defined 
		// as a rectangle that is fixed at 300 pixels wide and around 45 pixels high multiplied by the 
		// value you return here.
		self.getHeight = function () {
			if (currentSettings.size == "big") {
				return 8;
			}
			else {
				return 4;
			}
		}

		// **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
		self.onSettingsChanged = function (newSettings) {
			// Normally we'd update our text element with the value we defined in the user settings above (the_text), but there is a special case for settings that are of type **"calculated"** -- see below.
			currentSettings = newSettings;

			// set title
			$("#" + thisD3GeoId + " .d3GeoChartTitle").html(currentSettings["title"]);
		}

		// **onCalculatedValueChanged(settingName, newValue)** (required) : A public function we must implement that will be called when a calculated value changes. Since calculated values can change at any time (like when a datasource is updated) we handle them in a special callback function here.
		self.onCalculatedValueChanged = function (settingName, newValue) {
			// Remember we defined "data" up above in our settings.
			if (settingName == "data") {
				console.log("data changed");

				var circles = svg.selectAll('circle');
				circles.remove();

				circles = svg.selectAll('circle');
				circles.data(newValue)
				.enter()
				.append("circle")
					.filter(function (d) {
						var isNotZero = (parseFloat(d[currentSettings["latitude"]]) != 0 || parseFloat(d[currentSettings["longitude"]]) != 0) ? true : false;
						return isNotZero;
					})
					.attr('cx', function (d) {
						var long = parseFloat(d[currentSettings["longitude"]]);
						var lat = parseFloat(d[currentSettings["latitude"]]);
						var p = projection([long, lat]);
						return p[0];
					})
					.attr('cy', function (d) {
						var long = parseFloat(d[currentSettings["longitude"]]);
						var lat = parseFloat(d[currentSettings["latitude"]]);
						var p = projection([long, lat]);
						return p[1];
					})
					.attr('r', function (d) {
						return (parseInt(d[currentSettings["count"]]) * 3);
					})
					.attr('class', 'city');
			}
		}

		// **onDispose()** (required) : Same as with datasource plugins.
		self.onDispose = function () {
		}


		// draw chart
		self.drawChart = function (data) {
			// clear current chart so duplicate charts are not created
			$("#" + thisD3GeoId + " .d3GeoChart").html("");

			// get height. should be 45 based on Freeboard's block-size settings but 60 seems to work better
			var svgHeight = (self.getHeight() * 80);

			// get width. This feels a little hacky - needing explicit information about entities not associated with this item
			// but I can't see another way to get this information without altering the freeboard base-code
			var svgWidth = $("#" + thisD3GeoId).closest("li").attr("data-sizex") * 300;

			// get current time to determine rotation
			var rotation = getCurrentRotation();

			// set projection
			projection = d3.geo.naturalEarth() //d3.geo.mercator() //
			.scale((svgWidth - 60) / 2 / Math.PI)
			.translate([svgWidth / 2, (svgHeight * 0.667) / 2])
			.center([0, 0])
			.rotate([rotation, 0])
			.precision(0.1);

			circle = d3.geo.circle()
			.angle(90);

			path = d3.geo.path()
				.projection(projection);

			var graticule = d3.geo.graticule();


			svg = d3.select("#" + thisD3GeoId + " .d3GeoChart").append("svg")
				.attr("width", svgWidth)
				.attr("height", svgHeight * 0.667);

			svg.append("rect")
				.attr("id", "myFrame")
				.attr("class", "frame")
				.attr("width", svgWidth)
				.attr("height", svgHeight);

			svg.append("path")
				.datum(graticule)
				.attr("class", "graticule")
				.attr("d", path);

			night = svg.append("path")
			  .attr("class", "night")
			  .attr("d", path);

			d3.json("./lib/js/thirdparty/world-50m.json", function (error, world) {
				
				svg.insert("path", ".graticule")
					.datum(topojson.feature(world, world.objects.land))
					.attr("class", "land")
					.attr("d", path);

				var now = new Date();
				night.datum(circle.origin(antipode(solarPosition(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours, now.getMinutes, 0, 0))))).attr("d", path);

				svg.insert("path", ".graticule")
					.datum(topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; }))
					.attr("class", "boundary")
					.attr("d", path);
				svg.selectAll("path").attr("d", path); // doing this updates display

				updateRotation();
				setInterval(function () {
					updateRotation();
				}, 15000);
			});
		}


		// HELPER METHODS
		function updateRotation() {
			// set rotation of atlas relative to current time.
			projection.rotate([getCurrentRotation(), 0]);

			var now = new Date();
			night.datum(circle.origin(antipode(solarPosition(now)))).attr("d", path);
			svg.selectAll("path").attr("d", path); // doing this updates display
		}

		function getCurrentRotation() {
			var time = new Date();
			var minutesIntoDay = (time.getHours() * 60) + (time.getMinutes());
			var rotation = minutesIntoDay * .25; // 360 degrees/(24 hours * 60 minutes) = .25 degrees/minute
			return rotation - 67.5;  // take away 67.5 so that noon is at middle of atlas
		}

		// all of below is for calculating solar terminator and is taken from
		// https://gist.github.com/mbostock/4597134
		var π = Math.PI,
		radians = π / 180,
		degrees = 180 / π;

		function antipode(position) {
			return [position[0] + 180, -position[1]];
		}

		function solarPosition(time) {
			var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
				longitude = (d3.time.day.utc.floor(time) - time) / 864e5 * 360 - 180;
			return [
			  longitude - equationOfTime(centuries) * degrees,
			  solarDeclination(centuries) * degrees
			];
		}

		// Equations based on NOAA’s Solar Calculator; all angles in radians.
		// http://www.esrl.noaa.gov/gmd/grad/solcalc/

		function equationOfTime(centuries) {
			var e = eccentricityEarthOrbit(centuries),
				m = solarGeometricMeanAnomaly(centuries),
				l = solarGeometricMeanLongitude(centuries),
				y = Math.tan(obliquityCorrection(centuries) / 2);
			y *= y;
			return y * Math.sin(2 * l)
				- 2 * e * Math.sin(m)
				+ 4 * e * y * Math.sin(m) * Math.cos(2 * l)
				- 0.5 * y * y * Math.sin(4 * l)
				- 1.25 * e * e * Math.sin(2 * m);
		}

		function solarDeclination(centuries) {
			return Math.asin(Math.sin(obliquityCorrection(centuries)) * Math.sin(solarApparentLongitude(centuries)));
		}

		function solarApparentLongitude(centuries) {
			return solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;
		}

		function solarTrueLongitude(centuries) {
			return solarGeometricMeanLongitude(centuries) + solarEquationOfCenter(centuries);
		}

		function solarGeometricMeanAnomaly(centuries) {
			return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;
		}

		function solarGeometricMeanLongitude(centuries) {
			var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
			return (l < 0 ? l + 360 : l) / 180 * π;
		}

		function solarEquationOfCenter(centuries) {
			var m = solarGeometricMeanAnomaly(centuries);
			return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries))
				+ Math.sin(m + m) * (0.019993 - 0.000101 * centuries)
				+ Math.sin(m + m + m) * 0.000289) * radians;
		}

		function obliquityCorrection(centuries) {
			return meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;
		}

		function meanObliquityOfEcliptic(centuries) {
			return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;
		}

		function eccentricityEarthOrbit(centuries) {
			return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
		}

	}
}());
