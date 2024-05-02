import session from "../utils/session.js"
import products from "../utils/products.js"

document.querySelector("a#nav_button").addEventListener("click", session.logout)
document.addEventListener("DOMContentLoaded", products.renderAll)
