type Subscriber<T> = (data: T) => void

export class Publisher<T = unknown, P = unknown> {
  constructor(public hook: (props: P) => T) {}
  subscribers = new Set<Subscriber<T>>()
  data!: T

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber(this.data)
    }
  }
}
