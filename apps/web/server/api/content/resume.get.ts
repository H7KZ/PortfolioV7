export default defineEventHandler(event => content(event).resume(readLocale(event), isDraft(event)))
