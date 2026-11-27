import { Script, quat } from 'messier';

/** Swings a watchtower lamp from side to side, tipped down toward the garden. */
export default class Searchlight extends Script {
  /** Compass direction the swing centers on, degrees (0 = −Z, 90 = +X). */
  heading = 0;
  /** How far it swings each way, degrees. */
  sweep = 30;
  /** How far below the horizon it points, degrees. */
  tilt = 30;
  /** Seconds for a swing there and back. */
  period = 7;
  /** Where in the swing it starts, 0…1. */
  phase = 0;

  update(_dt: number, time: number): void {
    const yaw = ((this.heading + this.sweep * Math.sin((time / this.period + this.phase) * Math.PI * 2)) * Math.PI) / 180;
    const tilt = (this.tilt * Math.PI) / 180;
    this.transform.rotation = quat.lookRotation([Math.sin(yaw) * Math.cos(tilt), -Math.sin(tilt), -Math.cos(yaw) * Math.cos(tilt)]);
  }
}
