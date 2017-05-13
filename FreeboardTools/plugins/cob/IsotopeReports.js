// Best to encapsulate your plugin in a closure, although not required.
(function () {
	// create variable to track isotope plugins so that a unique Id can be assigned to each instance
	// making sure that more than one dimple widget can be on the screen at the same time. Freeboard
	// handles ids in the same way.
	var isotopeId = 0;
	freeboard.addStyle(".isotope-title", "fill: #B88F51;");
	freeboard.addStyle(".isotope-border", "border:1px solid #999 !important;");
	freeboard.addStyle(".isotopeReport .item", "width:100%; height:30px;");
	// ## IsotopeJS Sorted Report
	freeboard.loadWidgetPlugin({
		// Same stuff here as with datasource plugin.
		"type_name": "isotope-sortedReport",
		"display_name": "IsotopeJS Sorted Report",
		"description": "Some sort of description <strong>with optional html!</strong>",
		// **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
		"fill_size": false,

		// load isotope from CDN
		//"external_scripts": ["https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/2.1.1/isotope.pkgd.min.js"],
		"external_scripts": ["/lib/js/thirdparty/isotope.pkgd.min.js"],

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
					"name": "itemLimit",
					"display_name": "Item Limit",
					"type": "text",
					"description": "Number of items to display. If empty there is no limit."
				},
				{
					"name": "itemSortAttribute",
					"display_name": "Sort Attribute",
					"type": "text",
					"description": "Data item attribute to use to sort on."
				},
				{
					"name": "itemIdAttribute",
					"display_name": "Unique Id Attribute",
					"type": "text",
					"description": "Data item attribute that can be used to uniquely identify data item."
				},
				{
					"name": "itemTemplate",
					"display_name": "Item Template",
					"type": "text",
					"description": "HTML template used to display item data. Data attribute names must be enclosed in curly braces (e.g. {attName})."
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
			newInstanceCallback(new isotopeJSSortedReport(settings));
		}
	});

	// ### Widget Implementation
	//
	// -------------------
	// Here we implement the actual widget plugin. We pass in the settings;
	var isotopeJSSortedReport = function (settings) {
		var self = this;
		var currentSettings = settings;
		var currentValue = {};
		var thisIsotopeId = "isotope-" + isotopeId++;
		var myReport;

		// element to hold the display.
		var myTextElement = $("<div id='" + thisIsotopeId + "' class=\"isotopeReportContainer\"><div class='isotopeReportTitle'></div><div class='isotopeReport js-isotope'></div></div>");

		self.render = function (containerElement) {
			$container = $('#' + thisIsotopeId + " .isotopeReport ");
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
			$("#" + thisIsotopeId+ " .isotopeReportTitle").html(currentSettings["title"]);
			$("#" + thisIsotopeId + " .isotopeReportContainer").attr("style", "height:" + self.getHeight() * 45 + "px;");

			// draw chart
			//var data = new Function(currentSettings["data"])();
			//self.drawReport(data, currentSettings.itemSortAttribute, currentSettings.itemIdAttribute);
			//$('#' + thisIsotopeId + " .isotopeReport ").isotope("init").isotope();
			
		}

		// **onCalculatedValueChanged(settingName, newValue)** (required) : A public function we must implement that will be called when a calculated value changes. Since calculated values can change at any time (like when a datasource is updated) we handle them in a special callback function here.
		self.onCalculatedValueChanged = function (settingName, newValue) {
			// set title
			$("#" + thisIsotopeId + " .isotopeReportTitle").html(currentSettings["title"]);

			self.drawReport(newValue, currentSettings.itemSortAttribute, currentSettings.itemIdAttribute);
			
		}

		// **onDispose()** (required) : Same as with datasource plugins.
		self.onDispose = function () {}


		var _oldKeys = {};
		var _oldKeyNames = [];

		// draw report
		self.drawReport = function (data, sortAttribute, idAttribute) {

			if(sortAttribute == undefined || idAttribute == undefined){
				console.log("sortAttribute or idAddtribute empty");
				return;
			}

			// check if isotope intitialized
			if ($('#' + thisIsotopeId + " .isotopeReport ").data('isotope') == null){
				$('#' + thisIsotopeId + " .isotopeReport ").isotope({
					// options
					itemSelector: '.item',
					layoutMode: 'vertical',
					getSortData: {
						count: '[data-count] parseInt',
						identifier: '[id]'
					},
					sortAscending: {
						count: false,
						identifier: true
						},
					sortBy: ['count', 'identifier'],
					transitionDuration: "0.5s"
				});
			}


			// sort data;
			data = data.sort(function (a, b) { if (a[sortAttribute] > b[sortAttribute]) { return -1; } else if (a[sortAttribute] < b[sortAttribute]) { return 1; } else { return 0; } });

			// catalog new key data
			var newKeys = {};
			var newKeyNames = [];

			if(currentSettings.itemLimit == "" || !isNumeric(currentSettings.itemLimit)){
				currentSettings.itemLimit = 1000;
			}

			var maxCount = data.length < currentSettings.itemLimit ? data.length : currentSettings.itemLimit;
			for (var i = 0; i < maxCount; i++) {
				//data.forEach(function (d) {
				var key = data[i][idAttribute].replace(/ /g, "-");
				if (!newKeys.hasOwnProperty(key)) {
					newKeys[key] = data[i];
					newKeyNames.push(key);
				}
			};

			// find keys to remove
			_oldKeyNames.forEach(function (oldKey) {
				if (!newKeys.hasOwnProperty(oldKey)) {
					// remove from display
					$('#' + thisIsotopeId + " .isotopeReport").isotope('remove', $('#' + thisIsotopeId + " #" + oldKey));
					$('#' + thisIsotopeId + " .isotopeReport #" + oldKey).remove();
				}
			});

			// find keys to add 
			newKeyNames.forEach(function (newKey) {
				if (!_oldKeys.hasOwnProperty(newKey)) {
					// add to display
					$('#' + thisIsotopeId + " .isotopeReport ").append("<div id=\"" + newKey + "\" class=\"item isotope-border\" data-count=\"" + newKeys[newKey][sortAttribute] + "\"></div>");
					$('#' + thisIsotopeId + " .isotopeReport ").isotope('insert', $('#' + thisIsotopeId + " #" + newKey));
				}
			});

			// update current key data
			newKeyNames.forEach(function (key) {
				$('#' + thisIsotopeId + " #" + key).attr("data-count", (newKeys[key][sortAttribute]));

				var renderedTemplate = renderTemplate(newKeys[key], sortAttribute, idAttribute);
				$('#' + thisIsotopeId + " #" + key).html(renderedTemplate);
			});

			// update data display
			$('#' + thisIsotopeId + " .isotopeReport ").isotope('updateSortData').isotope();

			// persist new keys
			_oldKeyNames = newKeyNames;
			_oldKeys = newKeys;
			
			
		}

		// #### Helper methods ####

		// determines if a value is numeric. From http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
		function isNumeric(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}

		function renderTemplate(dataItem, sortAttribute, idAttribute) {
			// check to see if template present. if not, render default template
			if (currentSettings.itemTemplate == null || currentSettings == "") {
				return "<span class=\"count\">" + dataItem[sortAttribute] + "</span><span class=\"name\">" + dataItem[idAttribute] + "</span>";
			}
			
			// render template

			var renderedTemplate = currentSettings.itemTemplate;

			// get all items in {}
			var regEx = new RegExp("\{([\\w-]+)\}", "g");
			var matches = renderedTemplate.match(regEx);

			// find and replace all items with attribute data
			matches.forEach(function (m) {
				// parse attribute name
				var attName = m.substring(1, m.length - 1);

				// if data attribute not present, log error
				if (!dataItem.hasOwnProperty(attName)) {
					console.warn(attName + " not found on current data item");
				} else {
					renderedTemplate = renderedTemplate.replace(m, dataItem[attName]);
				}
			});
			return renderedTemplate;
		}
	}

}());
