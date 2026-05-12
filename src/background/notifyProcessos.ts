import { browserActionGetBadgeText, clearAlarm, getAlarms, getLocalStorage } from './tools'
import { isAuthenticated, listarProcessos } from './api'
import { currentBrowser } from './core'
import type { BrowserActionState, Message } from '../types/messaging'

const PERIOD_IN_MINUTES = 5
const ALARM_NAME = 'notifyProcessos'

const browserAction: BrowserActionState = {
  enabled: false,
  status: 'Desativado',
  qtdNaoVisualizado: null
}

function notify (message: { title: string; description: string }): void {
  const manifest = currentBrowser.runtime.getManifest()
  currentBrowser.notifications.create(ALARM_NAME, {
    type: 'basic',
    iconUrl: currentBrowser.runtime.getURL(manifest.action?.default_icon as string ?? ''),
    title: message.title,
    message: message.description
  })
}

async function notifyProcessos (): Promise<void> {
  const lista = await listarProcessos()
  browserAction.qtdNaoVisualizado = lista.filter(e => !e.processoVisualizado).length
  browserAction.enabled = true
  browserAction.status = 'Ativado'

  if (browserAction.qtdNaoVisualizado) {
    const count = Number(await browserActionGetBadgeText({}))
    if (!count) {
      notify({ title: 'Processos', description: 'Novo processo' })
      currentBrowser.action.setBadgeText({ text: '1' })
    }
  }
  currentBrowser.storage.local.set({ browserAction })
}

async function alarmNotifyProcessos (alarmInfo: chrome.alarms.Alarm): Promise<void> {
  try {
    await notifyProcessos()
  } catch (error) {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      browserAction.enabled = true
      browserAction.status = 'Não autenticado'
      browserAction.qtdNaoVisualizado = null
      currentBrowser.storage.local.set({ browserAction })
      const badgeText = await browserActionGetBadgeText({})
      if (badgeText !== 'login') {
        notify({ title: 'Erro ao checar processos', description: 'Usuário não está autenticado no SEI/SUPER' })
        currentBrowser.action.setBadgeText({ text: 'login' })
      }
    } else {
      await disableNotifyProcessos()
      console.error(alarmInfo.name, error)
      notify({ title: 'Erro ao checar processos', description: `Erro ao carregar dados: ${error}` })
    }
  }
}

async function enableNotifyProcessos (): Promise<void> {
  currentBrowser.alarms.onAlarm.addListener(alarmNotifyProcessos)
  currentBrowser.alarms.create(ALARM_NAME, { periodInMinutes: PERIOD_IN_MINUTES })
  await alarmNotifyProcessos({ name: ALARM_NAME, scheduledTime: Date.now() })
}

async function disableNotifyProcessos (): Promise<void> {
  browserAction.enabled = false
  browserAction.status = 'Desativado'
  browserAction.qtdNaoVisualizado = 0
  currentBrowser.storage.local.set({ browserAction })
  currentBrowser.action.setBadgeText({ text: '' })
  await clearAlarm(ALARM_NAME)
}

export async function notifyReceivedMessage (message: Message): Promise<void> {
  if (message.from === 'browserAction') {
    currentBrowser.action.setBadgeText({ text: '' })
  } else if (message.from === 'seippOptionsSave') {
    const storage = await getLocalStorage()
    if (storage.CheckTypes?.includes('notificacoes')) {
      const alarm = await getAlarms(ALARM_NAME)
      if (!alarm) enableNotifyProcessos()
    } else {
      disableNotifyProcessos()
    }
  }
}

export async function serviceNotify (): Promise<void> {
  const storage = await getLocalStorage()
  if (storage.CheckTypes?.includes('notificacoes') && storage.baseUrl) {
    const alarm = await getAlarms(ALARM_NAME)
    if (alarm) await clearAlarm(ALARM_NAME)
    enableNotifyProcessos()
  } else {
    disableNotifyProcessos()
  }
}

export async function notifyOnClicked (): Promise<void> {
  const storage = await getLocalStorage()
  currentBrowser.tabs.create({ url: storage.baseUrl as string })
}
