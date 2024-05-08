import session from "./session.js"
import products from "./products.js"

const form = {
  validations: undefined,
  submissions: undefined,
  isValid: true,
  validate: undefined,
  data: undefined,
  submit: undefined,
  handle: undefined
}

form.validations = {
  email: {
    required: (value) => value || "Email is required.",
    pattern: (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) || "Email format is wrong. Please, insert a valid email."
  },
  password: {
    required: (value) => value || "Password is required.",
    minLength: (value) => value.length >= 6 || "Password is too short. It must have at least 6 characters.",
    maxLength: (value) => value.length <= 15 || "Password is too long. It must have max of 15 characters."
  },
  product_image: {
    required: (value) => value || "Product image URL is required.",
    pattern: (value) => /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#= ]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//= ]*)/.test(value) || "Product image URL is invalid. Please, insert a valid URL",
    notFound: (value) => new Promise((resolve, reject) => {
      const image = new Image()
      const imageElement = document.forms.add_product.querySelector("img")

      image.onload = () => {
        const field = document.forms.add_product.elements.product_image

        !imageElement && field.parentElement.insertAdjacentHTML("beforebegin", `
          <img src="${value}" alt="Product Preview" class="preview" role="img">
        `)

        resolve(true)
      }

      image.onerror = () => {
        imageElement && imageElement.remove()
        reject("Product image URL is invalid or the image is not available anymore.")
      }

      image.src = value
    })
  },
  product_category: {
    required: (value) => value.trim() !== "" || "Product category is required.",
    pattern: (value) => /^[a-zA-ZÀ-ÿ-'\s\d]+$/.test(value) || "Product category is invalid. It must have only letters, numbers, hyphens (-) and apostrophes (').",
    noHyphenOnStart: (value) => !value.startsWith("-") || "Product category is invalid. It cannot start with an hyphen (-).",
    noApostropheOnStart: (value) => !value.startsWith("'") || "Product category is invalid. It cannot start with an apostrophe (')."
  },
  product_name: {
    required: (value) => value.trim() !== "" || "Product name is required.",
    pattern: (value) => /^[a-zA-ZÀ-ÿ-'\s\d]+$/.test(value) || "Product name is invalid. It must have only letters, numbers, hyphens (-) and apostrophes (').",
    noHyphenOnStart: (value) => !value.startsWith("-") || "Product name is invalid. It cannot start with an hyphen (-).",
    noApostropheOnStart: (value) => !value.startsWith("'") || "Product name is invalid. It cannot start with an apostrophe (')."
  },
  product_price: {
    required: (value) => value || "Product price is required.",
    pattern: (value) => /^[\d.,]+$/.test(value) || "Product price is wrong. It must have only numbers.",
    minValue: (value) => value !== "0.00" || "Product price cannot be zero. Please, insert a price.",
    maxValue: (value) => value.length <= 12 || "Product price is too high. Please, insert a valid price.",
  }
}

form.submissions = {
  login: session.login,
  add_product: products.add
}

const renderHintMessage = (field, message) => {
  const hintMessageId = `${field.name}_hint_message`
  const hintMessage = document.querySelector(`p#${hintMessageId}`)

  form.isValid = false

  if (!hintMessage) {
    field.setAttribute("aria-describedby", hintMessageId)
    field.parentElement.classList.add("warning")
    field.parentElement.insertAdjacentHTML("beforeend", `
      <p id="${hintMessageId}" class="hint-message" role="alert" aria-label="${field.name.charAt(0).toUpperCase() + field.name.slice(1).replace("_", " ")} hint message" aria-live="polite" aria-assertive="true">${message}</p>
    `)
  }
}

const unmountHintMessage = (field) => {
  const hintMessage = document.querySelector(`p#${field.name}_hint_message`)

  if (hintMessage) {
    field.removeAttribute("aria-describedby")
    hintMessage.parentElement.classList.remove("warning")
    hintMessage.remove()
  }

  form.isValid = true
}

form.validate = (field) => {
  if (form.validations[field.name]) {
    for (const validation of Object.values(form.validations[field.name])) {
      const validityCheck = validation(field.value)
      
      if (typeof validityCheck === "string" && validityCheck !== field.value) {
        renderHintMessage(field, validityCheck)
        break
      }

      if (validityCheck instanceof Promise) {
        validityCheck.catch(message => renderHintMessage(field, message))
        break
      }
    }
  }

  field.onfocus = () => unmountHintMessage(field)
}

form.data = (e) => {
  const data = new FormData(e.target)
  const dataObject = {}

  for (const [key, value] of data.entries()) {
    dataObject[key] = value
  }

  return dataObject
}

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

form.handle = () => {
  for (const formElement of document.querySelectorAll("form")) {
    formElement.noValidate = true
    formElement.addEventListener("submit", form.submit)
  
    for (const element of formElement.elements) {
      if (element.name) {
        element.value = ""
        !element.placeholder && (element.placeholder = "")
        element.autocomplete = "off"
        element.ariaAutoComplete = "none"

        if (form.validations[element.name]) {
          element.addEventListener("blur", () => form.validate(element))
        }
  
        if (element.name === "product_price") {
          element.value = "0.00"

          element.addEventListener("input", (e) => {
            const value = e.target.value

            if (value.trim()) {
              const cursorPosition = e.target.selectionStart
              const cleanedInput = value.replace(/\D/g, '')
              let valueAsPrice = (parseInt(cleanedInput, 10) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  
              e.target.value = valueAsPrice
              e.target.setSelectionRange(cursorPosition, cursorPosition)
            }
          })
        }
      }
    }
  }
}

const { handle, data } = form
export default { handle, data }
