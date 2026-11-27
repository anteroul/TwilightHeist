import { Script, vec3, type GameObject, type Vec3 } from 'messier';

/** Keeps the camera above and behind the thief, easing after it. */
export default class Follow extends Script {
  height = 13;
  back = 7;
  /** How quickly it catches up: higher is snappier. */
  ease = 4;
  private target: GameObject | null = null;
  private focus: Vec3 = [0, 0, 0];

  start(): void {
    this.target = this.scene.findByName('Thief');
    if (this.target) this.focus = vec3.clone(this.target.transform.position);
    this.place(1);
  }

  lateUpdate(dt: number): void {
    this.place(1 - Math.exp(-this.ease * dt));
  }

  private place(t: number): void {
    if (!this.target) return;
    this.focus = vec3.lerp(this.focus, this.target.transform.position, t);
    this.transform.position = vec3.add(this.focus, [0, this.height, this.back]);
    this.transform.lookAt(vec3.add(this.focus, [0, 0.8, 0]));
  }
}
