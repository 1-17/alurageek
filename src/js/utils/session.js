const session = {
  _key: "logged",
  login: undefined,
  logout: undefined,
  isLogged: undefined
}

session.login = () => {
  localStorage.setItem(session._key, true)
  window.location.replace("/products.html")
}

session.logout = () => localStorage.removeItem(session._key)

session.isLogged = !!localStorage.getItem(session._key)

export default session
