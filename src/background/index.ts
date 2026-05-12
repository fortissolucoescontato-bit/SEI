import { currentBrowser } from './core'
import { handleInstalled } from './tools'
import { serviceNotify, notifyReceivedMessage, notifyOnClicked } from './notifyProcessos'
import type { Message } from '../types/messaging'

/******************************************************************************
 SEI++: Service worker principal — stack modernizada com Vite + React + TS
 Autor: Lucas Vinicius Oliveira dos Santos
******************************************************************************/

currentBrowser.runtime.onInstalled.addListener(handleInstalled)

// Firefox-only: armazena a versão do browser no storage
const firefoxRuntime = currentBrowser.runtime as typeof chrome.runtime & {
  getBrowserInfo?: () => Promise<{ version: string }>
}
if (typeof firefoxRuntime.getBrowserInfo === 'function') {
  firefoxRuntime.getBrowserInfo().then((info) => {
    currentBrowser.storage.local.set({ version: info.version })
  })
}

/** Handle de mensagens recebidas */
currentBrowser.runtime.onMessage.addListener((message: Message) => {
  if (message.from === 'browserAction' || message.from === 'seippOptionsSave') {
    notifyReceivedMessage(message)
  }
})

/** Handle de click nas notificações */
currentBrowser.notifications.onClicked.addListener(function (notificationId: string) {
  if (notificationId === 'notifyProcessos') {
    notifyOnClicked()
  }
})

serviceNotify()
