export default defineEventHandler(event => content(event).home(readLocale(event), isDraft(event)))
