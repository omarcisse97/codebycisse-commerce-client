import Medusa from "@medusajs/js-sdk"

const medusaClient = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_SERVER_URL,
  publishableKey: import.meta.env.VITE_API_KEY_MEDUSA_SERVER,
})

export { medusaClient }