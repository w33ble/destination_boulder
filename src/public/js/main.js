import Alpine from 'https://unpkg.com/alpinejs@3.5.1/dist/module.esm.js'

// attach to window, useful for debugging
window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
  document.querySelector('#content').style.display = 'block'
})

Alpine.start()
