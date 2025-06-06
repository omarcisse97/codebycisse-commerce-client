import Medusa from "@medusajs/js-sdk"

const medusaClient = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_SERVER_URL,
  publishableKey: "pk_9a004279a64215115541ef7e5d961b557596bbd1aeac0028cb6b14a44df9c0a0",
})

export { medusaClient }
