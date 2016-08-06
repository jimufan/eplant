(function() {

/**
 * Eplant.Views.PlantView class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * ePlant View for browsing gene expression data of plant tissues during development as eFP.
 *
 * @constructor
 * @augments Eplant.BaseViews.EFPView
 * @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
 */
Eplant.Views.PlantView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.PlantView;

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

	/* Call eFP constructor */
	var efpSvgURL = 'data/plant/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/plant/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});
};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.PlantView);	// Inherit parent prototype

Eplant.Views.PlantView.viewName = "PlantView";
Eplant.Views.PlantView.displayName = "Plant eFP";
Eplant.Views.PlantView.hierarchy = "genetic element";
Eplant.Views.PlantView.magnification = 20;
Eplant.Views.PlantView.description = "Plant eFP";
Eplant.Views.PlantView.citation = "";
Eplant.Views.PlantView.activeIconImageURL = "img/active/plant.png";
Eplant.Views.PlantView.availableIconImageURL = "img/available/plant.png";
Eplant.Views.PlantView.unavailableIconImageURL = "img/unavailable/plant.png";

})();
