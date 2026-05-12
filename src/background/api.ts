import { getLocalStorage } from './tools'
import { fetchRoot, fetchSei, getActionUrl } from './fetchSei'
import type { Processo } from '../types/messaging'

async function fetchListaDetalhada (newUrl: string | null = null): Promise<Document> {
  const url = newUrl ?? await getActionUrl('procedimento_controlar')

  const formData = new URLSearchParams()
  formData.append('hdnTipoVisualizacao', 'D')

  const html = await fetchSei(url, { method: 'POST', body: formData })
  const parser = new DOMParser()
  const doc = parser.parseFromString(html ?? '', 'text/html')
  const form = doc.querySelector<HTMLFormElement>('#frmProcedimentoControlar')
  const tipoVisualizacao = form?.querySelector<HTMLInputElement>('#hdnTipoVisualizacao')?.value

  if (tipoVisualizacao === 'D') {
    return doc
  } else if (tipoVisualizacao === 'R' && newUrl === null) {
    const storage = await getLocalStorage()
    const formUrl = `${storage.baseUrl}${form?.getAttribute('action') ?? ''}`
    return fetchListaDetalhada(formUrl)
  } else {
    throw new Error('Erro ao obter a lista detalhada')
  }
}

export async function listarProcessos (): Promise<Processo[]> {
  const doc = await fetchListaDetalhada()
  const table = doc.querySelector<HTMLTableElement>('#tblProcessosDetalhado')

  if (!table) return []

  const rows = table.querySelectorAll<HTMLTableRowElement>('tbody > tr[id]')

  return [...rows].map((row) => {
    const linkProcesso = row.querySelector<HTMLAnchorElement>('td:nth-child(3) > a')
    return {
      id: row.id,
      numProcesso: linkProcesso?.innerText ?? '',
      processoVisualizado: linkProcesso?.classList.contains('processoVisualizado') ?? false,
      processoVisitado: linkProcesso?.classList.contains('processoVisitado') ?? false,
      atribuido: row.querySelector<HTMLAnchorElement>('td:nth-child(4) > a')?.innerText ?? '',
      tipoProcesso: row.querySelector<HTMLTableCellElement>('td:nth-child(5)')?.innerText ?? '',
      interessados: [...row.querySelectorAll<HTMLSpanElement>('td:nth-child(6) .spanItemCelula')].map(e => e.innerText),
      anotacao: { descricao: '', usuario: '' },
      marcador: { titulo: '', descricao: '' },
      especificacao: ''
    }
  })
}

export async function isAuthenticated (baseUrl?: string): Promise<boolean> {
  const doc = await fetchRoot(baseUrl ?? null)
  return !doc.querySelector('#frmLogin')
}
