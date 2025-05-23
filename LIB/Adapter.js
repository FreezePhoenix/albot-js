function Adapter(...properties) {
  return Function("object", ...properties, properties.map((initial) => {
    return "\tobject." + initial + " = " + initial + ";" 
  }).join("\n") + "return object");
}
module.exports = Adapter;