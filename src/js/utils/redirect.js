const isLoginPage = window.location.pathname.includes("login")
const isLogged = !!localStorage.getItem("logged")
const isPrivatePage = !isLoginPage && !isLogged

if (isPrivatePage) {
  window.location.replace("/alurageek")
}

if (isLoginPage && isLogged) {
  window.location.replace("/alurageek/products")
}
