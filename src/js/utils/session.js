const session = {
  key: "logged",
  login: undefined,
  logout: undefined,
  isLogged: undefined
}

session.login = () => {
  localStorage.setItem(session.key, true)
  window.location.replace("/products.html")
}

session.logout = () => localStorage.removeItem(session.key)

session.isLogged = !!localStorage.getItem(session.key)

const { key, ...sessionMethods } = session
export default sessionMethods
