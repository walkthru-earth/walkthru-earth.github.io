import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ParquetInfo,
  WorkerRequest,
  WorkerResponse,
} from './parquet-types';

class TestWorker {
  static instances: TestWorker[] = [];
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  postMessage = vi.fn<(message: WorkerRequest) => void>();
  terminate = vi.fn();

  constructor() {
    TestWorker.instances.push(this);
  }

  emit(data: WorkerResponse) {
    this.onmessage?.({ data } as MessageEvent<WorkerResponse>);
  }

  get requests() {
    return this.postMessage.mock.calls.map(([message]) => message);
  }
}

const info: ParquetInfo = {
  fileSize: 1024,
  numRows: 2,
  numRowGroups: 1,
  columns: [{ name: 'metric', type: 'DOUBLE', codec: 'SNAPPY' }],
  createdBy: 'test',
  parquetVersion: 2,
};

let loadParquet: typeof import('./parquet-loader').loadParquet;

beforeEach(async () => {
  vi.resetModules();
  TestWorker.instances = [];
  vi.stubGlobal('Worker', TestWorker);
  ({ loadParquet } = await import('./parquet-loader'));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadParquet worker lifecycle', () => {
  it('rejects an already cancelled query without creating a worker', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      loadParquet('/data.parquet', ['metric'], { signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(TestWorker.instances).toHaveLength(0);
  });

  it('never caches a cancelled partial result or a late response for it', async () => {
    const controller = new AbortController();
    const onChunk = vi.fn();
    const first = loadParquet(
      '/data.parquet',
      ['metric'],
      { signal: controller.signal },
      onChunk
    );
    const rejected = expect(first).rejects.toMatchObject({
      name: 'AbortError',
    });
    const worker = TestWorker.instances[0];
    const id = worker.requests[0].id;
    worker.emit({ id, type: 'chunk', rows: [{ metric: 1 }] });
    expect(onChunk).toHaveBeenCalledWith([{ metric: 1 }]);

    controller.abort();
    await rejected;
    expect(worker.requests[1]).toEqual({ id, cancel: true });
    worker.emit({ id, type: 'chunk', rows: [{ metric: 99 }] });
    worker.emit({ id, type: 'done', info });

    const second = loadParquet('/data.parquet', ['metric']);
    expect(worker.requests).toHaveLength(3);
    const retryId = worker.requests[2].id;
    expect(retryId).not.toBe(id);
    const completeRows = [{ metric: 2 }, { metric: 3 }];
    worker.emit({ id: retryId, type: 'chunk', rows: completeRows });
    worker.emit({ id: retryId, type: 'done', info });
    await expect(second).resolves.toEqual({ rows: completeRows, info });

    await expect(loadParquet('/data.parquet', ['metric'])).resolves.toEqual({
      rows: completeRows,
      info,
    });
    expect(worker.requests).toHaveLength(3);
    expect(onChunk).toHaveBeenCalledOnce();
  });

  it('keeps concurrent projections of one URL independent through out-of-order responses', async () => {
    const metric = loadParquet('/shared.parquet', ['metric']);
    const label = loadParquet('/shared.parquet', ['label']);
    const worker = TestWorker.instances[0];
    expect(TestWorker.instances).toHaveLength(1);
    expect(worker.requests).toHaveLength(2);
    expect(worker.requests.map((request) => request.cancel)).toEqual([
      undefined,
      undefined,
    ]);
    const metricId = worker.requests[0].id;
    const labelId = worker.requests[1].id;
    worker.emit({ id: labelId, type: 'chunk', rows: [{ label: 'city' }] });
    worker.emit({ id: metricId, type: 'chunk', rows: [{ metric: 4 }] });
    worker.emit({ id: labelId, type: 'done', info });
    worker.emit({ id: metricId, type: 'done', info });
    await expect(label).resolves.toEqual({ rows: [{ label: 'city' }], info });
    await expect(metric).resolves.toEqual({ rows: [{ metric: 4 }], info });
    await expect(loadParquet('/shared.parquet', ['label'])).resolves.toEqual({
      rows: [{ label: 'city' }],
      info,
    });
    await expect(loadParquet('/shared.parquet', ['metric'])).resolves.toEqual({
      rows: [{ metric: 4 }],
      info,
    });
    expect(worker.requests).toHaveLength(2);
  });

  it('cancels only the requested query when another projection is pending', async () => {
    const controller = new AbortController();
    const metric = loadParquet('/shared.parquet', ['metric'], {
      signal: controller.signal,
    });
    const rejected = expect(metric).rejects.toMatchObject({
      name: 'AbortError',
    });
    const label = loadParquet('/shared.parquet', ['label']);
    const worker = TestWorker.instances[0];
    const labelId = worker.requests[1].id;
    controller.abort();
    await rejected;
    expect(worker.requests[2]).toEqual({
      id: worker.requests[0].id,
      cancel: true,
    });
    worker.emit({ id: labelId, type: 'chunk', rows: [{ label: 'active' }] });
    worker.emit({ id: labelId, type: 'done', info });
    await expect(label).resolves.toEqual({ rows: [{ label: 'active' }], info });
    expect(worker.terminate).not.toHaveBeenCalled();
  });

  it.each(['error', 'messageerror'] as const)(
    'rejects all pending queries after worker %s and creates a fresh worker on retry',
    async (failure) => {
      const first = loadParquet('/one.parquet', ['metric']);
      const second = loadParquet('/two.parquet', ['metric']);
      const expectedMessage =
        failure === 'error'
          ? 'Worker crashed'
          : 'Unable to read Parquet worker response';
      const firstRejected = expect(first).rejects.toThrow(expectedMessage);
      const secondRejected = expect(second).rejects.toThrow(expectedMessage);
      const failedWorker = TestWorker.instances[0];
      failedWorker.emit({
        id: failedWorker.requests[0].id,
        type: 'chunk',
        rows: [{ metric: 99 }],
      });
      if (failure === 'error')
        failedWorker.onerror?.({ message: expectedMessage } as ErrorEvent);
      else failedWorker.onmessageerror?.();
      await Promise.all([firstRejected, secondRejected]);
      expect(failedWorker.terminate).toHaveBeenCalledOnce();

      const retry = loadParquet('/one.parquet', ['metric']);
      expect(TestWorker.instances).toHaveLength(2);
      const freshWorker = TestWorker.instances[1];
      const retryId = freshWorker.requests[0].id;
      freshWorker.emit({ id: retryId, type: 'chunk', rows: [{ metric: 1 }] });
      freshWorker.emit({ id: retryId, type: 'done', info });
      await expect(retry).resolves.toEqual({ rows: [{ metric: 1 }], info });
    }
  );
});
