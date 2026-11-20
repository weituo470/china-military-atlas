import type { IncomingMessage, ServerResponse } from 'node:http'
export declare function spaceSuggestionsDir(dir?: string): string
export declare function createSpaceSuggestionsMiddleware(options?: {
  dataDir?: string
  trustLocalProxy?: boolean
  ipLimit?: number
  passcode?: string
  unlockLimit?: number
  now?: () => number
}): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>
