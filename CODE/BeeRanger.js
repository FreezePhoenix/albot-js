setInterval(() => {
for(let x in parent.entities) {
	let entity = parent.entities[x]
	if(entity.type == "monster" && !entity.has_death_wish) {
		if((entity.mtype == "bee") && character.mp > 500) {

			if(character.name == "Boismon") {
			  if(distance(character, entity) < distance(get_player("Daedulaus"), entity)) {
					entity.has_death_wish = true;
					use_skill("piercingshot", x);
				//break;
				}
			} else {
				if(distance(character, entity) < distance(get_player("Boismon"), entity)) {
					entity.has_death_wish = true;
					use_skill("piercingshot", x);
				}
			}
		}
	}
} // */
	//use_skill("piercingshot", "kouin");
	/*
	if(character.mp > 100) {
		if(get_player("yezzir")  && !get_player("yezzir").rip) {
			use_skill("piercingshot", "yezzir");
		}
		if(get_player("fathergreen") && !get_player("fathergreen").rip) {
			use_skill("piercingshot", "fathergreen");
		}
		if(get_player("kakaka") && !get_player("kakaka").rip) {
			use_skill("piercingshot", "kakaka");
		}
		if(get_player("kouin") && !get_player("kouin").rip) {
			use_skill("piercingshot", "kouin");
		}
	}*/

	// use_skill("piercingshot", "yezzir");
	if(can_use("use_mp") && character.max_mp - character.mp > 500) {
		use("mp");
	} else if(can_use("use_hp") && character.max_hp - character.hp > 500) {
		use("hp")
	}
}, 50);
setInterval(() => {
	if(character.mp > 100 && false) {
	if(get_player("Bobbi1")  && !get_player("Bobbi1").rip || true) {
			use_skill("piercingshot", "Bobbi1");
		}
		if(get_player("Bobbi2")  && !get_player("Bobbi2").rip || true) {
			use_skill("piercingshot", "Bobbi2");
		}
		if(get_player("Bobbi3")  && !get_player("Bobbi3").rip || true) {
			use_skill("piercingshot", "Bobbi3");
		}
	}
}, 500);
setInterval(() => {
	for(let x in parent.chests) {
		if(parent.chests[x].items) {
			parent.socket.emit("open_chest", {
				id: x
			});
		} else {
			// parent.destroy_sprite(parent.chests[x]);
			delete parent.chests[x];
		}
	}
}, 100);
setInterval(() => {
	for(let i = 0; i < character.items.length; i++) {
		let item = character.items[i];
		if(item?.name == "ringsj" || item?.name == "hpbelt" || item?.name == "hpamulet" || item?.name == "stinger") {
			parent.socket.emit("destroy",{num:i,q:1,statue:true});
		}
	}
}, 1000);