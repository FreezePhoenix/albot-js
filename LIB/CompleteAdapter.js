/**
 * Complete adapter is a self-contained adapter. As soon as the adapter is garbage collected, so too is the associated object, if no other references are kept to it.
 */
function CompleteAdapter(...properties) {
  return Function(
    `const object = { ${properties
      .map((initial) => `${initial}: null`)
      .join(", ")} };\nreturn (${properties.join(",")}) => {\n${properties
      .map((initial) => `\tobject.${initial} = ${initial};`)
      .join("\n")}\n\treturn object;\n}`
  )();
}
module.exports = CompleteAdapter;
