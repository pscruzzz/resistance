export async function generateJitter() {
  // Get the current timestamp in milliseconds
  const now = new Date().getTime();

  // Use the last digit of the timestamp to determine the jitter (1 to 3 seconds)
  const jitter = (now % 10) * 1000; // Will result in a number between 1000 and 3000

  // Return a new Promise that resolves after the jitter time
  return new Promise<void>(resolve => {
      setTimeout(() => {
          resolve();
      }, jitter);
  });
}