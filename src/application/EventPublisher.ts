import { CitySnapshotData, ICityEventPublisher, ICityObserver, ResourceDeltaData } from '../types';

export class CityEventPublisher implements ICityEventPublisher {
  private readonly observers: Set<ICityObserver> = new Set();

  public subscribe(observer: ICityObserver): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: ICityObserver): void {
    this.observers.delete(observer);
  }

  public publish(snapshot: CitySnapshotData, delta: ResourceDeltaData): void {
    for (const observer of this.observers) {
      try {
        observer.onMetricsChanged(snapshot, delta);
      } catch (e) {
        console.error('Error in city observer notification:', e);
      }
    }
  }
}
