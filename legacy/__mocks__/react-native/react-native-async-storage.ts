type StorageType = { [key: string]: string }

const storage: StorageType = {}

const AsyncStorage = {
  setItem: jest.fn((key: string, value: string): Promise<void> => {
    return new Promise(resolve => {
      storage[key] = value
      resolve()
    })
  }),

  getItem: jest.fn((key: string): Promise<string | null> => {
    return new Promise(resolve => {
      resolve(storage[key] || null)
    })
  }),

  removeItem: jest.fn((key: string): Promise<void> => {
    return new Promise(resolve => {
      delete storage[key]
      resolve()
    })
  }),

  clear: jest.fn((): Promise<void> => {
    return new Promise(resolve => {
      Object.keys(storage).forEach(key => {
        delete storage[key]
      })
      resolve()
    })
  }),

  getAllKeys: jest.fn((): Promise<string[]> => {
    return new Promise(resolve => {
      resolve(Object.keys(storage))
    })
  }),

  multiGet: jest.fn((keys: string[]): Promise<[string, string | null][]> => {
    return new Promise(resolve => {
      const values = keys.map(key => [key, storage[key] || null])
      resolve(values)
    })
  }),

  multiSet: jest.fn((keyValuePairs: string[][]): Promise<void> => {
    return new Promise(resolve => {
      keyValuePairs.forEach(([key, value]) => {
        storage[key] = value
      })
      resolve()
    })
  }),

  multiRemove: jest.fn((keys: string[]): Promise<void> => {
    return new Promise(resolve => {
      keys.forEach(key => {
        delete storage[key]
      })
      resolve()
    })
  }),
}

export default AsyncStorage
