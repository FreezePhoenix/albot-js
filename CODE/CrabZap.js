var attack_mode = true;

setInterval(function () {
  if (character.mp < 2000 && can_use("mp")) {
    use_skill("mp");
  }
  loot();
  var target = get_nearest_monster();
  if (can_use("zapperzap")) {
    parent.socket.emit("skill", { name: "zapperzap", id: target.id });
    reduce_cooldown("zapperzap", character.ping * 2);
  }
  console.log(character.ping);
}, 200); // Loops every 1/4 seconds.
setInterval(() => {
  if (character.map === "jail") {
    parent.socket.emit("leave");
  }
  parent.ping();
}, 500);
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround
