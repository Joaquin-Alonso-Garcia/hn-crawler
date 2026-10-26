export class FakeClock {
  constructor(private current: Date) {}

  readonly now = (): Date => new Date(this.current);

  advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}
