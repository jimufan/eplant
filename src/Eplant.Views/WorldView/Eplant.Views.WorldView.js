(function() {
	
	/**
		* Eplant.Views.WorldView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing gene expression data of plant tissues during development as eFP.
		*
		* @constructor
		* @augments Eplant.BaseViews.EFPViewJson
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	if(typeof(google)!="undefined"){
		Eplant.Views.WorldView = function(geneticElement) {
			// Get constructor
			var constructor = Eplant.Views.WorldView;
			
			// Call parent constructor
			Eplant.View.call(this,
			constructor.displayName,				// Name of the View visible to the user
			constructor.viewName,
			constructor.hierarchy,			// Hierarchy of the View
			constructor.magnification,			// Magnification level of the View
			constructor.description,			// Description of the View visible to the user
			constructor.citation,			// Citation template of the View
			constructor.activeIconImageURL,		// URL for the active icon image
			constructor.availableIconImageURL,		// URL for the available icon image
			constructor.unavailableIconImageURL	// URL for the unavailable icon image
			);
			
			this.domContainer =Eplant.Views.WorldView.domContainer;
			
			// Call eFP constructor
			var efpURL = 'data/world/' + geneticElement.species.scientificName.replace(' ', '_') + '.json';
			Eplant.BaseViews.EFPViewJson.call(this, geneticElement, efpURL, {
			});
			
			/* Attributes */
			this.zooming=false;
			this.markerIcon = null;		// Marker icon definition
			this.viewGlobalConfigs = {
				isMaskOn:false, // Whether masking is on
				maskThreshold:1, // Masking threshold
				compareEFPView : null, // EFP view for comparing to
				maskColor :  "#B4B4B4", // Mask color
				errorColor : "#FFFFFF", // Error color
				mode : "absolute", // EFP mode
				left: 0,
				top:0,
				width:'auto',
				height:'auto',
				zoom:2,
				center: new google.maps.LatLng(25, 0)
				
			};
			
			if(this.name)
			{
				$(this.labelDom).empty();
				this.viewNameDom = document.createElement("span");
				var labelText = this.geneticElement.identifier;
				if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
					labelText += " / " + this.geneticElement.aliases.join(", ");
				}
				var text = this.name+': '+labelText;
				/*if(this.geneticElement.isRelated){
					text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
				}*/
				this.viewNameDom.appendChild(document.createTextNode(text)); 
				$(this.viewNameDom).appendTo(this.labelDom);
			}
		};
		ZUI.Util.inheritClass(Eplant.BaseViews.EFPViewJson, Eplant.Views.WorldView);	// Inherit parent prototype
		
		/* Define ePlant View properties */
		Eplant.Views.WorldView.viewName = "WorldView";
		Eplant.Views.WorldView.displayName = "World eFP";		// Name of the View visible to the user
		Eplant.Views.WorldView.hierarchy = "genetic element";	// Hierarchy of the View
		Eplant.Views.WorldView.magnification = 10;			// Magnification level of the View
		Eplant.Views.WorldView.description = "World eFP viewer";	// Description of the View visible to the user
		Eplant.Views.WorldView.citaiton = "";			// Citation template of the View
		Eplant.Views.WorldView.activeIconImageURL = "img/active/world.png";		// URL for the active icon image
		Eplant.Views.WorldView.availableIconImageURL = "img/available/world.png";		// URL for the available icon image
		Eplant.Views.WorldView.unavailableIconImageURL = "img/unavailable/world.png";	// URL for the unavailable icon image
		Eplant.Views.WorldView.viewType = "zui";
		/* Static constants */
		Eplant.Views.WorldView.map = null;			// GoogleMaps object
		Eplant.Views.WorldView.domContainer = null;	// DOM container for GoogleMaps
		
		
		/* Static methods */
		Eplant.Views.WorldView.initialize = function() {
			/* Get GoogleMaps DOM container */
			//Eplant.Views.WorldView.domContainer = document.getElementById("map_container");
			Eplant.Views.WorldView.domContainer = document.getElementById("World_container");	
			/*$(Eplant.Views.WorldView.domContainer).css({
				width:'100%',
				height:'100%',
				position:'absolute',
				left:0,
				top:0,
				opacity:0.99
			});*/
			$(Eplant.Views.WorldView.domContainer).css({"visibility": "hidden"});
			//$(Eplant.Views.WorldView.domContainer).insertBefore(ZUI.canvas);
			/* Create GoogleMaps object */
			
			Eplant.Views.WorldView.map = new google.maps.Map(Eplant.Views.WorldView.domContainer, {
				center: new google.maps.LatLng(25, 0),
				zoom: 2,
				streetViewControl: false,
				zoomControl:false,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mode:"html4"
			});
			
			google.maps.event.addListener(Eplant.Views.WorldView.map, 'zoom_changed', function(event) {
				Eplant.Views.WorldView.map.zooming = false;
			});
			
			
		};
		
		Eplant.Views.WorldView.prototype.downloadRawData = function() {
			if(this.rawSampleData){
				var downloadString = "";
				var currentdate = new Date(); 
				var datetime = "This file contains raw data downloaded from ePlant on " + currentdate.getDate() + "/"
				+ (currentdate.getMonth()+1)  + "/" 
				+ currentdate.getFullYear() + " @ "  
				+ currentdate.getHours() + ":"  
				+ currentdate.getMinutes() + ":" 
				+ currentdate.getSeconds();
				downloadString+=datetime+"\n";
				downloadString+=this.name+": "+this.geneticElement.identifier+"\n";
				downloadString+="URL: "+Eplant.urlForCurrentState()+"\n";
				downloadString+="JSON data: \n";
				downloadString+=this.rawSampleData;
				var blob = new Blob([downloadString], {type: "text/plain;charset=utf-8"});
				saveAs(blob, this.name+"-"+this.geneticElement.identifier+".txt");
			}
		};
		
		/**
			* Active callback method.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.active = function() {
			/* Call parent method */
			Eplant.BaseViews.EFPViewJson.prototype.active.call(this);
			
			/* Show map */
			$(Eplant.Views.WorldView.domContainer).css({"visibility": "visible"});
			//$(Eplant.Views.WorldView.domContainer).insertBefore(ZUI.canvas);
			
			//hacky, resize to fix the issue
			//google.maps.event.trigger(Eplant.Views.WorldView.map, 'resize');
			/* Reset map zoom and position 
				
				if(Eplant.globalViewConfigs[this.name].center){
				Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(
				Eplant.globalViewConfigs[this.name].center.k,
				Eplant.globalViewConfigs[this.name].center.D));
				}
				else{
				Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(25,0));
				}
				if(Eplant.globalViewConfigs[this.name].zoom){
				Eplant.Views.WorldView.map.setZoom(Eplant.globalViewConfigs[this.name].zoom);
				}
				else{
				Eplant.Views.WorldView.map.setZoom(2);
			}*/
			
			/* Insert markers */
			for (var n = 0; n < this.groups.length; n++) {
				var group = this.groups[n];
				group.marker.setMap(Eplant.Views.WorldView.map);
			}
			$(Eplant.Views.WorldView.domContainer).append(this.labelDom);
			
		};
		
		Eplant.Views.WorldView.prototype.afterActive = function() {
			Eplant.View.prototype.afterActive.call(this);
			
			Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(25, 0));
			
			Eplant.Views.WorldView.map.setZoom(2);
			
			
		};
		
		/**
			* Inactive callback method.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.inactive = function() {
			/* Call parent method */
			Eplant.BaseViews.EFPViewJson.prototype.inactive.call(this);
			
			/* Hide map */
			$(Eplant.Views.WorldView.domContainer).css({"visibility": "hidden"});
			//$(Eplant.Views.WorldView.domContainer).detach();
			/* Remove markers */
			for (var n = 0; n < this.groups.length; n++) {
				var group = this.groups[n];
				group.marker.setMap(null);
			}
			
		};
		
		/**
			* Default applyGlobalConfigs callback method.
			*
			* @override
		*/
		
		/*Eplant.Views.WorldView.prototype.applyGlobalConfigs = function() {
			Eplant.View.prototype.applyGlobalConfigs.call(this);
			if(Eplant.globalViewConfigs[this.name].center){
			Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(
			Eplant.globalViewConfigs[this.name].center.k,
			Eplant.globalViewConfigs[this.name].center.D));
			}
			if(Eplant.globalViewConfigs[this.name].zoom){
			var zoom = Eplant.globalViewConfigs[this.name].zoom;
			Eplant.Views.WorldView.map.setZoom(zoom);
			}
		};*/
		
		/**
			* Default saveGlobalConfigs callback method.
			*
			* @override
		*/
		
		/*Eplant.Views.WorldView.prototype.saveGlobalConfigs = function() {
			Eplant.View.prototype.saveGlobalConfigs.call(this);
			var center = Eplant.Views.WorldView.map.getCenter();
			Eplant.globalViewConfigs[this.name].center = center;
			var zoom = Eplant.Views.WorldView.map.getZoom();
			Eplant.globalViewConfigs[this.name].zoom = zoom===0?0.01:zoom;
			
		};*/
		
		/**
			* Draw callback method.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.draw = function() {
			/* Call parent method */
			Eplant.View.prototype.draw.call(this);
			
			/* Draw tags */
			for (var n = 0; n < this.tagVOs.length; n++) {
				var tagVO = this.tagVOs[n];
				tagVO.draw();
			}
		};
		
		/**
			* Clean up view.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.remove = function() {
			/* Remove gene id */
			this.viewGeneID.remove();
			/* Call parent method */
			Eplant.View.prototype.remove.call(this);
			
			/* Remove ViewObjects */
			for (var n = 0; n < this.tagVOs.length; n++) {
				var tagVO = this.tagVOs[n];
				tagVO.remove();
			}
			
			/* Remove legend */
			this.legend.remove();
			
			/* Remove EventListeners */
			ZUI.removeEventListener(this.updateAnnotationTagsEventListener);
		};
		
		/**
			* MouseMove callback method.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.mouseMove = function() {
		};
		
		/**
			* MouseWheel callback method.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.mouseWheel = function() {
		};
		
		Eplant.Views.WorldView.prototype.getTooltipContent = function(group) {
			var tooltipContent = "";
			if (this.mode == "absolute") {
				tooltipContent = group.id + 
				"<br>Mean: " + (+parseFloat(group.mean).toFixed(2)) + 
				"<br>Standard error: " + (+parseFloat(group.stdev).toFixed(2)) + 
				"<br>Sample size: " + group.n;
			}
			else if (this.mode == "relative") {
				tooltipContent = group.id + 
				"<br>Log2 value: " + (+parseFloat(ZUI.Math.log(group.mean / group.ctrlMean, 2)).toFixed(2)) + 
				"<br>Fold difference: " + (+parseFloat(group.mean / group.ctrlMean).toFixed(2));
			}
			else if (this.mode == "compare") {
				var index = this.groups.indexOf(group);
				var compareGroup = this.compareEFPView.groups[index];
				tooltipContent = group.id + 
				"<br>Log2 value: " + (+parseFloat(ZUI.Math.log(group.mean / compareGroup.group.mean, 2)).toFixed(2)) + 
				"<br>Fold difference: " + (+parseFloat(group.mean / compareGroup.group.mean).toFixed(2));
			}
			return tooltipContent;
		};
		
		/**
			* Loads eFP definition and data.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.loadData = function() {
			
			var mouse = {x: 0, y: 0};
			
			document.addEventListener('mousemove', function(e){ 
				mouse.x = e.clientX || e.pageX; 
				mouse.y = e.clientY || e.pageY 
			}, false);
			
			/* Get eFP definition */
			$.getJSON(this.efpURL, $.proxy(function(response) {
				/* Get web service URL */
				this.webService = response.webService;
				
				/* Get marker shape */
				this.markerIcon = response.marker;
				
				/* Prepare array for samples loading */
				var samples = [];
				
				/* Create groups */
				this.groups = [];
				for (var n = 0; n < response.groups.length; n++) {
					/* Get group data */
					var groupData = response.groups[n];
					Eplant.queue.add(function(){
						/* Create group object */
						var group = {
							id: this.groupData.id,
							samples: [],
							ctrlSamples: [],
							source: this.groupData.source,
							color: Eplant.Color.White,
							isHighlight: false,
							position: {
								lat: this.groupData.position.lat,
								lng: this.groupData.position.lng
							},
							tooltip: null
						};
						
						/* Prepare wrapper object for proxy */
						var wrapper = {
							group: group,
							eFPView: this.view
						};
						
						/* Create marker */
						group.marker = new google.maps.Marker({
							position: new google.maps.LatLng(group.position.lat, group.position.lng),
							icon: this.view.getMarkerIcon(group.color)
						});
						group.marker.data = group;
						
						/* Bind mouseover event for marker */
						google.maps.event.addListener(group.marker, "mouseover", $.proxy(function(event) {
							
							var tooltipContent=this.eFPView.getTooltipContent(group);
							group.tooltip = new Eplant.Tooltip({
								content: tooltipContent,
								x:mouse.x,
								y:mouse.y+20
							});
							
						}, wrapper));
						
						google.maps.event.addListener(group.marker, "mousemove", $.proxy(function(event) {
							if (group.tooltip) {
								group.tooltip.changeTooltipPosition(						
								{clientX:mouse.x,
								clientY:mouse.y+20});
							}
							
							
						}, wrapper));
						
						/* Bind mouseout event for marker */
						google.maps.event.addListener(group.marker, "mouseout", $.proxy(function() {
							if (group.tooltip) {
								group.tooltip.close();
								group.tooltip = null;
							}
						}, wrapper));
						
						
						google.maps.event.addListener(group.marker, "click", $.proxy(function( event ) {
							var tooltipContent=this.eFPView.getTooltipContent(group);
							var div = document.createElement("div");
							var info = document.createElement("div");
							$(info).html(tooltipContent);
							$(div).append(info);
							
							var EAViewName = Eplant.expressionAnglerViewNameMap[this.eFPView.viewName];
							/*if(EAViewName)
								{
								$(div).append(document.createElement("br"));
								var a1 = $('<a></a>',{
								text: 'Find genes that are highly expressed in this sample',
								'class': ''
								}).appendTo(div).css({
								'font-size': '13px',
								'margin-top': '5px',
								color:'#99cc00'
								});
								
								$(a1).click($.proxy(function() {
								if(this.eFPView.linkDialog)this.eFPView.linkDialog.close();
								Eplant.ExpressionAngler.generateStandardSearchQuery(EAViewName,this.eFPView,group,100);
								},this));
							}*/
							if(EAViewName)
							{					
								$(div).append(document.createElement("br"));
								var a1 = $('<a></a>',{
									text: 'Find genes that are specifically expressed in this sample',
									'class': ''
									}).appendTo(div).css({
									'font-size': '13px',
									'margin-top': '5px',
									color:'#99cc00'
								});
								
								$(a1).click($.proxy(function() {
									if(this.eFPView.linkDialog)this.eFPView.linkDialog.close();
									Eplant.ExpressionAngler.generateStandardSearchQuery(EAViewName,this.eFPView,group);
								},this));
							}
							if(group.link)
							{					
								$(div).append(document.createElement("br"));
								var a1 = $('<a></a>',{
									text: 'Open NASCArrays Information in a separate window',
									'class': ''
									}).appendTo(div).css({
									'font-size': '13px',
									'margin-top': '5px',
									color:'#99cc00'
								});
								
								$(a1).click($.proxy(function() {
									window.open(group.link, '_blank');
								},this));
							}
							if(Eplant.citations[Eplant.activeSpecies.scientificName][this.eFPView.name]){
								$(div).append(document.createElement("br"));
								var a1 = $('<a></a>',{
									text: 'Get citation information for this view',
									'class': ''
									}).appendTo(div).css({
									'font-size': '13px',
									'margin-top': '5px',
									color:'#99cc00'
								});
								
								$(a1).click($.proxy(function() {
									if(this.showCitation){
										this.showCitation()
									}
									else{
										Eplant.showCitation();
									}
								},this.eFPView));
							}
							if(this.eFPView.rawSampleData){
								$(div).append(document.createElement("br"));
								var a1 = $('<a></a>',{
									text: 'Get raw data for this view',
									'class': ''
									}).appendTo(div).css({
									'font-size': '13px',
									'margin-top': '5px',
									color:'#99cc00'
								});
								
								$(a1).click($.proxy(function() {
									
									this.downloadRawData()
									
								},this.eFPView));
							}
							
							
							if(group.ePlantLink && this.eFPView.geneticElement.views[group.ePlantLink])
							{		
								$(div).append(document.createElement("br"));
								var a2 = $('<a></a>',{
									text: 'Zoom to '+group.ePlantLink+' viewer',
									'class': ''
									}).appendTo(div).css({
									'font-size': '13px',
									'margin-top': '5px',
									color:'#99cc00'
								});
								$(a2).click($.proxy(function() {
									Eplant.changeActiveView(this.eFPView.geneticElement.views[group.ePlantLink]);
									if(this.eFPView.linkDialog)this.eFPView.linkDialog.close();
								},this));
							}
							
							this.eFPView.linkDialog = DialogManager.artDialogDynamic(div);
							
							
						},wrapper));
						
						/* Prepare samples */
						for (var m = 0; m < this.groupData.samples.length; m++) {
							var sample = {
								name: this.groupData.samples[m],
								value: null
							};
							samples.push(sample);
							group.samples.push(sample);
						}
						
						/* Asher: The new style of control */
						if (this.groupData.ctrlSamples !== undefined) {
							for (var m = 0; m < this.groupData.ctrlSamples.length; m++) {
								var sample = {
									name: this.groupData.ctrlSamples[m],
									value: null
								};
								
								/* Add to the sample array */
								samples.push(sample);
								group.ctrlSamples.push(sample);
							}
						}
						
						/* Append group to array */
						this.view.groups.push(group);
					},{view:this,groupData:groupData});
				}
				
				Eplant.queue.add(function(){
					/* Insert markers to map if this view is active */
					if (ZUI.activeView == this) {
						for (var n = 0; n < this.groups.length; n++) {
							var group = this.groups[n];
							group.marker.setMap(Eplant.Views.WorldView.map);
							
						}
					}
					
					/* Get sample values */
					/* Get sample names */
					var sampleNames = [];
					for (var n = 0; n < samples.length; n++) {
						sampleNames.push(samples[n].name);
					}
					/* Prepare wrapper for proxy */
					var wrapper = {
						samples: samples,
						eFPView: this
					};
					/* Query */
					$.getJSON(this.webService + "id=" + this.geneticElement.identifier + "&samples=" + JSON.stringify(sampleNames), $.proxy(function(response) {
						var haveNulls = false;
						var numNulls = 0;
						for (var m = 0; m < response.length; m++) {
							if(response[m].value===null||response[m].value==="None"){
								numNulls++;
							}
						}
						if(((numNulls / response.length) >> 0)===1){
							haveNulls = true;
						}
						this.eFPView.rawSampleData= JSON.stringify(response);
						/* Match results with samples and copy values to samples */
						
						if(haveNulls){
							this.eFPView.errorLoadingMessage="The sample database does not have any information for this gene.";
						}
						else{
							this.eFPView.rawSampleData= JSON.stringify(response);
							/* Match results with samples and copy values to samples */
							for (var n = 0; n < this.samples.length; n++) {
								for (var m = 0; m < response.length; m++) {
									if (this.samples[n].name == response[m].name) {
										this.samples[n].value = Number(response[m].value);
										break;
									}
								}
							}
							
							/* Process values */
							this.eFPView.processValues();
							
							/* Update eFP */
							//this.eFPView.updateDisplay();
							Eplant.queue.add(this.eFPView.updateDisplay, this.eFPView);
							
							/* Finish loading */
							//this.eFPView.loadFinish();
							
						}
						Eplant.queue.add(this.eFPView.loadFinish, this.eFPView);
					}, wrapper));
				},this)
				
			}, this));
		};
		
		/**
			* Updates eFP.
			*
			* @override
		*/
		Eplant.Views.WorldView.prototype.updateDisplay = function() {
			/* Return if data are not loaded */
			if (!this.isLoadedData) {
				return;
			}
			
			/* Update eFP */
			if (Eplant.viewColorMode == "absolute") {
				/* Find maximum value */
				var max = this.max;
				switch(Eplant.globalColorMode){
					case "absolute" :
					/*if(Eplant.experimentColorMode==="all"&&this.magnification===35){
						max= this.geneticElement.experimentViewMax;
						}
					else{*/
					max = this.max;
					break;
					case "globalAbsolute" :
					if(/*Eplant.experimentColorMode==="all"&&this.magnification===35*/this.viewName!="CellView"){
						max= this.geneticElement.species.max;//experimentViewMax;
					}
					else{
						max = this.geneticElement.species.geneticViewMax[this.viewName];
					}
					break;
					case "customAbsolute" :
					max = Eplant.customGlobalMax;
					break;
					default:
					max = this.eFPView.max;
					break;
				}
				
				/* Color groups */
				var minColor = ZUI.Util.getColorComponents(Eplant.midColor);
				var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
				for (var n = 0; n < this.groups.length; n++) {
					/* Get group */
					var group = this.groups[n];
					
					/* Get value ratio relative to maximum */
					var ratio = group.mean / max;
					
					/* Check whether ratio is invalid */
					if (isNaN(ratio) || !isFinite(ratio)) {		// Invalid
						group.color = this.errorColor;
					}
					else {		// Valid
						var red = minColor.red + Math.round((maxColor.red - minColor.red) * ratio);
						var green = minColor.green + Math.round((maxColor.green - minColor.green) * ratio);
						var blue = minColor.blue + Math.round((maxColor.blue - minColor.blue) * ratio);
						group.color = ZUI.Util.makeColorString(red, green, blue);
					}
					
					/* Set color of ViewObject */
					group.marker.setIcon(this.getMarkerIcon(group.color));
				}
			}
			else if (Eplant.viewColorMode == "relative") {
				var extremum=this.extremum; 
				switch(Eplant.globalColorMode){
					case "absolute" :
					/*if(Eplant.experimentColorMode==="all"&&this.magnification===35){
						extremum= this.geneticElement.experimentViewExtremum;
						}
					else{*/
					extremum = this.extremum;
					break;
					case "globalAbsolute" :
					if(/*Eplant.experimentColorMode==="all"&&this.magnification===35*/this.viewName!="CellView"){
						extremum= this.geneticElement.species.extremum;//experimentViewExtremum;
					}
					else{
						extremum = this.geneticElement.species.geneticViewExtremum[this.viewName];
					}
					
					break;
					case "customAbsolute" :
					extremum = Eplant.customGlobalExtremum;
					break;
					default:
					extremum = this.extremum;
					break;
				}
				
				/* Color groups */
				var minColor = ZUI.Util.getColorComponents(Eplant.minColor);
				var midColor = ZUI.Util.getColorComponents(Eplant.midColor);
				var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
				for (var n = 0; n < this.groups.length; n++) {
					/* Get group */
					var group = this.groups[n];
					
					/* Get log2 value relative to control */
					var log2Value = ZUI.Math.log(group.mean / group.ctrlMean, 2);
					
					/* Get log2 value ratio relative to extremum */
					var ratio = log2Value / extremum;
					
					/* Check whether ratio is invalid */
					if (isNaN(ratio) || !isFinite(ratio)) {		// Invalid
						group.color = this.errorColor;
					}
					else {		// Valid
						var color1, color2;
						if (ratio < 0) {
							color1 = midColor;
							color2 = minColor;
							ratio *= -1;
						}
						else {
							color1 = midColor;
							color2 = maxColor;
						}
						var red = color1.red + Math.round((color2.red - color1.red) * ratio);
						var green = color1.green + Math.round((color2.green - color1.green) * ratio);
						var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
						group.color = ZUI.Util.makeColorString(red, green, blue);
					}
					
					/* Set color of ViewObject */
					group.marker.setIcon(this.getMarkerIcon(group.color));
				}
			}
			else if (Eplant.viewColorMode == "compare") {
				
				this.compare(Eplant.compareGeneticElement);
				
				
				/* Find extremum log2 value */
				var extremum ;
				if(Eplant.compareGeneticElement.identifier===this.geneticElement.identifier){
					extremum=this.extremum;
				}
				else{
					extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.compareEFPView.groups[0].mean, 2));
					for (var n = 1; n < this.groups.length; n++) {
						var group = this.groups[n];
						var compareGroup = this.compareEFPView.groups[n];
						var absLog2Value = Math.abs(ZUI.Math.log(group.mean / compareGroup.mean, 2));
						if (absLog2Value > extremum) {
							extremum = absLog2Value;
						}
					}
					
				}
				
				/* Color groups */
				var minColor = ZUI.Util.getColorComponents(Eplant.minColor);
				var midColor = ZUI.Util.getColorComponents(Eplant.midColor);
				var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
				for (var n = 0; n < this.groups.length; n++) {
					/* Get group */
					var group = this.groups[n];
					var compareGroup = this.compareEFPView.groups[n];
					
					/* Get log2 value relative to control */
					var log2Value = ZUI.Math.log(group.mean / compareGroup.mean, 2);
					
					/* Get log2 value ratio relative to extremum */
					var ratio = log2Value / extremum;
					
					/* Check whether ratio is invalid */
					if (isNaN(ratio) || !isFinite(ratio)) {		// Invalid
						group.color = this.errorColor;
					}
					else {		// Valid
						var color1, color2;
						if (ratio < 0) {
							color1 = midColor;
							color2 = minColor;
							ratio *= -1;
						}
						else {
							color1 = midColor;
							color2 = maxColor;
						}
						var red = color1.red + Math.round((color2.red - color1.red) * ratio);
						var green = color1.green + Math.round((color2.green - color1.green) * ratio);
						var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
						group.color = ZUI.Util.makeColorString(red, green, blue);
					}
					
					/* Set color of ViewObject */
					group.marker.setIcon(this.getMarkerIcon(group.color));
				}
			}
			
			/* Apply masking */
			if (Eplant.isMaskOn) {
				for (var n = 0; n < this.groups.length; n++) {
					var group = this.groups[n];
					if (isNaN(group.sterror) || group.sterror >= group.mean * Eplant.maskThreshold) {
						group.color = this.maskColor;
						group.marker.setIcon(this.getMarkerIcon(group.color));
					}
				}
			}
			
			/* Update legend */
			this.legend.update();
		};
		
		/**
			* Returns the data URL of an icon image.
			*
			* @param {String} color Color of the icon image.
			* @return {DOMString} Data URL of the icon image.
		*/
		Eplant.Views.WorldView.prototype.getMarkerIcon = function(color) {
			var _color = color;
			if (_color[0] == "#") _color = _color.substring(1);
			if (this.markerIcon) {
				var canvas = document.createElement("canvas");
				canvas.width = this.markerIcon.width;
				canvas.height = this.markerIcon.height;
				var context = canvas.getContext("2d");
				context.beginPath();
				for (var n = 0; n < this.markerIcon.paths.length; n++) {
					var instructions = ZUI.Parser.pathToObj(this.markerIcon.paths[n]);
					for (var m = 0; m < instructions.length; m++) {
						var instruction = instructions[m];
						context[instruction.instruction].apply(context, instruction.args);
					}
				}
				context.strokeStyle = "none";
				//context.stroke();
				context.fillStyle = color;
				context.fill();
				
				return canvas.toDataURL("image/png");
			}
			else {
				return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + _color;
			}
		};
		
		/**
			* Grabs the View's screen.
			*
			* @override
			* @return {DOMString}
		*/
		Eplant.Views.WorldView.prototype.getViewScreen = function() {
			return null;
		};
		
		/**
			* Returns the enter-out animation configuration.
			*
			* @override
			* @return {Object} The default enter-out animation configuration.
		*/
		Eplant.Views.WorldView.prototype.getEnterOutAnimationConfig = function() {
			/* Get default configuration */
			var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
			
			/* Modify configuration */
			config.begin = function() {
				Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(25, 0));
				Eplant.Views.WorldView.map.setZoom(21);
			};
			config.draw = function(elapsedTime, remainingTime, view, data) {
				var zoom = Math.round((21 - 2) * remainingTime / (elapsedTime + remainingTime) + 2);
				Eplant.Views.WorldView.map.setZoom(zoom);
			};
			config.end = function() {
				Eplant.Views.WorldView.map.setZoom(2);
			};
			
			/* Return configuration */
			return config;
		};
		
		/**
			* Returns the exit-in animation configuration.
			*
			* @override
			* @return {Object} The default exit-in animation configuration.
		*/
		Eplant.Views.WorldView.prototype.getExitInAnimationConfig = function() {
			/* Get default configuration */
			var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
			
			/* Modify configuration */
			config.data = {
				sourceZoom: Eplant.Views.WorldView.map.getZoom()
			};
			config.draw = function(elapsedTime, remainingTime, view, data) {
				var zoom = Math.round((21 - data.sourceZoom) * elapsedTime / (elapsedTime + remainingTime) + data.sourceZoom);
				Eplant.Views.WorldView.map.setZoom(zoom);
			};
			config.end = function() {
				Eplant.Views.WorldView.map.setZoom(21);
			};
			
			/* Return configuration */
			return config;
		};
		
		Eplant.Views.WorldView.prototype.zoomIn = function() {
			
			if(!Eplant.Views.WorldView.map.zooming){
				Eplant.Views.WorldView.map.zooming=true;
				Eplant.Views.WorldView.map.setZoom(Eplant.Views.WorldView.map.getZoom()+1);
			}
			
		};
		
		Eplant.Views.WorldView.prototype.zoomOut = function() {
			if(!Eplant.Views.WorldView.map.zooming){
				Eplant.Views.WorldView.map.zooming=true;
				Eplant.Views.WorldView.map.setZoom(Eplant.Views.WorldView.map.getZoom()-1);
			}
			
		};
	}
	else{
		$(document.getElementById("World_container")).css({"visibility": "hidden"});	
		
	}
})();
