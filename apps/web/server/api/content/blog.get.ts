export default defineEventHandler(event => content(event).blog(readLocale(event), isDraft(event)))
