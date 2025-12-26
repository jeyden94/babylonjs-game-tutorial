import { ArcRotateCamera, Camera, Mesh, Scene, ShadowGenerator, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import { ThinParticleSystem } from "@babylonjs/core/Particles/thinParticleSystem";

export class Player extends TransformNode {
    public camera: UniversalCamera;
    public scene: Scene;
    private _input: any;

    // Camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

    // Player
    public mesh: Mesh; // outer collisionbox of player

    // const values
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setUpPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); // the player mesh will cast shadows

        this._input = input; // inputs we will get from inputController.ts
    }

    private _setUpPlayerCamera(): UniversalCamera {
        // root cam parent that handles positioning of the cam to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0); 
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        let yTilt = new TransformNode("ytilt");
        yTilt.rotation = Player.ORIGINAL_TILT;
        this._yTilt = yTilt;
        yTilt.parent = this._camRoot;

        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -60), this.scene);
        this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = 0.47350045992678597;
        this.camera.parent = yTilt;

        this.scene.activeCamera = this.camera;
        return this.camera;
        
    }

    private _updateCamera(): void {
        let centerPlayer = this.mesh.position.y + 2;
        this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4);
    }

}