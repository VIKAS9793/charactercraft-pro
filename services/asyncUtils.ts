// services/asyncUtils.ts

/**
 * Executes an array of promise-generating functions in controlled concurrent chunks.
 *
 * @param promiseFactories An array of functions, where each function returns a Promise.
 *   Using factories ensures that promises are not created until they are about to be processed.
 * @param chunkSize The maximum number of promises to run concurrently.
 * @param onProgress An optional callback that fires each time a promise in any chunk is settled.
 *   It receives the number of completed promises and the total number of promises.
 * @returns A promise that resolves with an array of PromiseSettledResult from all chunks.
 */
export async function processPromisesInChunks<T>(
  promiseFactories: (() => Promise<T>)[],
  chunkSize: number,
  onProgress?: (completed: number, total: number) => void
): Promise<PromiseSettledResult<T>[]> {
  const totalPromises = promiseFactories.length;
  let completedPromises = 0;
  const allResults: PromiseSettledResult<T>[] = [];

  for (let i = 0; i < totalPromises; i += chunkSize) {
    const chunkFactories = promiseFactories.slice(i, i + chunkSize);
    
    const chunkPromises = chunkFactories.map(factory => {
      const promise = factory();
      if (onProgress) {
        promise.finally(() => {
          completedPromises++;
          onProgress(completedPromises, totalPromises);
        });
      }
      return promise;
    });

    const results = await Promise.allSettled(chunkPromises);
    allResults.push(...results);
  }

  return allResults;
}
