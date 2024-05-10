import handleResponsiveSearchbar from "./utils/handleResponsiveSearchbar.js"
import form from "./utils/form.js"

document.addEventListener("DOMContentLoaded", () => {
  handleResponsiveSearchbar()
  form.handle()
})
