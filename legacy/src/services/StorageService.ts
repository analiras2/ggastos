import AsyncStorage from '@react-native-async-storage/async-storage'

export class StorageService {
  private static instance: StorageService
  private readonly STORAGE_PREFIX = '@GGastos:'

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  private getKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`
  }

  async save<T>(key: string, data: T): Promise<void> {
    try {
      const jsonData = JSON.stringify(data)
      await AsyncStorage.setItem(this.getKey(key), jsonData)
    } catch (error) {
      throw new Error(`Erro ao salvar dados: ${error}`)
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(this.getKey(key))
      return jsonData ? JSON.parse(jsonData) : null
    } catch (error) {
      throw new Error(`Erro ao carregar dados: ${error}`)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key))
    } catch (error) {
      throw new Error(`Erro ao remover dados: ${error}`)
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return keys.filter(key => key.startsWith(this.STORAGE_PREFIX))
    } catch (error) {
      throw new Error(`Erro ao buscar chaves: ${error}`)
    }
  }
}
