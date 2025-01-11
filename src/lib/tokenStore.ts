
if (!global.tokenStore) {
  global.tokenStore = new Map<string, string>()
}

export const getTokenStore = () => global.tokenStore
