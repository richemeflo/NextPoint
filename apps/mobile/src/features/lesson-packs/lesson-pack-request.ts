export const lessonPackRequestTimeoutMs = 10_000;

export async function runLessonPackRequest<TResult>(
  request: (signal: AbortSignal) => PromiseLike<TResult>,
  timeoutMs = lessonPackRequestTimeoutMs
): Promise<TResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await request(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}
