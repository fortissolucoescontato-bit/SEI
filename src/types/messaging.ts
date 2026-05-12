/**
 * Tipos compartilhados para mensagens entre background, popup e content scripts.
 */

export interface Message {
  from: 'browserAction' | 'seippOptionsSave' | 'contentScript'
  type?: string
  payload?: unknown
}

export interface BrowserActionState {
  enabled: boolean
  status: string
  qtdNaoVisualizado: number | null
}

export interface StorageData {
  CheckTypes?: string[]
  baseUrl?: string
  browserAction?: BrowserActionState
  [key: string]: unknown
}

export interface Processo {
  id: string
  numProcesso: string
  processoVisualizado: boolean
  processoVisitado: boolean
  atribuido: string
  tipoProcesso: string
  interessados: string[]
  anotacao: { descricao: string; usuario: string }
  marcador: { titulo: string; descricao: string }
  especificacao: string
}
