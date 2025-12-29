import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, Color4, FreeCamera, Sound, Effect, PostProcess, Matrix, Quaternion, StandardMaterial, Color3, PointLight, ShadowGenerator, ImportMeshAsync } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui";
import { Environment } from "./environment";
import { Player } from "./characterController";
import { PlayerInput } from "./inputController";
import { Camera } from "./cameraController";


enum State { START = 0, GAME = 1 , LOSE = 3, CUTSCENE = 4 }

class App {
    // General Entire Application
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _camera: Camera;

    // Game State Related
    public assets;
    private _player: Player;
    private _input;

    // Sounds

    // Scene Related
    private _cutScene: Scene;
    private _gamescene: Scene;
    private _environment: Environment;

    // Post Process

    private _state: number = 0;

    constructor() {

        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // MAIN render loop & state machine
        this._main();

    }

    private _createCanvas(): HTMLCanvasElement {

        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    private async _main(): Promise<void> {

        await this._goToStart();

        // Register a render 

        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.CUTSCENE:
                    this._scene.render();
                    break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.LOSE:
                    this._scene.render();
                    break;
                default: break;
            }
        });

        window.addEventListener("resize", () => {
            this._engine.resize();
        });
    }

    private async _goToStart() {
        this._engine.displayLoadingUI();

        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());


        //--GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        const startBtn = Button.CreateSimpleButton("start", "PLAY");
        startBtn.fontFamily = "Viga";
        startBtn.width = 0.2;
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(startBtn);

        startBtn.onPointerDownObservable.add(() => {
            this._goToCutScene(); // Remove in final
            scene.detachControl();
        });

        // Scene Finishes Loading
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;

    }

    private async _goToLose(): Promise<void> {
        this._engine.displayLoadingUI();

        // --SCENE SETUP--
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        // --GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        guiMenu.addControl(mainBtn);

        mainBtn.onPointerUpObservable.add(() => {
            this._goToStart();
        });

        // --SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOSE;
    }

    private async _goToCutScene(): Promise<void> {
        this._engine.displayLoadingUI();

        // --SCENE SETUP--
        this._scene.detachControl();
        this._cutScene = new Scene(this._engine);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._cutScene);
        camera.setTarget(Vector3.Zero());
        this._cutScene.clearColor = new Color4(0, 0, 0, 1);

        // --GUI--
        const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("cutscene");

        await this._cutScene.whenReadyAsync();
        this._engine.hideLoadingUI();

        this._scene.dispose();
        this._state = State.CUTSCENE;
        this._scene = this._cutScene;

        await this._setUpGame().then(res =>{
            this._goToGame();
        });

    }

    private async _setUpGame() {
        let scene = new Scene(this._engine);
        this._gamescene = scene;

        const environment = new Environment(scene);
        this._environment = environment;
        await this._environment.load();

        await this._loadCharacterAssets(scene); 
    }

    private async _loadCharacterAssets(scene): Promise<any> {

        async function loadCharacter() {
            // collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;

            // move origin of box collider to the bottom of the mesh (to match imported player mesh)
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

            // for collisions
            outer.ellipsoid = new Vector3(1, 1.5, 1);
            outer.ellipsoidOffset = new Vector3(0, 1.5, 0);
            outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

            return ImportMeshAsync("./models/player.glb", scene).then((result) => {
                const root = result.meshes[0];
                //body is our actual player mesh
                const body = root;
                body.parent = outer;
                body.isPickable = false; //so our raycasts don't hit ourself
                body.getChildMeshes().forEach(m => {
                    m.isPickable = false;
                })
                return {
                    mesh: outer as Mesh
                }
            });
        }

        return loadCharacter().then((assets) => {
            this.assets = assets;
        });

    }

    private async _initializeGameAsync(scene): Promise<void> {

        // temp light to light the entire scene
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;

        // Create the player
        this._player = new Player(this.assets, scene, shadowGenerator, this._input);

        const camera = this._player.activatePlayerCamera();

        // this._camera =  new Camera(scene)

        // const camera = this._camera.activateCamera();

        }

    private async _goToGame() {

        // --SETUP SCENE--
        this._scene.detachControl();
        let scene = this._gamescene;

        // --GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        scene.detachControl();

        const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
        loseBtn.width = 0.2;
        loseBtn.height = "40px";
        loseBtn.color = "white";
        loseBtn.top = "-14px";
        loseBtn.thickness = 0;
        loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(loseBtn);

        loseBtn.onPointerDownObservable.add(() => {
            this._goToLose();
            scene.detachControl();
        });

        //--INPUT--
        this._input = new PlayerInput(scene, this._environment); //detect 

        await this._initializeGameAsync(scene);
        
        await scene.whenReadyAsync();
        
        scene.getMeshByName("outer").position = scene.getTransformNodeByName("startPosition").getAbsolutePosition(); //move the player to the start position

        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        this._scene.attachControl();
    }    
}


new App();