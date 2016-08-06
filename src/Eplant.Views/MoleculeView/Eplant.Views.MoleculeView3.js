(function() {
	
	/**
		* Eplant.Views.MoleculeView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant view for browsing protein molecular structures and 3D annotations.
		* Uses JSmol.
		*
		* @constructor
		* @param {Eplant.GeneticElement} The GeneticElement associated with this view.
	*/
	Eplant.Views.MoleculeView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.MoleculeView;
		
		// Call parent constructor
		Eplant.View.call(this,
		constructor.displayName,			// Name of the View visible to the user
		constructor.viewName,
		constructor.hierarchy,			// Hierarchy of the View
		constructor.magnification,			// Magnification level of the View
		constructor.description,			// Description of the View visible to the user
		constructor.citation,			// Citation template of the View
		constructor.activeIconImageURL,		// URL for the active icon image
		constructor.availableIconImageURL,		// URL for the available icon image
		constructor.unavailableIconImageURL	// URL for the unavailable icon image
		);
		
		// Attributes
		this.geneticElement = geneticElement;
		this.zoom = 70;
		/* Title of the view */
		/*this.viewGeneID = new ZUI.ViewObject({
			shape: "text",
			positionScale: "screen",
			sizeScale: "screen",
			x: 400,
			y: 7,
			size: 15,
			fillColor: Eplant.Color.DarkGrey,
			content: geneticElement.identifier,
			centerAt: "left top"
		});*/
		
		this.viewInstruction= "This view displays the 3D molecular structure of the protein associated with the selected gene.";
		
		
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
		
		this.defaultLoadScript =
		'isDssp = false;' +		//Turn off DSSP
		'set defaultVDW babel;' +	//Set default Van der Waals to babel
		'spacefill off;' +		//Turn off space fill
		'wireframe off;' +		//Turn off wire frame
		'cartoons on;' +		//Turn on cartoons
		'color structure;'		//Color structures
		;
		/*this.info = {
			width: ZUI.width,
			height: ZUI.height,
			use: "HTML5",
			j2sPath: "lib/JSmol/j2s",
			script: 'set defaultloadscript "' + this.defaultLoadScript + '";',
			disableJ2SLoadMonitor: true,
			disableInitialConsole: true
			};
		*/
		// define loaded function to jsmol
		Eplant.Views.MoleculeView.loadedFunctions[this.geneticElement.identifier+'_loaded']=$.proxy(this.structureLoaded,this);
		//this.info.loadstructcallback = 'Eplant.Views.MoleculeView.loadedFunctions.'+this.geneticElement.identifier+'_loaded';
		
		this.domContainer = document.createElement("div");
		/*$(this.domContainer).css({
			'width':'100%',
			'height':'100%'
		});*/
		$(this.domContainer).attr('id','content'+this.geneticElement.identifier);
		$(Eplant.Views.MoleculeView.domCacheContainer).append(this.domContainer);	
		$(Eplant.Views.MoleculeView.domContainer).css({"visibility": "hidden"});
		$(this.domContainer).css({
			position: 'relative',
			width: '100%',
			height: '100%',
			'z-index': '-1'
		});
		
		this.loadData();
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.MoleculeView);	// Inherit parent prototype
	Eplant.Views.MoleculeView.viewName = "MoleculeView";
	Eplant.Views.MoleculeView.displayName = "Molecule Viewer";
	Eplant.Views.MoleculeView.hierarchy = "genetic element";
	Eplant.Views.MoleculeView.magnification = 70;
	Eplant.Views.MoleculeView.description = "Molecule viewer";
	Eplant.Views.MoleculeView.citation = "";
	Eplant.Views.MoleculeView.activeIconImageURL = "img/active/molecule.png";
	Eplant.Views.MoleculeView.availableIconImageURL = "img/available/molecule.png";
	Eplant.Views.MoleculeView.unavailableIconImageURL = "img/unavailable/molecule.png";
	Eplant.Views.MoleculeView.viewType = "zui";
	/* Constants */
	Eplant.Views.MoleculeView.domContainer = null;		// DOM container for JSmol
	Eplant.Views.MoleculeView.applet = null;			// JSmol applet object
	Eplant.Views.MoleculeView.container = null;		// JSmol container (inside the main domContainer)
	Eplant.Views.MoleculeView.canvas = null;			// JSmol canvas
	
	/* Static methods */
	/**
		* Initializes JSmol
	*/
	Eplant.Views.MoleculeView.initialize = function() {
		// Get JSmol DOM container
		Eplant.Views.MoleculeView.domContainer = document.getElementById("JSmol_container");
		Eplant.Views.MoleculeView.domCacheContainer = document.getElementById("JSmol_cache");
		Jmol.setDocument(0);
		Eplant.Views.MoleculeView.loadedFunctions = {};
		// Define JSmol initialization info
		
		Eplant.Views.MoleculeView.Params = {
			htmlPage: '',
			jsFile: "WebContent/mysj/molViewer41.js",
			page_fragment: "pages/molviewer.html",
			page_css: "WebContent/css/styles41.css",
			acidLetterMapUrl: "data/molecule/AcidLetterMap.json",
			acidLetterMap:null,
			mycounter: 0,
			maxFrequency:400,
			items: ["http://bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT5G48545.1.pdb", "http://bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT1G70630.1.pdb", "http://bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/Phyre2_AT1G62160.1.pdb"]
		}
		Eplant.Views.MoleculeView.Params.logOffset = Math.round(ZUI.Math.log(Eplant.Views.MoleculeView.Params.maxFrequency/1, 2)* 100) / 100;
		
		Eplant.Views.MoleculeView.Params.htmlPage = $.get(Eplant.Views.MoleculeView.Params.page_fragment, function(data) {
			Eplant.Views.MoleculeView.Params.htmlPage = data;
		});
		
		Eplant.Views.MoleculeView.Params.acidLetterMap = $.get(Eplant.Views.MoleculeView.Params.acidLetterMapUrl, function(data) {
			Eplant.Views.MoleculeView.Params.acidLetterMap = JSON.parse( data );
		});
		
	};
	
	Eplant.Views.MoleculeView.prototype.loadData = function(fileURL) {
		
		$.when(Eplant.Views.MoleculeView.Params.htmlPage).then($.proxy(function( data ) {
			$.getJSON(Eplant.ServiceUrl + 'JSMol.cgi?agi=' + this.geneticElement.identifier, $.proxy(function(response) {
				var moleculeSequenceStringArr = [];
				if (response.link != "") {
					this.moleculeModelRawText = JSON.stringify(response);
					$.get( response.link, $.proxy(function( raw ) {
						var divided = this.divideSequence(raw, moleculeSequenceStringArr, response);
						
						$.ajax({
							url: 'http://bar.utoronto.ca/webservices/araport/api/bar_get_protein_sequence_by_identifier.php/search?identifier='+this.geneticElement.identifier+'.1&source=Araport',
							headers: {'Authorization': 'Bearer 481c6bccdd15656018751cbf8dbe0a2'},
							type: 'GET',
							timeout: 50000,
							error: $.proxy(function() {
								this.getConfig(data,response,divided.moleculeSequenceStringArr,divided.gaps);
							},this),
							success: $.proxy(function(summary) {
								if(summary.result&&summary.result.length>0){
									
									this.fullSequenceRawText = JSON.stringify(summary);
									var sequenceArr = summary.result[0].sequence.split("");
									this.getConfig(data,response,divided.moleculeSequenceStringArr,divided.gaps,sequenceArr);
								}
								else{
									this.getConfig(data,response,divided.moleculeSequenceStringArr,divided.gaps);
								}
							},this)});
					},this));
				}
				else{
					this.errorLoadingMessage="No molecule structure found for this gene";
					this.loadFinish();
				}
				
			},this))
			.fail($.proxy(function(d, textStatus, error) {
				this.errorLoadingMessage="No molecule structure found for this gene";
				this.loadFinish();
			},this)
			);
		},this));
		
	};
	
	
	/**
		* Loads a structure from a file URL.
		*
		* @param {String} fileURL The URL of the file containing the structure.
	*/
	Eplant.Views.MoleculeView.prototype.loadStructure = function(fileURL) {
		Jmol.script(this.applet, "load \"" + fileURL + "\";");
	};
	
	Eplant.Views.MoleculeView.prototype.structureLoaded = function() {
		// Finish loading
		this.loadFinish();
	};
	
	Eplant.Views.MoleculeView.prototype.createSettingDialog = function() {
		var options = {};
		options.content = this.divSetting[0];
		options.title="Molecule Viewer Options";
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.width = 320;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= false;
		//options.show=false;
		options.ok= $.proxy(function() {
			this.settingDialog.close();
		}, this);
		
		
		this.settingDialog = window.top.art.dialog(options);
		//this.settingDialog.close();
	};
	
	Eplant.Views.MoleculeView.prototype.createViewSpecificUIButtons = function() {
		/* Filter */
		this.settinggButton = new Eplant.ViewSpecificUIButton(
		"img/setting.png",		// imageSource
		"Molecule View Setting",		// description
		function(data) {		// click
			data.moleculeView.createSettingDialog();
		},
		{
			moleculeView: this
		}
		);
		this.viewSpecificUIButtons.push(this.settinggButton);
	}
	
	Eplant.Views.MoleculeView.prototype.getConfig = function(data,response,moleculeSequenceStringArr,gaps,sequenceArr) {
		/*var str = 'content' + (++this.geneticElement.identifier);
		$('#root').append('<div id="' + str + '" class="content">' + this.geneticElement.identifier + '</div>');*/
		window['oMolViewer' + this.geneticElement.identifier];
		var clone = $(data).clone();
		
		this.divSetting = $(clone).find('#divMoleculeSetting');
		this.divSetting.attr('id', "divMoleculeSetting" + this.geneticElement.identifier);
		$(clone).find('#divMenuRight').attr('id', "divMenuRight" + this.geneticElement.identifier);
		$(clone).find('#divMenu').attr('id', "divMenu" + this.geneticElement.identifier);
		$(clone).find('#divJmolcontent').attr('id', "divJmolcontent" + this.geneticElement.identifier);
		$(clone).find('#btnReset').attr('id', "btnReset" + this.geneticElement.identifier);
		$(clone).find('#protSeq').attr('id', "protSeq" + this.geneticElement.identifier);
		$(clone).find('#divSeqContainer').attr('id', "divSeqContainer" + this.geneticElement.identifier);
		$(clone).find('#SeqSlider').attr('id', "SeqSlider" + this.geneticElement.identifier);
		$(clone).find('#btnDefaultColor').attr('id', "btnDefaultColor" + this.geneticElement.identifier);
		$(clone).find("input:radio[name='feature']").attr('name', "feature" + this.geneticElement.identifier);
		$(clone).find('#rd1').attr('id', "rd1a" + this.geneticElement.identifier);
		$(clone).find('#rd2').attr('id', "rd2a" + this.geneticElement.identifier);
		$(clone).find("[for='rd1']").attr('for', "rd1a" + this.geneticElement.identifier);
		$(clone).find("[for='rd2']").attr('for', "rd2a" + this.geneticElement.identifier);
		$(clone).find('#cchain').attr('id', "cchain" + this.geneticElement.identifier);
		$(clone).find('#cstruc').attr('id', "cstruc" + this.geneticElement.identifier);
		$(clone).find('#cgroup').attr('id', "cgroup" + this.geneticElement.identifier);
		$(clone).find("[for='cchain']").attr('for', "cchain" + this.geneticElement.identifier);
		$(clone).find("[for='cstruc']").attr('for', "cstruc" + this.geneticElement.identifier);
		$(clone).find("[for='cgroup']").attr('for', "cgroup" + this.geneticElement.identifier);
		$(clone).find("input:radio[name='color']").attr('name', "color" + this.geneticElement.identifier);
		$(clone).find('#opaque').attr('id', "opaque" + this.geneticElement.identifier);
		$(clone).find("[for='opaque']").attr('for', "opaque" + this.geneticElement.identifier);
		$(clone).find('#translucent').attr('id', "translucent" + this.geneticElement.identifier);
		$(clone).find("[for='translucent']").attr('for', "translucent" + this.geneticElement.identifier);
		$(clone).find("input:radio[name='pSpeed']").attr('name', "pSpeed" + this.geneticElement.identifier);
		$(clone).find('#ps1').attr('id', "ps1" + this.geneticElement.identifier);
		$(clone).find('#ps2').attr('id', "ps2" + this.geneticElement.identifier);
		$(clone).find('#ps3').attr('id', "ps3" + this.geneticElement.identifier);
		$(clone).find('#ps4').attr('id', "ps4" + this.geneticElement.identifier);
		$(clone).find('#ps5').attr('id', "ps5" + this.geneticElement.identifier);
		$(clone).find('#ps6').attr('id', "ps6" + this.geneticElement.identifier);
		$(clone).find('#ps7').attr('id', "ps7" + this.geneticElement.identifier);
		$(clone).find('#ps8').attr('id', "ps8" + this.geneticElement.identifier);
		$(clone).find("[for='ps1']").attr('for', "ps1" + this.geneticElement.identifier);
		$(clone).find("[for='ps2']").attr('for', "ps2" + this.geneticElement.identifier);
		$(clone).find("[for='ps3']").attr('for', "ps3" + this.geneticElement.identifier);
		$(clone).find("[for='ps4']").attr('for', "ps4" + this.geneticElement.identifier);
		$(clone).find("[for='ps5']").attr('for', "ps5" + this.geneticElement.identifier);
		$(clone).find("[for='ps6']").attr('for', "ps6" + this.geneticElement.identifier);
		$(clone).find("[for='ps7']").attr('for', "ps7" + this.geneticElement.identifier);
		$(clone).find("[for='ps8']").attr('for', "ps8" + this.geneticElement.identifier);
		$(clone).find("input:radio[name='quality']").attr('name', "quality" + this.geneticElement.identifier);
		$(clone).find('#mq').attr('id', "mq" + this.geneticElement.identifier);
		$(clone).find('#hq').attr('id', "hq" + this.geneticElement.identifier);
		$(clone).find("[for='mq']").attr('for', "mq" + this.geneticElement.identifier);
		$(clone).find("[for='hq']").attr('for', "hq" + this.geneticElement.identifier);
		$(clone).find("input:radio[name='spin']").attr('name', "spin" + this.geneticElement.identifier);
		$(clone).find('#sOff').attr('id', "sOff" + this.geneticElement.identifier);
		$(clone).find('#sOn').attr('id', "sOn" + this.geneticElement.identifier);
		$(clone).find("[for='sOff']").attr('for', "sOff" + this.geneticElement.identifier);
		$(clone).find("[for='sOn']").attr('for', "sOn" + this.geneticElement.identifier);
		$(clone).find("input:radio[name='slab']").attr('name', "slab" + this.geneticElement.identifier);
		$(clone).find('#std').attr('id', "std" + this.geneticElement.identifier);
		$(clone).find('#bhalf').attr('id', "bhalf" + this.geneticElement.identifier);
		$(clone).find('#fhalf').attr('id', "fhalf" + this.geneticElement.identifier);
		$(clone).find('#middle50').attr('id', "middle50" + this.geneticElement.identifier);
		$(clone).find('#middle20').attr('id', "middle20" + this.geneticElement.identifier);
		$(clone).find("[for='std']").attr('for', "std" + this.geneticElement.identifier);
		$(clone).find("[for='bhalf']").attr('for', "bhalf" + this.geneticElement.identifier);
		$(clone).find("[for='fhalf']").attr('for', "fhalf" + this.geneticElement.identifier);
		$(clone).find("[for='middle50']").attr('for', "middle50" + this.geneticElement.identifier);
		$(clone).find("[for='middle20']").attr('for', "middle20" + this.geneticElement.identifier);
		var config = {
			CSS: {
				IDs: {
					parentDivId: 'content' + this.geneticElement.identifier,
					jmolcontent: 'divJmolcontent' + this.geneticElement.identifier,
					btnReset: 'btnReset' + this.geneticElement.identifier,
					protSeq: 'protSeq' + this.geneticElement.identifier,
					jsMolViewer: 'oMolViewer' + this.geneticElement.identifier,
					seqSlider:'SeqSlider'+ this.geneticElement.identifier,
					divSeqContainer:'divSeqContainer'+ this.geneticElement.identifier,
					divMoleculeSetting:"divMoleculeSetting" + this.geneticElement.identifier,
					btnDefaultColor:'btnDefaultColor' + this.geneticElement.identifier,
					divMenu:'divMenu' + this.geneticElement.identifier,
					divMenuRight:'divMenuRight' + this.geneticElement.identifier
				},
				names: {
					rdFeature: 'feature' + this.geneticElement.identifier,
					color: 'color' + this.geneticElement.identifier,
					pSpeed: 'pSpeed' + this.geneticElement.identifier,
					quality: 'quality' + this.geneticElement.identifier,
					spin: 'spin' + this.geneticElement.identifier,
					slab: 'slab' + this.geneticElement.identifier
				}
			},
			application: {
				jMolObject: 'myJmol' + this.geneticElement.identifier,
				defaultLoadScript: "isDssp = false;set defaultVDW babel;" + "select protein or nucleic;cartoons Only;color \"#C9C9C9\";frank OFF;set disablePopupMenu false;" + "select *;zoom 70;translate x 5;translate y -5;display !water;" + "set platformSpeed 8; set cartoonFancy OFF; set highResolution OFF; set antialiasDisplay OFF;spin OFF;" + "select none; background HOVER \"#99cc00\"; color HOVER \"#FFFFFF\";",
				load: "load \""+response.link+"\""
			},
			callback:'Eplant.Views.MoleculeView.loadedFunctions.'+this.geneticElement.identifier+'_loaded',
			gaps:gaps,
			sequenceArr:sequenceArr,
			moleculeSequenceStringArr:moleculeSequenceStringArr,
			moleculeSequenceLen: response.sequence.length,
			moleculeView:this
		}
		var Info = {
			LoadStructCallback: "oMolViewer" + this.geneticElement.identifier + ".setControls",
			identifier:this.geneticElement.identifier
		}
		$(this.domContainer).html(clone);
		var viewer = new Eplant.Views.MoleculeView.Base(config, Info);
		this.balloons = viewer.config.balloons;
		this.overviewMarkers = viewer.config.overviewMarkers;
		
		
		this.applet= viewer.init();
		/* Create view-specific UI buttons */
		this.createViewSpecificUIButtons();
		
		
		
	};
	
	/*Eplant.Views.MoleculeView.prototype.updateDisplay = function() {
		for(var i=0;i<this.balloons.length;i++){
		
		}
		for(var i=0;i<this.overviewMarkers.length;i++){
		
		}
		
	};*/
	
	/**
		* Runs a Jmol script.
		*
		* @param {String} script The Jmol script to be run.
	*/
	Eplant.Views.MoleculeView.prototype.runScript = function(script) {
		if(this.applet){
			
			Jmol.script(this.applet, script);
		}
	};
	
	Eplant.Views.MoleculeView.prototype.resize = function(script) {
		if(this.applet){
			Jmol.resizeApplet(this.applet, "100%");
		}
	};
	
	Eplant.Views.MoleculeView.prototype.zoomIn = function() {
		
		if(this.applet){
			this.zoom+=5;
			Jmol.resizeApplet(this.applet, this.zoom);
		}
		
	};
	
	Eplant.Views.MoleculeView.prototype.zoomOut = function() {
		if(this.applet){
			this.zoom-=5;
			Jmol.resizeApplet(this.applet, this.zoom);
		}
		
	};
	
	Eplant.Views.MoleculeView.prototype.divideSequence = function(data, moleculeSequenceStringArr, response){
		var sequence = response.sequence;
		var firstSequenceNum = -1;
		var gaps = []
		var lines = data.split("\n");
		var currentLetters = lines[4].match(/[^ ]+/g)[3];
		for(var i =4, len = lines.length;i<len;i++){
			var split = lines[i].match(/[^ ]+/g);
			if(firstSequenceNum===-1){
				firstSequenceNum = Number(split[4]);
			}
			if(split&&split[3]!=currentLetters&&i+1<len){
				var currentPosition = [Number(split[5]),Number(split[6]),Number(split[7])];
				var split2 = lines[i+1].match(/[^ ]+/g);
				if(split2){
					var nextPosition = [Number(split2[5]),Number(split2[6]),Number(split2[7])];
					var distance = Math.sqrt(
					Math.pow((nextPosition[0]-currentPosition[0]),2)
					+Math.pow((nextPosition[1]-currentPosition[1]),2)
					+Math.pow((nextPosition[2]-currentPosition[2]),2)
					);
					if(distance>15){
						gaps.push("["+split[3]+"]"+split[4]+": ");
						var splitIndex = Number(split[4])-firstSequenceNum;
						if(moleculeSequenceStringArr.length<=0){
							moleculeSequenceStringArr[0]=sequence.substr(0, splitIndex);
							moleculeSequenceStringArr[1] = sequence.substr(splitIndex + 1);  // Gets the text part
						}
						else{
							var arrLen = moleculeSequenceStringArr.length;
							var lastPart = moleculeSequenceStringArr[arrLen-1]
							
							moleculeSequenceStringArr[arrLen-1]=lastPart.substr(0, splitIndex);
							moleculeSequenceStringArr[arrLen]=lastPart.substr(splitIndex + 1);
						}
					}
				}
				
			}
		}
		
		if(moleculeSequenceStringArr.length>0){
			var finalArr = [];
			var finalIndex = 0;
			for(var i =0, len = moleculeSequenceStringArr.length;i<len;i++){
				var subSequence = moleculeSequenceStringArr[i].match(/[-,]+|[a-zA-Z]+/g);
				if(subSequence){
					for(var j =0, jlen = subSequence.length;j<jlen;j++){
						finalArr[finalIndex]=subSequence[j];
						finalIndex++;
					}
				}
				else{
					finalArr[finalIndex]=moleculeSequenceStringArr[i];
					finalIndex++;
				}
				
			}
			moleculeSequenceStringArr = finalArr;
		}
		else{
			moleculeSequenceStringArr=sequence.match(/[-,]+|[a-zA-Z]+/g);
		}
		
		
		return {
			moleculeSequenceStringArr:moleculeSequenceStringArr,
			gaps:gaps
		};
		
	};
	
	
	/**
		* Gets the orientation / camera information of JSmol.
	*/
	Eplant.Views.MoleculeView.prototype.getOrientationInfo = function() {
		var orientationInfo = JSON.parse(Jmol.getPropertyAsJSON(this.applet, "orientationInfo") || "null");
		if (orientationInfo) {
			return orientationInfo.orientationInfo;
		}
		else {
			return null;
		}
	};
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.MoleculeView.prototype.active = function() {
		// Call parent method
		Eplant.View.prototype.active.call(this);
		
		/* Disable pointer events for ZUI canvas */
		ZUI.disablePointerEvents();
		//this.resize();
		$(this.domContainer).appendTo(Eplant.Views.MoleculeView.domContainer);
		// Make JSmol visible
		$(Eplant.Views.MoleculeView.domContainer).css({"visibility": "visible"});
		// Get JSmol canvas
		/*var canvas = document.getElementById(this.geneticElement.identifier+"_MoleculeViewJSmolApplet_canvas2d");
			
			// Pass input events to JSmol canvas
			ZUI.passInputEvent = $.proxy(function(event) {
			var e = new Event(event.type);
			for (var key in event) {
			e[key] = event[key];
			}
			canvas.dispatchEvent(e);
		}, this);*/
		
		
	};
	
	Eplant.Views.MoleculeView.prototype.afterActive = function() {
		Eplant.View.prototype.afterActive.call(this);
		this.runScript("zoom 70");
		
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.MoleculeView.prototype.inactive = function() {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);
		
		$(this.domContainer).appendTo(Eplant.Views.MoleculeView.domCacheContainer);
		// Hide JSmol
		$(Eplant.Views.MoleculeView.domContainer).css({"visibility": "hidden"});
		
		// Stop passing input events to JSmol
		ZUI.passInputEvent = null;
	};
	
	Eplant.Views.MoleculeView.prototype.downloadRawData = function() {
		
		var downloadString = "";
		var currentdate = new Date(); 
		var datetime = "This file contains raw data downloaded from ePlant on " + currentdate.getDate() + "/"
		+ (currentdate.getMonth()+1)  + "/" 
		+ currentdate.getFullYear() + " @ "  
		+ currentdate.getHours() + ":"  
		+ currentdate.getMinutes() + ":" 
		+ currentdate.getSeconds();
		downloadString+=datetime+"\n";
		var labelText = this.geneticElement.identifier;
		if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
			labelText += " / " + this.geneticElement.aliases.join(", ");
		}
		downloadString+=this.name+": "+labelText+"\n";
		
		downloadString+="URL: "+Eplant.urlForCurrentState()+"\n";
		downloadString+="JSON data: \n";
		if(this.moleculeModelRawText){
			downloadString+="\n\nMolecule Model Raw Data:\n";
			downloadString+=this.moleculeModelRawText;
		}
		
		if(this.fullSequenceRawText){
			downloadString+="\n\nFull Sequence Raw Data:\n";
			downloadString+=this.fullSequenceRawText;
		}
		
		if(this.CDDRawText){
			downloadString+="\n\nCDD Raw Data:\n";
			downloadString+=this.CDDRawText;
		}
		
		if(this.PfamRawText){
			downloadString+="\n\nPfam Raw Data:\n";
			downloadString+=this.PfamRawText;
		}
		
		if(this.SNPRawText){
			downloadString+="\n\nSNP Raw Data:\n";
			downloadString+=this.SNPRawText;
		}
		var blob = new Blob([downloadString], {type: "text/plain;charset=utf-8"});
		saveAs(blob, this.name+"-"+this.geneticElement.identifier+".txt");
		
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.MoleculeView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);		
		/*config.begin = $.proxy(function() {
			this.runScript("zoomto 0.2 500");
		},this);*/
		
		config.draw = $.proxy(function(elapsedTime, remainingTime, view, data) {
			this.runScript("zoom " + (400 / ZUI.camera._distance * 100));
			view.draw();
		},this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.MoleculeView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			this.runScript("zoom " + (400 / 10000 * 100));
			//this.runScript("zoomto 0.2 100");
		},this);
		config.draw = $.proxy(function(elapsedTime, remainingTime, view, data) {
			this.runScript("zoom " + (400 / ZUI.camera._distance * 100));
			view.draw();
		},this);
		return config;
	};
	
	/*
		* The remove function
	*/
	Eplant.Views.MoleculeView.prototype.remove = function() {
		//this.viewGeneID.remove();
		Eplant.View.prototype.remove.call(this);
		$(this.domContainer).remove();
		Eplant.Views.MoleculeView.loadedFunctions[this.geneticElement.identifier+'_loaded']=null;
	};
	Eplant.Views.MoleculeView.prototype.zoomIn = function() {
		this.zoom +=10;
		this.runScript("zoom " + this.zoom);
	};
	
	Eplant.Views.MoleculeView.prototype.zoomOut = function() {
		this.zoom -=10;
		this.runScript("zoom " + this.zoom);
	};
	
	
	
	
})();
