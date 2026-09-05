import { Dimension as IDimension } from '../../types';

export class Dimension implements IDimension {
  constructor(public readonly width: number, public readonly height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Dimension width and height must be positive numbers');
    }
  }

  public get area(): number {
    return this.width * this.height;
  }
}
