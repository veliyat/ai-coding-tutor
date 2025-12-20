const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in prod
    console.error(...args)
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args)
  },
  table: (data: unknown) => {
    if (isDev) console.table(data)
  },
  group: (label: string) => {
    if (isDev) console.group(label)
  },
  groupEnd: () => {
    if (isDev) console.groupEnd()
  },
}
