// Messier 0.8.0: types of the 'messier' module scripts import from. Written by the Messier editor; it's
// replaced when the project opens in a different version, so don't edit it.

declare module "messier/engine/math" {
    export type Vec2 = [number, number];
    export type Vec3 = [number, number, number];
    export type Vec4 = [number, number, number, number];
    export type Quat = [number, number, number, number];
    export type Mat4 = Float32Array<ArrayBuffer>;
    export const DEG2RAD: number;
    export const RAD2DEG: number;
    export function clamp(v: number, lo: number, hi: number): number;
    export const vec3: {
        create(x?: number, y?: number, z?: number): Vec3;
        clone(a: Readonly<Vec3>): Vec3;
        add(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3;
        sub(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3;
        scale(a: Readonly<Vec3>, s: number): Vec3;
        mul(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3;
        addScaled(a: Readonly<Vec3>, b: Readonly<Vec3>, s: number): Vec3;
        dot(a: Readonly<Vec3>, b: Readonly<Vec3>): number;
        cross(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3;
        length(a: Readonly<Vec3>): number;
        distance(a: Readonly<Vec3>, b: Readonly<Vec3>): number;
        normalize(a: Readonly<Vec3>): Vec3;
        lerp(a: Readonly<Vec3>, b: Readonly<Vec3>, t: number): Vec3;
        min(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3;
        max(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3;
        /** Transforms a point (w = 1) with perspective divide. */
        transformPoint(m: Mat4, v: Readonly<Vec3>): Vec3;
        /** Transforms a direction (w = 0). */
        transformDir(m: Mat4, v: Readonly<Vec3>): Vec3;
        equals(a: Readonly<Vec3>, b: Readonly<Vec3>, eps?: number): boolean;
    };
    export const quat: {
        identity(): Quat;
        clone(q: Readonly<Quat>): Quat;
        /** Hamilton product a * b (apply b first, then a). */
        multiply(a: Readonly<Quat>, b: Readonly<Quat>): Quat;
        normalize(q: Readonly<Quat>): Quat;
        invert(q: Readonly<Quat>): Quat;
        fromAxisAngle(axis: Readonly<Vec3>, rad: number): Quat;
        /** Euler angles in degrees, XYZ order (rotation matrix = Rx * Ry * Rz). */
        fromEulerDeg(x: number, y: number, z: number): Quat;
        /** Inverse of fromEulerDeg. */
        toEulerDeg(q: Readonly<Quat>): Vec3;
        rotateVec3(q: Readonly<Quat>, v: Readonly<Vec3>): Vec3;
        /** Rotation part of a (possibly scaled) matrix. Columns must already be normalized. */
        fromRotationMatrix(m: Mat4): Quat;
        /** Rotation that maps the -Z axis onto `dir`. */
        lookRotation(dir: Readonly<Vec3>, up?: Readonly<Vec3>): Quat;
    };
    export const mat4: {
        create(): Mat4;
        clone(a: Mat4): Mat4;
        /** out = a * b */
        multiply(a: Mat4, b: Mat4, out?: Mat4): Mat4;
        fromTRS(t: Readonly<Vec3>, q: Readonly<Quat>, s: Readonly<Vec3>, out?: Mat4): Mat4;
        invert(a: Mat4, out?: Mat4): Mat4 | null;
        transpose(a: Mat4, out?: Mat4): Mat4;
        /** Inverse-transpose of the upper 3x3, stored in a mat4 with zero translation. */
        normalMatrix(m: Mat4, out?: Mat4): Mat4;
        /** Right-handed perspective projection with depth range [0, 1]. */
        perspective(fovYRad: number, aspect: number, near: number, far: number): Mat4;
        /**
         * Reversed-Z perspective (near -> depth 1, far -> depth 0). Paired with a
         * float depth buffer and a 'greater' depth test this gives near-uniform depth
         * precision, so coplanar-ish surfaces (grid on floor) don't z-fight.
         */
        perspectiveReversedZ(fovYRad: number, aspect: number, near: number, far: number): Mat4;
        /** Right-handed orthographic projection with depth range [0, 1]. */
        ortho(l: number, r: number, b: number, t: number, n: number, f: number): Mat4;
        /** Reversed-Z orthographic projection (near -> depth 1, far -> depth 0), the counterpart of perspectiveReversedZ. */
        orthoReversedZ(l: number, r: number, b: number, t: number, n: number, f: number): Mat4;
        lookAt(eye: Readonly<Vec3>, target: Readonly<Vec3>, up: Readonly<Vec3>): Mat4;
        getTranslation(m: Mat4): Vec3;
        /** Splits an affine matrix into translation, rotation and scale (no shear). */
        decompose(m: Mat4): {
            t: Vec3;
            r: Quat;
            s: Vec3;
        };
    };
    export function srgbToLinear(c: number): number;
    export function linearToSrgb(c: number): number;
    export function hexToLinear(hex: string): Vec3;
    export function linearToHex(c: Readonly<Vec3>): string;
    /** Display-space (no gamma conversion) hex helpers, e.g. for clear colors. */
    export function hexToRgb(hex: string): Vec3;
    export function rgbToHex(c: Readonly<Vec3>): string;
    export function hsvToRgb(h: number, s: number, v: number): Vec3;
}
declare module "messier/engine/mesh" {
    import { type Vec3 } from "messier/engine/math";
    /** Floats per vertex: position(3) + normal(3) + uv(2). */
    export const VERTEX_STRIDE_FLOATS = 8;
    export const VERTEX_STRIDE_BYTES: number;
    /**
     * Where a mesh or texture came from, so a saved scene can point at it instead
     * of embedding vertex data: a procedural primitive with its generator
     * arguments, or the n-th resource of an imported asset (see tagAssetResources).
     */
    export type ResourceRef = {
        primitive: string;
        args: number[];
    } | {
        asset: string;
        index: number;
    };
    export interface MeshGPU {
        vertexBuffer: GPUBuffer;
        indexBuffer: GPUBuffer;
    }
    /**
     * Indexed triangle mesh with interleaved vertices. CPU data is kept so the
     * editor can raycast against triangles; GPU buffers are created lazily by the
     * renderer on first draw.
     */
    export class Mesh {
        name: string;
        vertices: Float32Array<ArrayBuffer>;
        indices: Uint32Array<ArrayBuffer>;
        boundsMin: Vec3;
        boundsMax: Vec3;
        gpu: MeshGPU | null;
        /** Source of this mesh, or null when it can't be saved (built by code at runtime). */
        ref: ResourceRef | null;
        constructor(name: string, vertices: Float32Array<ArrayBuffer>, indices: Uint32Array<ArrayBuffer>);
        get vertexCount(): number;
        get triangleCount(): number;
        static fromArrays(name: string, positions: ArrayLike<number>, normals: ArrayLike<number> | null, uvs: ArrayLike<number> | null, indices: ArrayLike<number> | null): Mesh;
        computeBounds(): void;
        /** Flips triangles whose geometric normal disagrees with their vertex normals. */
        fixWinding(): this;
        destroy(): void;
    }
    /** Area-weighted smooth vertex normals. */
    export function computeNormals(positions: ArrayLike<number>, indices: ArrayLike<number>): Float32Array;
}
declare module "messier/engine/material" {
    import type { Vec3, Vec4 } from "messier/engine/math";
    import type { ResourceRef } from "messier/engine/mesh";
    /**
     * An image uploaded with a full mip chain: as an sRGB texture for colors (base color, emissive), and as a linear one
     * for data (normals, metallic-roughness, occlusion). Each copy is made the first time a slot of that kind uses it.
     */
    export class Texture {
        readonly source: ImageBitmap;
        readonly name: string;
        gpu: GPUTexture | null;
        gpuLinear: GPUTexture | null;
        /** Source of the image (set when its asset is tagged), or null when it can't be saved. */
        ref: ResourceRef | null;
        constructor(source: ImageBitmap, name?: string);
        static fromBlob(blob: Blob, name?: string): Promise<Texture>;
        destroy(): void;
    }
    export interface MaterialGPU {
        uniformBuffer: GPUBuffer;
        bindGroup: GPUBindGroup;
        /** The textures `bindGroup` was made with, in TEXTURE_SLOTS order. */
        boundTextures: (Texture | null)[];
    }
    /** A material's texture fields, in bind-group order. */
    export const TEXTURE_SLOTS: readonly ["baseColorTexture", "normalTexture", "metallicRoughnessTexture", "occlusionTexture", "emissiveTexture"];
    export type TextureSlot = (typeof TEXTURE_SLOTS)[number];
    /** Slots whose textures hold data rather than colors, so they're sampled without sRGB decoding. */
    export const LINEAR_TEXTURE_SLOTS: ReadonlySet<TextureSlot>;
    /**
     * How a material's pixels meet what's behind them. `opaque` covers it (with `alphaCutoff`, in a cut-out). `alpha`
     * mixes by the base color's alpha (glass, smoke); `additive` adds on top, scaled by alpha (fire, beams). Blended
     * materials are drawn after everything opaque, sorted back to front, don't write depth and cast no shadows.
     */
    export type BlendMode = 'opaque' | 'alpha' | 'additive';
    export const BLEND_MODES: readonly BlendMode[];
    /** Fields saved with a scene (textures are saved separately, as refs). Keep in sync with clone(). */
    export const MATERIAL_FIELDS: readonly ["name", "baseColor", "metallic", "roughness", "emissive", "emissiveStrength", "normalScale", "occlusionStrength", "alphaCutoff", "doubleSided", "unlit", "blend"];
    /** Metallic-roughness PBR material (glTF 2.0 compatible subset). All colors are linear. */
    export class Material {
        name: string;
        baseColor: Vec4;
        metallic: number;
        roughness: number;
        emissive: Vec3;
        emissiveStrength: number;
        /** Multiplies baseColor (sRGB, alpha included). */
        baseColorTexture: Texture | null;
        /** Tangent-space normal map (glTF convention: +Y up in the image). Tangents come from the UVs per pixel. */
        normalTexture: Texture | null;
        /** Scales the normal map's X and Y. */
        normalScale: number;
        /** Linear: G is roughness and B is metallic (glTF packing), multiplying the factors. */
        metallicRoughnessTexture: Texture | null;
        /** Linear: R is ambient occlusion. Often the same image as metallicRoughnessTexture (ORM). */
        occlusionTexture: Texture | null;
        /** How much the occlusion texture darkens ambient light (0 = none, 1 = fully). */
        occlusionStrength: number;
        /** Multiplies emissive × emissiveStrength (sRGB). */
        emissiveTexture: Texture | null;
        /** Fragments with alpha below this are discarded. 0 disables alpha testing. */
        alphaCutoff: number;
        doubleSided: boolean;
        /** Skips lighting entirely; outputs base color + emissive. */
        unlit: boolean;
        /** See BlendMode. Anything but `opaque` makes the base color's alpha the opacity. */
        blend: BlendMode;
        gpu: MaterialGPU | null;
        constructor(name?: string, init?: Partial<Pick<Material, 'baseColor' | 'metallic' | 'roughness' | 'emissive' | 'emissiveStrength' | 'unlit' | 'doubleSided' | 'blend'>>);
        clone(): Material;
    }
    /**
     * A number that's equal for materials that draw the same (see materialsEqual). Different materials can collide, so
     * confirm a match with materialsEqual.
     */
    export function materialHash(m: Material): number;
    /** Whether two materials draw the same: every field but the name, and the same textures. The renderer batches these. */
    export function materialsEqual(a: Material, b: Material): boolean;
}
declare module "messier/engine/transform" {
    import { type Mat4, type Quat, type Vec3 } from "messier/engine/math";
    import type { GameObject } from "messier/engine/scene";
    /** Local position, rotation and scale as plain values (undo snapshots, resets). */
    export interface LocalTRS {
        position: Vec3;
        rotation: Quat;
        scale: Vec3;
    }
    export const IDENTITY_TRS: Readonly<LocalTRS>;
    /**
     * Position, rotation and scale of a GameObject relative to its parent, plus the hierarchy itself.
     *
     * World matrices are cached and computed lazily. Each transform remembers the local values it last baked into its
     * matrix and the version of its parent's world matrix it was computed against, so a change anywhere above it makes
     * it stale without walking the subtree. In-place edits (`transform.position[1] = y`) are noticed by comparing the
     * 10 local values with the baked copy, so they work as well as assignments.
     */
    export class Transform {
        readonly gameObject: GameObject;
        private _position;
        private _rotation;
        private _scale;
        private _parent;
        private readonly _children;
        private readonly _local;
        private readonly _world;
        private readonly _normal;
        private readonly _baked;
        private _dirty;
        private _worldVersion;
        private _parentVersion;
        private _normalVersion;
        constructor(gameObject: GameObject);
        /** Local position. Assigning stores the array; editing it in place also works. */
        get position(): Vec3;
        set position(v: Vec3);
        /** Local rotation quaternion [x, y, z, w]. */
        get rotation(): Quat;
        set rotation(q: Quat);
        get scale(): Vec3;
        set scale(v: Vec3);
        setEulerDeg(x: number, y: number, z: number): this;
        getEulerDeg(): Vec3;
        /** Copies local values (from another transform or a LocalTRS snapshot). */
        copyFrom(t: Readonly<LocalTRS>): this;
        /** The local values as a detached copy. */
        snapshot(): LocalTRS;
        get parent(): Transform | null;
        get children(): readonly Transform[];
        get root(): Transform;
        isAncestorOf(other: Transform): boolean;
        /**
         * Moves this transform under `parent` (null detaches it) at `index` among its children (default: last).
         * With keepWorldTransform (the default) the local values are recomputed so the object stays where it is in the
         * world; otherwise the local values are kept and the object moves with its new parent.
         */
        setParent(parent: Transform | null, keepWorldTransform?: boolean, index?: number): void;
        /** Local TRS matrix (cached; don't modify). */
        get localMatrix(): Mat4;
        /** World matrix (cached; don't modify). Always current, even mid-frame right after an edit. */
        get worldMatrix(): Mat4;
        /** Inverse-transpose of the world matrix's 3×3, for transforming normals (cached; don't modify). */
        get normalMatrix(): Mat4;
        /**
         * Brings this world matrix up to date assuming the parent's already is. The scene calls it top-down once a frame;
         * everything else goes through worldMatrix, which validates the ancestors first.
         */
        updateWorld(): void;
        private _validate;
        /** Re-bakes the local matrix if the values changed. Returns whether they did. */
        private _syncLocal;
        /** World position. Reading allocates a new Vec3; use getWorldPosition(out) in hot code. */
        get worldPosition(): Vec3;
        set worldPosition(p: Vec3);
        getWorldPosition(out: Vec3): Vec3;
        /** World rotation (the product of the local rotations up the hierarchy, so scale doesn't skew it). */
        get worldRotation(): Quat;
        set worldRotation(q: Quat);
        getWorldRotation(out: Quat): Quat;
        /** World direction of local −Z (where cameras and lights point). */
        get forward(): Vec3;
        /** World direction of local +X. */
        get right(): Vec3;
        /** World direction of local +Y. */
        get up(): Vec3;
        /** Normalized world direction of local axis 0 (X), 1 (Y) or 2 (Z), times `sign`. */
        getAxis(axis: 0 | 1 | 2, sign: number, out: Vec3): Vec3;
        /** Rotates so local −Z points at `target` (a world point or another transform). Does nothing if they coincide. */
        lookAt(target: Readonly<Vec3> | Transform, up?: Readonly<Vec3>): void;
        /** Local point → world point. */
        transformPoint(p: Readonly<Vec3>, out?: Vec3): Vec3;
        /** World point → local point. */
        inverseTransformPoint(p: Readonly<Vec3>, out?: Vec3): Vec3;
        /** Local direction → world direction (rotation only; scale is ignored and the length kept). */
        transformDirection(d: Readonly<Vec3>, out?: Vec3): Vec3;
        /** World direction → local direction (rotation only). */
        inverseTransformDirection(d: Readonly<Vec3>, out?: Vec3): Vec3;
    }
}
declare module "messier/engine/meshRenderer" {
    import { Component } from "messier/engine/component";
    import type { Material } from "messier/engine/material";
    import type { Mesh } from "messier/engine/mesh";
    /** Draws a mesh with a material at its object's transform. Needs both to draw. */
    export class MeshRenderer extends Component {
        mesh: Mesh | null;
        material: Material | null;
        castShadows: boolean;
        /** Shares the mesh and copies the material, so per-object material edits stay per object. */
        clone(): MeshRenderer;
    }
}
declare module "messier/engine/camera" {
    import { Component } from "messier/engine/component";
    import { type Mat4, type Vec3 } from "messier/engine/math";
    export interface Ray {
        origin: Vec3;
        dir: Vec3;
    }
    /**
     * Look-at view the renderer draws from (reversed-Z projection: depth 1 at near, 0 at far).
     * The editor's viewport camera is one; a scene's CameraComponent fills one in with applyTo().
     */
    export class Camera {
        position: Vec3;
        target: Vec3;
        up: Vec3;
        fovDeg: number;
        near: number;
        far: number;
        aspect: number;
        orthographic: boolean;
        /** Orthographic: half the visible height in world units. */
        orthoSize: number;
        view(): Mat4;
        projection(): Mat4;
        viewProjection(): Mat4;
        forward(): Vec3;
        /** World-space ray through a pixel (CSS pixels relative to the viewport). */
        screenRay(x: number, y: number, width: number, height: number): Ray;
        /** Projects a world point to viewport pixels. Returns null when behind the camera. */
        worldToScreen(p: Readonly<Vec3>, width: number, height: number, viewProj?: Mat4): [number, number] | null;
        /** Size in world units of one viewport pixel at the given point. */
        worldPerPixel(p: Readonly<Vec3>, viewportHeight: number): number;
    }
    export type Projection = 'perspective' | 'orthographic';
    export const PROJECTIONS: readonly Projection[];
    /** Lens settings: the fields copyFrom() copies and scenes save. */
    export const CAMERA_FIELDS: readonly ["projection", "fovDeg", "orthoSize", "near", "far", "priority"];
    type CameraSettings = Pick<CameraComponent, (typeof CAMERA_FIELDS)[number]>;
    /**
     * Camera component. Position and orientation come from the owning GameObject:
     * cameras look along the object's local -Z axis with local +Y up (scale is ignored).
     * The engine renders through the scene's active camera (Scene.activeCamera) while
     * Engine.useSceneCamera is set.
     */
    export class CameraComponent extends Component {
        projection: Projection;
        /** Perspective: vertical field of view in degrees. */
        fovDeg: number;
        /** Orthographic: half the visible height in world units. */
        orthoSize: number;
        near: number;
        far: number;
        /** The visible camera with the highest priority is the active one (ties go to the first in the hierarchy). */
        priority: number;
        constructor(init?: Partial<CameraSettings>);
        copyFrom(c: CameraComponent): this;
        clone(): CameraComponent;
        /**
         * Points `view` through this camera, placed by its owner's world matrix.
         * `target` is put `focusDistance` ahead.
         */
        applyTo(view: Camera, world: Mat4, focusDistance?: number): Camera;
    }
}
declare module "messier/engine/behaviours" {
    import { Component } from "messier/engine/component";
    import type { Scene } from "messier/engine/scene";
    type Hook = 'awake' | 'onEnable' | 'start' | 'update' | 'fixedUpdate' | 'lateUpdate' | 'onDisable' | 'onDestroy';
    /** Bit per dispatched hook, for the per-class "which hooks are overridden" cache. */
    export const HOOK_UPDATE = 1;
    export const HOOK_FIXED_UPDATE = 2;
    export const HOOK_LATE_UPDATE = 4;
    /**
     * Scripting component. Override the lifecycle hooks you need:
     *
     * - `awake()` once, when the object is first active in a running scene (even if the behaviour is disabled)
     * - `onEnable()` / `onDisable()` whenever the behaviour becomes live / stops being live (enabled, object active)
     * - `start()` once, right before the first update or fixedUpdate, only while enabled
     * - `fixedUpdate(fixedDt)` on every fixed step, `update(dt, time)` and `lateUpdate(dt)` every frame
     * - `onDestroy()` once, when the behaviour or its object is destroyed (or the scene stops running)
     *
     * Hooks only run while the scene is running (Play). A behaviour is only dispatched for the per-frame hooks its class
     * actually overrides, so an empty update costs nothing. Public number fields are the parameters the editor shows.
     */
    export abstract class Behaviour extends Component {
        awake(): void;
        onEnable(): void;
        start(): void;
        /** `time` is seconds since the scene started running (the same as Time.time when the engine drives it). */
        update(_dt: number, _time: number): void;
        fixedUpdate(_fixedDt: number): void;
        lateUpdate(_dt: number): void;
        onDisable(): void;
        onDestroy(): void;
        _awoken: boolean;
        _enabledCalled: boolean;
        _started: boolean;
        _startQueued: boolean;
        _inLists: boolean;
        /** Threw from a hook: skipped by update/fixedUpdate/lateUpdate until the scene restarts (or a script recompiles). */
        _failed: boolean;
        /** The running scene whose dispatch lists this behaviour is in (or is queued to start in). */
        _lifeScene: Scene | null;
        private _paramsView;
        /** Name used in the editor and in saved scenes. */
        get typeName(): string;
        /** True after a hook threw; the behaviour is paused until the scene restarts. */
        get failed(): boolean;
        /** Names of the inspector-editable number fields: own public number fields (not starting with `_`). */
        paramNames(): string[];
        getParam(name: string): number | undefined;
        setParam(name: string, value: number): void;
        /** The parameters as a plain-looking record (reads and writes go through getParam/setParam). */
        get params(): Record<string, number>;
        /** Which of update/fixedUpdate/lateUpdate this behaviour's class overrides (HOOK_* bits). */
        _hooks(): number;
        _sync(): void;
        /** Calls a hook, turning an exception into a failure report instead of breaking the frame. */
        _invoke(hook: Hook): void;
        _fail(err: unknown, hook: Hook): void;
        /** Forgets lifecycle state so the next run starts with awake() again. */
        _resetLifecycle(): void;
    }
    /** Spins the object; speeds in degrees per second around each local axis. */
    export class Rotator extends Behaviour {
        static readonly typeName = "Rotator";
        speedX: number;
        speedY: number;
        speedZ: number;
        constructor(init?: Partial<Pick<Rotator, 'speedX' | 'speedY' | 'speedZ'>>);
        update(dt: number): void;
    }
    /** Moves the object up and down around its start position. */
    export class Bobber extends Behaviour {
        static readonly typeName = "Bobber";
        amplitude: number;
        frequency: number;
        private _baseY;
        constructor(init?: Partial<Pick<Bobber, 'amplitude' | 'frequency'>>);
        start(): void;
        update(_dt: number, time: number): void;
    }
    /** Circles around the position the object had when Play started. */
    export class Orbiter extends Behaviour {
        static readonly typeName = "Orbiter";
        radius: number;
        speed: number;
        phase: number;
        private _center;
        constructor(init?: Partial<Pick<Orbiter, 'radius' | 'speed' | 'phase'>>);
        start(): void;
        update(_dt: number, time: number): void;
    }
    /** Light only: modulates intensity like a flame or a pulsing beacon. */
    export class LightPulse extends Behaviour {
        static readonly typeName = "LightPulse";
        amount: number;
        frequency: number;
        flicker: number;
        private _base;
        constructor(init?: Partial<Pick<LightPulse, 'amount' | 'frequency' | 'flicker'>>);
        start(): void;
        update(_dt: number, time: number): void;
    }
    /** Light only: cycles the light hue. */
    export class ColorCycle extends Behaviour {
        static readonly typeName = "ColorCycle";
        speed: number;
        saturation: number;
        offset: number;
        constructor(init?: Partial<Pick<ColorCycle, 'speed' | 'saturation' | 'offset'>>);
        update(_dt: number, time: number): void;
    }
    /** Built-in behaviours by typeName (the editor's Add menu and scene loading). */
    export const BEHAVIOURS: Record<string, () => Behaviour>;
    export function createBehaviour(type: string): Behaviour;
}
declare module "messier/engine/time" {
    export const DEFAULT_FIXED_RATE = 60;
    export const DEFAULT_MAX_SUBSTEPS = 8;
    export class Clock {
        /** Multiplies deltaTime and the time fed to fixed steps. 0 pauses the game; unscaled values keep running. */
        timeScale: number;
        /** Most fixed steps per frame. Time beyond that is dropped, so a slow frame can't snowball into slower ones. */
        maxSubsteps: number;
        private _fixedDeltaTime;
        private _deltaTime;
        private _unscaledDeltaTime;
        private _time;
        private _unscaledTime;
        private _fixedTime;
        private _frameCount;
        private _accumulator;
        /** Scaled seconds since the last frame. */
        get deltaTime(): number;
        get unscaledDeltaTime(): number;
        /** Scaled seconds since reset() (the start of Play). */
        get time(): number;
        get unscaledTime(): number;
        /** Simulated seconds after the fixed steps run so far. */
        get fixedTime(): number;
        /** Frames since reset(). */
        get frameCount(): number;
        /** Seconds per fixed step. */
        get fixedDeltaTime(): number;
        set fixedDeltaTime(dt: number);
        /** Fixed steps per second. */
        get fixedRate(): number;
        set fixedRate(hz: number);
        /**
         * How far the current frame is between the last fixed step and the next one (0…1). Renderers can blend the
         * previous and current physics poses with it.
         */
        get alpha(): number;
        /** Back to zero (start of Play). Keeps timeScale, fixedDeltaTime and maxSubsteps. */
        reset(): void;
        /** Advances by a real frame time (seconds) and returns how many fixed steps to run this frame. */
        beginFrame(unscaledDt: number): number;
        /** Called by the engine after each fixed step it ran. */
        fixedStepDone(): void;
    }
    /** The engine's clock. */
    export const Time: Clock;
}
declare module "messier/engine/physics" {
    import { Component } from "messier/engine/component";
    import { type Quat, type Vec3 } from "messier/engine/math";
    import type { Mesh } from "messier/engine/mesh";
    import type { GameObject, Scene } from "messier/engine/scene";
    export type BodyType = 'dynamic' | 'static' | 'kinematic';
    export type ColliderShape = 'box' | 'sphere';
    export const BODY_TYPES: readonly BodyType[];
    export const COLLIDER_SHAPES: readonly ColliderShape[];
    type RigidBodyOptions = Partial<Pick<RigidBody, 'shape' | 'center' | 'halfExtents' | 'radius' | 'mass' | 'friction' | 'restitution' | 'linearDamping' | 'angularDamping' | 'useGravity' | 'velocity' | 'angularVelocity'>>;
    /**
     * Physics component. `dynamic` bodies are moved by the simulation, `static`
     * ones never move, and `kinematic` ones are moved by you (transform edits or
     * behaviours) and push dynamic bodies with the velocity derived from that motion.
     */
    /** Settings saved with a scene (velocities are the initial ones set before Play). Keep in sync with clone(). */
    export const RIGID_BODY_FIELDS: readonly ["type", "shape", "center", "halfExtents", "radius", "mass", "friction", "restitution", "linearDamping", "angularDamping", "useGravity", "velocity", "angularVelocity"];
    export class RigidBody extends Component {
        type: BodyType;
        shape: ColliderShape;
        /** Collider center in the object's local space (scaled with the object). */
        center: Vec3;
        /** Box half extents in local space. */
        halfExtents: Vec3;
        /** Sphere radius in local space (scaled by the largest world scale axis). */
        radius: number;
        /** kg. Only used by dynamic bodies. */
        mass: number;
        friction: number;
        restitution: number;
        linearDamping: number;
        angularDamping: number;
        useGravity: boolean;
        /** World-space m/s. Set before Play for an initial velocity; updated live while simulating. */
        velocity: Vec3;
        /** World-space rad/s. */
        angularVelocity: Vec3;
        sleeping: boolean;
        /** World-space force and torque accumulated until the next step. */
        force: Vec3;
        torque: Vec3;
        /** Simulation bookkeeping: time spent below the sleep thresholds. */
        sleepTime: number;
        /** Pose seen by the last step. A mismatch means something else moved the object. */
        lastPosition: Vec3 | null;
        lastRotation: Quat | null;
        constructor(type?: BodyType, opts?: RigidBodyOptions);
        addForce(f: Readonly<Vec3>): void;
        addTorque(t: Readonly<Vec3>): void;
        /** Instant velocity change of `j / mass` (N·s), applied at the center of mass. */
        addImpulse(j: Readonly<Vec3>): void;
        wake(): void;
        /** Clears runtime state (sleep, accumulated forces, pose tracking). Velocities are kept. */
        resetState(): void;
        clone(): RigidBody;
    }
    /** Sizes the collider to the mesh's local bounds (unit box / sphere without a mesh). */
    export function fitCollider(body: RigidBody, mesh: Mesh | null): void;
    /** True when the mesh is flat along some axis, i.e. better suited to a static body. */
    export function isFlatMesh(mesh: Mesh | null): boolean;
    /** A collider resolved to world space. `center` is also the center of mass. */
    export interface WorldCollider {
        shape: ColliderShape;
        center: Vec3;
        axes: [Vec3, Vec3, Vec3];
        half: Vec3;
        radius: number;
    }
    /** The object's collider in world space, or null without a rigid body. Uses fresh (not cached) transforms. */
    export function worldCollider(obj: GameObject): WorldCollider | null;
    /** World-space corners of a box collider, ordered like boxCorners(). */
    export function colliderCorners(c: WorldCollider): Vec3[];
    export class PhysicsWorld {
        gravity: Vec3;
        /** Solver iterations per step. More = stiffer stacks. */
        iterations: number;
        /** Contacts in the last step (for stats). */
        contactCount: number;
        private cache;
        private bodyCount;
        /** Forgets cached contacts and wakes every body. Called when Play starts. */
        reset(scene: Scene): void;
        /** Advances the simulation by one fixed step of `h` seconds (Scene.fixedUpdate calls it). */
        step(scene: Scene, h: number): void;
    }
}
declare module "messier/engine/typescript" {
    export type TokenKind = 'ident' | 'keyword' | 'number' | 'string' | 'template' | 'regex' | 'punct' | 'comment' | 'eof';
    export interface Token {
        kind: TokenKind;
        value: string;
        start: number;
        end: number;
        /** A line break separates this token from the previous significant one. */
        nl: boolean;
    }
    export class TranspileError extends Error {
        readonly line: number;
        readonly column: number;
        constructor(message: string, line: number, column: number);
    }
    /**
     * Splits source into tokens. `>` is always emitted on its own (so `>>` can close
     * two type argument lists), and template literals are split at `${` / `}` so the
     * expressions inside them are tokens too. With `tolerant`, unterminated strings
     * and comments become tokens instead of errors (used for syntax highlighting).
     */
    export function tokenize(src: string, tolerant?: boolean): Token[];
    export function lineColumn(src: string, offset: number): {
        line: number;
        column: number;
    };
    export interface ImportBinding {
        imported: string;
        local: string;
    }
    export interface ModuleImport {
        from: string;
        /** Named imports (`import { a as b }`). */
        names: ImportBinding[];
        /** `import * as ns`. */
        namespace?: string;
        /** `import x from` */
        defaultName?: string;
        start: number;
    }
    export interface StripResult {
        code: string;
        imports: ModuleImport[];
        /**
         * How the default export is reached after the rewrite: the declared name of
         * `export default class Foo`, or `__default` for `export default <expr>`.
         */
        defaultExport: string | null;
        /** Names of class members declared `private` or `protected`. */
        privateMembers: Set<string>;
    }
    export interface StripOptions {
        /**
         * Rewrite the module syntax for evaluation inside a function body:
         * imports are blanked (and reported), `export` is removed and
         * `export default <expr>` assigns `__default`.
         */
        module?: boolean;
    }
    /** Erases TypeScript syntax from `src`. Throws TranspileError on unsupported or malformed input. */
    export function stripTypes(src: string, options?: StripOptions): StripResult;
}
declare module "messier/engine/scripting" {
    import { Behaviour } from "messier/engine/behaviours";
    import type { GameObject, Scene } from "messier/engine/scene";
    import * as api from "messier/engine/index";
    /** Module name scripts import the engine API from: `import { Script, vec3 } from 'messier'`. */
    export const SCRIPT_MODULE = "messier";
    export interface ScriptDiagnostic {
        kind: 'compile' | 'runtime';
        message: string;
        /** 1-based; 0 when unknown. */
        line: number;
        column: number;
        /** Name of the object whose script instance threw (runtime errors). */
        object?: string;
    }
    type ScriptClass = new () => Script;
    /** A TypeScript source file holding one behaviour class. */
    export class ScriptAsset {
        readonly id: number;
        name: string;
        source: string;
        /** Last successfully compiled class; kept while the source has errors so running objects keep working. */
        ctor: ScriptClass | null;
        /** Bumped on every successful compile; attached behaviours hot-swap when it changes. */
        version: number;
        /** Default values of the public number fields, from the last successful compile. */
        defaults: Record<string, number>;
        /** Compile error (at most one) followed by runtime errors since the last compile. */
        diagnostics: ScriptDiagnostic[];
        /** The source that `ctor` was compiled from, or that the last failed compile saw. */
        compiledSource: string | null;
        library: ScriptLibrary | null;
        /** Script components created from this asset; they adopt each newly compiled class. */
        readonly _instances: Set<api.Script>;
        /** sourceURL of the active class, used to map stack traces to source lines. */
        private url;
        private pendingUrl;
        constructor(name: string, source: string);
        /**
         * A new Script component running this asset, with inspector `overrides` of the field defaults. Before the asset
         * has compiled it's a plain Script that turns into the real class on the first successful compile.
         */
        create(overrides?: Record<string, number>): Script;
        get compileError(): ScriptDiagnostic | null;
        /** Compiles `source`. On failure the previous class stays active and a compile diagnostic is recorded. */
        compile(): boolean;
        private evaluate;
        /** Instantiates the class once to read the initial values of its public number fields. */
        private probeDefaults;
        /** Converts a thrown value into a diagnostic, mapping stack lines back to the source. */
        toDiagnostic(err: unknown, kind: ScriptDiagnostic['kind'], object?: string, url?: string): ScriptDiagnostic;
        /** Drops runtime errors from an earlier Play session. */
        clearRuntimeErrors(): void;
        /** Records a runtime error (deduplicated) and tells the library's listener. */
        reportRuntimeError(diag: ScriptDiagnostic): void;
    }
    /** The scene's script assets. */
    export class ScriptLibrary {
        readonly scripts: ScriptAsset[];
        /** Called when a running script throws (the behaviour is paused until the script changes). */
        onRuntimeError: ((script: ScriptAsset, diag: ScriptDiagnostic, isNew: boolean) => void) | null;
        /**
         * Optional host hook to find the position of a JavaScript syntax error the
         * type stripper let through. The editor implements it with a script element.
         */
        locateSyntaxError: ((code: string) => {
            line: number;
            column: number;
        } | null) | null;
        add(script: ScriptAsset, index?: number): ScriptAsset;
        remove(script: ScriptAsset): void;
        get(name: string): ScriptAsset | null;
        /** `base`, or `base2`, `base3`… if taken. */
        uniqueName(base: string, except?: ScriptAsset): string;
    }
    /**
     * Base class for TypeScript behaviour scripts: `export default class Spin extends Script { … }`. A Script is a
     * Behaviour with every lifecycle hook, plus the `object`, `scene` and `find()` shortcuts and the link to the
     * ScriptAsset it was compiled from. Public number fields become inspector parameters; values edited there are kept
     * as overrides of the defaults in code.
     */
    export class Script extends Behaviour {
        private _asset;
        private _overrides;
        private _error;
        private _version;
        /** The object this script is attached to (same as gameObject). */
        get object(): GameObject;
        /** The scene the object is in: findByName(), query(), getGroup(), activeCamera(), physics, background… */
        get scene(): Scene;
        /** First object in the scene with this name. */
        find(name: string): GameObject | null;
        /** The asset this script runs. */
        get asset(): ScriptAsset | null;
        /** Parameter values set in the inspector, by field name. */
        get overrides(): Readonly<Record<string, number>>;
        /** The runtime error that paused this script, until it recompiles or the scene restarts. */
        get error(): ScriptDiagnostic | null;
        get typeName(): string;
        paramNames(): string[];
        getParam(name: string): number | undefined;
        setParam(name: string, value: number): void;
        /** Copies the current field values and keeps the asset link and overrides. */
        clone(): Script;
        _bindAsset(asset: ScriptAsset | null, overrides: Readonly<Record<string, number>>, applyFields: boolean): void;
        _disposed(): void;
        _fail(err: unknown, hook: Parameters<Behaviour['_fail']>[1]): void;
        _resetLifecycle(): void;
        /**
         * Adopts the asset's newly compiled class in place, so references to this component stay valid. A running script
         * keeps its state and only gains new fields; one that hasn't started (or whose start() threw) is reset to the new
         * defaults and starts again, and so is a script outside a running scene.
         */
        _hotSwap(): void;
        private _applyOverrides;
    }
}
declare module "messier/engine/signal" {
    type Listener<Args extends unknown[]> = (...args: Args) => void;
    export class Signal<Args extends unknown[] = []> {
        private _slots;
        private _emitting;
        private _holes;
        /**
         * Calls `fn` on every emit until disconnected. With an `owner` (usually a component), the connection is dropped
         * automatically when the owner is destroyed. Returns a function that disconnects this connection.
         */
        connect(fn: Listener<Args>, owner?: object): () => void;
        /** Like connect(), but disconnects after the first call. */
        once(fn: Listener<Args>, owner?: object): () => void;
        /** Removes every connection of `fn`. Returns whether there was one. */
        disconnect(fn: Listener<Args>): boolean;
        /** Removes every connection. */
        disconnectAll(): void;
        isConnected(fn: Listener<Args>): boolean;
        get connectionCount(): number;
        emit(...args: Args): void;
        /** Resolves with the arguments of the next emit: `const [damage] = await hit.next()`. */
        next(owner?: object): Promise<Args>;
        /** Disconnects every connection (on any signal) made with `owner`. Called when a component is destroyed. */
        static disconnectOwner(owner: object): void;
        private _add;
        private _drop;
        private _compact;
    }
}
declare module "messier/engine/sky" {
    import type { Texture } from "messier/engine/material";
    import type { Vec3 } from "messier/engine/math";
    /**
     * What a scene shows behind everything. `color`: the flat `Scene.background`. `gradient`: a sky from `top` through
     * `horizon` to `ground`, with a sun disc toward the scene's first directional light. `image`: an equirectangular
     * (2:1) panorama. A gradient or image sky also lights the scene: metals reflect it (blurrier the rougher they are),
     * and ambient light comes from it, scaled by `lighting`, instead of from `Scene.ambientColor` × `ambientIntensity`.
     */
    export type SkyMode = 'color' | 'gradient' | 'image';
    export const SKY_MODES: readonly SkyMode[];
    /** Fields saved with a scene (the texture is saved as a ref). Keep in sync with copyFrom(). */
    export const SKY_FIELDS: readonly ["mode", "top", "horizon", "ground", "sunSize", "sunGlow", "intensity", "rotation", "lighting"];
    export class Sky {
        mode: SkyMode;
        /**
         * Gradient colors, linear RGB (like light colors: values above 1 are fine, exposure applies). Daylight sky is much
         * dimmer than the sun: these suit a directional light of intensity 3.
         */
        top: Vec3;
        horizon: Vec3;
        ground: Vec3;
        /** Gradient: angular diameter of the sun disc in degrees (0 hides it). */
        sunSize: number;
        /** Gradient: strength of the haze around the sun. */
        sunGlow: number;
        /** Image: equirectangular panorama (2:1, +Y up), or null. */
        texture: Texture | null;
        /** Image: brightness multiplier. */
        intensity: number;
        /** Image: turn around the vertical axis, degrees. */
        rotation: number;
        /** Gradient and image: how strongly the sky lights the scene (reflections and ambient light). */
        lighting: number;
        copyFrom(o: Sky): this;
        /** The mode the renderer draws: an image sky without an image falls back to the gradient. */
        get effectiveMode(): SkyMode;
    }
}
declare module "messier/engine/profiler" {
    /** Frames of frame-time history kept for the graph. */
    export const PROFILER_HISTORY = 120;
    /** One section of the last finished frame. Sections come in tree order: a parent, then its children (depth + 1). */
    export interface ProfileSection {
        name: string;
        depth: number;
        /** Milliseconds spent in the section during the frame, all of its runs together. */
        ms: number;
        /** Smoothed `ms`. */
        avg: number;
        /** Times it ran during the frame (fixed steps run several times, or not at all). */
        calls: number;
    }
    /** GPU time of one frame graph pass. */
    export interface GpuPassTime {
        name: string;
        ms: number;
        avg: number;
    }
    export class Profiler {
        /** Record sections and GPU pass times. While off, nothing is measured and the results keep their last values. */
        enabled: boolean;
        /** The clock, in milliseconds. Replaceable for tests. */
        now: () => number;
        /** Time from the previous frame to the last finished one, in milliseconds. */
        frameMs: number;
        avgFrameMs: number;
        /** Time the engine spent on the last finished frame (the top-level sections together). */
        cpuMs: number;
        avgCpuMs: number;
        /** Frames finished while enabled. */
        frames: number;
        /** The last PROFILER_HISTORY frame times, a ring: `historyIndex` is the oldest entry (the next one written). */
        readonly history: Float32Array<ArrayBuffer>;
        historyIndex: number;
        /** The last finished frame's sections, in tree order. */
        sections: ProfileSection[];
        /** Whether the device can time passes (the `timestamp-query` feature). The renderer sets it. */
        gpuSupported: boolean;
        /** GPU time per frame graph pass, in execution order. A few frames behind: the results are read back asynchronously. */
        gpu: GpuPassTime[];
        /** The passes of `gpu` together. */
        gpuMs: number;
        avgGpuMs: number;
        private readonly root;
        private readonly stack;
        private readonly gpuAvg;
        /** Opens a section inside the one that's open (or at the top level). Close it with end(). */
        begin(name: string): void;
        /** Closes the section opened last. */
        end(): void;
        /** Times `fn` as a section. */
        measure<T>(name: string, fn: () => T): T;
        /** Publishes the frame's sections and starts the next frame. `frameMs` is the time since the previous frame. */
        endFrame(frameMs: number): void;
        /** GPU pass times of one frame, as the renderer's timer reads them back. */
        setGpuTimes(names: readonly string[], ms: readonly number[]): void;
        /** Forgets everything measured so far. */
        reset(): void;
        private publish;
    }
    /** The engine's profiler. Engine.step and the renderer report to it; add your own sections with begin()/end(). */
    export const profiler: Profiler;
}
declare module "messier/engine/data" {
    export type Json = Record<string, unknown>;
    export function isObject(v: unknown): v is Json;
    /** Copies `keys` from `src` onto `target` when the value has the same type as the target's current one (numbers must be finite). */
    export function assignKnown<T extends object>(target: T, src: unknown, keys: readonly (keyof T & string)[]): T;
    /** Plain-data copy of `keys` (arrays are copied). */
    export function pickData<T extends object>(src: T, keys: readonly (keyof T & string)[]): Json;
}
declare module "messier/engine/sceneFormat" {
    import { type Json } from "messier/engine/data";
    export const SCENE_FORMAT = "messier-scene";
    export const PREFAB_FORMAT = "messier-prefab";
    /** Version of scene and prefab files. Bump it, with a migration, for changes that old readers would misread. */
    export const SCENE_VERSION = 3;
    /** Calls `fn` for every object of a scene or prefab document: top-level ones, children, objects added to instances. */
    export function forEachObject(doc: Json, fn: (obj: Json) => void): void;
    /**
     * `data` as a current-version document of `format` ('messier-scene' or 'messier-prefab'): itself when it is current,
     * else an upgraded copy. Throws when it isn't such a document or was saved by a newer version. `what` names it in
     * errors ('scene', 'prefab').
     */
    export function upgradeDocument(data: unknown, format: string, what: string): Json;
}
declare module "messier/engine/font" {
    /** Pixels per em at which glyphs are rasterized into the atlas. */
    export const SDF_EM = 48;
    /** Distance value (0…1) of the glyph edge. tiny-sdf's 0.25 cutoff: more reach outside, where outlines go. */
    export const SDF_EDGE = 0.75;
    export const ATLAS_SIZE = 2048;
    export interface FontStyle {
        /** CSS font family list, e.g. 'sans-serif' or 'Georgia, serif'. */
        family: string;
        bold: boolean;
    }
    /** A rasterized glyph: coverage (0…1) of a `width`×`height` bitmap whose pen origin is at (`originX`, `originY`), y down. */
    export interface GlyphBitmap {
        width: number;
        height: number;
        coverage: ArrayLike<number>;
        originX: number;
        originY: number;
        /** Advance in pixels at SDF_EM. */
        advance: number;
    }
    /**
     * Turns characters into coverage bitmaps at `sizePx` pixels per em, with `pad` empty pixels on every side.
     * `metrics` gives the font's ascent and descent in pixels.
     */
    export interface GlyphRasterizer {
        glyph(char: string, font: FontStyle, sizePx: number, pad: number): GlyphBitmap | null;
        metrics(font: FontStyle, sizePx: number): {
            ascent: number;
            descent: number;
        };
    }
    /** A glyph in the atlas. Quad and advance are in ems relative to the pen on the baseline, y up. */
    export interface Glyph {
        advance: number;
        /** False for blank glyphs (spaces) and when nothing could be rasterized. */
        visible: boolean;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        u0: number;
        v0: number;
        u1: number;
        v1: number;
    }
    /**
     * Distance field of a coverage bitmap, as bytes: SDF_EDGE·255 on the edge, higher inside, falling to 0 at
     * SDF_RADIUS·SDF_EDGE pixels outside. Partial coverage places the edge between pixels (as in mapbox's tiny-sdf).
     */
    export function coverageToSDF(coverage: ArrayLike<number>, width: number, height: number): Uint8Array;
    /** Distance threshold that draws an outline `widthEm` ems outside the glyph edge (as far as the field reaches). */
    export function outlineThreshold(widthEm: number): number;
    /**
     * The glyph atlas shared by everything that draws text. Glyphs are added on first use; when the atlas is full it's
     * cleared and refilled, which bumps `generation` so cached layouts know to rebuild.
     */
    export class FontAtlas {
        readonly size = 2048;
        readonly data: Uint8Array<ArrayBuffer>;
        /** Rows changed since the renderer last uploaded (dirtyMin > dirtyMax when clean). */
        dirtyMin: number;
        dirtyMax: number;
        generation: number;
        private rasterizer;
        private glyphs;
        private metrics;
        private shelfX;
        private shelfY;
        private shelfH;
        /** Replaces the rasterizer (null = none) and clears the atlas. Tests use this to run without a browser. */
        setRasterizer(r: GlyphRasterizer | null): void;
        private getRasterizer;
        get hasRasterizer(): boolean;
        /** Ascent and descent in ems. */
        fontMetrics(font: FontStyle): {
            ascent: number;
            descent: number;
        };
        glyph(char: string, font: FontStyle): Glyph;
        private clear;
        private addGlyph;
        /** Marks the atlas uploaded. */
        markClean(): void;
    }
    /** The atlas every text renderer uses. */
    export const fontAtlas: FontAtlas;
    export type TextAlign = 'left' | 'center' | 'right';
    export type TextBaseline = 'top' | 'middle' | 'bottom';
    export const TEXT_ALIGNS: readonly TextAlign[];
    export const TEXT_BASELINES: readonly TextBaseline[];
    export interface TextLayoutOptions extends FontStyle {
        /** Em size in local units. */
        size: number;
        align: TextAlign;
        verticalAlign: TextBaseline;
        /** Line spacing as a multiple of the size. */
        lineHeight: number;
        /** Wraps lines at spaces to fit this width (local units); 0 = no wrapping. */
        maxWidth: number;
    }
    export interface LaidOutGlyph {
        glyph: Glyph;
        /** Pen position on the baseline, local units, y up. */
        x: number;
        y: number;
    }
    export interface TextLayout {
        glyphs: LaidOutGlyph[];
        /** Block bounds in local units (y up), around the line boxes. */
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        lines: number;
    }
    /**
     * Lays `text` out around the local origin, y up: `align` puts the origin at the left, center or right of each line,
     * `verticalAlign` at the top, middle or bottom of the block. Newlines break lines.
     */
    export function layoutText(text: string, o: TextLayoutOptions, atlas?: FontAtlas): TextLayout;
}
declare module "messier/engine/draw2d" {
    import type { Mat4, Vec3, Vec4 } from "messier/engine/math";
    import { type FontAtlas, type TextAlign, type TextBaseline, type TextLayout } from "messier/engine/font";
    /** Floats per 2D vertex: position(3) + uv(2) + color(4) + threshold(1). Threshold < 0 = solid, else SDF edge. */
    export const VERTEX2D_FLOATS = 10;
    export type Point2 = readonly [number, number];
    /**
     * A color for 2D drawing: display-space RGB(A) 0…1 (like CSS colors, not linear like materials), or a CSS hex string
     * ('#rgb', '#rrggbb', '#rrggbbaa').
     */
    export type Color2D = Readonly<Vec4> | Readonly<Vec3> | string;
    export function toColor(c: Color2D | undefined, fallback?: Readonly<Vec4>): Vec4;
    /** Rectangle outline, optionally with rounded corners (radius clamped to half the shorter side). */
    export function rectPoints(x0: number, y0: number, x1: number, y1: number, radius?: number, cornerSegments?: number): Point2[];
    export function ellipsePoints(cx: number, cy: number, rx: number, ry: number, segments?: number): Point2[];
    /** Regular polygon inscribed in the ellipse, with a vertex pointing up (+y). */
    export function regularPolygonPoints(cx: number, cy: number, rx: number, ry: number, sides: number): Point2[];
    /** Triangle indices of a simple polygon (convex or not) by ear clipping. Degenerate input gives fewer triangles. */
    export function triangulate(pts: readonly Point2[]): number[];
    /**
     * Growable 2D vertex stream. Points are given in a local 2D frame and mapped through `matrix` (local x, y, 0 → the
     * batch's target space: world units for world-space batches, CSS pixels with y down for screen-space ones).
     */
    export class Batch2D {
        data: Float32Array<ArrayBuffer>;
        length: number;
        /** Local → target transform, column-major; null = identity. */
        matrix: Mat4 | null;
        get vertexCount(): number;
        reset(): void;
        private reserve;
        private vertex;
        triangle(a: Point2, b: Point2, c: Point2, color: Readonly<Vec4>): void;
        /** Fills a convex polygon as a fan. */
        fillConvex(pts: readonly Point2[], color: Readonly<Vec4>): void;
        /** Fills any simple polygon (concave too). */
        fillPolygon(pts: readonly Point2[], color: Readonly<Vec4>): void;
        /** Strokes a polyline `width` wide, centered on it, with mitered joins (beveled past 4× the width) and butt ends. */
        stroke(input: readonly Point2[], closed: boolean, width: number, color: Readonly<Vec4>): void;
        /** Glyph quads of a layout. `threshold` is the distance-field edge (SDF_EDGE for the glyph itself). */
        glyphs(layout: TextLayout, size: number, color: Readonly<Vec4>, threshold?: number): void;
        /** Text with an optional outline (drawn first, `outlineWidth` in local units). */
        text(layout: TextLayout, size: number, color: Readonly<Vec4>, outlineWidth?: number, outlineColor?: Readonly<Vec4>): void;
    }
    export interface ShapeStyle2D {
        /** Fill color; omit for no fill (a stroke-only shape). Defaults to white when there's no stroke either. */
        fill?: Color2D;
        stroke?: Color2D;
        /** Outline width in pixels (default 1 when `stroke` is set). */
        strokeWidth?: number;
    }
    export interface TextStyle2D {
        /** Pixels per em (default 16). */
        size?: number;
        color?: Color2D;
        font?: string;
        bold?: boolean;
        /** Which side of the text `x` is at (default 'left'). */
        align?: TextAlign;
        /** Which side of the text `y` is at (default 'top'). */
        baseline?: TextBaseline;
        lineHeight?: number;
        maxWidth?: number;
        outlineWidth?: number;
        outlineColor?: Color2D;
    }
    /**
     * Immediate-mode 2D drawing on top of the frame, for HUDs and debug drawing from scripts. Coordinates are CSS pixels
     * from the viewport's top-left corner, y down. Everything drawn during a frame (in update, lateUpdate…) is shown in
     * that frame and then cleared, so draw again every frame.
     */
    export class Draw2D {
        private readonly atlas;
        readonly batch: Batch2D;
        /** Viewport size in CSS pixels, as of the last rendered frame. */
        width: number;
        height: number;
        private readonly flip;
        constructor(atlas?: FontAtlas);
        /** Drops everything drawn so far this frame (the engine does this after each frame). */
        clear(): void;
        private shape;
        rect(x: number, y: number, width: number, height: number, style?: ShapeStyle2D, radius?: number): void;
        circle(cx: number, cy: number, radius: number, style?: ShapeStyle2D): void;
        ellipse(cx: number, cy: number, rx: number, ry: number, style?: ShapeStyle2D): void;
        /** Any simple polygon, given as [x, y] points. */
        polygon(points: readonly Point2[], style?: ShapeStyle2D): void;
        line(x1: number, y1: number, x2: number, y2: number, color?: Color2D, width?: number): void;
        polyline(points: readonly Point2[], color?: Color2D, width?: number, closed?: boolean): void;
        private layout;
        text(str: string, x: number, y: number, style?: TextStyle2D): void;
        /** Size in pixels that text() would cover. */
        measureText(str: string, style?: TextStyle2D): {
            width: number;
            height: number;
        };
    }
    /** The engine's immediate-mode 2D layer (drawn over the frame, cleared after it). */
    export const draw2d: Draw2D;
}
declare module "messier/engine/shapes2d" {
    import { Component } from "messier/engine/component";
    import type { Mat4, Vec4 } from "messier/engine/math";
    import { type Batch2D, type Point2 } from "messier/engine/draw2d";
    import { type TextAlign, type TextBaseline, type TextLayout } from "messier/engine/font";
    /**
     * Where a 2D renderer draws. `world`: on its object's local XY plane (facing +Z), in world units, depth tested
     * against the scene. `screen`: over the viewport like a HUD, in CSS pixels from `anchor` with +Y up, ignoring the
     * camera; the object's transform still places, rotates and scales it (its Z is ignored).
     */
    export type Space2D = 'world' | 'screen';
    export const SPACES_2D: readonly Space2D[];
    export type Anchor2D = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
    export const ANCHORS_2D: readonly Anchor2D[];
    /** Viewport point (CSS pixels, y down) of a screen anchor. */
    export function anchorPoint(anchor: Anchor2D, width: number, height: number): [number, number];
    /** Base of the 2D components: Shape2D and Text2D. Colors are display-space RGBA (like CSS), not linear. */
    export abstract class Renderer2D extends Component {
        space: Space2D;
        /** Screen space: the viewport point the object's position is measured from. */
        anchor: Anchor2D;
        /** Draw order: higher draws on top (within the same space). */
        order: number;
        /** Appends this renderer's triangles to `batch`, whose matrix is already set to the local → target transform. */
        abstract build(batch: Batch2D): void;
        /** Local-space bounds (x0, y0, x1, y1) of what build() draws. */
        abstract localBounds(): [number, number, number, number];
        /**
         * The local → target matrix: the world matrix in world space; for screen space, the world matrix's XY mapped to
         * viewport pixels from the anchor (y flipped to point down). `out` is overwritten.
         */
        targetMatrix(viewWidth: number, viewHeight: number, out?: Mat4): Mat4;
    }
    export type ShapeKind2D = 'rectangle' | 'ellipse' | 'polygon' | 'path';
    export const SHAPE_KINDS_2D: readonly ShapeKind2D[];
    /** Fields saved with a scene (`points` is saved separately because its length varies). Keep in sync with clone(). */
    export const SHAPE2D_FIELDS: readonly ["space", "anchor", "order", "shape", "width", "height", "cornerRadius", "sides", "closed", "filled", "fillColor", "strokeWidth", "strokeColor"];
    type Shape2DInit = Partial<Pick<Shape2D, (typeof SHAPE2D_FIELDS)[number] | 'points'>>;
    /**
     * A filled and/or outlined 2D shape centered on its object: a (rounded) rectangle, an ellipse, a regular polygon, or a
     * path through `points`.
     */
    export class Shape2D extends Renderer2D {
        shape: ShapeKind2D;
        /** Size in local units (meters in world space, pixels in screen space). */
        width: number;
        height: number;
        /** Rectangle: corner radius. */
        cornerRadius: number;
        /** Polygon: number of sides. */
        sides: number;
        /** Path: flat list of local x, y coordinates. */
        points: number[];
        /** Path: join the last point back to the first (open paths are only stroked). */
        closed: boolean;
        filled: boolean;
        fillColor: Vec4;
        /** Outline width in local units; 0 = no outline. */
        strokeWidth: number;
        strokeColor: Vec4;
        constructor(init?: Shape2DInit);
        /** The shape's outline in local coordinates. */
        outline(): Point2[];
        build(batch: Batch2D): void;
        localBounds(): [number, number, number, number];
    }
    /** Fields saved with a scene. Keep in sync with clone(). */
    export const TEXT2D_FIELDS: readonly ["space", "anchor", "order", "text", "fontSize", "fontFamily", "bold", "color", "align", "verticalAlign", "lineHeight", "maxWidth", "outlineWidth", "outlineColor"];
    type Text2DInit = Partial<Pick<Text2D, (typeof TEXT2D_FIELDS)[number]>>;
    /** Text drawn with a distance-field font, so it stays sharp at any size. */
    export class Text2D extends Renderer2D {
        text: string;
        /** Em size in local units (meters in world space, pixels in screen space). */
        fontSize: number;
        /** CSS font family, e.g. 'sans-serif', 'serif', 'monospace' or 'Georgia, serif'. */
        fontFamily: string;
        bold: boolean;
        color: Vec4;
        /** Which side of each line is at the object's origin. */
        align: TextAlign;
        /** Which side of the text block is at the object's origin. */
        verticalAlign: TextBaseline;
        /** Line spacing as a multiple of the font size. */
        lineHeight: number;
        /** Wraps at spaces to fit this width in local units; 0 = no wrapping. */
        maxWidth: number;
        /** Outline width in local units; 0 = none. Reaches up to about 0.15 × fontSize. */
        outlineWidth: number;
        outlineColor: Vec4;
        private _layout;
        private _layoutKey;
        constructor(init?: Text2DInit);
        /** The current layout, cached until a field that affects it (or the font atlas) changes. */
        layout(): TextLayout;
        build(batch: Batch2D): void;
        localBounds(): [number, number, number, number];
    }
}
declare module "messier/engine/sfx" {
    export type SfxWave = 'square' | 'saw' | 'sine' | 'triangle' | 'noise';
    export const SFX_WAVES: readonly SfxWave[];
    export interface SfxParams {
        wave: SfxWave;
        /** Start pitch in Hz (for noise: how fast the noise changes). */
        frequency: number;
        /** Pitch change in octaves per second (negative falls). */
        slide: number;
        /** Seconds: rise to full volume, hold, then fade to silence. The clip is as long as the three together. */
        attack: number;
        sustain: number;
        decay: number;
        /** 0–1: extra volume at the start of the sustain, falling off over it. */
        punch: number;
        /** Vibrato depth (fraction of the pitch) and speed (Hz). */
        vibratoDepth: number;
        vibratoSpeed: number;
        /** Square wave: fraction of each cycle that is high (0.5 is a plain square), and its change per second. */
        duty: number;
        dutySweep: number;
        /** Pitch multiplier applied after `arpeggioTime` seconds (1 or a time of 0: none). Coins and power-ups use it. */
        arpeggio: number;
        arpeggioTime: number;
        /** Restarts the pitch sweep every this many seconds (0: never). */
        repeat: number;
        /** Low-pass cutoff in Hz (0: off). */
        lowpass: number;
        /** 0–1. */
        volume: number;
        /** Noise seed. */
        seed: number;
    }
    export const SFX_DEFAULTS: Readonly<SfxParams>;
    /** Ready-made effects. Use one as is, or spread it and change a field: `{ ...SFX_PRESETS.laser, frequency: 900 }`. */
    export const SFX_PRESETS: {
        coin: Readonly<SfxParams>;
        laser: Readonly<SfxParams>;
        explosion: Readonly<SfxParams>;
        hit: Readonly<SfxParams>;
        jump: Readonly<SfxParams>;
        powerup: Readonly<SfxParams>;
        blip: Readonly<SfxParams>;
        select: Readonly<SfxParams>;
        thump: Readonly<SfxParams>;
        /** A seamless one-second loop: an engine or machine drone. */
        hum: Readonly<SfxParams>;
    };
    export type SfxPresetName = keyof typeof SFX_PRESETS;
    /** The parameters as the number list a clip ref stores. */
    export function packSfx(p: Readonly<SfxParams>): number[];
    /** Reads a packed list; missing or invalid entries keep their defaults. */
    export function unpackSfx(values: readonly number[]): SfxParams;
    /** Renders mono samples at `sampleRate`. */
    export function renderSfx(params: Readonly<SfxParams>, sampleRate?: number): Float32Array<ArrayBuffer>;
    /** A variation of `params`: every number nudged by up to ±`amount` (a fraction), deterministic for a seed. */
    export function mutateSfx(params: Readonly<SfxParams>, seed: number, amount?: number): SfxParams;
}
declare module "messier/engine/audioClip" {
    import { type SfxParams } from "messier/engine/sfx";
    /**
     * Where a clip comes from, so a saved scene can rebuild it: the sound file of an imported project asset, or the
     * synthesizer parameters (`packSfx`) of a generated effect.
     */
    export type ClipRef = {
        asset: string;
        index: number;
    } | {
        sfx: number[];
    };
    /** A sound: sample data (one or two channels) at a sample rate. Clips are immutable, so objects share them freely. */
    export class AudioClip {
        /** Source of the clip, or null when it was made at runtime from raw samples and can't be saved. */
        ref: ClipRef | null;
        /** The Web Audio buffer, created on first play. */
        _buffer: AudioBuffer | null;
        readonly name: string;
        readonly channels: readonly Float32Array<ArrayBuffer>[];
        readonly sampleRate: number;
        constructor(name: string, channels: Float32Array<ArrayBuffer>[], sampleRate: number);
        /** Length in seconds. */
        get duration(): number;
        /**
         * A synthesized sound effect (see `SFX_PRESETS`). The same parameters give the same clip instance, so calling this
         * every time a sound plays is cheap.
         */
        static synth(params: Readonly<SfxParams> | readonly number[], name?: string): AudioClip;
        /** The synthesizer parameters of a clip made by `synth()`, or null for other clips. */
        get sfx(): SfxParams | null;
        /** Copies a decoded Web Audio buffer. */
        static fromAudioBuffer(buffer: AudioBuffer, name: string): AudioClip;
    }
}
declare module "messier/engine/audio" {
    import type { AudioClip } from "messier/engine/audioClip";
    import type { Camera } from "messier/engine/camera";
    import type { Component } from "messier/engine/component";
    import type { Scene } from "messier/engine/scene";
    import type { Vec3 } from "messier/engine/math";
    /** Options for `audio.play()`. */
    export interface PlayOptions {
        /** 0 and up (1 = as recorded). */
        volume?: number;
        /** Playback speed: 2 is an octave up and twice as fast. */
        pitch?: number;
        loop?: boolean;
        /** World position: the sound is panned and fades with distance from the listener (and follows `owner`, if given). Omit for a 2D sound. */
        position?: Readonly<Vec3>;
        /** Positional sounds: full volume up to this distance... */
        minDistance?: number;
        /** ...fading to silence at this one. */
        maxDistance?: number;
        /**
         * The component the sound belongs to (an AudioSource). A positional sound follows its object, and the sound stops
         * when the component stops being live in the active, running scene (disabled, destroyed, or its scene unloaded).
         */
        owner?: Component;
    }
    /** One playing sound. */
    export class AudioVoice {
        /** Set when the sound finished or was stopped. */
        ended: boolean;
        readonly owner: Component | null;
        readonly loop: boolean;
        readonly startedAt: number;
        readonly _node: AudioBufferSourceNode;
        readonly _gain: GainNode;
        readonly _panner: PannerNode | null;
        constructor(node: AudioBufferSourceNode, gain: GainNode, panner: PannerNode | null, owner: Component | null, loop: boolean, startedAt: number);
        get playing(): boolean;
        set volume(v: number);
        set pitch(v: number);
        stop(): void;
        _setPosition(p: Readonly<Vec3>): void;
    }
    /**
     * Sound output, through the Web Audio API. Browsers only let a page start audio after the user interacted with it,
     * and the engine never listens to the page itself: the host (the editor, or a built game) calls `resume()` from
     * its key and pointer handlers. Until then, and wherever there is no Web Audio (Node), `play()` does nothing and
     * returns null. `Engine.step` calls `update()` every frame to move the listener with the camera being rendered.
     */
    export class AudioSystem {
        private ctx;
        private master;
        private readonly voices;
        private volume;
        private mute;
        /** Whether this environment has Web Audio at all. */
        get supported(): boolean;
        /** True once the context exists and runs (after the first user interaction): sounds are audible. */
        get ready(): boolean;
        /** The Web Audio context, once `resume()` created it. */
        get context(): AudioContext | null;
        get masterVolume(): number;
        set masterVolume(v: number);
        get muted(): boolean;
        set muted(v: boolean);
        /** Sounds playing now. */
        get activeVoices(): number;
        /** Creates or resumes the audio context. Call it from a user gesture (key or pointer event). */
        resume(): void;
        /** Decodes a sound file (wav, mp3, ogg…). Works before `resume()`; fails where there is no Web Audio. */
        decode(data: ArrayBuffer): Promise<AudioBuffer>;
        /** Plays a clip once (or looping). Returns null when audio isn't running yet or the clip is empty. */
        play(clip: AudioClip, options?: PlayOptions): AudioVoice | null;
        /** Stops every sound. */
        stopAll(): void;
        /**
         * Per frame: places the listener at `view`, moves positional sounds with their owners, and stops sounds whose owner
         * left the running `scene`.
         */
        update(scene: Scene, view: Camera): void;
        private prune;
        private applyVolume;
    }
    /** The engine's sound output. */
    export const audio: AudioSystem;
}
declare module "messier/engine/audioSource" {
    import { type AudioVoice } from "messier/engine/audio";
    import type { AudioClip } from "messier/engine/audioClip";
    import { Component } from "messier/engine/component";
    import type { Scene } from "messier/engine/scene";
    /** Fields saved with a scene (the clip is saved as a ref). Keep in sync with clone(). */
    export const AUDIO_SOURCE_FIELDS: readonly ["volume", "pitch", "loop", "playOnStart", "spatial", "minDistance", "maxDistance"];
    type AudioSourceInit = Partial<Pick<AudioSource, (typeof AUDIO_SOURCE_FIELDS)[number] | 'clip'>>;
    /**
     * Plays a clip from its object. Sounds only play while the scene runs (Play in the editor, or a built game), and stop
     * when the source is disabled, its object is deactivated or destroyed, or another scene loads. A `spatial` source is
     * heard from where its object is, relative to the camera being rendered.
     */
    export class AudioSource extends Component {
        clip: AudioClip | null;
        /** 0 and up. */
        volume: number;
        /** Playback speed: 2 is an octave up. */
        pitch: number;
        loop: boolean;
        /** Plays whenever the source becomes live in a running scene: when Play starts, or when its object is activated. */
        playOnStart: boolean;
        /** Positional: panned and fading with distance. Off: the same everywhere (music, UI sounds). */
        spatial: boolean;
        /** Spatial: full volume up to this distance, fading to silence at maxDistance. */
        minDistance: number;
        maxDistance: number;
        _voice: AudioVoice | null;
        _autoplayed: boolean;
        constructor(init?: AudioSourceInit);
        /** Whether the source's own sound (from play()) is playing. One-shots don't count. */
        get isPlaying(): boolean;
        /** Plays the clip from the start, replacing what play() started before. */
        play(): void;
        stop(): void;
        /** Plays a clip (default: this source's) once over whatever is playing; several can overlap: shots, footsteps, impacts. */
        playOneShot(clip?: AudioClip | null, volumeScale?: number): void;
        _start(clip: AudioClip, volumeScale: number, loop: boolean): AudioVoice | null;
    }
    /**
     * Per frame, for the active scene: starts `playOnStart` sources each time they become live (enabled, active, in the
     * running scene) once audio runs, so a looping sound that was due before the first user interaction still starts.
     * Also applies volume and pitch changes to playing sounds.
     */
    export function updateAudioSources(scene: Scene): void;
}
declare module "messier/engine/serialize" {
    import { GameObject, type Scene } from "messier/engine/scene";
    import { type Texture } from "messier/engine/material";
    import type { AudioClip, ClipRef } from "messier/engine/audioClip";
    import type { Mesh, ResourceRef } from "messier/engine/mesh";
    import { type Quat, type Vec3 } from "messier/engine/math";
    import { type Json } from "messier/engine/data";
    import { SCENE_FORMAT } from "messier/engine/sceneFormat";
    import { type NodeData, type PrefabData, type PrefabLibrary } from "messier/engine/prefab";
    export { SCENE_FORMAT, SCENE_VERSION, PREFAB_FORMAT } from "messier/engine/sceneFormat";
    export type BehaviourData = {
        type: string;
        enabled: boolean;
        params: Record<string, number>;
    } | {
        script: string;
        enabled: boolean;
        overrides: Record<string, number>;
    };
    export interface ObjectData {
        /** Set in prefabs: the object's id within the prefab. */
        id?: string;
        name: string;
        position: Vec3;
        rotation: Quat;
        scale: Vec3;
        visible: boolean;
        castShadows: boolean;
        mesh?: ResourceRef;
        /** Material fields plus `texture` (a ref). */
        material?: Json;
        light?: Json;
        camera?: Json;
        rigidBody?: Json;
        /** Shape2D fields plus `points` (flat x, y list). */
        shape2d?: Json;
        text2d?: Json;
        /** AudioSource fields plus `clip` (a ClipRef). */
        audioSource?: Json;
        behaviours?: BehaviourData[];
        children?: NodeData[];
    }
    export interface SceneData {
        format: typeof SCENE_FORMAT;
        version: number;
        /** Environment (ambient, background, exposure, shadow extent), `sky` (Sky fields plus `texture`, a ref) and `physics` ({ gravity, iterations }). */
        settings: Json;
        objects: NodeData[];
    }
    /** Turns refs back into meshes and textures while a scene loads. */
    export interface SceneResources {
        /** Prefabs by asset id; without it, prefab instances load as empty placeholders (with a warning). */
        prefab?(id: string): PrefabData | null;
        mesh(ref: ResourceRef): Mesh | null;
        texture(ref: ResourceRef): Texture | null;
        /** Sound clips; without it, sources load without their clip (with a warning). */
        clip?(ref: ClipRef): AudioClip | null;
    }
    export function isClipRef(v: unknown): v is ClipRef;
    export function isResourceRef(v: unknown): v is ResourceRef;
    /**
     * Stamps `{ asset, index }` refs on the meshes and textures of a freshly loaded
     * model, numbered in hierarchy order. Loaders are deterministic, so loading the
     * same files again and tagging them gives the same numbering.
     */
    export function tagAssetResources(root: GameObject, asset: string): {
        meshes: Mesh[];
        textures: Texture[];
    };
    /** Snapshot of the scene as JSON-safe data. Problems (meshes built at runtime) are appended to `warnings`. */
    export function serializeScene(scene: Scene, warnings?: string[]): SceneData;
    /** One object with its descendants as saved in a scene; a prefab instance (needs `prefabs`) as its link and changes. */
    export function serializeObject(obj: GameObject, prefabs: PrefabLibrary | null, warnings?: string[]): NodeData;
    /**
     * A prefab made of `obj` and its descendants. Instances among them become nested instances, and an instance root
     * makes a variant of its prefab. With `applyTo` (the prefab `obj` is an instance of), it's that prefab's new
     * version instead, `obj`'s changes included: its objects keep their ids, so other instances' overrides still find
     * them. Throws when the prefab would contain itself.
     */
    export function prefabFromObject(obj: GameObject, prefabs: PrefabLibrary | null, warnings?: string[], applyTo?: string): PrefabData;
    /**
     * Turns an instance back into plain objects: its objects forget the prefab, while instances nested in it stay
     * instances (and a variant becomes an instance of the prefab it's based on). Returns a function that undoes it.
     */
    export function unpackInstance(obj: GameObject, prefabs: PrefabLibrary | null): () => void;
    /** `data` as a scene of the current version (upgraded if it's older). Throws unless it's a scene this version can read. */
    export function upgradeSceneData(data: unknown): SceneData;
    /**
     * Replaces the scene's objects and settings with `data`. Scripts are looked up
     * by name in `scene.scripts`, so load the project's scripts first. Missing
     * resources, prefabs, scripts and behaviour types are skipped and reported in `warnings`.
     */
    export function applySceneData(scene: Scene, data: unknown, resources: SceneResources, warnings?: string[]): void;
    /** A detached object built from saved data of the current version (see serializeObject). */
    export function deserializeObject(data: NodeData, scene: Scene, resources: SceneResources, warnings?: string[]): GameObject;
    /** A new, detached instance of prefab `id` as the prefab has it (its root's name and transform); null when it's missing. */
    export function instantiatePrefab(id: string, scene: Scene, resources: SceneResources, warnings?: string[]): GameObject | null;
    /** Asset ids a scene uses itself: its objects' (see collectAssetIds) and its sky image's. Project.usedAssetIds adds what its prefabs use. */
    export function sceneAssetIds(data: SceneData, out?: Set<string>): Set<string>;
    /** Asset ids anywhere in saved data: refs of meshes, textures and sounds, and prefabs that instances link to. */
    export function collectAssetIds(data: unknown, out?: Set<string>): Set<string>;
}
declare module "messier/engine/prefab" {
    import { type Json } from "messier/engine/data";
    import { PREFAB_FORMAT } from "messier/engine/sceneFormat";
    import type { ObjectData } from "messier/engine/serialize";
    import type { Quat, Vec3 } from "messier/engine/math";
    export const PREFAB_EXTENSION = ".prefab";
    export const isPrefabFile: (name: string) => boolean;
    export interface PrefabData {
        format: typeof PREFAB_FORMAT;
        version: number;
        /** Every object in it (the root included) has an `id`. */
        root: NodeData;
    }
    /** A prefab instance as saved in a scene or a prefab. */
    export interface PrefabInstanceData {
        /** The prefab's asset id. */
        prefab: string;
        /** Its id, inside a prefab. */
        id?: string;
        name: string;
        position: Vec3;
        rotation: Quat;
        scale: Vec3;
        /**
         * Object id → changed values, by object key (`visible`, `mesh`, `behaviours`…: replaced whole) or
         * `<component>.<field>` (`material.color`). A component key set to null removes the component, a field set to
         * null removes the field (a texture).
         */
        overrides?: Record<string, Json>;
        /** Objects of the prefab (with their descendants) this instance leaves out. */
        removed?: string[];
        /** Objects this instance adds, at `index` among the children of the prefab object `parent`. */
        added?: {
            parent: string;
            index: number;
            object: NodeData;
        }[];
    }
    /** An object in a scene or prefab: plain, or a prefab instance. */
    export type NodeData = ObjectData | PrefabInstanceData;
    /** Prefab data by asset id. */
    export interface PrefabLibrary {
        prefab(id: string): PrefabData | null;
    }
    export function isInstanceData(d: unknown): d is PrefabInstanceData;
    /** Keys of an expanded tree that aren't saved object data. */
    export const EXPANDED_KEYS: readonly ["id", "instanceOf", "missingPrefab"];
    /** A new object id for a prefab. Ids only have to be unique within their prefab; never contain '/'. */
    export function newNodeId(): string;
    /** Prefab file text: pretty JSON, like scene files. */
    export function prefabText(data: PrefabData): string;
    /** The prefab in a file's bytes, upgraded to the current version (cached per byte array). Throws when it isn't one. */
    export function readPrefab(bytes: Uint8Array): PrefabData;
    /** A prefab document around `root`, at the current version. */
    export function prefabDocument(root: NodeData): PrefabData;
    /** An id of a prefab's own expansion (whose root is `prefabRoot`) as seen in an instance whose root has id `rootId`. */
    export function scopedId(id: string, prefabRoot: string, rootId: string): string;
    /** The inverse of scopedId; null when `id` isn't in that instance. */
    export function unscopedId(id: string, prefabRoot: string, rootId: string): string | null;
    /**
     * A prefab's objects as one tree (a copy): nested instances expanded, every object with its `id` and nested instance
     * roots marked with `instanceOf` (their prefab). Null when the prefab is missing or contains itself.
     */
    export function expandPrefab(id: string, lib: PrefabLibrary, warnings?: string[], stack?: string[]): Json | null;
    /**
     * Stands in for an instance whose prefab is missing: an empty object with the instance's name and transform, carrying
     * the instance data (`missingPrefab`) so saving writes it back unchanged.
     */
    export function missingPrefab(d: PrefabInstanceData, warnings: string[]): Json;
    /** The objects of an instance: its prefab's, changed as the instance says. Null when the prefab is missing. */
    export function expandInstance(inst: PrefabInstanceData, lib: PrefabLibrary, warnings?: string[], stack?: string[]): Json | null;
    /**
     * The changes that turn `base` (a prefab's expansion) into `live` (the same objects as saved now, by id, plus objects
     * in `added` that the prefab doesn't have). Children of `live` in `added` are saved whole, at their index.
     */
    export function diffInstance(live: Json, base: Json, added: ReadonlySet<Json>): Pick<PrefabInstanceData, 'overrides' | 'removed' | 'added'>;
    /** Prefab ids that data uses (instances anywhere in it), and the ones those prefabs use in turn. */
    export function prefabDependencies(data: unknown, lib: PrefabLibrary, out?: Set<string>): Set<string>;
}
declare module "messier/engine/scene" {
    import { type Mat4, type Quat, type Vec3 } from "messier/engine/math";
    import { Transform } from "messier/engine/transform";
    import { Component, type ComponentClass, type ComponentInit, type ComponentType } from "messier/engine/component";
    import type { Mesh } from "messier/engine/mesh";
    import type { Material } from "messier/engine/material";
    import { Light } from "messier/engine/light";
    import { CameraComponent } from "messier/engine/camera";
    import { Behaviour } from "messier/engine/behaviours";
    import { PhysicsWorld, RigidBody } from "messier/engine/physics";
    import { ScriptLibrary } from "messier/engine/scripting";
    import { Signal } from "messier/engine/signal";
    import { Sky } from "messier/engine/sky";
    import type { Json } from "messier/engine/data";
    import type { PrefabLibrary } from "messier/engine/prefab";
    /**
     * A node in the scene graph: a name, a Transform (always exactly one), child objects and components.
     * `mesh`, `material`, `light`, `camera` and `rigidBody` are shortcuts for the first component of that kind.
     */
    export class GameObject {
        readonly id: number;
        name: string;
        readonly transform: Transform;
        /** Child objects, in order. Change it through add()/remove() or transform.setParent(). */
        readonly children: readonly GameObject[];
        /**
         * On the root of a prefab instance (or of an instance nested in one): the prefab's asset id. Scenes save an
         * instance as this link plus how its objects differ from the prefab.
         */
        prefab: string | null;
        /** In a prefab instance: the id of the prefab object this one is (see prefab.ts), or null. */
        prefabNode: string | null;
        /** An instance whose prefab didn't load: its saved data, written back as it was. */
        _prefabStash: Json | null;
        _scene: Scene | null;
        /** In a scene, active in the hierarchy and not destroyed: its enabled components are live. */
        _live: boolean;
        private _activeSelf;
        private _activeInHierarchy;
        private _destroyed;
        private readonly _components;
        private _groups;
        private _castShadows;
        private _childAdded;
        private _childRemoved;
        private _destroyedSignal;
        constructor(name?: string);
        get parent(): GameObject | null;
        /** Adds `child` at `index` (default: last), keeping its local transform. */
        add(child: GameObject, index?: number): GameObject;
        remove(child: GameObject): void;
        isAncestorOf(other: GameObject): boolean;
        /** The scene this object is in, or null when detached. */
        get scene(): Scene | null;
        traverse(fn: (obj: GameObject) => void | boolean): void;
        /** A descendant by a path of child names: `find('Body/Weapon')`. Null if any step is missing. */
        find(path: string): GameObject | null;
        /** Emitted after a child is added (including reordering under the same parent). */
        get childAdded(): Signal<[child: GameObject]>;
        /** Emitted after a child is removed. */
        get childRemoved(): Signal<[child: GameObject]>;
        /** Emitted once when the object is destroyed. */
        get destroyed(): Signal<[obj: GameObject]>;
        /** The object's own active flag. Inactive objects and their descendants aren't drawn and their components don't run. */
        get activeSelf(): boolean;
        set activeSelf(v: boolean);
        setActive(active: boolean): void;
        /** Active itself and all its ancestors are active. */
        get activeInHierarchy(): boolean;
        /** Same as activeSelf (the editor's "Visible" checkbox and older scenes call it that). */
        get visible(): boolean;
        set visible(v: boolean);
        /** True when this object and all its ancestors are visible (active). */
        isVisibleInHierarchy(): boolean;
        /** True from the moment the object is destroyed. */
        get isDestroyed(): boolean;
        /** Groups (tags) this object belongs to. */
        get groups(): ReadonlySet<string>;
        addToGroup(name: string): void;
        removeFromGroup(name: string): void;
        isInGroup(name: string): boolean;
        /** Attached components in order (not including the transform). */
        get components(): readonly Component[];
        /** The attached behaviours (a new array each call). */
        get behaviours(): Behaviour[];
        /** Creates a component, applies `init` and attaches it. */
        addComponent<T extends Component>(type: ComponentType<T>, init?: ComponentInit<T>): T;
        /** Attaches an existing, detached component at `index` (default: last). */
        attachComponent<T extends Component>(component: T, index?: number): T;
        /** Detaches a component without destroying it, so it can be attached again (the editor's undo uses this). */
        detachComponent(component: Component): boolean;
        /** Destroys a component of this object. */
        removeComponent(component: Component): void;
        /** The first component that is an instance of `type` (subclasses included), or null. */
        getComponent<T extends Component>(type: ComponentClass<T>): T | null;
        /** Every component that is an instance of `type`, appended to `out`. */
        getComponents<T extends Component>(type: ComponentClass<T>, out?: T[]): T[];
        /** The first matching component on this object or a descendant (depth first), skipping inactive objects unless asked. */
        getComponentInChildren<T extends Component>(type: ComponentClass<T>, includeInactive?: boolean): T | null;
        /** The first matching component on this object or an ancestor. */
        getComponentInParent<T extends Component>(type: ComponentClass<T>): T | null;
        get mesh(): Mesh | null;
        set mesh(m: Mesh | null);
        get material(): Material | null;
        set material(m: Material | null);
        get castShadows(): boolean;
        set castShadows(v: boolean);
        get light(): Light | null;
        set light(l: Light | null);
        get camera(): CameraComponent | null;
        set camera(c: CameraComponent | null);
        get rigidBody(): RigidBody | null;
        set rigidBody(rb: RigidBody | null);
        private _meshRenderer;
        private _replace;
        /** World matrix (cached and always current; don't modify). */
        get worldMatrix(): Mat4;
        get normalMatrix(): Mat4;
        /** A copy of the world matrix. */
        computeWorldMatrix(): Mat4;
        worldPosition(): Vec3;
        worldRotation(): Quat;
        /** Direction the object faces (local -Z) in world space. */
        forward(): Vec3;
        /** Sets the world-space position, converting into the parent's space. */
        setWorldPosition(p: Vec3): void;
        setWorldRotation(q: Quat): void;
        /** Re-parents while keeping the current world transform. */
        setParentKeepWorld(parent: GameObject, index?: number): void;
        /**
         * Deep copy of the object, its components (via Component.clone()) and descendants. Meshes and textures are shared;
         * materials are copied. The copy is detached; see GameObject.instantiate().
         */
        clone(): GameObject;
        /**
         * Clones `original` into a scene: under `parent` (keeping the original's local transform) or, by default, at the
         * top level of the original's scene where the original is in the world.
         */
        static instantiate(original: GameObject, parent?: GameObject): GameObject;
        /**
         * Destroys an object (with its descendants) or a single component. In a running scene this is deferred: the target
         * is marked at once (it leaves Scene.query() and gets no further callbacks), and onDisable → onDestroy run and it is
         * detached at the end of the frame (Scene.processDestroyed). Elsewhere it happens immediately.
         */
        static destroy(target: GameObject | Component): void;
        /** Runs the destroy callbacks and detaches `target`. Called by destroy() or at the end of the frame. */
        static _finishDestroy(target: GameObject | Component): void;
        private _markDestroyed;
        private _dispose;
        /** Called by Transform.setParent after the hierarchy changed. */
        _parentChanged(oldParent: GameObject | null): void;
        /** Marks this object as the root of `scene`. */
        _makeSceneRoot(scene: Scene): void;
        /** Recomputes scene, activeInHierarchy and liveness for this subtree and syncs components whose state changed. */
        private _refreshState;
    }
    /** Where a scene's prefabs come from: the project it was loaded from (ProjectResources). */
    export interface PrefabSource extends PrefabLibrary {
        /** A new, detached instance of a prefab by asset name, path under assets/ or id; null when there's no such prefab. */
        instantiatePrefab(prefab: string, scene: Scene): GameObject | null;
    }
    export class Scene {
        /** Invisible container; top-level objects are its children. */
        readonly root: GameObject;
        /** Linear RGB ambient light color, multiplied by ambientIntensity. Unused while the sky lights the scene. */
        ambientColor: Vec3;
        ambientIntensity: number;
        /** Clear color (display space), shown when `sky.mode` is 'color'. */
        background: Vec3;
        /** Backdrop and, unless it's a flat color, environment lighting. */
        readonly sky: Sky;
        exposure: number;
        /** How far from the camera (world units, along its view) the directional light's shadows reach. */
        shadowDistance: number;
        /** Shadow map cascades over that distance (1–4): more keeps near shadows sharper the farther it reaches. */
        shadowCascades: number;
        readonly physics: PhysicsWorld;
        /** TypeScript behaviour scripts available to this scene's objects (shared with clones). */
        readonly scripts: ScriptLibrary;
        /** The project's prefabs, for instantiate() and for saving instances. Set by whoever loads the scene; shared with clones. */
        prefabs: PrefabSource | null;
        /** Emitted when a behaviour's hook throws (the behaviour is then paused). Without listeners the error is logged. */
        readonly behaviourError: Signal<[behaviour: Behaviour, error: unknown, hook: string]>;
        private readonly _registry;
        private readonly _groups;
        private _running;
        private readonly _startQueue;
        private readonly _updateList;
        private readonly _fixedList;
        private readonly _lateList;
        private _dispatching;
        private _holes;
        private readonly _destroyQueue;
        private readonly _clock;
        constructor(scripts?: ScriptLibrary);
        /**
         * A copy to run (the editor plays a clone so Stop can throw it away): same settings and script library, every
         * object cloned with GameObject.clone(). The copy isn't running.
         */
        clone(): Scene;
        /**
         * Adds an instance of a prefab of the project (by name, such as 'Enemy', or by its path under assets/) under
         * `parent` (default: the top level), with the prefab's own transform. Returns it, or null (with a warning) when the
         * project has no such prefab.
         */
        instantiate(prefab: string, parent?: GameObject): GameObject | null;
        /** The top-level objects. */
        get rootObjects(): readonly GameObject[];
        add(obj: GameObject, parent?: GameObject): GameObject;
        remove(obj: GameObject): void;
        traverse(fn: (obj: GameObject) => void | boolean): void;
        find(predicate: (obj: GameObject) => boolean): GameObject | null;
        findByName(name: string): GameObject | null;
        /**
         * Live components of a class (subclasses included): enabled, on objects active in this scene. The array is kept up
         * to date as components are added, removed, enabled and disabled, so don't modify it, and copy it if you change
         * the scene while iterating.
         */
        query<T extends Component>(type: ComponentClass<T>): readonly T[];
        /** Objects in this scene that are in group `name` (active or not), in the order they joined. */
        getGroup(name: string): readonly GameObject[];
        /** The camera the game renders through: the live camera with the highest priority (ties: the one listed first). */
        activeCamera(): GameObject | null;
        /** Brings every world matrix up to date in one top-down pass (world matrices are also correct when read lazily). */
        updateMatrices(): void;
        /** Whether behaviours run (Play). */
        get running(): boolean;
        /**
         * Starts or stops running behaviours. Starting wakes every live behaviour (awake, then onEnable; start comes before
         * its first update). Stopping runs onDisable and onDestroy and forgets lifecycle state, so the next start begins
         * with awake again.
         */
        setRunning(running: boolean): void;
        /** One fixed step: start pending behaviours, fixedUpdate, then physics. */
        fixedUpdate(fixedDt: number): void;
        /** Starts pending behaviours, then runs update(dt, time). */
        updateBehaviours(dt: number, time: number): void;
        lateUpdate(dt: number): void;
        /** Finishes destroys requested during the frame (onDisable → onDestroy → detach). The engine calls it last. */
        processDestroyed(): void;
        /**
         * Runs one whole frame with the scene's own fixed-step clock: when playing, fixed steps, update and lateUpdate;
         * then world matrices and pending destroys. Handy for tools and tests; the engine drives the phases itself.
         */
        update(dt: number, time: number, playing: boolean): void;
        _queueStart(b: Behaviour): void;
        _queueDestroy(target: GameObject | Component): void;
        _addToLists(b: Behaviour): void;
        _removeFromLists(b: Behaviour): void;
        private _removeFrom;
        private _flushStarts;
        private _dispatch;
        private _compact;
        _register(c: Component): void;
        _unregister(c: Component): void;
        _groupAdd(name: string, obj: GameObject): void;
        _groupRemove(name: string, obj: GameObject): void;
    }
}
declare module "messier/engine/component" {
    import type { GameObject, Scene } from "messier/engine/scene";
    import type { Transform } from "messier/engine/transform";
    /** A concrete component class that addComponent() can construct. */
    export type ComponentType<T extends Component> = new () => T;
    /** Any component class, including abstract ones like Behaviour, for lookups and queries. */
    export type ComponentClass<T extends Component> = abstract new (...args: never[]) => T;
    type DataKeys<T> = {
        [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K;
    }[keyof T];
    /** Initial field values for addComponent(), applied before the component is attached (so before awake). */
    export type ComponentInit<T> = Partial<Pick<T, DataKeys<T>>>;
    /**
     * Base class of everything attached to a GameObject (except its Transform). A component is *live* while it's
     * enabled and its object is active in the hierarchy of a scene; live components are listed by Scene.query().
     */
    export abstract class Component {
        private _gameObject;
        private _enabled;
        _registeredIn: Scene | null;
        _destroyed: boolean;
        /** The object this component is attached to. Throws before it's attached (e.g. in field initializers). */
        get gameObject(): GameObject;
        /** Whether the component is attached to an object. */
        get attached(): boolean;
        get transform(): Transform;
        get enabled(): boolean;
        set enabled(v: boolean);
        /** Enabled, attached to an object that is active in a scene's hierarchy, and not destroyed. */
        get isActiveAndEnabled(): boolean;
        /** True from the moment the component (or its object) is destroyed. */
        get isDestroyed(): boolean;
        /**
         * A detached copy for GameObject.clone()/instantiate(). The default constructs the same class and copies own
         * enumerable fields that don't start with `_`: arrays and typed arrays one level deep (vectors), Signals as new
         * empty signals (a copy has its own listeners), other objects shared. Override it when a component holds state
         * that needs deeper copies.
         */
        clone(): Component;
        /** Public fields only, so components can be logged and stringified (the owner link would be circular). */
        toJSON(): Record<string, unknown>;
        /** Called once when the destruction completes (after onDestroy for behaviours). */
        _disposed(): void;
        /** Called by GameObject when this component is attached to or detached from it. */
        _setOwner(obj: GameObject | null): void;
        /**
         * Re-evaluates whether the component should be listed in its scene (and, for behaviours, which lifecycle callbacks
         * are due). Called whenever enabled, the object's active state, its scene or the destroyed flag may have changed.
         */
        _sync(): void;
    }
}
declare module "messier/engine/light" {
    import { Component } from "messier/engine/component";
    import type { Vec3 } from "messier/engine/math";
    export type LightType = 'directional' | 'point' | 'spot';
    export const LIGHT_TYPE_INDEX: Record<LightType, number>;
    /** Fields saved with a scene. Keep in sync with clone(). */
    export const LIGHT_FIELDS: readonly ["type", "color", "intensity", "range", "innerAngle", "outerAngle", "castShadows"];
    /**
     * Light component. Position and direction come from the owning GameObject:
     * lights shine along the object's local -Z axis.
     */
    export class Light extends Component {
        type: LightType;
        /** Linear RGB. */
        color: Vec3;
        intensity: number;
        /** Point / spot: distance at which the light fades to zero. */
        range: number;
        /** Spot: full-intensity cone half-angle in degrees. */
        innerAngle: number;
        /** Spot: cut-off cone half-angle in degrees. */
        outerAngle: number;
        /**
         * Renders a shadow map. Directional: cascades out to Scene.shadowDistance (the first such light only). Point and
         * spot: a shadow map of their own, while there's room (twelve spot lights or two point lights, nearest first).
         */
        castShadows: boolean;
        constructor(type?: LightType, color?: Vec3, intensity?: number);
        clone(): Light;
    }
}
declare module "messier/engine/input" {
    /** Built-in axes: WASD and the arrow keys. `vertical` is positive for W / Up. */
    export type AxisName = 'horizontal' | 'vertical';
    /**
     * Keyboard state for scripts, by `KeyboardEvent.code` ('KeyW', 'ArrowUp',
     * 'Space', 'ShiftLeft'…), so bindings don't move with the keyboard layout.
     *
     * The engine never listens to the DOM itself: the host (the editor, or a game
     * page) forwards events with `keyDown`/`keyUp`, which lets it decide when the
     * game has the keyboard. `Engine` calls `endFrame()` after each update, so
     * `pressed`/`released` are true for exactly one update, even for a tap that
     * went down and up between two frames.
     */
    export class InputState {
        private readonly down;
        private readonly pressedNow;
        private readonly releasedNow;
        /** True while any of the keys is held. */
        isDown(...codes: string[]): boolean;
        /** True on the update after any of the keys went down (key repeat doesn't count). */
        pressed(...codes: string[]): boolean;
        /** True on the update after any of the keys was let go. */
        released(...codes: string[]): boolean;
        /**
         * -1, 0 or 1. Either a built-in axis (`'horizontal'`: A/D and ←/→,
         * `'vertical'`: S/W and ↓/↑) or your own negative and positive key lists.
         * Holding both sides gives 0.
         */
        axis(name: AxisName): number;
        axis(negative: string[], positive: string[]): number;
        /** Keys currently held, for debugging. */
        get keys(): string[];
        keyDown(code: string): void;
        keyUp(code: string): void;
        /** Forget everything, e.g. on window blur, where keyup events never arrive. */
        reset(): void;
        endFrame(): void;
    }
    /** The keyboard, shared by every script: `import { input } from 'messier'`. */
    export const input: InputState;
}
declare module "messier/engine/primitives" {
    import { Mesh } from "messier/engine/mesh";
    export function createCube(size?: number): Mesh;
    export function createSphere(radius?: number, segments?: number, rings?: number): Mesh;
    export function createPlane(size?: number, subdivisions?: number): Mesh;
    export function createCylinder(radius?: number, height?: number, segments?: number): Mesh;
    export function createTorus(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number): Mesh;
    export type PrimitiveKind = 'cube' | 'sphere' | 'plane' | 'cylinder' | 'torus';
    /** Rebuilds a primitive from a saved `{ primitive, args }` ref, or null for an unknown kind. */
    export function buildPrimitive(kind: string, args: number[]): Mesh | null;
    /** Shared unit-sized primitive meshes for editor "Add" menus. */
    export function getPrimitive(kind: PrimitiveKind): Mesh;
}
declare module "messier/engine/overlay" {
    import { type Vec3, type Vec4 } from "messier/engine/math";
    import type { Camera } from "messier/engine/camera";
    /** Floats per overlay vertex: position(3) + color(4). */
    export const OVERLAY_STRIDE_FLOATS = 7;
    /**
     * Immediate-mode builder for editor helper geometry. Lines are expanded on the
     * CPU into camera-facing ribbons with a constant on-screen pixel width.
     * `depth` geometry is occluded by the scene; `top` geometry is always visible.
     */
    export class OverlayBuilder {
        readonly depth: number[];
        readonly top: number[];
        private camera;
        private viewportHeight;
        begin(camera: Camera, viewportHeight: number): void;
        get isEmpty(): boolean;
        pixelSize(p: Readonly<Vec3>): number;
        triangle(a: Readonly<Vec3>, b: Readonly<Vec3>, c: Readonly<Vec3>, color: Readonly<Vec4>, onTop?: boolean): void;
        /** Line segment with a constant on-screen width in pixels. */
        line(a: Readonly<Vec3>, b: Readonly<Vec3>, color: Readonly<Vec4>, widthPx?: number, onTop?: boolean): void;
        polyline(points: Readonly<Vec3>[], color: Readonly<Vec4>, widthPx?: number, onTop?: boolean, closed?: boolean): void;
        /** Circle in the plane perpendicular to `normal`. */
        circle(center: Readonly<Vec3>, normal: Readonly<Vec3>, radius: number, color: Readonly<Vec4>, widthPx?: number, onTop?: boolean, segments?: number): void;
        cone(base: Readonly<Vec3>, tip: Readonly<Vec3>, radius: number, color: Readonly<Vec4>, onTop?: boolean, segments?: number): void;
        /** Axis-aligned cube centered at `center`. */
        cube(center: Readonly<Vec3>, half: number, color: Readonly<Vec4>, onTop?: boolean): void;
        /** Small octahedron, used as a light icon. */
        diamond(center: Readonly<Vec3>, radius: number, color: Readonly<Vec4>, onTop?: boolean): void;
        /** Wireframe box from 8 corners ordered as produced by boxCorners(). */
        wireBox(corners: Vec3[], color: Readonly<Vec4>, widthPx?: number, onTop?: boolean): void;
    }
    export function boxCorners(min: Readonly<Vec3>, max: Readonly<Vec3>): Vec3[];
    export function circlePoints(center: Readonly<Vec3>, normal: Readonly<Vec3>, radius: number, segments: number): Vec3[];
}
declare module "messier/engine/raycast" {
    import { type Vec3 } from "messier/engine/math";
    import type { Ray } from "messier/engine/camera";
    import type { GameObject, Scene } from "messier/engine/scene";
    import { Renderer2D } from "messier/engine/shapes2d";
    export interface RaycastHit {
        object: GameObject;
        distance: number;
        point: Vec3;
    }
    /** Slab test. Returns the entry distance or null. */
    export function rayAABB(origin: Readonly<Vec3>, dir: Readonly<Vec3>, min: Readonly<Vec3>, max: Readonly<Vec3>): number | null;
    /** Möller–Trumbore, double sided. */
    export function rayTriangle(o: Readonly<Vec3>, d: Readonly<Vec3>, a: Vec3, b: Vec3, c: Vec3): number | null;
    export function raySphere(origin: Readonly<Vec3>, dir: Readonly<Vec3>, center: Readonly<Vec3>, radius: number): number | null;
    /** Ray against one mesh object (AABB pre-test, then exact triangles). `dir` must be normalized. */
    export function raycastObject(obj: GameObject, ray: Ray): number | null;
    /**
     * Ray against an object's world-space 2D renderers (Shape2D, Text2D): their bounds rectangle on the local XY plane.
     * Screen-space ones aren't in the world; see pickScreen2D().
     */
    export function raycast2D(obj: GameObject, ray: Ray): number | null;
    /**
     * The topmost visible screen-space 2D renderer whose bounds contain the viewport point (CSS pixels, y down), or null.
     */
    export function pickScreen2D(scene: Scene, x: number, y: number, width: number, height: number): Renderer2D | null;
    /** Closest visible mesh (or world-space 2D) hit in the scene. */
    export function raycastScene(scene: Scene, ray: Ray, filter?: (o: GameObject) => boolean): RaycastHit | null;
    /** World-space AABB of an object and all its descendants' meshes and world-space 2D renderers, or null if none. */
    export function worldBounds(obj: GameObject): {
        min: Vec3;
        max: Vec3;
    } | null;
}
declare module "messier/engine/frameGraph" {
    /** A texture the graph allocates for the frame. Usage flags come from how passes use it. */
    export interface TransientTextureDesc {
        format: GPUTextureFormat;
        /** Size in texels. Without it, the output size times `scale`. */
        size?: [number, number];
        /** Fraction of the output size (default 1), when `size` isn't given. */
        scale?: number;
        sampleCount?: number;
        mipLevelCount?: number;
    }
    /** A texture of one frame's graph. Only valid in the frame it was made in. */
    export class TextureHandle {
        readonly name: string;
        readonly _graph: FrameGraph;
        readonly _frame: number;
        readonly _index: number;
        /** @internal */
        constructor(name: string, _graph: FrameGraph, _frame: number, _index: number);
    }
    export interface ColorAttachment {
        /** Default 'clear'; 'load' also counts as reading the texture. */
        loadOp?: GPULoadOp;
        clearValue?: GPUColor;
        /** A single-sample texture the (multisampled) attachment resolves into. */
        resolveTarget?: TextureHandle;
        /** The array layer drawn into (default 0). Passes writing different layers still count as writing the texture. */
        layer?: number;
    }
    /** Depth only: the stencil aspect isn't handled yet. */
    export interface DepthAttachment {
        /** Default 'clear'; 'load' also counts as reading the texture. */
        depthLoadOp?: GPULoadOp;
        depthClearValue?: number;
        /** The array layer drawn into (default 0), as for color attachments. */
        layer?: number;
    }
    /** Formats and sample count of a render pass's attachments, for choosing pipelines that match them. */
    export interface RenderTarget {
        colorFormats: GPUTextureFormat[];
        depthFormat: GPUTextureFormat | null;
        sampleCount: number;
    }
    /** The textures of the frame, for a pass's execute function. */
    export interface FrameResources {
        texture(handle: TextureHandle): GPUTexture;
        /** A default view of the texture. */
        view(handle: TextureHandle): GPUTextureView;
        /** The pass's attachments (render passes; null in compute passes). */
        readonly target: RenderTarget | null;
    }
    interface PassBuilderBase {
        /** Samples the texture (a texture binding). */
        read(handle: TextureHandle): void;
        /** Never culled, even when nothing reads what it writes (it has effects outside the graph). */
        sideEffect(): void;
    }
    export interface RenderPassBuilder extends PassBuilderBase {
        colorAttachment(handle: TextureHandle, options?: ColorAttachment): void;
        depthAttachment(handle: TextureHandle, options?: DepthAttachment): void;
    }
    export interface ComputePassBuilder extends PassBuilderBase {
        /** Reads the texture as a storage texture. */
        readStorage(handle: TextureHandle): void;
        /** Writes the texture as a storage texture. */
        writeStorage(handle: TextureHandle): void;
    }
    export type RenderPassExecute = (pass: GPURenderPassEncoder, resources: FrameResources) => void;
    export type ComputePassExecute = (pass: GPUComputePassEncoder, resources: FrameResources) => void;
    /**
     * Times passes on the GPU (see GpuTimer). The graph asks it for each pass's timestamp writes, lets it resolve them
     * at the end of the encoder, and tells it when the frame was submitted.
     */
    export interface PassTimer {
        begin(): void;
        /** Where the pass writes its begin and end timestamps, or undefined to leave it untimed. */
        timestampWrites(pass: string): GPURenderPassTimestampWrites | undefined;
        resolve(encoder: GPUCommandEncoder): void;
        submitted(): void;
    }
    /** What compile() decided: the passes in execution order and the ones culled. */
    export interface CompiledFrame {
        passes: string[];
        culled: string[];
    }
    export class FrameGraph {
        private readonly device;
        /** Times each executed pass on the GPU while set (the device needs `timestamp-query`). */
        timer: PassTimer | null;
        private outputSize;
        private frame;
        private resources;
        private passes;
        private readonly pool;
        constructor(device: GPUDevice);
        /** The size transient textures scale from (the canvas). Changing it frees every pooled texture. */
        setOutputSize(width: number, height: number): void;
        /** Pooled GPU textures (for tests and stats). */
        get pooledTextures(): number;
        /** A texture this frame's passes share, allocated from the pool. */
        createTexture(name: string, desc: TransientTextureDesc): TextureHandle;
        /** A texture owned elsewhere (the canvas texture, a persistent shadow map). The graph never allocates or frees it. */
        importTexture(name: string, texture: GPUTexture): TextureHandle;
        addRenderPass(name: string, setup: (builder: RenderPassBuilder) => RenderPassExecute): void;
        addComputePass(name: string, setup: (builder: ComputePassBuilder) => ComputePassExecute): void;
        /**
         * Orders and culls this frame's passes. Throws when a pass reads a transient texture no pass writes, or when
         * passes depend on each other in a cycle.
         */
        compile(): CompiledFrame;
        private plan;
        /** Compiles and records this frame's passes into one command encoder, submits it, and starts the next frame. */
        execute(): CompiledFrame;
        /** Frees every pooled texture. */
        destroy(): void;
        private addResource;
        private resource;
        private newPass;
        private sample;
        private attach;
        /** Passes in execution order: dependencies first, declaration order otherwise. */
        private order;
        /** Passes whose results are used: the ones writing imported textures or marked sideEffect, and what they read. */
        private alive;
        private lifetimes;
        private renderPassDescriptor;
        /** A single layer of the texture: an array texture's default view would be all its layers. */
        private attachmentView;
        private renderTarget;
        private gpuTexture;
        private resolvedSize;
        private allocate;
        private endFrame;
        private releaseAll;
    }
}
declare module "messier/engine/culling" {
    import type { Mat4, Vec3 } from "messier/engine/math";
    /** Six planes, four floats each (a, b, c, d): a point is inside when a·x + b·y + c·z + d ≥ 0 for all of them. */
    export type FrustumPlanes = Float32Array;
    /**
     * The world-space planes of `viewProj`'s visible volume: left, right, bottom, top, then the two depth planes. Not
     * normalized (boxOutsideFrustum doesn't need it).
     */
    export function frustumPlanes(viewProj: Readonly<Mat4>, out?: FrustumPlanes): FrustumPlanes;
    /**
     * Whether the box `min`…`max`, transformed by `world`, lies entirely outside one of the planes. Conservative the
     * usual way: a box near a corner of the frustum can pass while being outside, never the other way around.
     */
    export function boxOutsideFrustum(planes: FrustumPlanes, world: Readonly<Mat4>, min: Readonly<Vec3>, max: Readonly<Vec3>): boolean;
    /** Whether the sphere at `center` with `radius` lies entirely outside one of the planes. */
    export function sphereOutsideFrustum(planes: FrustumPlanes, center: Readonly<Vec3>, radius: number): boolean;
}
declare module "messier/engine/batching" {
    import type { Mat4, Vec3 } from "messier/engine/math";
    import type { Mesh } from "messier/engine/mesh";
    import { type Material } from "messier/engine/material";
    import type { MeshRenderer } from "messier/engine/meshRenderer";
    /** Floats per instance: the Object struct of meshData.wgsl (model, normal matrix). */
    export const OBJECT_FLOATS = 32;
    /** One instanced draw. */
    export interface MeshBatch {
        mesh: Mesh;
        /** The material every instance is drawn with (the first of the look-alikes). */
        material: Material;
        /** Index of the first instance in the object array. */
        first: number;
        count: number;
    }
    export class DrawList {
        /** The camera's opaque batches, in order of first appearance. */
        readonly main: MeshBatch[];
        /** The camera's blended batches, back to front: draw them in this order, after `main`. */
        readonly transparent: MeshBatch[];
        /** The casters of each shadow view, in the order the views were given. */
        readonly shadows: MeshBatch[][];
        /** Instance data for every view, OBJECT_FLOATS each. Grows as needed; `objectCount` instances are valid. */
        objects: Float32Array<ArrayBuffer>;
        objectCount: number;
        /** Instances the camera draws (opaque and blended), and the ones of all the shadow views. */
        mainInstances: number;
        shadowInstances: number;
        /** Renderers left out of the main pass because they're outside the view. */
        culled: number;
        /** The distinct materials of the batches (the ones that need their uniforms uploaded). */
        readonly materials: Set<Material>;
        private readonly viewPlanes;
        private readonly lightPlanes;
        private readonly sorted;
        private readonly canonical;
        private readonly buckets;
        private readonly byMesh;
        /**
         * Builds the batches for `renderers` (each with a mesh and a material), seen from `eye` through `viewProj`.
         * `shadowViews` are the view-projection matrices shadow maps are drawn with. With `cull` off every renderer is
         * drawn in every view.
         */
        build(renderers: readonly MeshRenderer[], viewProj: Readonly<Mat4>, eye: Readonly<Vec3>, shadowViews?: readonly Readonly<Mat4>[], cull?: boolean): void;
        private add;
        /** Writes the batches' instances into the object array and publishes them. */
        private emit;
        private reserve;
    }
}
declare module "messier/engine/gpuTimer" {
    import type { PassTimer } from "messier/engine/frameGraph";
    export class GpuTimer implements PassTimer {
        private readonly device;
        /** Passes timed per frame; later ones go untimed. */
        readonly maxPasses: number;
        /** Called with a frame's pass names (execution order) and their GPU times in milliseconds. */
        onResults: ((names: string[], ms: number[]) => void) | null;
        private readonly querySet;
        private readonly resolveBuffer;
        private readonly free;
        private readbacks;
        private names;
        private target;
        private destroyed;
        constructor(device: GPUDevice, 
        /** Passes timed per frame; later ones go untimed. */
        maxPasses?: number);
        begin(): void;
        timestampWrites(pass: string): GPURenderPassTimestampWrites | undefined;
        resolve(encoder: GPUCommandEncoder): void;
        submitted(): void;
        destroy(): void;
    }
}
declare module "messier/engine/shadows" {
    import { type Mat4, type Vec3 } from "messier/engine/math";
    import type { Camera } from "messier/engine/camera";
    import { type FrustumPlanes } from "messier/engine/culling";
    /** Layers of the shadow map: the most cascades a scene can ask for. */
    export const MAX_SHADOW_CASCADES = 4;
    export interface ShadowCascade {
        /** World to the cascade's clip space (normal Z: 0 near the light, 1 far). */
        viewProj: Mat4;
        /** View depth (along the camera's forward axis) where the cascade ends. */
        far: number;
        /** Radius of the slice's bounding sphere: the box is twice that across. */
        radius: number;
        /** Size of one shadow-map texel in world units. */
        texel: number;
        /** Depth range of the box (world units), for turning a world-space bias into a depth one. */
        depthRange: number;
    }
    /**
     * The cascades for `camera`, looking along `lightDir` (the direction the light travels), up to `distance` from the
     * camera, on a `mapSize` texel square per cascade.
     */
    export function computeCascades(camera: Camera, lightDir: Readonly<Vec3>, distance: number, count: number, mapSize: number): ShadowCascade[];
    /** Layers of the point and spot light shadow map: two point lights, or twelve spot lights. */
    export const MAX_LOCAL_SHADOW_LAYERS = 12;
    export interface LocalShadowLight {
        type: 'point' | 'spot';
        position: Readonly<Vec3>;
        /** Where a spot light points (unit length). */
        direction: Readonly<Vec3>;
        range: number;
        /** Spot: the cone's half-angle in degrees. */
        outerAngle: number;
    }
    export interface LocalShadow {
        /** The first of its layers (a spot light has one, a point light six, one per face in CUBE_FACES order). */
        layer: number;
        /** World to each layer's clip space (normal Z). */
        views: Mat4[];
        /** A shadow-map texel's world size per unit of distance from the light, for scaling the bias. */
        texelPerDistance: number;
    }
    /** The views of one light's shadow on `mapSize` texel squares, starting at `layer`. */
    export function localShadowViews(light: LocalShadowLight, layer: number, mapSize: number): LocalShadow;
    /**
     * Hands out the `maxLayers` layers to `lights` (null: not casting shadows): lights whose range is inside the view
     * (`viewPlanes`) first, nearest to `eye` first. Returns each light's shadow, or null.
     */
    export function assignLocalShadows(lights: readonly (LocalShadowLight | null)[], eye: Readonly<Vec3>, viewPlanes: FrustumPlanes, maxLayers: number, mapSize: number): (LocalShadow | null)[];
}
declare module "messier/engine/environment" {
    import type { FrameGraph, TextureHandle } from "messier/engine/frameGraph";
    /** Faces of the captured sky, in texels: what the prefilter reads, at every mip. */
    export const ENVIRONMENT_SIZE = 128;
    /** Faces of the specular cube's first mip; each further mip is the next roughness. */
    export const SPECULAR_SIZE = 128;
    /** Mips of the specular cube: roughness 0, 0.2, … 1. mesh.wgsl reads it with this count. */
    export const SPECULAR_LEVELS = 6;
    export const IRRADIANCE_SIZE = 32;
    /** The passes' texture handles in this frame's graph, for the passes that sample them. */
    export interface EnvironmentHandles {
        specular: TextureHandle;
        irradiance: TextureHandle;
    }
    export class EnvironmentMaps {
        private readonly device;
        /** The prefiltered sky, a cube with SPECULAR_LEVELS mips. */
        readonly specularView: GPUTextureView;
        readonly irradianceView: GPUTextureView;
        /** The BRDF table (r = scale, g = bias to F0), by (N·V, roughness). */
        readonly brdfView: GPUTextureView;
        /** Linear, clamped, mipmapped: for the cubes and the table. */
        readonly sampler: GPUSampler;
        /** How many times the sky has been baked. */
        bakes: number;
        private readonly env;
        private readonly specular;
        private readonly irradiance;
        private readonly capturePipeline;
        private readonly downsamplePipeline;
        private readonly prefilterPipeline;
        private readonly irradiancePipeline;
        private readonly captureOut;
        private readonly downsampleGroups;
        private readonly prefilterGroups;
        private readonly irradianceGroup;
        private captureSky;
        private bakedKey;
        private bakedTexture;
        constructor(device: GPUDevice, commonWGSL: string);
        /**
         * Whether the sky differs from the one last baked: `key` holds everything the capture reads (the frame's sky values,
         * without how strongly it lights the scene, which applies when it's read), and `texture` is the image sky's.
         */
        needsBake(key: Float32Array, texture: unknown): boolean;
        /**
         * Declares the passes that rebake the sky into this frame's graph, and remembers it as baked. The capture reads the
         * frame uniform and the sky texture through `frame` and `sky` (the frame bind group's).
         */
        bake(g: FrameGraph, key: Float32Array, texture: unknown, frame: GPUBuffer, sky: GPUTextureView, skySampler: GPUSampler): EnvironmentHandles;
    }
}
declare module "messier/engine/pipelines" {
    import { type BlendMode, type Material } from "messier/engine/material";
    import type { Mesh } from "messier/engine/mesh";
    import type { RenderTarget } from "messier/engine/frameGraph";
    export type MeshPass = 'main' | 'shadow';
    /** Everything that selects a mesh pipeline. Plain data; variantKeyString() is its identity. */
    export interface MeshVariantKey {
        pass: MeshPass;
        cull: GPUCullMode;
        /** Discard below the material's alpha cutoff. Only the shadow pass uses it; the main pass branches at runtime. */
        alphaTest: boolean;
        /** Main pass: how the color is blended in. Blended variants test depth without writing it. */
        blend: BlendMode;
        /** Null for depth-only passes. */
        colorFormat: GPUTextureFormat | null;
        sampleCount: number;
        depthFormat: GPUTextureFormat;
        /** Reversed-Z 'greater' for the main pass, 'less' for shadow maps. */
        depthCompare: GPUCompareFunction;
    }
    export function variantKeyString(key: MeshVariantKey): string;
    /**
     * The pipeline key for drawing `mesh` with `material` in `pass` into `target`. The only place that decides mesh
     * pipelines: draw loops, prewarming and tests all go through it.
     */
    export function meshVariantKey(pass: MeshPass, material: Pick<Material, 'doubleSided' | 'alphaCutoff' | 'blend'>, _mesh: Mesh | null, target: RenderTarget): MeshVariantKey;
    /** Every valid key for these targets: the variants a project can need. Tests build them all. */
    export function allMeshVariantKeys(targets: Record<MeshPass, RenderTarget>): MeshVariantKey[];
    /** What the variants are made of: the WGSL pieces and the bind group layouts the renderer owns. */
    export interface MeshPipelineSources {
        /** Prepended to the main pass shader (frame bindings, skyRadiance). */
        common: string;
        /** Prepended to both mesh shaders: the Material and Object structs, mirrored by the renderer's packing. */
        meshData: string;
        mesh: string;
        shadow: string;
        layouts: {
            frame: GPUBindGroupLayout;
            material: GPUBindGroupLayout;
            object: GPUBindGroupLayout;
            shadowFrame: GPUBindGroupLayout;
        };
        /** Interleaved mesh vertex stride (position 3, normal 3, uv 2 floats). */
        vertexStride: number;
    }
    /** Mesh pipelines by variant: built on demand (counted, so hitches show) or ahead of time with prewarm(). */
    export class MeshPipelines {
        private readonly device;
        private readonly sources;
        /** Pipelines built synchronously by get() so far. RenderStats.pipelineBuilds reports a frame's share. */
        builds: number;
        private readonly pipelines;
        private readonly pending;
        private readonly modules;
        private readonly layouts;
        constructor(device: GPUDevice, sources: MeshPipelineSources);
        /** Pipelines in the cache. */
        get size(): number;
        has(key: MeshVariantKey): boolean;
        /** The pipeline for `key`, built now if it isn't cached (a hitch, counted in `builds`). */
        get(key: MeshVariantKey): GPURenderPipeline;
        /** Builds the pipelines of `keys` that aren't cached, in the background (createRenderPipelineAsync). */
        prewarm(keys: readonly MeshVariantKey[]): Promise<void>;
        private module;
        /**
         * Main: frame, material, object. Shadow: its own group 0 (the frame group holds the shadow map being drawn into),
         * then object, then, for the alpha test, the material (the same bind groups the main pass uses).
         */
        private pipelineLayout;
        private describe;
    }
}
declare module "messier/engine/renderer" {
    import type { Scene } from "messier/engine/scene";
    import type { Camera } from "messier/engine/camera";
    import { type OverlayBuilder } from "messier/engine/overlay";
    import { type Draw2D } from "messier/engine/draw2d";
    import { type RenderTarget } from "messier/engine/frameGraph";
    import { MeshPipelines, type MeshPass, type MeshVariantKey } from "messier/engine/pipelines";
    export const MAX_LIGHTS = 128;
    export interface RenderOptions {
        time?: number;
        /**
         * How far the frame is between two fixed steps (Time.alpha, 0…1), for blending physics poses. Passed through
         * for renderers that interpolate; this one draws the current poses.
         */
        alpha?: number;
        grid?: boolean;
        overlay?: OverlayBuilder | null;
        /** Immediate-mode 2D layer drawn over everything else (the engine passes `draw2d`). */
        draw2d?: Draw2D | null;
        /** Draw screen-space Shape2D/Text2D components (default true). */
        screen2D?: boolean;
    }
    export interface RenderStats {
        /** Draw calls of the main and overlay passes (a batch of instances is one). */
        drawCalls: number;
        triangles: number;
        /** Mesh instances drawn in the main pass. */
        instances: number;
        /** Mesh renderers skipped because they're outside the view. */
        culled: number;
        lights: number;
        /** Mesh instances drawn into the shadow map, over all its cascades. */
        shadowCasters: number;
        /** Shape2D/Text2D components drawn. */
        elements2D: number;
        /** Mesh pipelines built during the frame because they weren't prewarmed (each one a hitch). */
        pipelineBuilds: number;
    }
    /**
     * Forward renderer: shadow passes (a cascade each for one directional light, a layer each for point and spot
     * lights), a 4x MSAA HDR main pass (lit meshes, the sky), a tonemap pass, then the display-space overlay pass (editor
     * grid, 2D, overlay helpers) resolved into the canvas. Each frame declares its passes on a FrameGraph, which orders
     * them and owns their transient textures.
     */
    export class Renderer {
        readonly device: GPUDevice;
        readonly canvas: HTMLCanvasElement;
        readonly format: GPUTextureFormat;
        readonly sampleCount = 4;
        width: number;
        height: number;
        readonly stats: RenderStats;
        /** Skip meshes outside the camera's view (and, in the shadow passes, outside their cascade). */
        frustumCulling: boolean;
        private readonly context;
        /** Declares, orders and runs each frame's passes, and owns their transient textures (MSAA color, depth). */
        private readonly graph;
        /** Times the graph's passes for the profiler; null when the device has no `timestamp-query`. */
        private readonly gpuTimer;
        private readonly frameLayout;
        private readonly materialLayout;
        private readonly objectLayout;
        private readonly shadowFrameLayout;
        /** Mesh and shadow pipelines by variant (see pipelines.ts). */
        readonly meshPipelines: MeshPipelines;
        private readonly gridPipeline;
        private readonly overlayDepthPipeline;
        private readonly overlayTopPipeline;
        private readonly mipPipelines;
        private readonly skyPipeline;
        private readonly tonemapPipeline;
        private readonly tonemapLayout;
        private readonly tonemapBuffer;
        /** The HDR texture `tonemapGroup` reads (the graph's pool may hand out another one). */
        private tonemapSource;
        private tonemapGroup;
        private readonly tonemapData;
        private readonly world2DPipeline;
        private readonly screen2DPipeline;
        private readonly frameBuffer;
        private readonly lightBuffer;
        private readonly shadowFrameBuffer;
        private readonly shadowMap;
        private readonly shadowMapView;
        /** Point and spot light shadows: a layer per spot light, six per point light (see shadows.ts). */
        private readonly localShadowMap;
        private readonly localShadowMapView;
        /** Each local shadow layer's matrix, for the main pass. */
        private readonly localShadowBuffer;
        private readonly localShadowData;
        private readonly viewPlanes;
        private frameBindGroup;
        /** The sky texture `frameBindGroup` was made with (null: the white placeholder), and its view. */
        private frameSky;
        private frameSkyView;
        /** The sky prefiltered for image-based lighting (see environment.ts). */
        private readonly environment;
        private readonly shadowSampler;
        private readonly skySampler;
        /** One per shadow view (SHADOW_SLOTS): its matrix. */
        private readonly shadowFrameBindGroups;
        private readonly textureSampler;
        private readonly mipSampler;
        private readonly whiteTextureView;
        private objectBuffer;
        private objectBindGroup;
        private objectCapacity;
        private readonly drawList;
        private overlayBuffer;
        private overlayCapacity;
        private readonly atlasTexture;
        private readonly view2DBuffers;
        /** World-space and screen-space 2D bind groups (same atlas, different view matrix). */
        private readonly view2DGroups;
        private buffer2D;
        private capacity2D;
        private atlasGeneration;
        private readonly world2D;
        private readonly screen2D;
        private readonly list2D;
        private readonly matrix2D;
        private readonly frameData;
        private readonly lightData;
        private readonly draws;
        private readonly materialData;
        static create(canvas: HTMLCanvasElement): Promise<Renderer>;
        private constructor();
        private makeFrameBindGroup;
        private resizeIfNeeded;
        private ensureMesh;
        /** Uploads `tex` as sRGB colors, or with `linear` as raw data (each copy filters its mips in its own space). */
        private ensureTexture;
        private generateMips;
        private prepareMaterial;
        private ensureObjectCapacity;
        private uploadOverlay;
        /**
         * Builds the 2D vertex streams (world-space components, then screen-space components and the immediate layer) and
         * uploads them with any new glyphs. Returns the vertex counts of the two parts.
         */
        private prepare2D;
        /** Renders one frame. World matrices must be up to date (Scene.updateMatrices). */
        render(scene: Scene, camera: Camera, options?: RenderOptions): RenderStats;
        /** The attachments the mesh passes draw into, as the frame graph declares them: what mesh variants are made for. */
        meshTargets(): Record<MeshPass, RenderTarget>;
        /** Every mesh pipeline variant this renderer can need. */
        meshVariantKeys(): MeshVariantKey[];
        /**
         * Builds the mesh pipelines `scene` draws with in the background, so they're ready when it's rendered instead of
         * built in the middle of a frame. Call after a scene or an asset loads.
         */
        prewarm(scene: Scene): Promise<void>;
        /**
         * A shadow pass (one view: a cascade or a point/spot light layer): depth only, on its own group 0 (the frame group
         * holds the shadow map it's drawing into), the view's matrix at `slot`. The alpha-tested variant reads the material
         * from group 2.
         */
        private drawShadowCasters;
        /** The main pass, as linear radiance: opaque meshes, the sky behind them, then blended meshes back to front. */
        private drawScene;
        /** The tonemap pass: HDR radiance to display colors, per sample (see tonemap.wgsl). */
        private drawTonemap;
        /** The overlay pass, display space: grid, world 2D, depth-tested overlay, screen 2D (HUD), then the overlay on top. */
        private drawDisplay;
    }
}
declare module "messier/engine/engine" {
    import { Renderer, type RenderStats } from "messier/engine/renderer";
    import { Scene, type GameObject } from "messier/engine/scene";
    import { Camera } from "messier/engine/camera";
    import { OverlayBuilder } from "messier/engine/overlay";
    import { Signal } from "messier/engine/signal";
    export interface FrameInfo {
        dt: number;
        /** Seconds since the engine started. */
        time: number;
        /** Seconds since Play mode started (Time.time; 0 when not playing). */
        playTime: number;
        /** Fixed-step interpolation factor (Time.alpha). */
        alpha: number;
    }
    type FrameCallback = (frame: FrameInfo) => void;
    /**
     * Owns the main loop. Each frame, while playing: fixed steps (fixedUpdate, physics) → update → lateUpdate; then
     * input edges reset, world matrices sync, hooks, render, and deferred destroys. Input itself arrives as DOM events
     * between frames, so it's current before the frame starts.
     */
    export class Engine {
        readonly renderer: Renderer;
        /** Emitted after the active scene changes. */
        readonly sceneChanged: Signal<[scene: Scene, previous: Scene]>;
        /** Free view (the editor's viewport camera), used when no scene camera is in use. */
        readonly camera: Camera;
        /** Render through the scene's active camera (Scene.activeCamera) when it has one, instead of `camera`. */
        useSceneCamera: boolean;
        /** The scene camera the current frame is rendered through, or null when it uses `camera`. */
        viewObject: GameObject | null;
        readonly overlay: OverlayBuilder;
        playing: boolean;
        showGrid: boolean;
        fps: number;
        private _scene;
        private time;
        private last;
        private frameHandle;
        private fpsAccum;
        private fpsFrames;
        private readonly sceneView;
        private readonly beforeRenderHooks;
        private readonly afterRenderHooks;
        private constructor();
        static create(canvas: HTMLCanvasElement): Promise<Engine>;
        /** Called every frame after the scene update and before rendering (build overlay here). */
        /** The view the current frame is rendered from: the scene camera's, or `camera`. */
        get view(): Camera;
        /** The active scene: the one that updates and renders. */
        get scene(): Scene;
        /**
         * Makes `scene` the active one. While playing, the previous scene stops running (onDisable/onDestroy) and the new
         * one starts. Scenes are plain objects, so keep the ones you want to return to.
         */
        setActiveScene(scene: Scene): void;
        onBeforeRender(cb: FrameCallback): void;
        onAfterRender(cb: (stats: RenderStats) => void): void;
        setPlaying(playing: boolean): void;
        start(): void;
        stop(): void;
        /** `frameMs`: the real time since the previous frame (`dt` is capped), for the profiler. */
        private step;
        private render;
    }
}
declare module "messier/engine/sceneManager" {
    import type { Engine } from "messier/engine/engine";
    import { type Scene } from "messier/engine/scene";
    import { Signal } from "messier/engine/signal";
    /** Where the scenes come from: a built game's embedded project, or the project open in the editor (during Play). */
    export interface SceneSource {
        /** Scene names in build order. */
        readonly names: readonly string[];
        /** Builds a fresh, not yet running copy of scene `index`. */
        load(index: number): Promise<Scene>;
    }
    /**
     * Switches between the scenes of a game: `sceneManager.loadScene('Level 2')` or `loadScene(1)`, by the order of
     * File → Build. The host attaches a source (the game page, or the editor while playing); without one, loading
     * fails with a warning.
     *
     * Loading is asynchronous (imported models may have to be decoded first), so the new scene replaces the active one
     * after the current frame at the earliest. Until then the old scene keeps running. When several loads overlap, the
     * last one wins. Replacing a scene stops it (onDisable → onDestroy) and, if this manager loaded it, destroys its
     * objects.
     */
    export class SceneManager {
        /** Emitted after loadScene() made a scene active, with its build index. */
        readonly sceneLoaded: Signal<[scene: Scene, index: number]>;
        /** Where load problems go. Defaults to console.warn. */
        onWarning: ((message: string) => void) | null;
        private _engine;
        private _source;
        private _activeIndex;
        private _request;
        private _pending;
        private _owned;
        /** Called by the host. `activeIndex` is the build index of the scene already active, if any. */
        attach(engine: Engine, source: SceneSource, activeIndex?: number): void;
        /** Called by the host when the game stops. Loads still in progress are dropped. */
        detach(): void;
        /** Number of scenes in the build. */
        get sceneCount(): number;
        /** Name of the scene at a build index, or null. */
        sceneName(index: number): string | null;
        /** Build index of the active scene, or -1 (e.g. when Play started in a scene that isn't in the build). */
        get activeSceneIndex(): number;
        get activeSceneName(): string | null;
        /** True while a loadScene() is in progress. */
        get isLoading(): boolean;
        /** Makes a scene of the build active, by name or build index. Resolves to it, or to null if it didn't load. */
        loadScene(scene: string | number): Promise<Scene | null>;
        private warn;
    }
    /** Scene switching for scripts: `import { sceneManager } from 'messier'`. */
    export const sceneManager: SceneManager;
}
declare module "messier/engine/project" {
    import type { Mesh, ResourceRef } from "messier/engine/mesh";
    import type { Texture } from "messier/engine/material";
    import { Scene, type GameObject, type PrefabSource } from "messier/engine/scene";
    import type { ScriptLibrary } from "messier/engine/scripting";
    import { type MemoryFile } from "messier/engine/loaders/index";
    import { AudioClip, type ClipRef } from "messier/engine/audioClip";
    import { type SceneData, type SceneResources } from "messier/engine/serialize";
    import { type PrefabData } from "messier/engine/prefab";
    export const PROJECT_FORMAT = "messier-project";
    export const PROJECT_VERSION = 1;
    /**
     * An imported file: a model (the model file first, then the companion files (.bin, .mtl, textures) it read), a
     * sound or an image (one file). The first file's extension tells which.
     */
    export interface Asset {
        id: string;
        name: string;
        files: MemoryFile[];
        /** Where it lives under assets/ in a project folder (set by the folder format; not part of the packed form). */
        path?: string;
    }
    export interface ProjectScene {
        id: string;
        name: string;
        data: SceneData;
    }
    export interface ScriptSource {
        name: string;
        source: string;
    }
    /** What File → Build puts in a game: the scenes in build order (the first one starts) and the page title. */
    export interface BuildSettings {
        /** Defaults to the project name. */
        title: string;
        /** Scenes not listed are appended, included. Ids of deleted scenes are ignored. */
        scenes: {
            id: string;
            enabled: boolean;
        }[];
    }
    interface AssetEntry {
        id: string;
        name: string;
        /** Its place under assets/ in a project folder, so a browser copy saved to a folder keeps the layout. */
        path?: string;
        files: {
            name: string;
            offset?: number;
            length: number;
        }[];
    }
    /** The JSON part of a project. Asset files carry offsets into the BIN chunk when encoded. */
    export interface ProjectManifest {
        format: typeof PROJECT_FORMAT;
        version: number;
        name: string;
        startScene: string;
        scenes: ProjectScene[];
        scripts: ScriptSource[];
        build: BuildSettings;
        assets: AssetEntry[];
    }
    export class Project {
        name: string;
        scenes: ProjectScene[];
        startScene: string;
        scripts: ScriptSource[];
        build: BuildSettings;
        /**
         * Imported files. Kept in memory even when no scene uses them anymore (undo
         * can bring the objects back); only referenced assets are written out.
         */
        assets: Asset[];
        getScene(id: string): ProjectScene | null;
        getAsset(id: string): Asset | null;
        /** Every scene in build order, with whether the build includes it. */
        buildList(): {
            scene: ProjectScene;
            enabled: boolean;
        }[];
        /** The scenes a build includes, in order. Their indices are the ones `sceneManager.loadScene()` takes. */
        buildScenes(): ProjectScene[];
        /**
         * A copy holding only `scenes` (in that order, the first one starting) and the assets they use: what a built
         * game ships. Scene data and asset files are shared, not copied.
         */
        subset(scenes: ProjectScene[]): Project;
        /** Assets used by at least one scene, and every prefab (scripts instantiate them by name), in project order. */
        referencedAssets(): Asset[];
        /** Ids of the assets `scenes` use, every prefab, and what those prefabs use. */
        usedAssetIds(scenes: readonly ProjectScene[]): Set<string>;
        /** `ids` plus the assets the prefabs among them use, recursively (in place). */
        withDependencies(ids: Set<string>): Set<string>;
        /** The prefab of a prefab asset (null for other assets, and when the file can't be read). */
        prefabData(id: string): PrefabData | null;
        /** A prefab asset by id, name or path under assets/ (with or without the extension). */
        findPrefab(key: string): Asset | null;
        /** The JSON part without file offsets. Cheap to compare for change detection. */
        manifest(): ProjectManifest;
        encode(): Uint8Array<ArrayBuffer>;
        static decode(data: ArrayBuffer | Uint8Array<ArrayBuffer>): Project;
        /**
         * Builds a project from its manifest. `fileBytes` supplies each asset file's
         * contents (from the BIN chunk, or from autosave storage); assets with a
         * missing file are dropped, and their scenes load with warnings.
         */
        static fromManifest(json: unknown, fileBytes: (asset: AssetEntry, file: AssetEntry['files'][number]) => Uint8Array<ArrayBuffer> | null): Project;
    }
    export const isPrefabAsset: (a: Asset) => boolean;
    /**
     * Resolves scene refs for one project: rebuilds primitives and synthesized
     * sounds, and loads each imported asset once, sharing its meshes, textures and
     * clips across scene loads. Also the prefab source of the scenes it loads.
     */
    export class ProjectResources implements SceneResources, PrefabSource {
        readonly project: Project;
        private readonly assets;
        private readonly clips;
        private readonly primitives;
        constructor(project: Project);
        /**
         * Loads the assets `data` references that aren't loaded yet, and those of every prefab (a script may instantiate
         * any of them). Failures become warnings.
         */
        prepare(data: SceneData, warnings?: string[]): Promise<void>;
        /** Whether the asset was loaded (or tried and failed). */
        has(assetId: string): boolean;
        /**
         * (Re)loads one asset from its files in the project. Objects that use the old meshes, textures or clips keep
         * them; look the new ones up by ref. Returns false (with a warning) when it can't be loaded.
         */
        load(assetId: string, warnings?: string[]): Promise<boolean>;
        /** Drops what was loaded for an asset, so the next prepare() or load() reads its files again. */
        forget(assetId: string): void;
        /** The loaded hierarchy of a model asset, to clone into a scene (clones share its meshes and textures). */
        model(assetId: string): GameObject | null;
        /** A new Scene holding `entry`'s objects, with `scripts` as its library (load the project's scripts into it first). */
        instantiate(entry: ProjectScene, scripts: ScriptLibrary, warnings?: string[]): Promise<Scene>;
        prefab(id: string): PrefabData | null;
        /** A new instance of a prefab by name, path or id (prepare() loaded what it uses). Load problems are logged. */
        instantiatePrefab(key: string, scene: Scene): GameObject | null;
        /** Makes meshes and textures of an asset imported in this session resolvable without reloading it. */
        register(assetId: string, resources: {
            meshes: Mesh[];
            textures: Texture[];
        }, model?: GameObject | null): void;
        /** Makes a sound imported in this session resolvable without decoding it again. */
        registerClip(assetId: string, clip: AudioClip): void;
        clip(ref: ClipRef): AudioClip | null;
        mesh(ref: ResourceRef): Mesh | null;
        texture(ref: ResourceRef): Texture | null;
    }
}
declare module "messier/engine/loaders/audio" {
    import { AudioClip } from "messier/engine/audioClip";
    /** Sound file extensions Import accepts. What decodes depends on the browser; these work in all current ones. */
    export const AUDIO_EXTENSIONS: string[];
    export const isAudioFile: (name: string) => boolean;
    /** Decodes a sound file into a clip named after the file. */
    export function loadAudioClip(fileName: string, data: ArrayBuffer): Promise<AudioClip>;
}
declare module "messier/engine/loaders/resources" {
    /** Resolves a relative URI referenced by a model file (buffers, textures, .mtl). */
    export type ResourceResolver = (uri: string) => Promise<ArrayBuffer>;
    export function urlResolver(baseUrl: string): ResourceResolver;
    /** Resolves URIs against a set of user-selected / dropped files by file name. */
    export function fileResolver(files: Iterable<File>): ResourceResolver;
    export function mimeFromName(name: string): string;
    /** A file held in memory, as stored in a project asset. */
    export interface MemoryFile {
        name: string;
        bytes: Uint8Array<ArrayBuffer>;
    }
    /** Resolves URIs against in-memory files by file name (like fileResolver). */
    export function bytesResolver(files: Iterable<MemoryFile>): ResourceResolver;
    /** Wraps a resolver to keep a copy of every external file it reads (data: URIs are part of the model file already). */
    export function recordingResolver(resolve: ResourceResolver, read: MemoryFile[]): ResourceResolver;
}
declare module "messier/engine/loaders/gltf" {
    import { GameObject } from "messier/engine/scene";
    import { type ResourceResolver } from "messier/engine/loaders/resources";
    export function loadGLTF(data: ArrayBuffer, name: string, resolve: ResourceResolver): Promise<GameObject>;
}
declare module "messier/engine/loaders/obj" {
    import { GameObject } from "messier/engine/scene";
    import { type ResourceResolver } from "messier/engine/loaders/resources";
    export function loadOBJ(text: string, name: string, resolve: ResourceResolver): Promise<GameObject>;
}
declare module "messier/engine/loaders/index" {
    import type { GameObject } from "messier/engine/scene";
    import type { Asset } from "messier/engine/project";
    import type { AudioClip } from "messier/engine/audioClip";
    import { Texture } from "messier/engine/material";
    import { type ResourceResolver } from "messier/engine/loaders/resources";
    export { loadGLTF } from "messier/engine/loaders/gltf";
    export { loadOBJ } from "messier/engine/loaders/obj";
    export * from "messier/engine/loaders/resources";
    export * from "messier/engine/loaders/audio";
    export const MODEL_EXTENSIONS: string[];
    /** Image files that can be a project asset of their own (a sky panorama). */
    export const IMAGE_EXTENSIONS: string[];
    export const isImageFile: (name: string) => boolean;
    /** Decodes an image file into a texture named after the file. */
    export function loadImageTexture(fileName: string, data: ArrayBuffer): Promise<Texture>;
    /** Loads an image file and captures it as a project asset (one file; scenes refer to its texture as index 0). */
    export function loadImageAsset(fileName: string, data: ArrayBuffer, id?: string): Promise<{
        texture: Texture;
        asset: Asset;
    }>;
    /** Loads a model file that is already in memory. The extension of `fileName` picks the loader. */
    export function loadModelFromBytes(fileName: string, data: ArrayBuffer, resolve: ResourceResolver): Promise<GameObject>;
    /** Loads a .glb / .gltf / .obj from a URL. Companion files are fetched relative to it. */
    export function loadModelFromURL(url: string): Promise<GameObject>;
    /**
     * Loads every model among `files`. Other files (.bin, .mtl, textures) are used
     * to resolve references, so select/drop a model together with its companions.
     */
    export function loadModelsFromFiles(files: File[]): Promise<GameObject[]>;
    export interface LoadedAsset {
        /** The model, with its meshes and textures tagged with refs into `asset`. */
        model: GameObject;
        /** The model file plus exactly the companion files the loader read. */
        asset: Asset;
    }
    /** A short id that is unique enough within a project. Doesn't need a secure context like crypto.randomUUID. */
    export function newAssetId(): string;
    /** Loads a model and captures it as a project asset, so a saved scene can reference its meshes and textures. */
    export function loadModelAsset(fileName: string, data: ArrayBuffer, resolve: ResourceResolver, id?: string): Promise<LoadedAsset>;
    /** Loads a sound file and captures it as a project asset (one file; scenes refer to its clip as index 0). */
    export function loadAudioAsset(fileName: string, data: ArrayBuffer, id?: string): Promise<{
        clip: AudioClip;
        asset: Asset;
    }>;
    export function loadModelAssetFromURL(url: string): Promise<LoadedAsset>;
    export function loadModelAssetsFromFiles(files: File[]): Promise<LoadedAsset[]>;
}
declare module "messier/engine/projectFolder" {
    import { Project, ProjectResources, type Asset, type ProjectScene } from "messier/engine/project";
    import { type SceneData } from "messier/engine/serialize";
    import { type ResourceResolver } from "messier/engine/loaders/index";
    export const PROJECT_FOLDER_FORMAT = "messier-project-folder";
    export const PROJECT_FOLDER_VERSION = 1;
    export const PROJECT_MANIFEST = "project.json";
    export const SCENES_DIR = "scenes";
    export const SCRIPTS_DIR = "scripts";
    export const ASSETS_DIR = "assets";
    export const SCENE_EXTENSION = ".messier";
    export const SCRIPT_EXTENSION = ".ts";
    export const META_EXTENSION = ".meta";
    /** File access the folder format needs. Paths are relative to the project folder. */
    export interface FolderIO {
        /** Entries of a directory ('' = the project folder); an empty list when it doesn't exist. */
        list(dir: string): Promise<{
            name: string;
            kind: 'file' | 'directory';
        }[]>;
        read(path: string): Promise<Uint8Array<ArrayBuffer>>;
        /** Creates missing directories. */
        write(path: string, data: Uint8Array | string): Promise<void>;
        /** Removes a file or a directory with its contents; nothing happens when it doesn't exist. */
        remove(path: string): Promise<void>;
        /** Size and modification time, or null when there is no such file. */
        stat(path: string): Promise<{
            size: number;
            modified: number;
        } | null>;
    }
    export type AssetKind = 'model' | 'image' | 'sound' | 'prefab' | 'other';
    export function assetKind(path: string): AssetKind;
    export const joinPath: (...parts: string[]) => string;
    export const dirName: (path: string) => string;
    export const fileName: (path: string) => string;
    /** File name without its extension. */
    export const fileStem: (path: string) => string;
    /** Resolves '.' and '..' segments and repeated slashes. */
    export function normalizePath(path: string): string;
    /** A name that works as a file name on every system. */
    export function safeFileName(name: string): string;
    export const scenePath: (name: string) => string;
    export const scriptPath: (name: string) => string;
    export const metaPath: (assetPath: string) => string;
    export const isMetaFile: (path: string) => boolean;
    export const isScenePath: (path: string) => boolean;
    export const isScriptPath: (path: string) => boolean;
    export const isAssetPath: (path: string) => boolean;
    /** Every file under `dir`, recursively, sorted; dot files are skipped. */
    export function listFiles(io: FolderIO, dir?: string): Promise<string[]>;
    export function sceneText(data: SceneData): string;
    export function manifestText(project: Project): string;
    export function metaText(id: string): string;
    /** The id in an asset's .meta file, or null when it has none (or it can't be read). */
    export function readMeta(io: FolderIO, assetPath: string): Promise<string | null>;
    export interface LoadedFolder {
        project: Project;
        /** The project's assets, loaded. */
        resources: ProjectResources;
        warnings: string[];
    }
    /** Reads a project folder. Asset files without a .meta get one (written to the folder). */
    export function loadProjectFolder(io: FolderIO): Promise<LoadedFolder>;
    export function readScene(io: FolderIO, path: string): Promise<ProjectScene>;
    /**
     * Adds (or replaces) the asset for one file under assets/: gives it a .meta if it has none, reads it, and loads it
     * into `resources`. A model's companion files (.bin, .mtl, textures) are found by loading it, relative to its own
     * directory. Returns the asset.
     */
    export function importAssetFile(io: FolderIO, path: string, project: Project, resources: ProjectResources, warnings?: string[]): Promise<Asset>;
    /** Resolves a model's relative references inside the folder; falls back to the file name in the model's directory. */
    export function folderResolver(io: FolderIO, dir: string): ResourceResolver;
    /**
     * Writes `project` as a folder and returns it as loaded from there: scene ids become their paths, and assets get
     * paths under assets/ (a model with companion files in a directory of its own). Asset ids are kept, so scene
     * references stay valid.
     */
    export function writeProjectFolder(io: FolderIO, project: Project): Promise<Project>;
    /** The script API's declarations (scripts/messier-types.mjs builds them), for VS Code and other TypeScript editors. */
    export const TYPES_PATH = ".messier/messier.d.ts";
    export const TSCONFIG_PATH = "tsconfig.json";
    /** Type-checks scripts/ against the 'messier' declarations; noEmit, since the editor compiles scripts itself. */
    export const TSCONFIG_TEXT: string;
    /**
     * Puts the script types into a project folder: `types` as .messier/messier.d.ts (when it differs), and a
     * tsconfig.json unless the folder has one (it may be the user's own). Returns the paths written.
     */
    export function writeTypeFiles(io: FolderIO, types: string): Promise<string[]>;
    /** Path → "size:modified" for every file in the folder. */
    export type FolderSnapshot = Map<string, string>;
    export function snapshotFolder(io: FolderIO): Promise<FolderSnapshot>;
    export function diffSnapshots(before: FolderSnapshot, after: FolderSnapshot): {
        added: string[];
        changed: string[];
        removed: string[];
    };
    /** A FolderIO kept in memory: for tests, and to zip a project. */
    export class MemoryFolder implements FolderIO {
        readonly files: Map<string, {
            bytes: Uint8Array<ArrayBuffer>;
            modified: number;
        }>;
        private clock;
        list(dir: string): Promise<{
            name: string;
            kind: 'file' | 'directory';
        }[]>;
        read(path: string): Promise<Uint8Array<ArrayBuffer>>;
        write(path: string, data: Uint8Array | string): Promise<void>;
        remove(path: string): Promise<void>;
        stat(path: string): Promise<{
            size: number;
            modified: number;
        } | null>;
    }
}
declare module "messier/engine/index" {
    export * from "messier/engine/math";
    export * from "messier/engine/mesh";
    export * from "messier/engine/material";
    export * from "messier/engine/light";
    export * from "messier/engine/sky";
    export * from "messier/engine/transform";
    export * from "messier/engine/component";
    export * from "messier/engine/meshRenderer";
    export * from "messier/engine/scene";
    export * from "messier/engine/camera";
    export * from "messier/engine/behaviours";
    export * from "messier/engine/input";
    export * from "messier/engine/sfx";
    export * from "messier/engine/audioClip";
    export * from "messier/engine/audio";
    export * from "messier/engine/audioSource";
    export * from "messier/engine/signal";
    export * from "messier/engine/time";
    export * from "messier/engine/scripting";
    export * from "messier/engine/typescript";
    export * from "messier/engine/physics";
    export * from "messier/engine/primitives";
    export * from "messier/engine/overlay";
    export * from "messier/engine/font";
    export * from "messier/engine/draw2d";
    export * from "messier/engine/shapes2d";
    export * from "messier/engine/raycast";
    export * from "messier/engine/renderer";
    export * from "messier/engine/profiler";
    export * from "messier/engine/culling";
    export * from "messier/engine/batching";
    export * from "messier/engine/engine";
    export * from "messier/engine/sceneManager";
    export * from "messier/engine/loaders/index";
    export * from "messier/engine/serialize";
    export * from "messier/engine/prefab";
    export * from "messier/engine/project";
    export * from "messier/engine/projectFolder";
}

declare module "messier" {
    export * from "messier/engine/index";
}
