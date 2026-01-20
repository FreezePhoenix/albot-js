/**
 * Created by Nexus on 30.07.2017.
 */
class BotUi {
	id = null;
	structure = null;
	element = null;
	data = {};

	constructor(id, structure) {
		this.id = id;
		this.structure = structure;
		this.elements = new Array(this.structure.length);
		for(let i = 0; i < this.elements.length; i++) {
			this.elements[i] = [];
		}
	}

	destroy() {
		var container = document.getElementById('botUIContainer');
		container.removeChild(this.element);
	}

	create() {
		var element = document.createElement('div');
		element.className = 'box';
		var html = '';
		for (var i in this.structure) {
			let struct = this.structure[i];
			let elements = this.elements[i];
			var { name, label, type } = struct;
			switch (type) {
				case 'text':
					elements.push(document.createElement('div'));
					elements.push(document.createElement('span'));
					elements.push(document.createElement('span'));
					let [textwrap, textlabel, textvalue] = elements;
					textwrap.classList.add(name, 'textDisplay', 'boxRow');
					textlabel.innerText = label + ": ";
					textwrap.appendChild(textlabel);
					textwrap.appendChild(textvalue);
					element.appendChild(textwrap);
					break;
				case 'outOfMax':
				case 'progressBar':
					let baroptions = struct.options ??= { color: 'green' };
					elements.push(document.createElement('div'));
					elements.push(document.createElement('div'));
					elements.push(document.createElement('div'));
					elements.push(document.createElement('span'));
					elements.push(document.createElement('span'));
					elements.push(document.createElement('div'));
					let [barwrap, barborder, bartext, barlabel, barvalue, bar] = elements;
					barwrap.classList.add(name, 'progressBarDisplay', 'boxRow');
					barborder.classList.add('border');
					bartext.classList.add('barLabel');
					barlabel.innerText = label + ": ";
					barvalue.innerText = "0%";
					bartext.appendChild(barlabel);
					bartext.appendChild(barvalue);
					barborder.appendChild(bartext);
					bar.classList.add('bar');
					bar.style.backgroundColor = baroptions.color;
					barborder.appendChild(bar);
					barwrap.appendChild(barborder);
					element.appendChild(barwrap);
					break;
				case 'breakdownBar':
					let bbaroptions = struct.options;
					elements.push(document.createElement('div'));
					elements.push(document.createElement('div'));
					elements.push(document.createElement('div'));
					elements.push(document.createElement('span'));
					elements.push(document.createElement('span'));
					
					for(let i = 0; i < bbaroptions.colors.length; i++) {
						elements.push(document.createElement('div'));
					}

					let [bbarwrap, bbarborder, bbartext, bbarlabel, bbarvalue, ...bbar] = elements;
					bbarwrap.classList.add(name, 'progressBarDisplay', 'boxRow');
					bbarborder.classList.add('border');
					bbartext.classList.add('barLabel');
					bbarlabel.innerText = label + ": ";
					bbarvalue.innerText = "0";
					bbartext.appendChild(bbarlabel);
					bbartext.appendChild(bbarvalue);
					bbarborder.appendChild(bbartext);

					for(let i = 0; i < bbar.length; i++) {
						bbar[i].style.backgroundColor = bbaroptions.colors[i];
						bbar[i].title = bbaroptions.labels[i];
						bbar[i].classList.add('bar');
						bbarborder.appendChild(bbar[i]);
					}
					bbarwrap.appendChild(bbarborder);
					element.appendChild(bbarwrap);
					break;
				case 'object':
					// No preperation at all
					break;
			}
		}
		this.element = element;
		var container = document.getElementById('botUIContainer');
		container.appendChild(element);
	}

	render() {
		for (var i in this.structure) {
			var name = this.structure[i].name;
			var type = this.structure[i].type;
			var value = this.data[name];
			let elements = this.elements[i];
			if (value === undefined) continue;
			switch (type) {
				case 'text':
					elements[2].innerText = value;
					break;
				case 'outOfMax':
				case 'progressBar':
					if(typeof value == "object") {
						elements[4].innerText = value[0] + "%";
						elements[5].style.width = value[1] + "%";
					} else {
						elements[4].innerText = value;
						elements[5].style.width = value + "%";
					}
					break;
				case 'breakdownBar':
					let sum = 0;
					for (let j = 0; j < value.length; j++) {
						sum += value[j];
					}
					for (let j = 0; j < value.length; j++) {
						elements[5 + j].style.width = (value[j] / sum) * 100 + '%';
					}
					elements[4].innerText = sum;
					break;
				case 'object':
					if (window[name + value.key]) {
						Object.assign(window[name + value.key], value);
					} else {
						window[name + value.key] = Object.assign({}, value);
					}

					break;
			}
		}
	}

	update(data) {
		this.data = data;
		this.render();
	}

	updateProperty(name, value) {
		this.data[name] = value;
		this.render();
	}
}
