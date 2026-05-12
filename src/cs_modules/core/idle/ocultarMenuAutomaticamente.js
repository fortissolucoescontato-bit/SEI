/* global __mconsole */
// eslint-disable-next-line no-unused-vars
function ocultarMenuAutomaticamente (BaseName) {
  const mconsole = new __mconsole(BaseName + '.ocultarMenuAutomaticamente')
  const menu = document.querySelector('#divInfraAreaTelaE')

  if (menu && menu.classList.contains('infraAreaTelaEExibeGrande')) {
    const iconMenu = document.querySelector('#lnkInfraMenuSistema')
    iconMenu.click()
    mconsole.log('Menu ocultado automaticamente')
  }
}
