'use strict';
var Orbat = class {
	constructor(){
		this.orbatName = '';
		this.hostility = '';
	}
	read(xml){
		function parseNode(element){
			var node = element.childNodes;
			var nodeName = '';
			var obj = {};
			for (var i in node) {
				if (node[i].nodeType == 1 && node[i].nodeName) {
					nodeName = node[i].nodeName.split(':')[1] || node[i].nodeName;
					if (node[i].childNodes.length == 1 && node[i].childNodes[0].nodeType == 3) {
						//this is a text node, get content
						obj[nodeName] = node[i].childNodes[0].nodeValue;
					}else{
						//this is a node with children, get all children
						obj[nodeName] = parseNode(node[i]);
					}
				}

			}			
			return obj;
		}

		this.orbatName = 'ORBAT';
		this.hostility = '';
		this.suborgs = [];
		var orgs = {};
		var nodeName = '';
		
		if (typeof xml == 'string'){
			xml = (new DOMParser()).parseFromString(xml , "text/xml");	
		}
		var organizations = xml.getElementsByTagName('Organizations').item(0).childNodes;
		var forcesides = {'Friendly':'','Hostile':'','Neutral':''}
		for (var i in organizations) {
			if (organizations[i].nodeType == 1) {
				nodeName = organizations[i].nodeName.toString().split(':')[1] || organizations[i].nodeName;
				/*if (nodeName == 'ForceSides') {
					var units = organizations[i].childNodes;
					for (var j in units) {
						if (units[i].nodeType == 1 && units[j].nodeName) {
							nodeName = units[j].nodeName.split(':')[1] || units[j].nodeName;
							if (nodeName == 'ForceSide') {
								var obj = parseNode(units[j]);
								orgs[obj.ObjectHandle] = obj;
								orgs[obj.ObjectHandle].sidc = obj.SymbolIdentifier;
								orgs[obj.ObjectHandle].name = obj.ForceSideName;
							}
						}
					}
				}*/
				if (nodeName == 'Units') {
					var units = organizations[i].childNodes;
					for (var j in units) {
						if (units[i].nodeType == 1 && units[j].nodeName) {
							nodeName = units[j].nodeName.split(':')[1] || units[j].nodeName;
							if (nodeName == 'Unit') {
								var obj = parseNode(units[j]);
								orgs[obj.ObjectHandle] = obj;
								var str = obj.SymbolIdentifier;
								orgs[obj.ObjectHandle].sidc = str.substr(0, 1) + 'F' + str.substr(1+1);
								orgs[obj.ObjectHandle].name = obj.UnitSymbolModifiers.UniqueDesignation;
							}
						}
					}
				}
				if (nodeName == 'Equipment') {
					var equipment = organizations[i].childNodes;
					for (var j in equipment) {
						if (equipment[i].nodeType == 1 && equipment[j].nodeName) {
							nodeName = equipment[j].nodeName.split(':')[1] || equipment[j].nodeName;
							if (equipment[j].nodeName == 'EquipmentItem') {
								var obj = parseNode(equipment[j]);
								orgs[obj.ObjectHandle] = obj;
								//orgs[obj.ObjectHandle].sidc = obj.SymbolIdentifier;
								var str = obj.SymbolIdentifier;
								orgs[obj.ObjectHandle].sidc = str.substr(0, 1) + 'F' + str.substr(1+1);
								orgs[obj.ObjectHandle].name = obj.EquipmentSymbolModifiers.UniqueDesignation;
							}
						}
					}
			
				}
			}
		}
		
		for (var i in orgs) {
			if (orgs[i].hasOwnProperty('Relations') && 
				orgs[i].Relations.OrganicSuperiorHandle &&
				orgs.hasOwnProperty(orgs[i].Relations.OrganicSuperiorHandle)) {
				//Parent exists
				var parent = orgs[i].Relations.OrganicSuperiorHandle;
				if (!orgs[parent].hasOwnProperty('suborgs')) orgs[parent].suborgs = [];
				orgs[parent].suborgs.push(orgs[i]);
			}else{
				//Parent dosen't exist, add at top level
				this.suborgs.push(orgs[i]);
			}
		}
		return this;
	}
}