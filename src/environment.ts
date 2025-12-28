import { Action, ActionManager, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;
    public ground;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        this.ground = MeshBuilder.CreateBox("ground", { size: 24 }, this._scene);
        this.ground.scaling = new Vector3(1, .02, 1);
    }
}