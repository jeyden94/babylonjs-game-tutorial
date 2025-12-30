import { ArcRotateCamera, Tools, Camera, Mesh, Quaternion, Ray, Scene, ShadowGenerator, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import { ThinParticleSystem } from "@babylonjs/core/Particles/thinParticleSystem";

export class Player extends TransformNode {
    // public camera: UniversalCamera;
    public camera: ArcRotateCamera;
    public scene: Scene;
    private _input: any;

    // Camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;
    private _centered: boolean;
    private _centerCount: number;
    private _cameraTargetPosition: Vector3 = null;
    private _isCameraMoving: boolean = false;

    // Player
    public mesh: Mesh; // outer collisionbox of player

    // const values
    private static readonly PLAYER_SPEED: number = 0.45;

    // player movement variables
    private _deltaTime: number = 0;


    private _moveDirection: Vector3 = Vector3.Zero();

    private _atDestination: boolean = false;
    private _destination: Vector3 = new Vector3();
    private _pendingMoves: number;
    private _currentMove: Vector3 = new Vector3();


    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setUpPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");

        shadowGenerator.addShadowCaster(assets.mesh); // the player mesh will cast shadows

        this._input = input; // inputs we will get from inputController.ts
    }

    private _setUpPlayerCamera(): ArcRotateCamera {
        // root cam parent that handles positioning of the cam to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0); 
        this._camRoot.rotation = new Vector3(0, 0, 0);

        this.camera = new ArcRotateCamera(
            "camera", 
            Tools.ToRadians(90),   // alpha: keeps camera behind character
            Tools.ToRadians(60),   // beta: INCREASE this to look more downward (try 75-85)
            35,                     // radius: distance
            Vector3.Zero(), 
            this.scene
        );        
        
        this.camera.fov = 0.8;

        this.scene.activeCamera = this.camera;
        return this.camera;
        
    }

    private _updateCamera(): void {
        // Just set the target - let the render loop handle the movement
        this._cameraTargetPosition = new Vector3(
            this.mesh.position.x, 
            this.mesh.position.y + 2,
            this.mesh.position.z
        );
        this._isCameraMoving = true;
        this._centered = true;
        this._centerCount = 0;
    }

    private _moveCamera(): void {
        if (!this._isCameraMoving || !this._cameraTargetPosition) return;
        
        // Update target to current player position (so it tracks while moving)
        this._cameraTargetPosition.set(
            this.mesh.position.x,
            this.mesh.position.y + 2,
            this.mesh.position.z
        );
        
        let offset = this._cameraTargetPosition.subtract(this.camera.target);
        
        this.camera.target = Vector3.Lerp(
            this.camera.target,
            this._cameraTargetPosition,
            0.1
        );
        
        this.camera.position = this.camera.position.add(offset.scale(0.1));
        
        // Stop when close enough
        if (Vector3.Distance(this.camera.target, this._cameraTargetPosition) < 0.5) {
            this._isCameraMoving = false;
        }
    }

    private _updateFromMouseControls(): void {
        this._moveDirection = Vector3.Zero();
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;


        if (!this._input.clickMap || this._input.clickMap.length === 0) {
            if (this._input.centerKeyDown && this._centerCount > 0 && this._centered == false) {
                this._updateCamera();
            }
            return;
        }

        this._centered = false;
        this._centerCount = 1;

        this._currentMove = this._input.clickMap[0];

        let direction = this._currentMove.subtract(this.mesh.position);

        let distance = direction.length();

        let angle = Math.atan2(direction.x, direction.z);

        let normalizedDirection = direction.normalize();

        if (distance < 0.5) {
            this._input.clickMap.shift();
        }

        this._moveDirection = normalizedDirection.scale(Player.PLAYER_SPEED);

        let targetRotation = Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = Quaternion.Slerp(
            this.mesh.rotationQuaternion,
            targetRotation,
            10 * this._deltaTime
        );

        this.mesh.moveWithCollisions(this._moveDirection);

        if (this._input.centerKeyDown && this._centerCount > 0 && this._centered == false) {
            this._updateCamera();
        }

    }

    private _beforeRenderUpdate(): void {
        this._updateFromMouseControls();
        // this._updateGroundDetection();
        this._moveCamera();  // Call every frame, it checks internally if it should do anything
        console.log(
            this._isCameraMoving,
            this._centered,
            this._centerCount
        )
    }

    public activatePlayerCamera(): ArcRotateCamera {
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
        })
        return this.camera;
    }

}