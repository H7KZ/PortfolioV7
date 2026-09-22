export default defineEventHandler(async event => sendText(event, (await content().site()).humansTxt))
