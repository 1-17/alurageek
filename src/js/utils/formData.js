const formData = (e) => {
  e.preventDefault()

  const formData = new FormData(e.target)
  const dataObject = {}

  for (const [key, value] of formData.entries()) {
    dataObject[key] = value
  }

  return dataObject
}

export default formData
