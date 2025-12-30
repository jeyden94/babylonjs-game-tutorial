import { ArcRotateCamera, Tools, Vector3, Scene, TransformNode } from "@babylonjs/core";

export class RTSArcCam extends ArcRotateCamera {

    public scene: Scene;
    private _camRoot: TransformNode;
    
    constructor(scene: Scene) {

        super("camera", Tools.ToRadians(90), Tools.ToRadians(60), 35, Vector3.Zero(), scene);

        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0); 
        this._camRoot.rotation = new Vector3(0, 0, 0);
        
        this.fov = 0.8;

    }
    
}