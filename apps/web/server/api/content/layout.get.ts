export default defineEventHandler(event => content(event).layout(readLocale(event), isDraft(event)))
