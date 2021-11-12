import Alpine from 'https://unpkg.com/alpinejs@3.5.1/dist/module.esm.js'

// attach to window, useful for debugging
window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
  console.log('alpine is started')
})

Alpine.start()
