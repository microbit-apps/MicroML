/**
* This is an example of making a screen with ui-core/ui-controls.
* Screens subclass ui.UiScreen, lay out ui-controls views, and draw
* custom content onto the DrawSurface in render().
*/
namespace micro_ml {
  export class ExampleMicroGUIScene extends ui.UiScreen {
    private boxRect: ui.Rect
    private title: string
    private text: string[]

    constructor(runtime: ui.UiRuntime) {
      super(runtime)
      this.backgroundColor = 3 // 3 = Pink in the default palette

      // A microgui-style TextBox: white shadow rect offset +2/+2,
      // coloured body, centred title, text lines below.
      this.boxRect = new ui.Rect(2, 2, 136, 60)
      this.title = "hi"
      this.text = ["Press micro:bit A btn"]

      // Manipulating the text after it's been created:
      let count = 0;
      input.onButtonPressed(1, () => {
        count++;
        this.text = ["" + count]
      })
    }

    activate() {
      super.activate();
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "cancel": {
          this.runtime.pop()
          return true
        }
      }

      return undefined
    }

    render(surface: ui.DrawSurface) {
      super.render(surface)

      surface.fillRect(
        new ui.Rect(this.boxRect.x + 2, this.boxRect.y + 2, this.boxRect.width, this.boxRect.height),
        15
      );
      surface.fillRect(this.boxRect, 2)

      surface.drawText(
        this.title,
        this.boxRect.x + ((this.boxRect.width - (this.title.length * bitmaps.font8.charWidth)) >> 1),
        this.boxRect.y + 4,
        { color: 1 }
      )

      this.text.forEach((line: string, index: number) => {
        surface.drawText(
          line,
          this.boxRect.x + 4,
          this.boxRect.y + 24 + (index * 10),
          { color: 1 }
        )
      })
    }
  }
}
