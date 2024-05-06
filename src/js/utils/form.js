import session from "./session.js"
import products from "./products.js"

const form = {
  validations: undefined,
  submissions: undefined,
  isValid: true,
  validate: undefined,
  data: undefined,
  submit: undefined
}

form.validations = {
  email: {
    required: (value) => value.trim() || "Email is required.",
    pattern: (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) || "Email format is wrong. Please, insert a valid email."
  },
  password: {
    required: (value) => value.trim() || "Password is required.",
    minLength: (value) => value.length >= 6 || "Password is too short. It must have at least 6 characters.",
    maxLength: (value) => value.length <= 15 || "Password is too long. It must have max of 15 characters."
  }
}

form.submissions = {
  login: session.login,
  add_product: products.add
}

form.validate = (field) => {
  const hintMessageId = `${field.name}_hint_message`

  if (form.validations[field.name]) {
    for (const validation of Object.values(form.validations[field.name])) {
      const validityCheck = validation(field.value)
      const message = validityCheck !== field.value && validityCheck

      if (typeof message === "string") {
        form.isValid = false

        field.setAttribute("aria-describedby", hintMessageId)
        field.parentElement.classList.add("warning")
        field.parentElement.insertAdjacentHTML("beforeend", `
          <p id="${hintMessageId}" class="hint-message" role="alert" aria-live="polite" aria-assertive="true">
            ${message}
          </p>
        `)
        break
      }
    }
  }

  field.onfocus = () => {
    const hintMessage = document.querySelector(`p#${hintMessageId}`)

    if (hintMessage) {
      field.removeAttribute("aria-describedby")
      hintMessage.parentElement.classList.remove("warning")
      hintMessage.remove()
    }

    form.isValid = true
  }
}

form.data = (e) => {
  const data = new FormData(e.target)
  const dataObject = {}

  for (const [key, value] of data.entries()) {
    dataObject[key] = value
  }

  return dataObject
}

const { data: formData } = form
export { formData }

form.submit = (e) => {
  e.preventDefault()
  
  form.validations.email.value = (value) => value === "admin@alurageek.com" || "Email does not exist. Please, try again."
  form.validations.password.value = (value) => value === "123456" || "Password is wrong. Please, try again."
  
  const { id, elements } = e.target

  if (!id) {
    throw new Error("Form: Missing id attribute.")
  }
  
  for (const element of elements) {
    form.validate(element)
  }

  if (form.isValid) {
    if (!form.submissions[id]) {
      throw new Error(`Form '${id}': Missing submission function.`)
    }

    form.submissions[id](e)
  }
}

const handleForm = () => {
  const forms = document.querySelectorAll("form")

  forms.forEach(formElement => {
    formElement.noValidate = true
    formElement.addEventListener("submit", form.submit)

    for (const element of formElement.elements) {
      if (element.name) {
        !element.placeholder && (element.placeholder = "")
        element.autocomplete = "off"
        element.ariaAutoComplete = "none"

        if (form.validations[element.name]) {
          element.addEventListener("blur", () => form.validate(element))
        }
      }
    }
  })
}

export default handleForm
