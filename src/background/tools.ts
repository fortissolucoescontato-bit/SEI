import { currentBrowser } from './core'
import type { StorageData } from '../types/messaging'

/** Executa ao instalar ou atualizar o complemento. */
export function handleInstalled (_details: chrome.runtime.InstalledDetails): void {
  const onError = (error: unknown): void => { console.error(`Error: ${error}`) }

  function abrirUrlSeipp (item: StorageData): void {
    item.InstallOrUpdate = true
    currentBrowser.storage.local.set(item)

    const repoUrl = 'https://github.com/fortissolucoescontato-bit/SEI'

    if (item.CheckTypes === undefined) {
      currentBrowser.tabs.create({ url: repoUrl })
    } else if (!item.CheckTypes.includes('hidemsgupdate')) {
      currentBrowser.tabs.create({ url: repoUrl })
    }
  }

  getLocalStorage('CheckTypes').then(abrirUrlSeipp).catch(onError)
}

export function getLocalStorage (params?: string | string[] | null): Promise<StorageData> {
  return new Promise((resolve, reject) => {
    currentBrowser.storage.local.get(params ?? null, (storage) => {
      if (currentBrowser.runtime.lastError) {
        reject(currentBrowser.runtime.lastError)
        return
      }
      resolve(storage as StorageData)
    })
  })
}

export function getAlarms (name: string): Promise<chrome.alarms.Alarm | undefined> {
  return new Promise((resolve, reject) => {
    currentBrowser.alarms.get(name, (alarm) => {
      if (currentBrowser.runtime.lastError) {
        reject(currentBrowser.runtime.lastError)
        return
      }
      resolve(alarm)
    })
  })
}

export function clearAlarm (name: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    currentBrowser.alarms.clear(name, (wasCleared) => {
      if (currentBrowser.runtime.lastError) {
        reject(currentBrowser.runtime.lastError)
        return
      }
      resolve(wasCleared)
    })
  })
}

export function browserActionGetBadgeText (details: chrome.browserAction.BadgeTextDetails): Promise<string> {
  return new Promise((resolve, reject) => {
    currentBrowser.action.getBadgeText(details, (badgeText) => {
      if (currentBrowser.runtime.lastError) {
        reject(currentBrowser.runtime.lastError)
        return
      }
      resolve(badgeText)
    })
  })
}
