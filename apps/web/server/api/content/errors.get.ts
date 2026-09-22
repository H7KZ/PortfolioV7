export default defineEventHandler(event => content(event).errors(readLocale(event), isDraft(event)))
