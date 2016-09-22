'use strict';
var Orbat = class {
	constructor() {
		this.orbatName = '';
		this.hostility = '';
	}
	read(xml){
		function suborgs(element){
			var subs = [];
			for (var i in element.childNodes){
				if(element.childNodes[i].nodeName == version[xmlns].suborgs){			
					for (var j in element.childNodes[i].childNodes){
						if(element.childNodes[i].childNodes[j].nodeName == version[xmlns].organisation){
							var organisation = element.childNodes[i].childNodes[j];
							var o = {};
							o.name = organisation.getAttribute(version[xmlns].name);
							o.SIDC = organisation.getAttribute(version[xmlns].sidc);
							o.suborgs = suborgs(organisation);
							subs.push(o);
						}
					 }		
				}
			}
			return subs; 
		}
		if (typeof xml == 'string'){
			xml = (new DOMParser()).parseFromString(xml , "text/xml");	
		}
		var version = [];
		version["http://schemas.systematic.dk/2009/products/orbat-definition-v1"] = {
			organisation:	"org",
			suborgs: 		"suborgs",
			name: 			"name",
			sidc:			"symbolcode",
			hostility:		"hostility"}
		version["http://schemas.systematic.dk/2011/products/orbat-definition-v2"] = {
			organisation:	"Organisation",
			suborgs: 		"SubOrganisations",
			name: 			"Name",
			sidc:			"SymbolCode",
			hostility:		"Hostility"}
		version["http://schemas.systematic.dk/2011/products/orbat-definition-v3"] = {
			organisation:	"Organisation",
			suborgs: 		"SubOrganisations",
			name: 			"Name",
			sidc:			"SymbolCode",
			hostility:		"Hostility"}
	
		var xmlns = xml.firstChild.getAttribute("xmlns");
		this.orbatName = xml.firstChild.getAttribute(version[xmlns].name);
		this.hostility = xml.firstChild.getAttribute(version[xmlns].hostility);
		for (var i in xml.firstChild.childNodes){
			if(xml.firstChild.childNodes[i].nodeName == version[xmlns].organisation){
				var element = xml.firstChild.childNodes[i];
				this.name = element.getAttribute(version[xmlns].name);
				this.sidc = element.getAttribute(version[xmlns].sidc);
				this.suborgs = suborgs(element);
			}
		}
		return this;
	}
	write(){
		function toXML(obj){
			var xml = '';
			xml += '<Organisation Name="'+obj.name+'" SymbolCode="'+obj.sidc+'" SubSymbolCode="">\n';
			xml += '<CustomAttributes />\n<NominalHoldings />\n'
			//console.log(obj)
			var suborgs = obj.suborgs || obj._suborgs;
			if(suborgs){
				if(suborgs.length){
					xml += '<SubOrganisations>\n';
					for (var i in suborgs){
						xml += toXML(suborgs[i]);
					}
					xml += '</SubOrganisations>\n';
				}else{
					xml += '<SubOrganisations />\n';
				}
			}else{
				xml += '<SubOrganisations />\n';
			}
			xml += '</Organisation>\n'
			return xml;
		}
		var xml = '';
		xml += '<?xml version="1.0" encoding="utf-8"?>\n<Orbat xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" ModificationTime="'+(new Date().toISOString())+'" CreationTime="'+(new Date().toISOString())+'" Name="'+this.orbatName+'" Hostility="'+this.hostility+'" ParentRelationship="" xmlns="http://schemas.systematic.dk/2011/products/orbat-definition-v2">\n';
		xml += toXML(this);
		xml += '<HoldingTypes />\n<CustomAttributes />\n</Orbat>';
		return xml;
	}
}