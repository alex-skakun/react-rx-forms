import {
    asapScheduler,
    filter,
    from,
    map,
    MonoTypeOperatorFunction,
    Observable,
    ObservableInput,
    OperatorFunction,
    pipe,
    startWith,
    Subject,
    subscribeOn,
    Subscription,
    switchMap,
    withLatestFrom
} from "rxjs";

export function gate<T>(gateObservable: Observable<any>): MonoTypeOperatorFunction<T> {
    return pipe(
        withLatestFrom(gateObservable),
        filter(([_value, gateValue]) => Boolean(gateValue)),
        map(([value]) => value),
    );
}

export function toggleLastBy(toggleObservable: Observable<any>): MonoTypeOperatorFunction<boolean> {
    return pipe(
        switchMap((value) => {
            return toggleObservable.pipe(
                map(() => value = !value),
                startWith(value),
            );
        }),
    );
}

class LinkedQueueNode<T> {
    readonly #value
    next: LinkedQueueNode<T> | null;
    previous: LinkedQueueNode<T> | null;

    constructor(value: T, next: LinkedQueueNode<T> | null, previous: LinkedQueueNode<T> | null) {
        this.#value = value;
        this.next = next;
        this.previous = previous;

        if (this.next) {
            this.next.previous = this;
        }
    }

    get value(): T {
        return this.#value;
    }

    clear(): void {
        this.next = null;
        this.previous = null;
    }
}

class LinkedQueue<T> {
    #length = 0;
    #head: LinkedQueueNode<T> | null = null;
    #tail: LinkedQueueNode<T> | null = null;

    get length(): number {
        return this.#length;
    }

    pop(): T | undefined {
        if (this.#tail) {
            const lastNode = this.#tail;

            this.#tail = lastNode.previous;
            if (this.#tail) {
                this.#tail.next = null;
            }
            this.#length--;
            lastNode.clear();

            return lastNode.value;
        }

        return undefined;
    }

    unshift(value: T): void {
        const isFirstNode = !this.#head;
        const newNode = new LinkedQueueNode<T>(value, this.#head, null);
        this.#head = newNode;
        this.#length++;

        if (isFirstNode) {
            this.#tail = newNode;
        }
    }

    clear(): void {
        this.#head = null;
        this.#tail = null;
        this.#length = 0;
    }
}

class BufferedQueueSubject<T> extends Subject<T> {
    readonly #masterSubscription = new Subscription();
    readonly #queue = new LinkedQueue<() => Observable<T>>();
    readonly #execQueue = new LinkedQueue<void>();
    readonly #size: number;

    readonly #results = new Map<number, T>();
    #lastEmitted: number | null = null;
    #completed = false;
    #counter = 0;

    constructor(size: number) {
        super();
        this.#size = size;
    }

    addInQueue(action: () => Observable<T>): void {
        this.#queue.unshift(action);
        this.#resolveQueue();
    }

    markAsCompleted(): void {
        this.#completed = true;
        this.#resolveQueue();
    }

    cancel(): void {
        this.#execQueue.clear();
        this.#queue.clear();
        this.#results.clear();
        this.#masterSubscription.unsubscribe();
    }

    interrupt(error: any): void {
        this.cancel();
        this.error(error);
    }

    #resolveQueue() {
        if (this.#execQueue.length < this.#size && this.#queue.length) {
            this.#execQueue.unshift();

            const action = this.#queue.pop()!;
            const index = this.#counter++;
            const subscription = action()
                .pipe(
                    map((value): [number, T] => [index, value]),
                    subscribeOn(asapScheduler),
                )
                .subscribe({
                    next: ([index, value]) => {
                        this.#results.set(index, value);
                        this.#resolveResults();
                    },
                    error: (error) => this.error(error),
                    complete: () => {
                        subscription && this.#masterSubscription.remove(subscription);
                        this.#execQueue.pop();
                        this.#resolveQueue();
                    },
                });
            this.#masterSubscription.add(subscription);
        } else if (this.#completed && this.#queue.length === 0 && this.#execQueue.length === 0) {
            this.complete();
        }
    }

    #resolveResults(): void {
        const start = this.#lastEmitted !== null ? this.#lastEmitted + 1 : 0;
        const iterationsCount = this.#results.size + start;

        for (let i = start; i < iterationsCount; i++) {
            if (this.#results.has(i)) {
                const value = this.#results.get(i)!;
                this.next(value);
                this.#results.delete(i);
                this.#lastEmitted = i;
            } else {
                return;
            }
        }
    }
}

export function switchMergeMap<T, K>(
    mapFn: (value: T, index: number) => ObservableInput<K>,
    concurrent = 1,
): OperatorFunction<T, K> {
    return (source: Observable<T>): Observable<K> => {
        return new Observable(subscriber => {
            let counter = 0;
            const bufferedActionsQueue = new BufferedQueueSubject<K>(concurrent);
            const queueSubscription = bufferedActionsQueue.pipe(subscribeOn(asapScheduler)).subscribe({
                next: (value) => subscriber.next(value),
                error: (error) => subscriber.error(error),
                complete: () => subscriber.complete(),
            });
            const subscription = source.pipe(subscribeOn(asapScheduler)).subscribe({
                complete: () => bufferedActionsQueue.markAsCompleted(),
                error: (error) => bufferedActionsQueue.interrupt(error),
                next: (value) => {
                    const index = counter++;
                    const action = () => from(mapFn(value, index));

                    bufferedActionsQueue.addInQueue(action);
                },
            });

            return () => {
                bufferedActionsQueue.cancel();
                queueSubscription.unsubscribe();
                subscription.unsubscribe();
                subscriber.complete();
            };
        });
    };
}
