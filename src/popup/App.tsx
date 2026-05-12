import { useState, useEffect } from 'react'
import type { BrowserActionState } from '../types/messaging'

const currentBrowser = typeof (globalThis as unknown as { browser?: unknown }).browser === 'undefined'
  ? chrome
  : (globalThis as unknown as { browser: typeof chrome }).browser

async function getLocalStorage (): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    currentBrowser.storage.local.get(null, resolve)
  })
}

function App () {
  const [state, setState] = useState<BrowserActionState>({
    enabled: false,
    status: 'Carregando...',
    qtdNaoVisualizado: null
  })
  const [baseUrl, setBaseUrl] = useState<string | null>(null)

  useEffect(() => {
    getLocalStorage().then((storage) => {
      const ba = storage.browserAction as BrowserActionState | undefined
      if (ba) {
        setState(ba)
        setBaseUrl(storage.baseUrl as string ?? null)
      }

      // Notifica o background que o popup foi aberto
      currentBrowser.runtime.sendMessage({ from: 'browserAction', text: 'Action Clicked' })
    })
  }, [])

  function openControleProcesso () {
    if (baseUrl) currentBrowser.tabs.create({ url: baseUrl })
  }

  return (
    <div className="popup">
      <h3 className="popup-title">SEI++</h3>

      <div className="popup-content">
        <div className="field">
          <label>Notificações:</label>
          <span className={`status-badge ${state.status === 'Ativado' ? 'active' : 'inactive'}`}>
            {state.status}
          </span>
        </div>

        {state.enabled && (
          <>
            <div className="field">
              <label>Processos novos:</label>
              <span className="count">{state.qtdNaoVisualizado ?? 0}</span>
            </div>

            {baseUrl && (
              <p className="hostname">{baseUrl}</p>
            )}

            <button className="btn-primary" onClick={openControleProcesso}>
              Abrir controle de processos
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
