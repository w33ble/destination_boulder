document.addEventListener('alpine:init', async () => {
  Alpine.data('home', () => ({
    token: null,
    init() {
      this.$nextTick(() => {
        this.token = window.localStorage.getItem('hasura-admin-secret')
      })
    },
    setToken() {
      window.localStorage.setItem('hasura-admin-secret', this.token)
    }
  }))
})
