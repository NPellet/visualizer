

$(document).ready(function() {

$("#FormSpectacle").each(function() {

	var form = new BI.Forms.Form();

	var sectionMain = form.addSection(new BI.Forms.Section('main', {}, new BI.Title('Informations générales')));
	var group  = sectionMain.addFieldGroup(new BI.Forms.GroupFields.List('maingroup', {}));


	group.addField({type: 'Text', title: new BI.Title('Titre du spectacle'), name: 'spectacletitle'});


//	group.addField({type: 'Datetime', title: new BI.Title('Date du spectacle'), name: 'spectacledate'});



	comboCat = group.addField({type: 'Combo', title: new BI.Title('Catégorie'), name: 'spectaclecategory'});
	comboCat.implementation.setOptions(_allCat);



	comboSeasons = group.addField({type: 'Combo', title: new BI.Title('Saison'), name: 'spectacleseason'});
	comboSeasons.implementation.setOptions(_allSeasons);


	
	var affiche = group.addField({type: 'Uploader', placeholder: 'Glisser-lâcher l\'affiche ici', title: new BI.Title('Affiche'), name: 'spectacleaffiche'});
	affiche.implementation.setUploadURL('./plugins/terreauxspectacles/ajax/fileupload.php');

	section = form.addSection(new BI.Forms.Section('knowmore', {}, new BI.Title('En savoir plus')));	
	var group = section.addFieldGroup(new BI.Forms.GroupFields.Table('knowmoreurlgroup', {}));

	group.addField({type: 'Text', title: new BI.Title('Adresse URL'), name: 'url'});
	group.addField({type: 'Text', title: new BI.Title('Texte'), name: 'text'});

	

	var group = section.addFieldGroup(new BI.Forms.GroupFields.List('knowmorefilesgroup', {}));

	field = group.addField({type: 'Uploader', title: new BI.Title('Fichiers PDF'), name: 'moreinfosfile'});
	field.implementation.setUploadURL('./plugins/terreauxspectacles/ajax/fileupload.php');

	section = form.addSection(new BI.Forms.Section('links', {}, new BI.Title('Liens')));	
	var group = section.addFieldGroup(new BI.Forms.GroupFields.Table('links', {}));

	group.addField({type: 'Text', title: new BI.Title('Adresse URL'), name: 'linkurl'});
	group.addField({type: 'Text', title: new BI.Title('Texte'), name: 'linkdescr'});

	
	section = form.addSection(new BI.Forms.Section('revuepresse', {}, new BI.Title('Revue de presse')));	
	section = section.addSection(new BI.Forms.Section('revuepresseelement', { multiple: true }, new BI.Title('Element')));	
	var group = section.addFieldGroup(new BI.Forms.GroupFields.List('revueelement', {}));
	group.addField({type: 'Text', title: new BI.Title('Titre'), name: 'revuetitle'});
	group.addField({type: 'Text', title: new BI.Title('Adresse URL'), name: 'revuelinkurl'});
	group.addField({type: 'Date', title: new BI.Title('Date'), name: 'revuedate'});
	
	group.addField({type: 'Text', title: new BI.Title('Média'), name: 'revuemedia'});
	
	var field = group.addField({type: 'Uploader', title: new BI.Title('Fichier'), name: 'revuefile'});
	field.implementation.setUploadURL('./plugins/terreauxspectacles/ajax/fileupload.php');
		
/*

	var group = section.addFieldGroup(new BI.Forms.GroupFields.List('links', {}));

	group.addField({type: 'Text', title: new BI.Title('Adresse URL'), name: 'linkurl'});
	group.addField({type: 'Text', title: new BI.Title('Texte'), name: 'linkdescr'});
*/
	

	

	section = form.addSection(new BI.Forms.Section('texts', {}, new BI.Title('Textes')));	
	var group = section.addFieldGroup(new BI.Forms.GroupFields.List('textsgroup', {}));

	group.addField({type: 'Wysiwyg', title: new BI.Title('Description'), name: 'spectacledescr'});
	group.addField({type: 'Wysiwyg', title: new BI.Title('Distribution'), name: 'spectacledistr'});


	section = form.addSection(new BI.Forms.Section('salle', {}, new BI.Title('Salle de spectacle')));
	var group = section.addFieldGroup(new BI.Forms.GroupFields.List('salle', {}));

	
	var persons = _prices;
	
	var allPrices = {}, _allSalles = [];
	for(var k = 0; k < _salles.length; k++) {
		_allSalles.push({title: _salles[k].name, key: _salles[k].id });

		allPrices[_salles[k].id] = {categoryPerson: [], categoryPrice: [], price: []};
		for(var i = 0; i < persons.length; i++) {
			for(var j = 1; j < 5; j++) {
				if(_salles[k]['cat' + j]) {
					allPrices[_salles[k].id]["categoryPerson"].push(persons[i]);
					allPrices[_salles[k].id]["categoryPrice"].push(_salles[k]['cat' + j]);
					allPrices[_salles[k].id]["price"].push("");
				}
			}
		}
	}

	var comboSalles = group.addField({ type: "Combo", title: new BI.Title('Salle'), name: "salles"});
	comboSalles.implementation.setOptions(_allSalles);


	comboSalles.onChange(function(index, value) {
		groupPrices.emptyAllRows();
		groupPrices.fillJson(allPrices[value]);
	});
	

	var groupPrices = section.addFieldGroup(new BI.Forms.GroupFields.Table('pricelist', {}));
	categoryPerson = groupPrices.addField({ type: "Text", disabled: true, title: new BI.Title("Catégorie de personne"), name: "categoryPerson"});
	categoryPrice = groupPrices.addField({ type: "Text", disabled: true, title: new BI.Title("Catégorie de prix"), name: "categoryPrice"});
	price = groupPrices.addField({ type: "Text", disabled: true, title: new BI.Title("Prix"), name: "price"});




	section = form.addSection(new BI.Forms.Section('dates', {}, new BI.Title('Dates des représentations')));
	var group = section.addFieldGroup(new BI.Forms.GroupFields.Table('datesgroup', {}));

	group.addField({ type: 'Datetime', title: new BI.Title('Date'), name: 'datename'});
	chk = group.addField({ type: 'Checkbox', title: new BI.Title('Annulé'), name: 'canceled'});
	chk.implementation.setOptions({canceled: 'Annuler la date'});
	chk = group.addField({ type: 'Checkbox', title: new BI.Title('Complet'), name: 'full'});
	chk.implementation.setOptions({full: 'Date complète'});
	chk = group.addField({ type: 'Checkbox', title: new BI.Title('Formulaire de réservation'), name: 'formres'});
	chk.implementation.setOptions({form: 'Afficher un formulaire'});
	group.addField({ type: 'Text', title: new BI.Title('Lien de la billetterie'), name: 'linkticket'});
	group.addField({ type: 'Textarea', title: new BI.Title('Coordonnées de contact'), name: 'contact'});



	section = form.addSection(new BI.Forms.Section('support', {}, new BI.Title('Soutien')));
	var group = section.addFieldGroup(new BI.Forms.GroupFields.Table('supportgroup', {}));

	soutien = group.addField({ type: "Combo", multiple: true, title: new BI.Title('Liste des soutiens'), name: "supportelement"});
	soutien.implementation.setOptions(_soutien);

	var self = form;
	var save = new BI.Buttons.Button('Save', function() {
		window.setTimeout(function() {
			var val = self.getValueFull();
			$.post('./plugins/terreauxspectacles/ajax/save.php', {id: _id || null, value: JSON.stringify(val), name: val.sections.main[0].groups.maingroup[0].spectacletitle[0] }, function() {
				
				
				$("#FormSpectacle").html('<div class="Message Ok">Le spectace a correctement été enregistré</div>');
				
			})
		}, 1);
	});
		
	save.setColor('blue');
	form.addButtonZone().addButton(save);

	form.init($(this));
	form.afterInit();
	form.getTemplater().afterInit();

	
	form.fillJson(_spectacle);
});
});