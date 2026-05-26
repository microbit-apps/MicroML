namespace micro_ml {
  import GUIComponentScene = microgui.GUIComponentScene
  import GUIComponentAbstract = microgui.GUIComponentAbstract
  import GUIComponentAlignment = microgui.GUIComponentAlignment
  import TextBox = microgui.TextBox

  const nnModelInformation: GUIComponentAbstract = new TextBox({
    alignment: GUIComponentAlignment.TOP_LEFT,
    isActive: false,
    title: "Title Text :)", // optional arg
    text: ["Press micro:bit A btn"], // optional arg
    colour: 2, // optional arg; 2 = Red
    xScaling: 1.7, // optional arg
  });
}
