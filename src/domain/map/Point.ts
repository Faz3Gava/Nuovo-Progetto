import { Point as IPoint } from '../../types';

export class Point implements IPoint {
  constructor(public readonly x: number, public readonly y: number) {}

  public equals(other: IPoint): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public chebyshevDistance(other: IPoint): number {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
  }
}
