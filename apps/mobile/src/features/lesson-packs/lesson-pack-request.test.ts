import assert from 'node:assert/strict';
import test from 'node:test';

import { runLessonPackRequest } from './lesson-pack-request';

test('a lesson-pack request resolves normally before its deadline', async () => {
  const value = await runLessonPackRequest(
    async (signal) => {
      assert.equal(signal.aborted, false);
      return 'ready';
    },
    100
  );

  assert.equal(value, 'ready');
});

test('a stalled lesson-pack request is aborted at its deadline', async () => {
  await assert.rejects(
    runLessonPackRequest(
      (signal) =>
        new Promise<never>((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new Error('request_aborted')),
            { once: true }
          );
        }),
      10
    ),
    /request_aborted/
  );
});
