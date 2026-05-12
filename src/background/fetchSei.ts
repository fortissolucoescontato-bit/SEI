import { getLocalStorage } from './tools'

export async function fetchSei (url: string, options: RequestInit = { method: 'GET' }): Promise<string | undefined> {
  const resp = await fetch(url, options)
  if (resp.ok) {
    const buffer = await resp.arrayBuffer()
    return new TextDecoder('ISO-8859-1').decode(buffer)
  }
}

/**
 * Busca o DOM raiz do SEI.
 * @param baseUrl URL base do SEI (Default: storage.baseUrl)
 */
export async function fetchRoot (baseUrl: string | null = null): Promise<Document> {
  const storage = await getLocalStorage()
  const url = baseUrl ?? storage.baseUrl ?? ''
  const parser = new DOMParser()
  const html = await fetchSei(url)
  return parser.parseFromString(html ?? '', 'text/html')
}

export async function getActionUrl (actionName: string): Promise<string> {
  const storage = await getLocalStorage()
  const doc = await fetchRoot()
  const menu = doc.querySelector('#main-menu, #infraMenu')
  const link = menu?.querySelector<HTMLAnchorElement>(`li > a[href*="acao=${actionName}"]`)
  return `${storage.baseUrl}${link?.getAttribute('href') ?? ''}`
}
