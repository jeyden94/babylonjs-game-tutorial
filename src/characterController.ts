import { ArcRotateCamera, Camera, Mesh, Scene, ShadowGenerator, TransformNode, Vector3 } from "@babylonjs/core";
import { ThinParticleSystem } from "@babylonjs/core/Particles/thinParticleSystem";

export class Player extends TransformNode {
    public camera: Camera;
    public scene: Scene;
    private _input: any;

    // Player
    public mesh: Mesh; // outer collisionbox of player

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setUpPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); // the player mesh will cast shadows

        this._input = input; // inputs we will get from inputController.ts
    }

    private _setUpPlayerCamera() {
        var camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0, 3, 0), this.scene);
    }
}