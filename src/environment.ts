import { ImportMeshAsync, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;
    public env;
    public meshes;
    public camera;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {

        const assets = await this._loadAsset();

        assets.allMeshes.forEach(m => {
            m.receiveShadows = true;
            m.checkCollisions = true;
        })

        this.env = assets.env;
        this.meshes = assets.allMeshes;

    }

    public async _loadAsset() {
        const result = await ImportMeshAsync("./models/terrain-test.glb", this._scene);

        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        return {
            env: env, //reference to our entire imported glb (meshes and transform nodes)
            allMeshes: allMeshes, // all of the meshes that are in the environment
        }
    }
}