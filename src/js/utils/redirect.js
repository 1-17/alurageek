const isLoginPage = window.location.pathname.includes("login")
const isLogged = !!localStorage.getItem("login")

if (!isLoginPage && !isLogged) {
  window.location.replace("/")
}

if (isLoginPage && isLogged) {
  window.location.replace("/products.html")
}
