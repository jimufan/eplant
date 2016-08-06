(function() {

/**
 * Eplant.BaseViews.EFPView.Legend class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * @constructor
 * @param {Eplant.BaseViews.EFPView} eFPView The EFPView that owns this legend.
 */
EFP.Legend = function(eFPView) {
	/* Attributes */
	this.eFPView = eFPView;			// Parent EFPView
	this.width = 300;				// Width of the legend
	this.height = 158;				// Height of the legend
	this.x = 10;					// X-coordinate position of the legend
	this.y = 10;	// Y-coordinate position of the legend
	this.isVisible = true;			// Whether the legend is visible
	this.domContainer = null;			// DOM container for the legend
	this.canvas = null;				// Canvas for drawing
	this.context = null;				// Canvas context

	/* Create DOM container */
	this.domContainer = document.createElement("div");
	$(this.domContainer).css({
		"pointer-events": "none",
		"position": "absolute",
		"left": this.x,
		"bottom": this.y,
		"width": this.width,
		"height": this.height
	});
	this.domContainer.ondragstart = function() {	// Disable dragging on the legend
		return false;
	};

	/* Create canvas */
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.context = this.canvas.getContext("2d");
	$(this.domContainer).append(this.canvas);
};

/**
 * Updates the legend.
 */
EFP.Legend.prototype.update = function() {
	/* Clear canvas */
	this.context.clearRect(0, 0, this.width, this.height);

	/* Distinguish eFP mode and draw legend */
	var titleText = "";
	var controlText = "";
	this.context.save();
	this.context.font = "10px Helvetica";
	if (this.eFPView.mode == "absolute") {
		/* Find maximum value */
		var max = this.eFPView.groups[0].mean;
		for (var n = 1; n < this.eFPView.groups.length; n++) {
			var group = this.eFPView.groups[n];
			if (group.mean > max) {
				max = group.mean;
			}
		}

		/* Get legend colors */
		var minColor = getColorComponents(this.eFPView.midColor);
		var maxColor = getColorComponents(this.eFPView.maxColor);

		/* Draw legend */
		var value = 0;
		var color = {
			red: minColor.red,
			green: minColor.green,
			blue: minColor.blue
		};
		for (var n = 0; n < 11; n++) {
			/* Color */
			this.context.fillStyle = makeColorString(Math.round(color.red), Math.round(color.green), Math.round(color.blue));
			this.context.fillRect(0, (10 - n) * 12 + 14, 16, 12);

			/* Label */
			this.context.fillStyle = '#000';
			this.context.fillText(Math.round(value * 100) / 100, 20, (10 - n) * 12 + 10 + 14);

			/* Calculate value and color for next iteration */
			value += max / 10;
			color.red += (maxColor.red - minColor.red) / 10;
			color.green += (maxColor.green - minColor.green) / 10;
			color.blue += (maxColor.blue - minColor.blue) / 10;
		}

		/* Set title and control texts */
		titleText = "Linear";
		controlText = "Absolute";
	}
	else if (this.eFPView.mode == "relative") {
		/* Find extremum log2 value */
		var extremum = Math.abs(log(this.eFPView.groups[0].mean / this.eFPView.groups[0].ctrlMean, 2));
		for (var n = 1; n < this.eFPView.groups.length; n++) {
			var group = this.eFPView.groups[n];
			var absLog2Value = Math.abs(log(group.mean / group.ctrlMean, 2));
			if (absLog2Value > extremum) {
				if (isNaN(absLog2Value) || !isFinite(absLog2Value)) {
				} else {
					extremum = absLog2Value;
				}
			}
		}

		/* Get legend colors */
		var minColor = getColorComponents(this.eFPView.minColor);
		var midColor = getColorComponents(this.eFPView.midColor);
		var maxColor = getColorComponents(this.eFPView.maxColor);

		/* Draw legend */
		/* -extremum to 0 */
		var value = -extremum;
		var color = {
			red: minColor.red,
			green: minColor.green,
			blue: minColor.blue
		};
		for (var n = 0; n < 5; n++) {
			/* Color */
			this.context.fillStyle = makeColorString(Math.round(color.red), Math.round(color.green), Math.round(color.blue));
			this.context.fillRect(0, (10 - n) * 12 + 14, 16, 12);

			/* Label */
			this.context.fillStyle = Eplant.Color.Black;
			this.context.fillText(Math.round(value * 100) / 100, 20, (10 - n) * 12 + 10 + 14);

			/* Calculate value and color for next iteration */
			value += extremum / 5;
			color.red += (midColor.red - minColor.red) / 5;
			color.green += (midColor.green - minColor.green) / 5;
			color.blue += (midColor.blue - minColor.blue) / 5;
		}
		/* 0 to extremum */
		value = 0;
		color = {
			red: midColor.red,
			green: midColor.green,
			blue: midColor.blue
		};
		for (var n = 5; n < 11; n++) {
			/* Color */
			this.context.fillStyle = makeColorString(Math.round(color.red), Math.round(color.green), Math.round(color.blue));
			this.context.fillRect(0, (10 - n) * 12 + 14, 16, 12);

			/* Label */
			this.context.fillStyle = '#000';
			this.context.fillText(Math.round(value * 100) / 100, 20, (10 - n) * 12 + 10 + 14);

			/* Calculate value and color for next iteration */
			value += extremum / 5;
			color.red += (maxColor.red - midColor.red) / 5;
			color.green += (maxColor.green - midColor.green) / 5;
			color.blue += (maxColor.blue - midColor.blue) / 5;
		}

		/* Set title and control texts */
		titleText = "Log2 Ratio";
		controlText = "Relative to control: " + (Math.round(this.eFPView.groups[0].ctrlMean * 100) / 100);
	}
	else if (this.eFPView.mode == "compare") {
		/* Find extremum log2 value */
		var extremum = Math.abs(log(this.eFPView.groups[0].mean / this.eFPView.compareEFPView.groups[0].mean, 2));
		for (var n = 1; n < this.eFPView.groups.length; n++) {
			var group = this.eFPView.groups[n];
			var compareGroup = this.eFPView.compareEFPView.groups[n];
			var absLog2Value = Math.abs(ZUI.Math.log(group.mean / compareGroup.mean, 2));
			if (absLog2Value > extremum) {
				extremum = absLog2Value;
			}
		}

		/* Get legend colors */
		var minColor = getColorComponents(this.eFPView.minColor);
		var midColor = getColorComponents(this.eFPView.midColor);
		var maxColor = getColorComponents(this.eFPView.maxColor);

		/* Draw legend */
		/* -extremum to 0 */
		var value = -extremum;
		var color = {
			red: minColor.red,
			green: minColor.green,
			blue: minColor.blue
		};
		for (var n = 0; n < 5; n++) {
			/* Color */
			this.context.fillStyle = makeColorString(Math.round(color.red), Math.round(color.green), Math.round(color.blue));
			this.context.fillRect(0, (10 - n) * 12 + 14, 16, 12);

			/* Label */
			this.context.fillStyle = Eplant.Color.Black;
			this.context.fillText(Math.round(value * 100) / 100, 20, (10 - n) * 12 + 10 + 14);

			/* Calculate value and color for next iteration */
			value += extremum / 5;
			color.red += (midColor.red - minColor.red) / 5;
			color.green += (midColor.green - minColor.green) / 5;
			color.blue += (midColor.blue - minColor.blue) / 5;
		}
		/* 0 to extremum */
		value = 0;
		color = {
			red: midColor.red,
			green: midColor.green,
			blue: midColor.blue
		};
		for (var n = 5; n < 11; n++) {
			/* Color */
			this.context.fillStyle = makeColorString(Math.round(color.red), Math.round(color.green), Math.round(color.blue));
			this.context.fillRect(0, (10 - n) * 12 + 14, 16, 12);

			/* Label */
			this.context.fillStyle = '#000';
			this.context.fillText(Math.round(value * 100) / 100, 20, (10 - n) * 12 + 10 + 14);

			/* Calculate value and color for next iteration */
			value += extremum / 5;
			color.red += (maxColor.red - midColor.red) / 5;
			color.green += (maxColor.green - midColor.green) / 5;
			color.blue += (maxColor.blue - midColor.blue) / 5;
		}

		/* Set title and control texts */
		titleText = "Log2 Ratio";
		controlText = "Relative to " + this.eFPView.compareEFPView.geneticElement.identifier;
	}

	/* Draw mask color */
	this.context.fillStyle = this.eFPView.maskColor;
	this.context.fillRect(0, 11 * 12 + 14, 16, 12);
	this.context.fillStyle = '#000';
	var text = "Masked";
	if (!this.eFPView.isMaskEnabled) {
		text += " (N/A)";
	}
	else if (this.eFPView.maskThreshold === null) {
		text += " (off)";
	}
	else {
		text += " (" + String.fromCharCode(8805) + (this.eFPView.maskThreshold * 100) + "% RSE)";
	}
	this.context.fillText(text, 20, 11 * 12 + 10 + 14);
	this.context.restore();

	/* Draw legend title and control texts */
	this.context.save();
	this.context.fillStyle = '#000';
	this.context.font = "12px Helvetica";
	this.context.fillText(titleText, 0, 10);
	this.context.fillText(controlText, 130, this.height - 1);
	this.context.restore();
};

/**
 * Attaches the legend to the view.
 */
EFP.Legend.prototype.attach = function() {
	$("#efp_container").append(this.domContainer);
};

/**
 * Detaches the legend to the view.
 */
EFP.Legend.prototype.detach = function() {
	$(this.domContainer).detach();
};

/**
 * Makes the legend visible.
 */
EFP.Legend.prototype.show = function() {
	this.isVisible = true;
	if (ZUI.activeView == this.eFPView) {
		this.attach();
	}
};

/**
 * Hides the legend.
 */
EFP.Legend.prototype.hide = function() {
	this.isVisible = false;
	if (ZUI.activeView == this.eFPView) {
		this.detach();
	}
};

/**
 * Removes the legend.
 */
EFP.Legend.prototype.remove = function() {
	/* Remove DOM elements */
	$(this.domContainer).remove();
};

})();
