import diff from 'jest-diff'
global.expect.extend({
  toHaveBeenDispatchedWith(received, expected) {
    const options = {
      isNot: this.isNot,
      promise: this.promise
    }
    const data = received.mock.calls[0][1]
    const pass = this.equals(data, expected)
    const message = pass
      ? () =>
        this.utils.matcherHint('toHaveBeenDispatchedWith', undefined, undefined, options) +
          '\n\n' +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(data)}`
      : () => {
        const difference = diff(expected, data, {
          expand: this.expand
        })
        return (
          this.utils.matcherHint('toHaveBeenDispatchedWith', undefined, undefined, options) +
            '\n\n' +
            (difference &&
              `Expected: ${this.utils.printExpected(expected)}\n` + `Received: ${this.utils.printReceived(data)}`)
        )
      }

    return { actual: received, message, pass }
  }
})
