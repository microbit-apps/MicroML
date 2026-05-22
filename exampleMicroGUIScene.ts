/**
* This is an example of making a scene with microgui.
* microgui is a nascent extension that endeavours to make it easier to develop complex scenes.
* It provides components that you can easily manipulate to make more complex scenes.
* If you have problems with microgui, please file an issue or reach out. https://github.com/microbit-apps/MicroGUI/issues
*/
namespace example_project {
  import AppInterface = user_interface_base.AppInterface

  // MicroGUI enables scenes to be made up of hetrogenous components:
  import GUIComponentScene = microgui.GUIComponentScene
  import GUIComponentAbstract = microgui.GUIComponentAbstract
  import GUIComponentAlignment = microgui.GUIComponentAlignment
  import TextBox = microgui.TextBox

  export class ExampleMicroGUIScene extends GUIComponentScene {
    constructor(app: AppInterface) {
      super({ app, colour: 3 }) // 3 = Pink in the default palette

      const simpleTextComponent: GUIComponentAbstract = new TextBox({
        alignment: GUIComponentAlignment.TOP_LEFT,
        isActive: false,
        title: "Title Text :)", // optional arg
        text: ["Press micro:bit A btn"], // optional arg
        colour: 2, // optional arg; 2 = Red
        xScaling: 1.7, // optional arg
      });

      // Cast the object to access TextBox-specific properties
      (simpleTextComponent as TextBox).title = "hi";

      // Manipulating a component after it's been created:
      let count = 0;
      input.onButtonPressed(1, function () {
        count++;
        (simpleTextComponent as TextBox).text = ["" + count];
      })

      this.components = [simpleTextComponent]
    }

    activate() {
      super.activate();
      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.B.id,
        () => {
          this.app.popScene()
        }
      )
    }

    draw() {
      super.draw()
    }
  }
}
