(function () {
	// create variable to track weather plugins so that a unique Id can be assigned to each instance
	// making sure that more than one dimple widget can be on the screen at the same time. Freeboard
	// handles ids in the same way.
	var weatherId = 0;
	freeboard.addStyle('.weather-title, .weather-axis text, .weather-legend-text', "fill: #B88F51;");
	freeboard.addStyle('.weather, .weather-axis .weather', "stroke: #999 !important;");

	// ## WeatherJS Wind-direction indicator
	freeboard.loadWidgetPlugin({
		"type_name": "weatherStationJS",
		"display_name": "Weather Station JS",
		"description": "Collection of weather station type gauges",
		// **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
		"fill_size": false,
		"settings": [
				{
					"name": "gaugeType",
					"display_name": "Gauge Type",
					"type": "option",
					"options": [
							{ "name": "WindDirection", "value": "windDirection" }
					]
				},
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
					"name": "x-axis",
					"display_name": "X Axis",
					"description": "comma separated list of data attrubutes to use for x axis values",
					"type": "text"
				},
				{
					"name": "x-percent",
					"display_name": "X Value Is Percent",
					"description": "Determines if x axis value is percent",
					"type": "boolean",
					"value": 0

				},
				{
					"name": "x-axis-order-rules",
					"display_name": "X Axis Order Rules",
					"description": "enter comma separated list of order rules (column names to order by). First value for value order rule, second value for group order rule, all other values will be ignored.",
					"type": "text"
				},
				{
					"name": "x-axis-order-direction",
					"display_name": "X Axis Order Direction",
					"description": "enter comma separated list indicating if items should be ordered in descending fashion (true, false). First value for order rule, second value for group rule, all other values will be ignored",
					"type": "text"
				},
				{
					"name": "y-axis",
					"display_name": "Y Axis",
					"description": "comma separated list of data attrubutes to use for y axis values",
					"type": "text"
				},
				{
					"name": "y-axis-order-rules",
					"display_name": "Y Axis Order Rules",
					"description": "enter comma separated list of order rules (column names to order by). First value for value order rule, second value for group order rule, all other values will be ignored.",
					"type": "text"
				},
				{
					"name": "y-axis-order-direction",
					"display_name": "Y Axis Order Direction",
					"description": "enter comma separated list indicating if items should be ordered in descending fashion (true, false). First value for order rule, second value for group rule, all other values will be ignored",
					"type": "text"
				},
				{
					"name": "z-axis",
					"display_name": "Z Axis",
					"description": "comma separated list of data attrubutes to use for z axis values",
					"type": "text"
				},
				{
					"name": "p-axis",
					"display_name": "P Axis",
					"description": "Value column used for pie type charts",
					"type": "text"
				},
				{
					"name": "categories",
					"display_name": "Categories",
					"type": "text"
				},
				{
					"name": "bounds",
					"display_name": "Chart Bounds",
					"description": "Comma separated string containing 4 values: x-origin, y-origin, width, height. Values can be indicated in px or % values.",
					"type": "text"
				},
				{
					"name": "legend",
					"display_name": "Legend Bounds",
					"description": "Comma separated string containing 4 values: x-origin, y-origin, width, height. Values can be indicated in px or % values.",
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
						},
						{
							"name": "Huge",
							"value": "huge"
						}

					]
				}

		],
		// Same as with datasource plugin, but there is no updateCallback parameter in this case.
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new dimpleJSChart(settings));
		}
	});

	// ### Widget Implementation
	//
	// -------------------
	// Here we implement the actual widget plugin. We pass in the settings;
	var dimpleJSChart = function (settings) {
		var self = this;
		var currentSettings = settings;
		var thisDimpleId = "dimple-" + dimpleId++;
		var myChart;

		// element to hold the display.
		var myTextElement = $("<div id='" + thisDimpleId + "'><div class='dimpleChartTitle'></div><div class='dimpleChart'></div></div>");

		self.render = function (containerElement) {

			// Here we append our text element to the widget container element.
			$(containerElement).append(myTextElement);

		}

		// the height is not in pixels, but in blocks. A block in freeboard is currently defined 
		// as a rectangle that is fixed at 300 pixels wide and around 45 pixels high multiplied by the 
		// value you return here.
		self.getHeight = function () {
			if (currentSettings.size == "huge") {
				return 6;
			}
			else if (currentSettings.size == "big") {
				return 4;
			}
			else {
				return 2;
			}
		}

		// **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
		self.onSettingsChanged = function (newSettings) {
			// Normally we'd update our text element with the value we defined in the user settings above (the_text), but there is a special case for settings that are of type **"calculated"** -- see below.
			currentSettings = newSettings;

			// set title
			$("#" + thisDimpleId + " .dimpleChartTitle").html(currentSettings["title"]);

			// draw chart
			self.drawChart(null);

		}

		// **onCalculatedValueChanged(settingName, newValue)** (required) : A public function we must implement that will be called when a calculated value changes. Since calculated values can change at any time (like when a datasource is updated) we handle them in a special callback function here.
		self.onCalculatedValueChanged = function (settingName, newValue) {

			// Remember we defined "data" up above in our settings.
			if (settingName == "data") {
				if (myChart == null) {
					self.drawChart(newValue);
				}
				myChart.data = newValue;
				myChart.draw(1000);


			}
		}

		// **onDispose()** (required) : Same as with datasource plugins.
		self.onDispose = function () {
		}


		// draw chart
		self.drawChart = function (data) {
			// clear current chart so duplicate charts are not created
			$("#" + thisDimpleId + " .dimpleChart").html("");

			// get height. should be 45 based on Freeboard's block-size settings but 60 seems to work better
			var svgHeight = (self.getHeight() * 60);

			// get width. This feels a little hacky - needing explicit information about entities not associated with this item
			// but I can't see another way to get this information without altering the freeboard base-code
			var svgWidth = $("#" + thisDimpleId).closest("li").attr("data-sizex") * 300;

			// create svg
			var svg = dimple.newSvg("#" + thisDimpleId + " .dimpleChart", svgWidth, svgHeight);
			myChart = new dimple.chart(svg, data);

			// draw bounds. 
			if (currentSettings["bounds"] != "" && currentSettings["bounds"] != null) {
				var bounds = currentSettings["bounds"].split(",");
				// add in validation here!

				myChart.setBounds(bounds[0], bounds[1], bounds[2], bounds[3]);
			}

			// set up x-axis
			if (currentSettings["x-axis"] != "" && currentSettings["x-axis"] != null) {
				if (!currentSettings["x-percent"]) {
					var x = myChart.addCategoryAxis("x", currentSettings["x-axis"].split(","));
				} else {
					var x = myChart.addPctAxis("x", currentSettings["x-axis"].split(","));
				}
				// set up order rules on x axis. allow for the config of both column and group ordering
				var xOrderRule = currentSettings["x-axis-order-rules"] == null ? "" : currentSettings["x-axis-order-rules"].split(",");
				if (xOrderRule.length > 0) {
					x.addOrderRule(xOrderRule[0]);
				}
				if (xOrderRule.length > 1) {
					x.addGroupOrderRule(xOrderRule[1]);
				}
			}

			// set up y-axis
			if (currentSettings["y-axis"] != "" && currentSettings["y-axis"] != null) {

				myChart.addMeasureAxis("y", currentSettings["y-axis"].split(","));
				// set up order rules on x axis. allow for the config of both column and group ordering

				var yOrderRule = currentSettings["y-axis-order-rules"] == null ? "" : currentSettings["y-axis-order-rules"].split(",");
				if (yOrderRule.length > 0) {
					y.addOrderRule(yOrderRule[0]);
				}
				if (yOrderRule.length > 1) {
					y.addGroupOrderRule(yOrderRule[1]);
				}
			}

			// set up z-axis
			if (currentSettings["z-axis"] != "" && currentSettings["z-axis"] != null) {
				var z = myChart.addCategoryAxis("z", currentSettings["z-axis"].split(","));

				//myChart.addMeasureAxis("z", currentSettings["z-axis"]);
			}

			// set up p-axis for pie chart types
			if (currentSettings["p-axis"] != "" && currentSettings["p-axis"] != null) {
				var p = myChart.addCategoryAxis("p", currentSettings["p-axis"].split(","));

				//myChart.addMeasureAxis("p", currentSettings["p-axis"]);
			}

			// add chart series
			var s = myChart.addSeries(currentSettings["categories"], eval(currentSettings["chartType"]));

			// add smoothing if needed
			//s.interpolation = "cardinal";

			if (currentSettings["legend"] != null) {
				var l = currentSettings["legend"].split(",");
				myChart.addLegend(l[0], l[1], l[2], l[3], l[4]);
			}

		}
	}

}());
