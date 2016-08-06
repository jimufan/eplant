
/**
	* Eplant.ViewMode namespace
	*
	* This namespace contains view modes used in ePlant.
	*
	* @namespace
*/
Eplant.ViewModes= {};
Eplant.ViewModes.zui = $('#ZUI_container');
Eplant.ViewModes.home = $('#home_container');
Eplant.ViewModes.svg = $('#efp_holder');
Eplant.ViewModes.heatmap = $('#heatmap_container');
Eplant.ViewModes.sequence = $('#Sequence_cache');
Eplant.ViewModes.cytoscape = $('#Cytoscape_container');
Eplant.ViewModes.geneinfo = $('#GeneInfo_container');
Eplant.ViewModes.geneslider = $('#GeneSlider_container');
Eplant.currentViewModes = 'home';
Eplant.currentScreenshotContainer = $('#home_container');
/* Switch view mode */
Eplant.switchViewMode = function(mode) {
	if(Eplant.ViewModes[mode])
	{
		for (var viewMode in Eplant.ViewModes) {
			if (Eplant.ViewModes.hasOwnProperty(viewMode)&&viewMode!=="sequence") {
				$(Eplant.ViewModes[viewMode]).hide();
			}
		}
		
		$(Eplant.ViewModes[mode]).show();
		Eplant.currentViewModes = mode;
		if(Eplant.activeView){
			Eplant.screenShotBeforeRender= function() {};
			Eplant.screenShotOnRendered= function() {};
			
			switch(Eplant.activeView.viewName){
				case "WorldView":
				Eplant.currentScreenshotContainer = $('#World_container');
				break;
				case "HeatMapView":
				Eplant.screenShotBeforeRender = Eplant.activeSpecies.views.HeatMapView.removeActiveGeneRow;
				Eplant.screenShotOnRendered = Eplant.activeSpecies.views.HeatMapView.changeActiveGeneRow;
				Eplant.currentScreenshotContainer =  $(Eplant.ViewModes[Eplant.currentViewModes]);
				break;
				default:
				if(Eplant.currentViewModes ==='svg'){
					Eplant.currentScreenshotContainer = $('#efp_container');
				}
				else{
					
					Eplant.currentScreenshotContainer =  $(Eplant.ViewModes[Eplant.currentViewModes]);
				}
				break;
			}
			
		}
	}
};
Eplant.screenShotBeforeRender= function() {
};
Eplant.screenShotOnRendered = function() {
};
Eplant.screenShotForCurrent = function() {
	var $toPrint;
	if(Eplant.smallMultipleOn){
		$toPrint =$("#SmallMultipleContainer");
		$("#SmallMultipleContainer .smallMultiplesSvgImage").css({'border': '1px solid #aaaaaa'});
		$("#SmallMultipleContainer .smallMultiplesGeneTitle").css({"color":"#aaaaaa"});
	}
	else{
		$toPrint =  Eplant.currentScreenshotContainer;/*'#viewPort'*/;
	}
	var hiddenEles = [];
	var addedEles = [];
	if(Eplant.activeView.viewName==="SequenceView"){
		alert('SequenceView is linked to an outside service, the screenshot cannot be taken inside ePlant.')
		return;
	}
	
	
	var containerElement = document.createElement("div");
	$(containerElement).css({
		'position': 'absolute',
		bottom:'2%',
		left:'-50%',
		width:'80%',
		'margin-left': '65%',
		color:'grey',
		opacity:0.8
	});
	
	
	$(containerElement).enableSelection();
	containerElement.style.textAlign = "left";
	containerElement.innerHTML = "Loading citation...";
	var content = '';
	$.ajax({
		type: "GET",
		url: "cgi-bin/citation.cgi?view=" + ZUI.activeView.name,
		dataType: "json",
		timeout:3000,
		}).done(function(response) {
		
		content += "This image was  generated with the ePlant <i>" + Eplant.activeSpecies.scientificName + "</i> " + response.view + "  at bar.utoronto.ca by "+Eplant.Authours+" "+Eplant.Year+".";
		containerElement.innerHTML =content;
	})
	.fail(function(){
		containerElement.innerHTML ='No citation information available for this view.';
	})
	.always($.proxy(function(){
		
		if(Eplant.activeView.viewName==="MoleculeView"){
			var menu = $toPrint.find("#divMain");
			var menuRight = $toPrint.find("#divMenuRight");
			$(menu).hide();
			$(menuRight).hide();
			hiddenEles.push(menu);
			hiddenEles.push(menuRight);
			
			$(containerElement).css({
				bottom:'auto',
				top:'50px'
			});
		}
		/*
			var parent = $($toPrint).parent();
			var percent = Math.round(2048/$(window).width()*100)+'%';
			
			var domScreenshotContainer= document.createElement("div");
			addedEle.push(domScreenshotContainer);
			$(domScreenshotContainer).css({
			
			width: percent,
			'position': 'absolute',
			left: '0%',
			top: '0%',
			height:percent
			}).appendTo(document.body);
			
			$($toPrint).appendTo(domScreenshotContainer);
		*/
		if($('svg',$toPrint).length>0)
		{
			$('svg',$toPrint).each(function() {
				var c = document.createElement('canvas');
				$(c).css({
					left:0,//$(this).position().left,
					top:0,//$(this).position().top,
					width:'100%',//$(this).width(),
					height:'100%',//$(this).height(),
					position:'absolute'
				});
				var svgStr=(new XMLSerializer()).serializeToString(this);//$(this).html().replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/<canvas.+/g,"");
				$(this).parent().append(c);
				canvg(c,svgStr);
				addedEles.push(c);
				$(this).hide();
				hiddenEles.push(this);
			});	
		}
		if(containerElement.innerHTML !=='No citation information available for this view.'){
			
			$toPrint.append(containerElement);
			addedEles.push(containerElement);
		}
		Eplant.screenShotBeforeRender();
		html2canvas($toPrint, {
			useCors: true,
			//proxy: 'cgi-bin/html2canvas.php',
			onrendered: function(canvas) {
				if (canvas) {
					/* Create container DOM element */
					var domContainer= document.createElement("div");
					
					$(domContainer).css({
						'text-align': 'center'
					});
					
					Eplant.screenShotOnRendered();
					var imgUrl = canvas.toDataURL();
					var filename = $('#tabUl').find('.ui-tabs-active .fullTab').text();
					filename = filename.replace(':','');
					
					
					
					
					
					var img = $('<img />', { 
						src: imgUrl,
						alt: 'Screenshot'
						}).css({
						'max-width': '100%',
						'max-height': '100%',
						width: 'auto',
						height: 'auto'
					});
					var link = $('<a />', { 
						'download':filename,
						'href':imgUrl
					}).append(img);
					var domImageContainer= document.createElement("div");
					$(domImageContainer).css({
						'overflow': 'hidden',
						border: '1px solid #aaaaaa',
						margin: "0 10%"
					});
					$(domImageContainer).append(link);
					
					
					/* Create image container DOM element */
					
					
					/* Create title DOM element 
						var domTitle = $('<p>Screen Capture</p>');
						$(domTitle).css({
						'font-size': '30px',
						'line-height': '56px',
						color:'#000'
						});
					$(domContainer).append(domTitle)*/
					
					//$(domTitle).html("Right click on the image to download");
					
					
					/* Add title DOM element to the container */
					;
					$(domContainer).append(domImageContainer);
					
					var domOtherFormat = $('<div>');
					/* Set CSS class of title for styling */
					$(domOtherFormat).css({
						'font-size': '30px',
						'line-height': '56px',
						color:'#000'
					});
					
					/*var pdfLink = $('<a>PDF</a>').css({color:"#99cc00",margin:"0 5px"});
						$(pdfLink).click($.proxy(function(){
						//a4 size [ 595.28,  841.89]
						var imgWidth  = this.img.outerWidth();
						var imgHeight = this.img.outerHeight();
						var ratio = imgHeight/imgWidth;
						if(ratio>1.4){
						imgHeight = 841.89;
						imgWidth = 841.89/ratio;
						}else{
						imgHeight = 440*ratio;
						imgWidth = 440;
						}
						doc = new jsPDF({
						unit:'px', 
						format:'a4'
						});     
						doc.addImage(imgUrl, 'JPEG', 0, 0,imgWidth,imgHeight);
						doc.save(filename+'.pdf');
						},{img:img}));
					$(domOtherFormat).append(pdfLink);*/
					
					
					
					var pngLink = $('<a href="'+imgUrl+'" download="'+filename+'">Save PNG Image</a>').addClass("greenDownloadButton");
					/*$(pngLink).click(function(){
						canvas.toBlob(function(blob) {
						saveAs(blob, filename+".png");
						});
					});*/
					$(domOtherFormat).append(pngLink);
					
					if(Eplant.activeView&&Eplant.activeView.generateScreenshotSvgStr&&!Eplant.smallMultipleOn){
						var svgLink = $('<div>Save SVG Image</div>').addClass("greenDownloadButton");
						var svgStr = Eplant.activeView.generateScreenshotSvgStr(content);
						$(svgLink).click(function(){
							var blob = new Blob([svgStr], {type: "text/plain;charset=utf-8"});
							saveAs(blob, filename+".svg");
						});
						$(domOtherFormat).append(svgLink);
					}
					
					$(domContainer).append(domOtherFormat);
					
					DialogManager.artDialog(domContainer,{"title":"Screen Capture"});
					
					
					} else {
					alert("Sorry! Screen capture is not available for this view.");
				}
				//$toPrint.appendTo(parent);
				if(addedEles.length>0)
				{
					while(addedEles.length>0)
					{
						var c = addedEles.pop();
						$(c).remove();
					}
				}
				if(hiddenEles.length>0)
				{
					while(hiddenEles.length>0)
					{
						var c = hiddenEles.pop();
						$(c).show();
					}
				}
				
				if(Eplant.smallMultipleOn){
					Eplant.UpdateSmallMultiplesActiveGene();
				}
				
				/*$('svg',$toPrint).each(function() {
					$(this).show();
				});*/
				
			}
			
		});
	},this));
	
};

