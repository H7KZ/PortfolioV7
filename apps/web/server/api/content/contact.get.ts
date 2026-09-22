export default defineEventHandler(event => content(event).contact(readLocale(event), isDraft(event)))
