import { ArcRotateCamera, Mesh, Quaternion, Scene, ShadowGenerator, TransformNode, Vector3 } from "@babylonjs/core";
import { PlayerInput } from "./inputController";

export class Player extends TransformNode {
    
    public scene: Scene;
    private _camera: ArcRotateCamera; 
    private _input: PlayerInput;

    // Camera
    private _centered: boolean;
    private _centerCount: number;
    private _cameraTargetPosition: Vector3 = null;
    private _isCameraMoving: boolean = false;

    // Player Mesh
    public mesh: Mesh; // outer collisionbox of player

    // Movement
    private _deltaTime: number = 0;
    private _moveDirection: Vector3 = Vector3.Zero();
    private _currentMove: Vector3 = new Vector3();

    // const values
    private static readonly PLAYER_SPEED: number = 0.45;

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, camera, input?) {
        super("player", scene);

        this.scene = scene;
        this._input = input;
        this._camera = camera;

        this.mesh = assets.mesh;
        this.mesh.parent = this;
        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");
        shadowGenerator.addShadowCaster(assets.mesh); // the player mesh will cast shadows

    }

    private _initializeCenterCamera(): void {
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

    private _moveCameraToUnit(): void {
        if (!this._isCameraMoving || !this._cameraTargetPosition) return;
        
        // Update target to current player position (so it tracks while moving)
        this._cameraTargetPosition.set(
            this.mesh.position.x,
            this.mesh.position.y + 2,
            this.mesh.position.z
        );
        
        let offset = this._cameraTargetPosition.subtract(this._camera.target);
        
        this._camera.target = Vector3.Lerp(
            this._camera.target,
            this._cameraTargetPosition,
            0.1
        );
        
         this._camera.position = this._camera.position.add(offset.scale(0.1));
        
        // Stop when close enough
        if (Vector3.Distance(this._camera.target, this._cameraTargetPosition) < 0.5) {
            this._isCameraMoving = false;
        }
    }

    private _moveUnit(): void {
        this._moveDirection = Vector3.Zero();
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        if (!this._input.clickMap || this._input.clickMap.length === 0) {
            if (this._input.centerKeyDown && this._centerCount > 0 && this._centered == false) {
                this._initializeCenterCamera();
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
            this._initializeCenterCamera();
        }

    }

    public beforeRenderUpdate() {
        this.scene.registerBeforeRender(() => {
            this._moveUnit();
            this._moveCameraToUnit();
        })
    }

}