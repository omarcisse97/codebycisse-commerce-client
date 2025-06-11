import Medusa from "@medusajs/js-sdk"

const baseUrl = import.meta.env.VITE_MEDUSA_SERVER_URL;
const publishableKey = import.meta.env.VITE_API_KEY_MEDUSA_SERVER


const medusaClient = new Medusa({
  baseUrl: baseUrl,
  publishableKey: publishableKey ,
})

export { medusaClient }