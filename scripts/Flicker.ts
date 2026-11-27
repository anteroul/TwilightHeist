import { Script } from 'messier';

/** Makes a fire's light (and its flame, a child named Flame) waver. */
export default class Flicker extends Script {
  /** How much the brightness wavers, as a fraction of it. */
  amount = 0.25;
  /** Wavers per second, roughly. */
  rate = 7;
  private base = 0;
  private flameScale = 1;

  start(): void {
    this.base = this.object.light?.intensity ?? 0;
    this.flameScale = this.object.find('Flame')?.transform.scale[1] ?? 1;
  }

  update(_dt: number, time: number): void {
    const t = time * this.rate;
    // Two waves out of step read as fire rather than a pulse.
    const f = 1 + this.amount * (0.6 * Math.sin(t) + 0.4 * Math.sin(t * 2.37 + 1.3));
    if (this.object.light) this.object.light.intensity = this.base * f;
    const flame = this.object.find('Flame');
    if (flame) flame.transform.scale = [flame.transform.scale[0], this.flameScale * (0.8 + 0.25 * f), flame.transform.scale[2]];
  }
}
