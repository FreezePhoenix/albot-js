/**
 * Created by Nexus on 30.07.2017.
 */
class BotUi {
    id = null;
    structure = null;
    element = null;
    constructor(id, structure) {
        this.id = id;
        this.structure = structure;
    }
    destroy() {
        var container = document.getElementById("botUIContainer");
        container.removeChild(this.element);
    };
    create() {
        var element = document.createElement("div");
        element.className = "box";
        var html = "";
        for (var i in this.structure) {
            var name = this.structure[i].name;
            var label = this.structure[i].label;
            var type = this.structure[i].type;
            var options = this.structure[i].options;
            switch (type) {
                case "text":
                    html += "<div class='" + name + " textDisplay boxRow'><div class='textDisplayLabel'>" + label + ": </div><div class='textDisplayValue'></div></div>";
                    break;
                case "progressBar":
                    if (!options)
                        options = {
                            color: "green"
                        };
                    html += "<div class='" + name + " progressBarDisplay boxRow'><div class='border'><div class='barLabel'>" + label + ": <div class='odometer value'>0%</div></div><div class='bar' style='background-color: " + options.color + "'> </div></div>  </div>";
                    break;
                case "image":
                    if (!options) {
                        options = {
                            width: 200,
                            height: 200
                        };
                    }
                    html += "<div class='" + name + " imageDisplay boxRow'> <img src='' style='width:" + options.width + "px;height:" + options.height + "px;'/> </div>";
    
                    break;
                case "graph":
                    //TODO implement later
                    break;
                case "button":
                    //TODO implement later
                    break;
          case "breakdownBar":
            // TODO: Implement later
            html += "<div class='" + name + " progressBarDisplay boxRow'><div class='border'>";
            html += "<div class='barLabel'>" + label + ": <div class='odometer value'>0</div></div>";
            
            for(let i = 0; i < options.colors.length; i++) {
              html += "<div class='bar' style='background-color: " + options.colors[i] + "' title='" + options.labels[i] + "'></div>"
            }
            html += "</div></div>";
            break;
                case "outOfMax":
                    if (!options)
                        options = {
                            color: "green"
                        };
                    html += "<div class='" + name + " progressBarDisplay boxRow'>  <div class='border'><div class='barLabel'>" + label + ": <div class='odometer value'>0</div></div><div class='bar' style='background-color: " + options.color + "'></div></div></div>";
                    break;
                case "object":
                    // No preperation at all
                    break;
            }
        }
        element.innerHTML = html;
        this.element = element;
        var container = document.getElementById("botUIContainer");
        container.appendChild(element);
    };
    render() {
        for (var i in this.structure) {
            var name = this.structure[i].name;
            var type = this.structure[i].type;
            var value = this.data[name];
            if (value === undefined)
                continue;
            var row = this.element.getElementsByClassName(name)[0];
            switch (type) {
                case "text":
                    row.getElementsByClassName("textDisplayValue")[0].textContent = value;
                    break;
                case "progressBar":
                    row.getElementsByClassName("bar")[0].style.width = value + "%";
                    row.getElementsByClassName("value")[0].textContent = value + "%";
                    break;
                case "image":
                    row.getElementsByTagName("img")[0].src = value;
                    break;
                case "graph":
                    //TODO implement later
                    break;
                case "breakdownBar":
                    let sum = 0;
                    for(let i = 0; i < value.length; i++) {
                        sum += value[i];
                    }
                    let BARS = row.getElementsByClassName("bar");
                    let VALUE = row.getElementsByClassName("value")[0];
                    for(let i = 0; i < value.length; i++) {
                        BARS[i].style.width = ((value[i] / sum) * 100) + "%";
                    }
                    VALUE.textContent = sum;
                    break;
                case "outOfMax":
                    row.getElementsByClassName("bar")[0].style.width = value[1] + "%";
                    row.getElementsByClassName("value")[0].textContent = value[0];
                    break;
                case "object":
                    if (window[name + value.key]) {
                        Object.assign(window[name + value.key], value);
                    } else {
                        window[name + value.key] = Object.assign({}, value);
                    }
    
                    break;
            }
        }
    
    };
    update(data) {
        this.data = data;
        this.render();
    };
    updateProperty(name, value) {
        this.data[name] = value;
        this.render();
    };
}