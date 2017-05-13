// Best to encapsulate your plugin in a closure, although not required.
(function()
{
	// create variable to track dimple plugins so that a unique Id can be assigned to each instance
	// making sure that more than one dimple widget can be on the screen at the same time. Freeboard
	// handles ids in the same way.
	var dimpleId = 0;
	freeboard.addStyle('.dimple-title, .dimple-axis text, .dimple-legend-text', "fill: #B88F51;");
	freeboard.addStyle('.domain, .dimple-axis .tick line', "stroke: #999 !important;");

	// ## DimpleJS Multiple Line Chart
	freeboard.loadWidgetPlugin({
		// Same stuff here as with datasource plugin.
		"type_name": "dimplejs-chart",
		"display_name": "DimpleJS Chart",
		"description": "Some sort of description <strong>with optional html!</strong>",
		// **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
		"fill_size": false,
		// load external scripts
		"external_scripts": ["https://fishboy42.github.io/DasboardTools/FreeboardTools/dist/dimple.v2.1.3.min.js"],

		"settings": [
				{
					"name": "chartType",
					"display_name": "Chart Type",
					"type": "option",
					"options": [
							{ "name": "Bar", "value": "dimple.plot.bar" },
							{ "name": "Pie", "value": "dimple.plot.pie" },
							{ "name": "Line", "value": "dimple.plot.line" },
							{ "name": "Area", "value": "dimple.plot.area" }
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
					"description" : "comma separated list of data attrubutes to use for x axis values",
					"type": "text"
				},
				{
					"name": "x-axisType",
					"display_name": "X Axis Type",
					"description": "Indicates data type of X axis",
					"type": "option",
					"options": [
						{
							"name": "Measure Axis",
							"value": "measure"
						},
						{
							"name": "Percent Axis",
							"value": "percent"
						},
						{
							"name": "Category Axis",
							"value": "category"
						},
						{
							"name": "Time Axis",
							"value": "time"
						},
						{
							"name": "Log Axis",
							"value": "log"
						}
					],
					"value": "measure"
				},
				{
					"name": "x-axisOptions",
					"display_name": "X Axis Options",
					"description": "options for axis types: Percent (categories), Time (inputFormat, outputFormat), Log (logBase)",
					"type": "text"
				},
				{
					"name": "x-axis-order-rules",
					"display_name": "X Axis Order Rules",
					"description": "Attribute name, array, or function to use to order x-axis.",
					"type": "calculated"
				},
				{
					"name": "x-axis-order-descending",
					"display_name": "X Axis Order Descending",
					"description": "Order x-axis in descending fashion (true, false).",
					"type": "boolean",
					"value": "false"
				},
				{
					"name": "y-axis",
					"display_name": "Y Axis",
					"description": "comma separated list of data attrubutes to use for y axis values",
					"type": "text"
				},
				{
					"name": "y-axisType",
					"display_name": "Y Axis Type",
					"description": "Indicates data type of Y axis",
					"type": "option",
					"options": [
						{
							"name": "Measure Axis",
							"value": "measure"
						},
						{
							"name": "Percent Axis",
							"value": "percent"
						},
						{
							"name": "Category Axis",
							"value": "category"
						},
						{
							"name": "Time Axis",
							"value": "time"
						},
						{
							"name": "Log Axis",
							"value": "log"
						}
					],
					"value": "measure"
				},
				{
					"name": "y-axisOptions",
					"display_name": "Y Axis Options",
					"description": "options for axis types: Percent (categories), Time (inputFormat, outputFormat), Log (logBase)",
					"type": "text"
				},
				{
					"name": "y-axis-order-rules",
					"display_name": "Y Axis Order Rules",
					"description": "Attribute name, array, or function to use to order y-axis.",
					"type": "calculated"
				},
				{
					"name": "y-axis-order-descending",
					"display_name": "Y Axis Order Descending",
					"description": "Order y-axis in descending fashion (true, false).",
					"type": "boolean",
					"value": "false"
				},
				{
					"name": "z-axis",
					"display_name": "Z Axis",
					"description": "comma separated list of data attrubutes to use for z axis values",
					"type": "text"
				},
				{
					"name": "z-axisType",
					"display_name": "Z Axis Type",
					"description": "Indicates data type of Z axis",
					"type": "option",
					"options": [
						{
							"name": "Measure Axis",
							"value": "measure"
						},
						{
							"name": "Percent Axis",
							"value": "percent"
						},
						{
							"name": "Log Axis",
							"value": "log"
						}
					],
					"value": "measure"
				},
				{
					"name": "z-axisOptions",
					"display_name": "Z Axis Options",
					"description": "options for axis types: Percent (categories), Log (logBase)",
					"type": "text"
				},
				{
					"name": "z-axis-order-rules",
					"display_name": "Z Axis Order Rules",
					"description": "Attribute name, array, or function to use to order z-axis.",
					"type": "calculated"
				},
				{
					"name": "z-axis-order-descending",
					"display_name": "Z Axis Order Descending",
					"description": "Order z-axis in descending fashion (true, false).",
					"type": "boolean",
					"value": "false"
				},
				{
					"name": "p-axis",
					"display_name": "P Axis",
					"description": "Value column used for pie type charts",
					"type": "text"
				},
				{
					"name": "p-axisType",
					"display_name": "P Axis Type",
					"description": "Indicates data type of p axis for pie-type charts",
					"type": "option",
					"options": [
						{
							"name": "Measure Axis",
							"value": "measure"
						},
						{
							"name": "Percent Axis",
							"value": "percent"
						},
						{
							"name": "Log Axis",
							"value": "log"
						}
					],
					"value": "measure"
				},
				{
					"name": "p-axis-order-rules",
					"display_name": "P Axis Order Rules",
					"description": "Attribute name, array, or function to use to order p-axis.",
					"type": "calculated"
				},
				{
					"name": "p-axis-order-descending",
					"display_name": "P Axis Order Descending",
					"description": "Order p-axis in descending fashion (true, false).",
					"type": "boolean",
					"value": "false"
				},
				{
					"name": "categories",
					"display_name": "Categories",
					"type": "text"
				},
				{
					"name": "category-order-rules",
					"display_name": "Category Order Rules",
					"description": "Attribute name, array, or function to use to order Categories.",
					"type": "calculated"
				},
				{
					"name": "category-order-descending",
					"display_name": "Category Order Descending",
					"description": "Order categories in descending fashion (true, false).",
					"type": "boolean",
					"value": "false"
				},
				{
					"name": "chart-smoothing",
					"display_name": "Smooth Chart",
					"description": "Add smoothing to graph lines (true, false).",
					"type": "boolean",
					"value": "false"
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
			// set title
			$("#" + thisDimpleId + " .dimpleChartTitle").html(currentSettings["title"]);

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
				var xAxisValue = currentSettings["x-axis"].split(",").length == 1 ? currentSettings["x-axis"] : currentSettings["x-axis"].split(",");
				var xAxisOptions = currentSettings["x-axisOptions"] != "" ? currentSettings["x-axisOptions"] : null;

				var x = null;
				switch (currentSettings["x-axisType"]) {
					case "log":
						x = myChart.addLogAxis("x", xAxisValue, xAxisOptions);
						break;
					case "percent":
						x = myChart.addPctAxis("x", xAxisValue, xAxisOptions);
						break;
					case "category":
						x = myChart.addCategoryAxis("x", xAxisValue);
						break;
					case "time":
						var inputFormat = null;
						var outputFormat = null;
						if (xAxisOptions != null) {
							var options = xAxisOptions.split(",");
							inputFormat = options[0] == "" ? null : options[0];
							if (options.length > 1) {
								outputFormat = options[1] == "" ? null : options[1];
							}
						}
						x = myChart.addTimeAxis("x", xAxisValue, inputFormat, outputFormat);
						break;
					default:
						x = myChart.addMeasureAxis("x", xAxisValue);
						break;
				}

				// set up order rules on x axis. allow for the config of both column and group ordering
				var xOrderRule = new Function(currentSettings["x-axis-order-rules"]);
				x.addOrderRule(xOrderRule(), currentSettings["x-axis-order-descending"]);

			}

			// set up y-axis
			if (currentSettings["y-axis"] != "" && currentSettings["y-axis"] != null) {
				var yAxisValue = currentSettings["y-axis"].split(",").length == 1 ? currentSettings["y-axis"] : currentSettings["y-axis"].split(",");
				var yAxisOptions = currentSettings["y-axisOptions"] != "" ? currentSettings["y-axisOptions"] : null;

				var y = null;
				switch (currentSettings["y-axisType"]) {
					case "log":
						y = myChart.addLogAxis("y", yAxisValue, yAxisOptions);
						break;
					case "percent":
						y = myChart.addPctAxis("y", yAxisValue, yAxisOptions);

						break;
					case "category":
						y = myChart.addCategoryAxis("y", yAxisValue);
						break;
					case "time":
						var inputFormat = null;
						var outputFormat = null;
						if (yAxisOptions != null) {
							var options = yAxisOptions.split(",");
							inputFormat = options.length >= 1 ? options[0] : null;
							outputFormat = options.length >= 2 ? options[1] : null;
						}

						y = myChart.addTimeAxis("y", yAxisValue, inputFormat, outputFormat);
						break;
					default:
						y = myChart.addMeasureAxis("y", yAxisValue);
						break;
				}

				var yOrderRule = new Function(currentSettings["y-axis-order-rules"]);
				y.addOrderRule(yOrderRule(), currentSettings["y-axis-order-descending"]);
				
			}

			// set up z-axis
			if (currentSettings["z-axis"] != "" && currentSettings["z-axis"] != null) {
				var zAxisValue = currentSettings["z-axis"].split(",").length == 1 ? currentSettings["z-axis"] : currentSettings["z-axis"].split(",");
				var zAxisOptions = currentSettings["z-axisOptions"] != "" ? currentSettings["z-axisOptions"] : null;

				var z = null;
				switch (currentSettings["z-axisType"]) {
					case "log":
						z = myChart.addLogAxis("z", zAxisValue, zAxisOptions);
						break;
					case "percent":
						z = myChart.addPctAxis("z", zAxisValue, zAxisOptions);
						break;
					default:
						z = myChart.addMeasureAxis("z", zAxisValue);
						break;
				}

				var zOrderRule = new Function(currentSettings["z-axis-order-rules"]);
				z.addOrderRule(zOrderRule(), currentSettings["z-axis-order-descending"]);

			}

			// set up p-axis for pie chart types
			if (currentSettings["p-axis"] != "" && currentSettings["p-axis"] != null) {
				var pAxisValue = currentSettings["p-axis"].split(",").length == 1 ? currentSettings["p-axis"] : currentSettings["p-axis"].split(",");
				var pAxisOptions = currentSettings["p-axisOptions"] != "" ? currentSettings["p-axisOptions"] : null;

				var p = null;
				switch (currentSettings["p-axisType"]) {
					case "log":
						p = myChart.addLogAxis("p", pAxisValue, pAxisOptions);
						break;
					case "percent":
						p = myChart.addPctAxis("p", pAxisValue, pAxisOptions);
						break;
					default:
						p = myChart.addMeasureAxis("p", pAxisValue);
						break;
				}

				var pOrderRule = new Function(currentSettings["p-axis-order-rules"]);
				p.addOrderRule(pOrderRule(), currentSettings["p-axis-order-descending"]);

			}

			// add chart series
			var chartSeries = null;
			if (currentSettings["categories"] != "" && currentSettings["categories"] != null) {
				chartSeries = currentSettings["categories"].split(",").length == 1 ? currentSettings["categories"] : currentSettings["categories"].split(",");
			}
			var s = myChart.addSeries(chartSeries, eval(currentSettings["chartType"]));

			// set up order rules for chart series. allow for the config of both column and group ordering
			var seriesOrderRule = new Function(currentSettings["category-order-rules"]); //category - order - rules
			s.addOrderRule(seriesOrderRule(), currentSettings["category-order-descending"]);

			// add smoothing if needed
			if (currentSettings["chart-smoothing"] == true) {
				s.interpolation = "cardinal";
			}

			if (currentSettings["legend"] != null) {
				var l = currentSettings["legend"].split(",");
				myChart.addLegend(l[0], l[1], l[2], l[3], l[4]);
			}

		}
	}

	function getAbsolutePath() {
	    var loc = window.location;
	    var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
	    return loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length));
	}

}());
