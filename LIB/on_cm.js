parent.socket.on("cm", function(a) {
  let name = a.name;
  let data = JSON.parse(a.message);
  // function on_cm(name, data) {
	if (group.includes(name) || to_party.includes(name)) {
		if (typeof data == "object") {
			if (data.command) {
				switch (data.command) {
					case "blink":
						blink(data.x, data.y)
						break;
					case "magiport":
						magiport(data.name)
						break;
					case "aggro":
						targeter.RemoveFromGreyList(data.name);
						say("Removed " + data.name + " from greylist for attacking " + data.defender)
						break;
					case "send_cm":
						send_cm(data.name, data.data);
						break;
					case "server":
						parent.switch_server(data.data);
						break;

				}
			}
		} else {
			switch (data) {
				case "shutdown":
					parent.shutdown()
					break;
				case "teleport":
					magiport(name);
					break;
				case "coords":
					const { x, y, map } = character,
						  command = "blink"
					send_cm(name, { x, y, map, command });
					break;
			}
		}
  }
});