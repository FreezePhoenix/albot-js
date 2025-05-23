   
var attack_mode=true
const to_party = [
		"CuteBurn",
		"CuteFreeze",
		"Rael",
		"AriaHarper",
		"Daedulaus",
		"Firenus",
		"Boismon"
	],
      party_leader = "Firenus",
      socket = parent.socket;
const targets = {
 Firenus: ["crab"],
 Boismon: ["crab"],
 Daedulaus: ["crab"]
};
const gold_buffer = 40000;
setInterval(() => {
	if (character.map == "jail") {
		socket.emit("leave");
	}
	if (!can_move_to(character.x, character.y)) {
		// parent.use_skill("use_town")
	}
	if (character.name == party_leader) {
		for (let i = 1; i < to_party.length; i++) {
			let name = to_party[i];
			if (!(name in parent.party)) {
				send_party_invite(name);
			}
		}
	} else {
		if (character.party) {
			if (character.party != party_leader) {
				console.log(character.party);
				socket.emit("party", {
					event: "leave"
				});
			}
		} else {
			send_party_request(party_leader);
		}
	}
}, 1000)
socket.on("request", function({ name }) {
	console.log("Party Request");
	if (to_party.indexOf(name) != -1 && name != "AriaHarper") {
		accept_party_request(name);
	}
});

socket.on("invite", function({ name }) {
	console.log("Party Invite");
	if (to_party.indexOf(name) != -1) {
		accept_party_invite(name);
	}
});
setInterval(function(){
    use_hp_or_mp();
    loot();

    if(!attack_mode || character.rip || is_moving(character)) return;
  // console.log("targets: ", targets);
    var target=get_nearest_monster({type:targets[character.name][0], no_target: true});    
    
            
    if(!in_attack_range(target))
    {
    if(target == null) {
      // smart_move(targets[character.name][0])
    } else {
        //move(
        //    (character.real_x+target.x)/2,
        //    (character.real_y+target.y)/2
        //    );
        // Walk half the distance
    }
    }
    else if(can_attack(target))
    {
        set_message("Attacking");
        attack(target);
    }
},100); // Loops every 1/10th seconds.

const sendTarget = character.name == "Firenus" ? "AriaHarper" : "Firenus";
const toSend = ["cclaw", "crabclaw", "ringsj", "seashell", "hpamulet", "hpbelt", "wcap", "wpants", "suckerpunch",  "wattire", "wshoes", "gem0" , "gem1" , "shadowstone" , "ijx" , "beewings" , "candy1" , "candy0" , "x0" , "x1" , "x2" , "x3" , "x4" , "x5" , "x6" , "x7" , "x8" , "egg0" , "egg1" , "egg2" , "egg3" , "egg4" , "egg5" , "egg6" , "egg7" , "egg8" , "egg9" , "oranment" , "candycane" , "mistletoe" , "ornament" , "goldenegg" , "redenvelopev3" , "candypop" , "platinumnugget" , "wbreeches" , "lostearring" , "rattail" , "rfangs" , "cscale"];
setInterval(function(){
  
  // Leave these comments. They'll be useful later to you.

  for(let i = 0; i < 42; i++) {
    let item = character.items[i];
    // First, we make sure the item is actually an item, not an empty slot.
    // Then, we see if we want to send it. I.E. it's a trash item or a seashell.
    if(item != null && toSend.includes(item.name)) {
      // Send the item quantity if it has one, else default to 1.
      send_item(sendTarget, i, item.q || 1)
    }  
  }
  // if we have more than the buffer (I like 40K. BECAUSE.)
  if(character.gold > gold_buffer) {
    // then we send all the gold we have other than the buffer.
    send_gold(sendTarget, character.gold - gold_buffer);
  }
}, 5000);
function distance_to_point(x, y) {
	return Math.sqrt(
		Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2)
	);
}
function guard_post(location) {
	setInterval(() => {
		if(can_move_to(location.x, location.y) && distance_to_point(location.x, location.y) > 10) {
			move(location.x, location.y);
		} else if(!smart.moving && distance_to_point(location.x, location.y) > 10) {
			smart_move(location);
		}
	}, 1000);
}
switch(character.name) {
	case "Daedulaus":
		guard_post({x:-1202, y:-136})
		break;
	case "Firenus":
		guard_post({x:-1202,y:-66});
		break;
	case "Boismon":
		guard_post({x:-1202, y:4});
		break;
}