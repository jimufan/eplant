
//http://stackoverflow.com/questions/8988855/include-another-html-file-in-a-html-file

// http://stackoverflow.com/questions/3402877/calling-a-function-defined-inside-jquery-ready-from-outside-of-it
var MolViewer = function(conf) {
	/**
		* http://www.w3.org/wiki/JavaScript_best_practices
		* configuration options
		* TODO working on this
	*/
	var config = {
		CSS : {
			/*
				* IDs used in the document
			*/
			IDs : {
				jmolcontent : 'divJmolcontent',
				btnReset : 'btnReset',
				viewOptions : 'viewOptions',
				PfamDomains : 'PfamDomains',
				CDDdomains : 'CDDdomains',
				protSeq : 'protSeq',
				divSeqSlider : 'divSeqSlider',
				draggableBar : 'draggableBar',
				divSeqTitle : 'divSeqTitle',
				divSeqContainner : 'divSeqContainner',
				fadeLeft : 'fadeLeft',
				fadeRight : 'fadeRight',
				svgContainner : 'svgContainner',
				btnCDDtryAgain : 'btnCDDtryAgain',
				btnPfamTryAgain : 'btnPfamTryAgain',
				jsMolViewer : 'oMolViewer'
			},
			/*
				* These are the names of the CSS classes
			*/
			classes : {
				foo : 'foo',
				bar : 'bar',		
			},
			/*
				* The name attribute
			*/
			names : {
				rdFeature : 'feature'		
			}
		},
		/*
			* Application settings
		*/
		application : {
			//the name to use to create the jmol object
			jMolObject : 'myJmol',
			//
			pfamUrlBar : 'http://bar.utoronto.ca/~gfucile/cdd3d/cgi-bin/PfamAnnot.cgi',
			//
			pfamUrlDev : 'ProxyServlet',
			//
			pfamParams : 'FASTAseq',
			//
			cddUrlBar : 'http://bar.utoronto.ca/~gfucile/cdd3d/cgi-bin/CDDannot.cgi',
			//
			cddUrlDev : 'ProxyServlet',
			//
			cddParams : 'FASTAseq',
			//Turn off DSSP; Set default Van der Waals to babel; Turn off space fill; 
			//Turn off wire frame; Turn on cartoons; Color structures; remove jsmol logo; disable popupmenu
			//Jmol.script(myJmol, 'select protein or nucleic;cartoons Only;color group; ');//set default structure visualization;
			defaultLoadScript :	"isDssp = false;set defaultVDW babel;"+
			"select protein or nucleic;cartoons Only;color gray;frank OFF;set disablePopupMenu true;"+
			"select protein or nucleic;cartoons Only;color gray;frank OFF;set disablePopupMenu true;"+
			"select *;zoom 70;translate x 5;translate y -5;display !water;",
			//
			resetColorsScript : 'select not (protein or nucleic); color cpk; select protein or nucleic; color gray;'
		}
		
	};
	$.extend(true, config, conf);
	
	var myJmolOb;
	var oldLogger;
	var xhrPool = []; //holds ajax request functions (to abort if necessary). http://jsfiddle.net/s4pbn/3/
	var mySequence = {}; //holds info from each residue
	var codeArray = {'ALA':'A','ARG':'R','ASN':'N','ASP':'D','CYS':'C','GLU':'E',
		'GLN':'Q','GLY':'G','HIS':'H','ILE':'I','LEU':'L','LYS':'K','MET':'M',
	'PHE':'F','PRO':'P','SER':'S','THR':'T','TRP':'W','TYR':'Y','VAL':'V'};
	
	/**
		* initial JSmol setup
	*/
	var Info = {
		color : "#FFFFFF", 	
		height : '100%', 		
		width : '100%',
		use : "HTML5",
		serverURL : "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
		src : null,
		LoadStructCallback : config.CSS.IDs.jsMolViewer+".setControls",
		script: "set defaultLoadScript '" + config.application.defaultLoadScript + "';load "+config.loadStructure||'=2HHB',
		//defaultModel : "=2HHB",//1MBN
		debug : false,
		disableJ2SLoadMonitor : true,
		//coverImage : "img/whiteOnePixel.gif",
		//boxmessage : "changinh",
		disableInitialConsole : true,//If set true, avoids the display of messages ('console') in the Jmol panel while the Jmol object is being built initially.
		addSelectionOptions : false	//if you want to display, below the Jmol object, a menu with options for loading structures from public databases
	}
	
	/**
		* 
	*/
	function init() {
		setLogger();
		console.log('initializing MolViewer');
		
	    //abort all running ajax requests
	    xhrPool.abortAll = function() {
	    	console.log('aborting all ajax requests');
	        $(this).each(function(idx, jqXHR) {
	            jqXHR.abort();
			});
	        $.xhrPool = [];
		};
	    
	    //default values for all ajax requests
	    $.ajaxSetup({
	        beforeSend: function(jqXHR) {
	            xhrPool.push(jqXHR);
			},
	        complete: function(jqXHR) {
	            var index = xhrPool.indexOf(jqXHR);
	            if (index > -1) {
	                xhrPool.splice(index, 1);
				}
			}
		});    
		
	    //set position of fades on sequence div every time windows is resized
	    $( window ).resize(function() {
	    	setBorderSequenceFades();
		});
	    
	    //create and put the jsmol on screen
	    //http://wiki.jmol.org/index.php/Jmol_JavaScript_Object/Functions
	    Jmol.setDocument(0);
	    myJmolOb =  Jmol.getApplet(config.application.jMolObject, Info);// creates the object but does not insert it
	    //myJmolOb = window[config.application.jMolObject];//used to have a reference to jMol object created above
		this.myJmolOb = myJmolOb;
	    $(jq(config.CSS.IDs.jmolcontent)).html(Jmol.getAppletHtml(myJmolOb));//insert the object in the page
		
	    //then add controls for Options
		$("input:radio[name="+config.CSS.names.rdFeature+"]").change(function() {
		    resetJsmolColors();
			fakeFunctions.removeAlignment();//remove the fake alignment if exist
			setBorderSequenceFades();//need to change the borders fade
			createSlider();//recreate slider without alignment - call this after call method to remove alignment 
		    switch($(this).val()) {
				case 'hydro':
		    	Jmol.script(myJmolOb, 'select hydrophobic; color mediumblue; '+
				'select polar; color red;wireframe 0.0; spacefill 0.0; select charged; color "#FFFF00";');
		        break;
				case 'temp':
		    	Jmol.script(myJmolOb, 'select all; color relativeTemperature; ');
		        break;
				case 'iso':
		    	alert('Sorry, this feature is still in development.');//TODO implement
		        break;
				default:
		    	break;
			}
		});
		
		$(jq(config.CSS.IDs.btnReset)).click(function(e) {
			reloadModel();
		});
	}
	
	/**
		* put console.log() in a div
	*/
	function setLogger() {
		oldLogger = console.log;
		var logger = document.getElementById('logger');
		if(logger){
			console.log = function(message) {
				//http://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome
				oldLogger.call(this, message);
				if (typeof message == 'object')
				logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br>';
				else
				logger.innerHTML += message + '<br>';
				
				scrollLoggerToBottom();
			}
		}
	}
	
	/**
		* 
	*/
	function ajaxGetCDDfeatures(fullseq){
		
		console.log('calling CDD ajax');
	    $(jq(config.CSS.IDs.CDDdomains)).empty().append("<span class='loading'>Loading CDD features</span>");
		
		$.ajax({
		    type: 'POST',
		    dataType: 'json',
		    url: config.application.cddUrlBar,
		    timeout: 25000,
		    data: { "url" : config.application.cddUrlBar,"FASTAseq": fullseq },
		    cache: false,
		    success: function(data, textStatus, jqXHR){
		    	console.log('fullseq '+fullseq+ " url " + config.application.cddUrlBar);
	    		$(jq(config.CSS.IDs.CDDdomains)).empty();
	    		console.log('cdd result from json:\n'+JSON.stringify(data));
	    		
	    		if(Object.keys(data).length==0){//empty
	    			$(jq(config.CSS.IDs.CDDdomains)).append("<span> No features found</span> <br/>");
	    			
					}else{
					
	    			$.each(data, function(key, value) {
	    				var numberPattern = /\d+/g;//only numbers
						
	    				var arIndex = value.match( numberPattern );//hold the indexes
	    				console.log('arIndex '+arIndex);
	    				for(x in arIndex){
	    					console.log('x '+x+' arIndex '+arIndex[x]);
						}
	    				key = key.replace(/ /g, "_")//need to change space to _ to use at ids
						
		    			$(jq(config.CSS.IDs.CDDdomains)).append("<span id='"+key +"span' class='radioMenu'><input type='radio' id='"+key+"' name='"+config.CSS.names.rdFeature+"' value='TODO' style='' ><label for='"+key+"'>"+ key+" (" +value+")</label></span>");
						
						$(jq(key)).click(function(e) {
							setResiduesByIndexes(e, arIndex);
							fakeFunctions.removeAlignment();
							fakeFunctions.fakeFullAlignment(mySequence.fullseq);
							createSlider();
						});
					});
				}
			},
		    error: function(xhr, textStatus, errorThrown){
				console.log('cdd request failed: '+xhr.responseText+'. textStatus: '+textStatus);
				if(textStatus==="abort") {
					$(jq(config.CSS.IDs.CDDdomains)).empty();
					}else if(textStatus==="timeout") {
					$(jq(config.CSS.IDs.CDDdomains)).empty().append("<span style='white-space: normal;'>CDD features loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnCDDtryAgain+"' style='margin: 10px;'>Try again</button>");  	    	    
					$(jq(config.CSS.IDs.btnCDDtryAgain)).click(function(e) {
						ajaxGetCDDfeatures(mySequence.fullseq);
					});
					}else{
					$(jq(config.CSS.IDs.CDDdomains)).empty().append("<span style='white-space: normal;'>CDD features loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnCDDtryAgain+"' style='margin: 10px;'>Try again</button>");   	    	    
					$(jq(config.CSS.IDs.btnCDDtryAgain)).click(function(e) {
						ajaxGetCDDfeatures(mySequence.fullseq);
					});
				}
			}
		});
		
	}
	
	/**
		* 
	*/
	function ajaxGetPfamDomains(fullseq){
		console.log('calling pfam at bar.utoronto.ca');
		
		$(jq(config.CSS.IDs.PfamDomains)).empty().append("<span class='loading' >Loading Pfam domains</span>");
		
		$.ajax({
		    type: 'POST',
		    dataType: 'json',
		    url: config.application.pfamUrlBar,
		    timeout: 25000,
		    data: {"FASTAseq" : fullseq, "url" : config.application.pfamUrlBar},
		    cache: false,
		    success: function(data, textStatus, jqXHR ){
		    	$(jq(config.CSS.IDs.PfamDomains)).empty();
				
	    		console.log('pfam result from json:');
	    		console.log(JSON.stringify(data));
	    		
	    		if(Object.keys(data).length==0){//empty
	    			$(jq(config.CSS.IDs.PfamDomains)).append("<span> Error loading domains</span> <br/>");
					}else{
		    		$.each(data, function(key, value) {
		    			console.log( 'key: '+key + " value:" + value +' PfamAnnot: '+value.PfamAnnot+' startIndex: '+value.startIndex+
						' endIndex: '+value.endIndex+' Expect: '+value.Expect+' domainName: '+value.domainName );
						
		    			$(jq(config.CSS.IDs.PfamDomains)).append("<span id='"+key+"span' class='radioMenu'><input type='radio' id='"+key +"' name='"+config.CSS.names.rdFeature+"' value='TODO' style=''><label for='"+key +"'>" + value.PfamAnnot+": " + value.startIndex+" - " + value.endIndex+" ("+value.domainName+")</label></span>");
		    			
		    			document.getElementById(key).addEventListener("click", function(){
		    				setColorByRange(value.startIndex, value.endIndex);
		    				fakeFunctions.removeAlignment();
		    				fakeFunctions.fakeFullAlignment(mySequence.fullseq);
		    				createSlider();
						});
					});
				}
			},
		    error: function(xhr, textStatus, errorThrown){
		    	console.log('Pfam request failed: '+xhr.responseText+'. textStatus: '+textStatus);
		    	if(textStatus==="abort") {
		    		$(jq(config.CSS.IDs.PfamDomains)).empty();
					}else if(textStatus==="timeout") {
		    		$(jq(config.CSS.IDs.PfamDomains)).empty().append("<span style='white-space: normal;'>Pfam domain loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnPfamTryAgain+"'>Try again</button>");   	            
		    		$(jq(config.CSS.IDs.btnPfamTryAgain)).click(function(e) {
		    			ajaxGetPfamDomains(mySequence.fullseq);
					});
					}else{
					$(jq(config.CSS.IDs.PfamDomains)).empty().append("<span style='white-space: normal;'>Pfam domain loading error. Try again?</span><br> <button class='greenbutton' id='"+config.CSS.IDs.btnPfamTryAgain+"'>Try again</button>");
					$(jq(config.CSS.IDs.btnPfamTryAgain)).click(function(e) {
		    			ajaxGetPfamDomains(mySequence.fullseq);
					});
				}
			}
		});
		
	}
	
	/**
		* 
	*/
	function scrollLoggerToBottom(){
		// http://www.w3schools.com/jsref/prop_element_scrollheight.asp
		//scroll to bottom
		$("#logger").scrollTop($('#logger').prop('scrollHeight'));
	}
	
	/**
		* select/unselect residue
	*/
	function setResidue(residueSpan) {
		//I'm getting the color from the first atom from the residue, I think that's enough
		var resColor = Jmol.evaluateVar( myJmolOb, "{"+$(residueSpan).attr("id")+"}[0].color " );
		
		if(mySequence[$(residueSpan).attr("id")].selected){
			$(residueSpan).removeClass('selected').addClass('deselected');
			Jmol.script(myJmolOb, 'select '+ $(residueSpan).attr("id") +' ; color {'+mySequence[$(residueSpan).attr("id")].previousColor+'};wireframe 0.0; spacefill off;');
			mySequence[$(residueSpan).attr("id")].selected=false;
			}else{
			mySequence[$(residueSpan).attr("id")].previousColor=resColor;
			$(residueSpan).removeClass('deselected').addClass('selected');
			Jmol.script(myJmolOb, 'select '+ $(residueSpan).attr("id") +' and (sidechain or alpha); color "#99cc00";wireframe 0.3; spacefill off;');
			mySequence[$(residueSpan).attr("id")].selected=true;
		}
	}
	
	/**
		* set color of residues by index
	*/
	function setResiduesByIndexes(domainSpan, arrayOfIndexes) {
		
		var jsmolCommand = ''; //holds string command to send to jsmol	
		resetJsmolColors();
		
		console.log('arrayOfIndexes: '+arrayOfIndexes.constructor.name );
		for (var i = 0; i < arrayOfIndexes.length; i++) {
			
			var y = arrayOfIndexes[i];
			var residueSpan = res[arrayOfIndexes[i]];
			
			jsmolCommand += 'select '+ residueSpan +' ; color "#CCE77B";';
		}
		
		console.log("command to send to jsmol: "+ jsmolCommand);
		Jmol.script(myJmolOb, jsmolCommand);
	}
	
	/**
		* 
	*/
	function resetJsmolColors(){
		Jmol.script(myJmolOb, config.application.resetColorsScript);//
	}
	
	/**
		* set color by range
	*/
	function setColorByRange(startIndex, endIndex) {
		
		var jsmolCommand = ''; //holds string command to send to jsmol
		resetJsmolColors();
		
		for(var i = startIndex-1; i<=endIndex-1; i++){
			var residueSpan = res[i];
			//I'm getting the color from the first atom from the residue, I think that's enough
			//Jmol.evaluateVar( myJmol, "{"+res[i]+" and *.CA}.color " );//get carbon alpha http://chemapps.stolaf.edu/jmol/docs/misc/atomInfo.txt
			var resColor = Jmol.evaluateVar( myJmolOb, "{"+residueSpan+"}[0].color " );		
			
			jsmolCommand += 'select '+ residueSpan +' ; color "#CCE77B";';
			
		}
		console.log("command to send to jsmol: "+ jsmolCommand);
		Jmol.script(myJmolOb, jsmolCommand);
	}
	
	/**
		* takes care of escaping non valid ID characters and places a "#" at the beginning of the ID string: $( jq( "some.id" ) )
		* http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
	*/
	function jq( myid ) {	 
	    return "#" + myid.replace( /(:|\.|\[|\]|,)/g, "\\\\$1" );	 
	}
	
	/**
		* Reloads current file, will trigger LoadStructCallback callback function
		* @param
		* @return
	*/
	function reloadModel(){
		xhrPool.abortAll();//stop all ajax calls
		$("input:radio").attr("checked", false);//remove checked radios buttons
		fakeFunctions.removeAlignment();//remove alignment make slider be created correctly
		Jmol.script(myJmolOb, 'load;');//load again the same structure
		
	}
	
	/**
		* 
	*/
	function setBorderSequenceFades(){
		var innerHeight = $(jq(config.CSS.IDs.protSeq)).innerHeight();
		
		$(jq(config.CSS.IDs.fadeLeft)).innerHeight(innerHeight);
		$(jq(config.CSS.IDs.fadeLeft)).position({
			of: $(jq(config.CSS.IDs.divSeqContainner)),
			my: "left top",
			at: "left"+" top",
			collision: "none"
		});
		
		$(jq(config.CSS.IDs.fadeRight)).innerHeight(innerHeight);
		$(jq(config.CSS.IDs.fadeRight)).position({
			of: $(jq(config.CSS.IDs.divSeqContainner)),
			my: "right top",
			at: "right"+" top",
			collision: "none"
		});
	}
	
	/**
		* 
	*/
	function createSlider(){
		return;//TODO remove
		
		//document.getElementById('divSeqSlider').style.backgroundImage = 'none';//remove if exists
		$(jq(config.CSS.IDs.divSeqSlider)).css("backgroundImage", "none");
		var svgContainer = d3.select(jq(config.CSS.IDs.divSeqSlider)).append("svg")
		.attr("id", config.CSS.IDs.svgContainner)
		.attr("width", 300).attr("height", 70)
		.attr("xmlns", 'http://www.w3.org/2000/svg');
		
		//Draw the h line top
		var hLine1 = svgContainer.append("line")
		.attr("x1", 10).attr("y1", 5)
		.attr("x2", 290).attr("y2", 5)
		.attr("stroke-width", 1).attr("stroke", "gray");
		
		//draw vertical lines
		if (mySequence.fullPipes && mySequence.fullPipes.length > 0) {
			
			var width = 280;// width of the line representing the sequence
			var size = mySequence.fullPipes.length;
			var step = width/size;
			var position = 10;//there is a margin of 10pixels from the div container
			
			for (var i = 0, len = mySequence.fullPipes.length; i < len; i++) {
				
				//mySequence.fullseq
				if(mySequence.fullPipes[i] === '|' ){
					svgContainer.append("line")
					.attr("x1", position).attr("y1", 5)
					.attr("x2", position).attr("y2", 45)
					.attr("stroke-width", 1).attr("stroke", "gray");
				}
				position += step;
			}
			
			//Draw the h line bottom
			var hLine2 = svgContainer.append("line")
			.attr("x1", 10).attr("y1", 45)
			.attr("x2", 290).attr("y2", 45)
			.attr("stroke-width", 1).attr("stroke", "gray");
		}
		
		//http://aghoshb.com/articles/jquery-getting-a-selected-elements-outer-html.html
		//http://stackoverflow.com/questions/6459398/jquery-get-html-of-container-including-the-container-itself
		//alert($(jq(config.CSS.IDs.svgContainner)).clone().wrapAll("<div/>").parent().html());
		//TODO improve- there is a bug puting the slider bar as position absolute and zindex=3 while loading different structures
		//the better way is to draw the svg as background image but I didn't find a way using D3js, so I first create as inline element
		//then I get the content and put as background, finally I remove the inline svg keeping just the svg as background
		var mySVG64 = window.btoa($(jq(config.CSS.IDs.svgContainner)).clone().wrapAll("<div/>").parent().html());		 
		document.getElementById(config.CSS.IDs.divSeqSlider).style.backgroundImage = "url('data:image/svg+xml;base64,"+mySVG64+" ')";
		document.getElementById(config.CSS.IDs.divSeqSlider).style.backgroundRepeat = "no-repeat";
		$(jq(config.CSS.IDs.svgContainner)).remove();
		
		//add the drag control	
		divSequenceWidth = $(jq(config.CSS.IDs.divSeqContainner)).width();
		divSeqW = $(jq(config.CSS.IDs.protSeq)).width();
		divwrapperWidth = $(jq(config.CSS.IDs.divSeqSlider)).width();
		draggable5 = $(jq(config.CSS.IDs.draggableBar)).width();
		draggable5Border = 2; //1px each side;
		total = draggable5 + draggable5Border;
		$(jq(config.CSS.IDs.draggableBar)).draggable({
			containment : "parent",
			axis : "x",
			opacity: 0.4,
			scroll: false,
			start: function(event, ui) {			        
			},
			drag: function(event, ui) {
				$(jq(config.CSS.IDs.divSeqContainner)).scrollLeft( (ui.position.left*(divSeqW-divSequenceWidth))/(divwrapperWidth-total) );
				//event.stopPropagation();
			},
			stop: function(event, ui) {
			}
		});
		
		$(jq(config.CSS.IDs.divSeqContainner)).on('scroll', function (event) {				
			var x = ($(this).scrollLeft());
			var now = parseInt($(jq(config.CSS.IDs.draggableBar)).css( "left" ));
			if(isNaN(now))
			now=0;
			var y = x-now;
			var diff = ((divwrapperWidth-total)*x)/(divSeqW-divSequenceWidth);
			var move = diff-now;
			document.getElementById(config.CSS.IDs.draggableBar).style.left = diff+"px";
		});
		
	}
	
	/**
		* callback method - set all controls related with jsmol protein structure
	*/
	function setControls(a,b,c,d,e,f,g,h){
		var aa = '' + a;	var bb = '' + b;	var cc = '' + c;
		var dd = '' + d;	var ee = '' + ee;	var ff = '' + ff;
		var gg = '' + gg;	var hh = '' + hh;
	    //console.log('aa: '+aa+'\n'+'bb: '+bb+'\n'+'cc: '+cc+'\n'+'dd: '+dd+'\n'+'ee: '+ee+'\n'+'ff: '+ff+'\n'+'gg: '+gg+'\n'+'hh: '+hh);
		
	    if(cc != 'zapped'){//avoid call twice, happens when load a new file using the input field
			
			var theSeq = Jmol.evaluateVar( myJmolOb, "show('residues')" );		
			res = theSeq.split("\n");//global var
			mySequence.sequenceArray = res; //holds array sequence one letter code
			console.log('res: '+res);
			var seqToShow ='';
			
			//transform 3 letter in 1 letter to call ajax
			var fullseq = '';
			for (var i=0; i<res.length; i++) {
				
				var matches = res[i].match(/\[(.*?)\]/);
				
				if (matches) {
				    if(codeArray[matches[1]])
					fullseq += codeArray[matches[1]];
				}			
			}
			console.log("1letterseq: "+fullseq);
			mySequence.fullseq = fullseq;
			//ajax call get Pfam domains
			ajaxGetPfamDomains(fullseq);
			//ajax call get CDD domains
			ajaxGetCDDfeatures(fullseq);
			
			for (var i=0; i<res.length; i++) {
				res1letter ='';		
				for (var x in codeArray){		
					if(res[i].indexOf(x) > -1){
						res1letter = codeArray[x];
						mySequence[res[i]]={oneLetterCode:codeArray[x],threeLetterCode:x,selected:false};
						
						break;
					}
				}
				if(res1letter.length){//only aminoacids, skip anything else (hem, h2o, etc)
					//seqToShow += "<span class='sequence deselected icon hint--top hint--success hint-rounded' id=\'"+res[i]+"\' data-hint=\'"+res[i]+"\' onclick=\'oMolViewer.setResidue(this);\'>"+res1letter+"</span>";				
					//removed hint
					seqToShow += "<span class='sequence deselected' id=\'"+res[i]+"\'  onclick=\'"+config.CSS.IDs.jsMolViewer+".setResidue(this);\'>"+res1letter+"</span>";
				}
			}
			
			//add space on both sides to show both sequence ends
			var fadeWidth = $('#fadeLeft, #fadeRight').width();
			var spanExtraSpace = "<span class='alignment' style='width: "+(fadeWidth/2)+"px;' ></span>";
			seqToShow = spanExtraSpace + seqToShow + spanExtraSpace;
			
			$(jq(config.CSS.IDs.divSeqTitle)).empty().append('Sequence');
			
			$(jq(config.CSS.IDs.protSeq)).empty().append(seqToShow);
			
			setBorderSequenceFades();
			
			//slider creation here
			createSlider();			
			//end of slider creation
			
			}else{//load a new structure takes time so remove all options from the older structure to avoid use old controls to interact with the new loaded structure
	    	$(jq(config.CSS.IDs.PfamDomains)).empty();
	    	$(jq(config.CSS.IDs.CDDdomains)).empty();
	    	$(jq(config.CSS.IDs.viewOptions)).empty();
	    	$(jq(config.CSS.IDs.protSeq)).empty();
		}
		Eplant.Views.MoleculeView.loadedFunctions[this.config.callback]();
		if(Eplant.Views.MoleculeView.fisrtLoad && Eplant.Views.MoleculeView.fisrtLoadDfd) Eplant.Views.MoleculeView.fisrtLoadDfd.resolve();
	}
	
	/**
		* TODO FAKE DATA, update to use real information
	*/
	var fakeFunctions = {
		/**
			* Generate fake alignment
			* Param is one aminoacid letter
		*/
		fakeAlignment : function(amino1letterCode){
			return;//TODO remove
			var randoms= [amino1letterCode, '', '', '', 'X'];// '' represents mismatch, X represents 'similar' aminoacid
			var randomnumber = Math.floor(Math.random()*5);//interval of 0-5
			var result = randoms[randomnumber];
			if(result == ''){
				return ['-',' '];//mismatch
				}else if(result == amino1letterCode){
				return[amino1letterCode, '|'];
				}else{
				return[result, ' '];
			}
			
		},
		
		/**
			* Generate fake alignment, 3x more changes of mismatch than match
			* Param is full sequence (1 letter aminoacid)
		*/
		fakeFullAlignment : function(seq){
			return;//TODO remove
			var pipes = '';
			var consensus = '';
			var fullConsensus = '';
			var fullPipes = '';
			for (var i = 0, len = seq.length; i < len; i++) {
				var resp = fakeFunctions.fakeAlignment(seq[i]);				
				pipes+="<span class='alignment' >"+resp[1]+"</span>";
				consensus+="<span class='alignment' >"+resp[0]+"</span>";
				fullConsensus += resp[0];
				fullPipes += resp[1];
			}
			
			//will be used to create slider
			mySequence.fullConsensus = fullConsensus;
			mySequence.fullPipes = fullPipes;
			
			pipes ="<span class='spanPipes' >"+pipes+"</span>";
			consensus ="<span class='spanConsensus' >"+consensus+"</span>";
			
			$(jq(config.CSS.IDs.protSeq)).append("<br>"+pipes+"<br>"+consensus);
			
			fakeFunctions.addBorderSpaces();
			setBorderSequenceFades();
			
		},
		
		//add space on both sides to show both sequence ends
		addBorderSpaces : function(){
			return;//TODO remove
			var fadeWidth = $('#fadeLeft, #fadeRight').width();
			var spanExtraSpace = "<span class='alignment' style='width: "+(fadeWidth/2)+"px;' ></span>";
			
			$( ".spanPipes" ).first().prepend(spanExtraSpace);
			$( ".spanPipes" ).last().append(spanExtraSpace);
			
			$( ".spanConsensus" ).first().prepend(spanExtraSpace);
			$( ".spanConsensus" ).last().append(spanExtraSpace);
		},
		
		
		removeAlignment : function(){
			return;//TODO remove
			$(jq(config.CSS.IDs.protSeq)+" .sequence").last().nextAll().remove();
			setBorderSequenceFades();
			mySequence.fullConsensus = null;
			mySequence.fullPipes = null;
		}
	}
	
	/**
		* put here functions and variables you want to be public
	*/
	return {
		oldLogger : oldLogger,
		showMessage : function() {
			// TODO
		},
		config : config,
		init : init,
		scrollLoggerToBottom : scrollLoggerToBottom,
		ajaxGetPfamDomains : ajaxGetPfamDomains,
		ajaxGetCDDfeatures : ajaxGetCDDfeatures,
		setResidue : setResidue,
		setResiduesByIndexes : setResiduesByIndexes,
		resetJsmolColors : resetJsmolColors,
		setColorByRange : setColorByRange,
		jq : jq,
		reloadModel : reloadModel,
		setControls : setControls,
		setBorderSequenceFades : setBorderSequenceFades,
		fakeFunctions : fakeFunctions,
		xhrPool : xhrPool,
		mySequence : mySequence,
		createSlider: createSlider
	};
};

// -----------------------------------------

var oMolViewer;	
$(document).ready(function() {
	
	
});
