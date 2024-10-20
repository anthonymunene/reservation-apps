export const logError = (error: Error) => {
  console.error(`Error: ${error.message}`)
  if ("stack" in error) {
    console.error(`Stack trace: ${error.stack}`)
  }
  // Additional logging logic, such as sending the error to a monitoring service
}
