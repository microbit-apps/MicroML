/**
* Define a namespace for your project
* so you don't have to prepend it to everything.
*/
namespace example_project {
  // This import is really just a convenience to avoid having to prepend user_interface_base
  // Extensions and files are included when you list them inside pxt.json
  import AppInterface = user_interface_base.AppInterface
  import Scene = user_interface_base.Scene
  import SceneManager = user_interface_base.SceneManager

  // Application configuration:
  user_interface_base.getIcon = (id: string) => icons.get(id)
  user_interface_base.resolveTooltip = (ariaId: string) => ariaId

  export class App implements AppInterface {
    sceneManager: SceneManager

    constructor() {
      // One interval delay to ensure all static constructors have executed.
      basic.pause(5)

      this.sceneManager = new SceneManager()

      // Progress to the next scene if the arcade shield is present:
      if (shieldhelpers.shieldPresent())
        this.pushScene(new example_project.Home(this));
    }

    public pushScene(scene: Scene) {
      this.sceneManager.pushScene(scene)
    }

    public popScene() {
      this.sceneManager.popScene()
    }

    // Stub to satisfy AppInterface. You can implement as needed:
    public save(slot: string, buffer: Buffer): boolean {
      return true;
    }

    // Stub to satisfy AppInterface. You can implement as needed:
    public load(slot: string): Buffer {
      return Buffer.create(0)
    }
  }
}
