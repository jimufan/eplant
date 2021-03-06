(function() {
	
	/**
		* Eplant.PaletteDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Dialog for user to choose colors for an eFP view.
		*
		* @constructor
		* @param {Eplant.BaseViews.EFPView} eFPView The EFPView that owns this dialog.
	*/
	Eplant.PaletteDialog = function() {
		/* Attributes */
		this.domContainer = null;		// DOM container element
		this.domMinColorInput = null;		// DOM element for min color input
		this.domMidColorInput = null;		// DOM element for max color input
		this.domMaxColorInput = null;		// DOM element for max color input
		
		this.minColor = Eplant.minColor;
		this.midColor = Eplant.midColor;
		this.maxColor = Eplant.maxColor;
		/* Create DOM elements */
		this.createDOM();
		
		/* Create and open dialog */
		this.createDialog();
	};
	
	Eplant.PaletteDialog.prototype.setColors = function(min,mid,max) {
		$("#minColorInputText").val(min);
		$("#midColorInputText").val(mid);
		$("#maxColorInputText").val(max);
		$("#minColorInput").spectrum("set", min);
		$("#midColorInput").spectrum("set", mid);
		$("#maxColorInput").spectrum("set", max);
		this.minColor = min; // Minimum color
		this.midColor = mid; // Middle color
		this.maxColor = max; // Maximum color
	};
	
	Eplant.PaletteDialog.prototype.createPresetButton = function(min,mid,max) {
		var presetButton = $(document.createElement("div")).addClass('efp-color-preset');
		if(!Eplant.activeView.mode||Eplant.activeView.mode!=='absolute'){
			var presetButtonColor1 = $(document.createElement("div")).addClass('efp-color-preset-color').css({'background':min});
			$(presetButton).append(presetButtonColor1);
		}
		
		var presetButtonColor2 = $(document.createElement("div")).addClass('efp-color-preset-color').css({'background':mid});
		var presetButtonColor3 = $(document.createElement("div")).addClass('efp-color-preset-color').css({'background':max});
		$(presetButton).on('click',$.proxy(function(){
			this.setColors(min,mid, max);
		},this));
		$(presetButton).append(presetButtonColor2).append(presetButtonColor3)
		return $(presetButton);
		
	};
	
	/**
		* Creates DOM elements.
	*/
	Eplant.PaletteDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		
		/* Table */
		var table = document.createElement("table");
		$(table).width(300).css({
			'border-spacing': '0 5px',
		'border-collapse': 'separate'});
		
		$(this.domContainer).append(table);
		
		
		if(!Eplant.activeView.mode||Eplant.activeView.mode!=='absolute'){
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			/* Label */
			var label = document.createElement("label");
			$(label).html("Min Color");
			$(td).append(label);
			$(tr).append(td);
			td = document.createElement("td");
			/* Treshold input */
			this.domMinColorInput = document.createElement("input");
			$(this.domMinColorInput).width(60);
			$(this.domMinColorInput).addClass('colorPicker');
			$(this.domMinColorInput).attr('id','minColorInput');
			$(this.domMinColorInput).val(Eplant.minColor);
			$(td).append(this.domMinColorInput);
			this.domMinColorInputText = document.createElement("input");
			$(this.domMinColorInputText).addClass('paletteInput');
			$(this.domMinColorInputText).attr('id','minColorInputText');
			$(this.domMinColorInputText).val(Eplant.minColor);
			$(this.domMinColorInputText).change($.proxy(function(evt) {
				var input = $( evt.target ).val();
				var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input);
				if(isOk){
					$("#minColorInput").spectrum("set", input);
					this.minColor=input;
					}else{
					alert('Not a valid color.');
				}
			},this));
			
			$(td).append(this.domMinColorInputText);
			$(tr).append(td);
			$(table).append(tr);
		}
		
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		label = document.createElement("label");
		$(label).html("Zero Color");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		/* Treshold input */
		this.domMidColorInput = document.createElement("input");
		$(this.domMidColorInput).addClass('colorPicker');
		$(this.domMidColorInput).attr('id','midColorInput');
		$(this.domMidColorInput).val(Eplant.midColor);
		$(td).append(this.domMidColorInput);
		this.domMidColorInputText = document.createElement("input");
		$(this.domMidColorInputText).addClass('paletteInput');
		$(this.domMidColorInputText).attr('id','midColorInputText');
		$(this.domMidColorInputText).val(Eplant.midColor);
		$(this.domMidColorInputText).change($.proxy(function(evt) {
			var input = $( evt.target ).val();
			var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input);
			if(isOk){
				$("#midColorInput").spectrum("set", input);
				this.midColor=input;
				}else{
				alert('Not a valid color.');
			}
		},this));
		$(td).append(this.domMidColorInputText);
		$(tr).append(td);
		$(table).append(tr);
		
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		label = document.createElement("label");
		$(label).html("Max Color");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		/* Treshold input */
		this.domMaxColorInput = document.createElement("input");
		$(this.domMaxColorInput).width(60);
		$(this.domMaxColorInput).addClass('colorPicker');
		$(this.domMaxColorInput).attr('id','maxColorInput');
		$(this.domMaxColorInput).val(Eplant.maxColor);
		$(td).append(this.domMaxColorInput);
		this.domMaxColorInputText = document.createElement("input");
		$(this.domMaxColorInputText).addClass('paletteInput');
		$(this.domMaxColorInputText).attr('id','maxColorInputText');
		$(this.domMaxColorInputText).val(Eplant.maxColor);
		$(this.domMaxColorInputText).change($.proxy(function(evt) {
			var input = $( evt.target ).val();
			var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input);
			if(isOk){
				$("#maxColorInput").spectrum("set", input);
				this.maxColor=input;
				}else{
				alert('Not a valid color.');
			}
		},this));
		$(td).append(this.domMaxColorInputText);
		$(tr).append(td);
		$(table).append(tr);
		
		
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		label = document.createElement("label");
		$(label).html("Preset Colors");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		$(td).css({width:160});
		var div = document.createElement("div");
		$(div).css({width:160});
		$(td).append(div);
	/* Treshold input */
	$.getJSON( "data/presetColors.json", $.proxy(function( data ) {
		var presetColors = data;
		/* Create Choice objects for the SelectList */
		for (var n = 0; n < presetColors.length; n++) {
			/* Get Species */
			var presetColor = presetColors[n];
			
			this.createPresetButton(presetColor.minColor,presetColor.midColor, presetColor.maxColor).appendTo(div);
		}
	},this));
	
	$(tr).append(td);
	$(table).append(tr);
	/*this.domOk = document.createElement("input");
		$(this.domOk).attr("type", "button");
		$(this.domOk).css({"width":"100px"});
		$(this.domOk).addClass("button greenButton");
		$(this.domOk).val("OK");
		$(this.domContainer).append(this.domOk);
		$(this.domOk).on('click',$.proxy(function(event, ui) {
		
		Eplant.minColor= this.minColor;
		Eplant.midColor= this.midColor;
		Eplant.maxColor= this.maxColor;
		
		var event = new ZUI.Event("update-colors", Eplant, null);
		ZUI.fireEvent(event);
		
		if(Eplant.activeView.updateDisplay){
		Eplant.activeView.updateDisplay();
		}
		
		
		this.close();
		}, this));
		this.domCancel = document.createElement("input");
		$(this.domCancel).attr("type", "button");
		$(this.domCancel).css({"width":"100px"});
		$(this.domCancel).addClass("button greyButton");
		$(this.domCancel).val("Cancel");
		$(this.domContainer).append(this.domCancel);
		$(this.domCancel).on('click',$.proxy(function(event, ui) {
		this.close()
	}, this));*/
};



/**
	* Creates and opens the dialog.
*/
Eplant.PaletteDialog.prototype.createDialog = function() {
	/*$(this.domContainer).dialog({
		title: "Color Settings",
		width: 320,
		height: "auto",
		minHeight: 0,
		resizable: false,
		modal: true,
		open: $.proxy(function(event, ui) {
		$(".ui-dialog-titlebar-close").hide();
		$(".ui-dialog-buttonpane").css({'border-top-width':'0px'});
		if(!Eplant.activeView.mode||Eplant.activeView.mode!=='absolute'){
		$("#minColorInput").spectrum({
		clickoutFiresChange: true,
		color: this.minColor,
		change: $.proxy(function(color) {
		this.minColor =	color.toHexString(); // #ff0000
		},this)
		});
		}
		
		$("#midColorInput").spectrum({
		clickoutFiresChange: true,
		color: this.midColor,
		change: $.proxy(function(color) {
		this.midColor =	color.toHexString(); // #ff0000
		},this)
		});
		$("#maxColorInput").spectrum({
		clickoutFiresChange: true,
		color: this.maxColor,
		change: $.proxy(function(color) {
		this.maxColor =	color.toHexString(); // #ff0000
		},this)
		});
		}, this),	
		close: $.proxy(function(event, ui) {
		this.remove();
		}, this)
	});*/
	var options = {};
	options.content = this.domContainer;
	options.title = "Color Settings";
	options.lock = true;
	options.background = '#000'; 
	options.opacity = 0.6;
	options.width = 320;
	options.window = 'top'; 
	options.fixed= true; 
	options.drag= false;
	options.resize= false;
	options.init= $.proxy(function() {
		if(!Eplant.activeView.mode||Eplant.activeView.mode!=='absolute'){
			$("#minColorInput").spectrum({
				clickoutFiresChange: true,
				color: this.minColor,
				change: $.proxy(function(color) {
					this.minColor =	color.toHexString(); // #ff0000
				},this)
			});
		}
		
		$("#midColorInput").spectrum({
			clickoutFiresChange: true,
			color: this.midColor,
			change: $.proxy(function(color) {
				this.midColor =	color.toHexString(); // #ff0000
			},this)
		});
		$("#maxColorInput").spectrum({
			clickoutFiresChange: true,
			color: this.maxColor,
			change: $.proxy(function(color) {
				this.maxColor =	color.toHexString(); // #ff0000
			},this)
			// });
		}, this);
	}, this);
	options.close= $.proxy(function() {
		//this.remove();
	}, this);
	options.ok =$.proxy(function(event, ui) {
		Eplant.minColor= this.minColor;
		Eplant.midColor= this.midColor;
		Eplant.maxColor= this.maxColor;
		
		var event = new ZUI.Event("update-colors", Eplant, null);
		ZUI.fireEvent(event);
		
		/* Update eFP */
		if(Eplant.activeView.updateDisplay){
			Eplant.activeView.updateDisplay();
		}
		
		
		/* Close dialog */
		this.close();
		
	}, this);
	/*options.cancel = $.proxy(function(event, ui) {
		this.close();
	}, this);*/
	this.dialog = window.top.art.dialog(options);
};

/**
	* Closes the dialog.
*/
Eplant.PaletteDialog.prototype.close = function() {
	/* Close dialog */
	this.dialog.close();
};

/**
	* Removes the dialog.
*/
Eplant.PaletteDialog.prototype.remove = function() {
	/* Remove DOM elements */
	this.dialog.close();
};

})();
