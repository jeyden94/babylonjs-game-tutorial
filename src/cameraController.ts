// import { ArcRotateCamera, Tools, Vector3, Scene, TransformNode } from "@babylonjs/core";

// export class Camera {

//     public scene: Scene;
//     public camera: ArcRotateCamera;

//     private _camRoot: TransformNode;
//     private _yTilt: TransformNode;

//     private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
    
//     constructor(scene: Scene) {
//         this.scene = scene;

//         // this._camRoot = new TransformNode("root");
//         // this._camRoot.position = new Vector3(0, 0, 0); 
//         // this._camRoot.rotation = new Vector3(0, Math.PI, 0);

//         // let yTilt = new TransformNode("ytilt");
//         // yTilt.rotation = Camera.ORIGINAL_TILT;
//         // this._yTilt = yTilt;
//         // yTilt.parent = this._camRoot;

//         // this.camera = new ArcRotateCamera("camera", Tools.ToRadians(90), Tools.ToRadians(65), 35, Vector3.Zero(), this.scene);
//         // this.camera.lockedTarget = this._camRoot.position;
//         // this.camera.fov = 0.47350045992678597;
//         // this.camera.parent = yTilt;

//         // this.scene.activeCamera = this.camera;
    
//     }

//     public activateCamera(): ArcRotateCamera {
//         // root cam parent that handles positioning of the cam to follow the player
//         this._camRoot = new TransformNode("root");
//         this._camRoot.position = new Vector3(0, 0, 0); 
//         this._camRoot.rotation = new Vector3(0, Math.PI, 0);

//         let yTilt = new TransformNode("ytilt");
//         yTilt.rotation = Camera.ORIGINAL_TILT;
//         this._yTilt = yTilt;
//         yTilt.parent = this._camRoot;

//         this.camera = new ArcRotateCamera("camera", Tools.ToRadians(90), Tools.ToRadians(65), 35, Vector3.Zero(), this.scene);
//         this.camera.lockedTarget = this._camRoot.position;
//         this.camera.fov = 0.47350045992678597;
//         this.camera.parent = yTilt;

//         this.scene.activeCamera = this.camera;
//         return this.camera;
        
//     }

//     // public activateCamera(): ArcRotateCamera {
//     //     this.scene.registerBeforeRender(() => {
//     //         this._beforeRenderUpdate();
//     //         // this._updateCamera();
//     //     })
//     //     return this.camera;
//     // }
    
// }