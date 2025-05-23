let stand_analysis = {};
const analyze = () => {
  const buy = (stand_analysis.buy = {});
  const sell = (stand_analysis.sell = {});
  let max = 4;
  if (character.stand) {
    max = 30;
  }
  for (let i = 0; i++ < max; i) {
    let slot_id = "trade" + i;
    let slot = character.slots[slot_id];
    if (slot != null) {
      if (slot.b === true) {
        let analysis = (buy[slot.name] ??= []);
        analysis.push([slot_id, slot.price, slot.q ?? 1, slot.level ?? 0])
      } else {
        let analysis = (sell[slot.name] ??= []);
        analysis.push([slot_id, slot.price, slot.q ?? 1, slot.level ?? 0])
      }
    }
  }
};
module.exports.analysis = stand_analysis;
module.exports.analyze = analyze;
