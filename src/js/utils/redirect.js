const isLoginPage = window.location.pathname.includes("login")
const isLogged = !!localStorage.getItem("logged")

if (!isLoginPage && !isLogged) {
  window.location.replace("/")
}

if (isLoginPage && isLogged) {
  window.location.replace("/products.html")
}
