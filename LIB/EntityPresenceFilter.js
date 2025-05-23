function EntityPresenceFilter(...names) {
  if(names.length == 0) {
    throw new Error("EntityPresenceFilter.names must not be empty");
  }
  return Function(`return () => ((${names.map(name => `"${name}" in parent.entities`).join(" || ")}));`)();
}
module.exports = EntityPresenceFilter;