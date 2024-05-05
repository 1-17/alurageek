import session from "./session.js"

const form = {
  validations: undefined,
  submissions: undefined,
  validate: undefined,
  isValid: true,
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
  login: session.login
}

form.validate = (field, isSubmitEvent) => {
  if (isSubmitEvent) {
    form.validations.email.value = (value) => value === "admin@alurageek.com" || "Email does not exist. Please, try again."
    form.validations.password.value = (value) => value === "123456" || "Password is wrong. Please, try again."
  }

  let hintMessageElement

  if (form.validations[field.name]) {
    for (const validation of Object.values(form.validations[field.name])) {
      const validity = validation(field.value)
      const message = validity !== field.value && validity

      if (typeof message === "string") {
        form.isValid = false

        const hintMessageId = `${field.name}_hint_message`
        field.setAttribute("aria-describedby", hintMessageId)
        field.parentElement.insertAdjacentHTML("beforeend", `
          <p id="${hintMessageId}" class="hint-message" role="alert" aria-live="polite" aria-assertive="true"></p>
        `)
        hintMessageElement = document.getElementById(hintMessageId)
        hintMessageElement.textContent = message
        break
      }
    }
  }

  field.onfocus = () => hintMessageElement && hintMessageElement.remove()
}

form.submit = (e) => {
  e.preventDefault()
  const { id, elements } = e.target

  for (const element of elements) {
    form.validate(element, true)
  }

  if (form.isValid) {
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
