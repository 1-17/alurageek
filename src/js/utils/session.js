import formData from "./formData.js"

const session = {
  _key: "login",
  login: undefined,
  logout: undefined,
  isLogged: undefined
}

session.login = (e) => {
  localStorage.setItem(session._key, JSON.stringify(formData(e)))
  
  if (localStorage.getItem(session._key)) {
    window.location.replace("/products.html")
  }
}

session.logout = () => localStorage.removeItem(session._key)

session.isLogged = !!localStorage.getItem(session._key)

export default session
