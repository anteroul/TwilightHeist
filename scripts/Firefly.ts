import { Script, vec3, type Vec3 } from 'messier';

/** Drifts around where it was placed, and blinks. */
export default class Firefly extends Script {
  /** How far it wanders, m. */
  wander = 1.2;
  /** Seconds per loop. */
  period = 9;
  /** Where in the loop it starts, 0…1. */
  phase = 0;
  private home: Vec3 = [0, 0, 0];

  start(): void {
    this.home = vec3.clone(this.transform.position);
  }

  update(_dt: number, time: number): void {
    const a = (time / this.period + this.phase) * Math.PI * 2;
    this.transform.position = vec3.add(this.home, [Math.sin(a) * this.wander, Math.sin(a * 3) * 0.3, Math.sin(a * 2) * this.wander * 0.6]);
    const blink = 0.5 + 0.5 * Math.sin(a * 7);
    const s = 0.35 + 0.65 * blink;
    this.transform.scale = [s, s, s];
  }
}
