import session from "./session.js"
import products from "./products.js"

const form = {
  validations: undefined,
  submissions: undefined,
  isValid: true,
  hintMessage: {
    id: "_hint_message",
    element: undefined,
    render: undefined,
    unmount: undefined
  },
  validate: undefined,
  data: undefined,
  submit: undefined,
  initialPrice: "0.00",
  formatPriceField: undefined,
  handle: undefined
}

const productImage = {
  form: document.querySelector("form#add_product") || document.querySelector("form#edit_product"),
  element: undefined,
  render: undefined,
  unmount: undefined
}

productImage.render = (imageURL) => {
  if (!imageURL) {
    throw new Error("Product Image Render: Missing image URL argument.")
  }

  if (typeof imageURL !== "string") {
    throw new Error("Product Image Render: Invalid image URL argument. It must be a string.")
  }
  
  if (productImage.form && !productImage.element) {
    const fieldContainer = productImage.form.elements.product_image.parentElement
    
    if (!fieldContainer) {
      throw new Error("Product Image Render: Field container not found.")
    }

    fieldContainer.insertAdjacentHTML("beforebegin", `
      <img src="${imageURL}" alt="Product Preview" class="preview" role="img">
    `)
  }
}

productImage.unmount = () => productImage.element?.remove()

form.validations = {
  email: {
    required: (value) => value || "Email is required.",
    pattern: (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) || "Email format is wrong. Please, insert a valid email.",
    maxLength: (value) => value.length <= 120 || "Email is too long. It must have max of 120 characters."
  },
  password: {
    required: (value) => value || "Password is required.",
    minLength: (value) => value.length >= 6 || "Password is too short. It must have min of 6 characters.",
    maxLength: (value) => value.length <= 15 || "Password is too long. It must have max of 15 characters."
  },
  product_image: {
    required: (value) => {
      if (value) {
        return true
      }
      productImage.unmount()
      return "Product image URL is required."
    },
    pattern: (value) => {
      if (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#= ]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//= ]*)/.test(value)) {
        return true
      }
      productImage.unmount()
      return "Product image URL is invalid. Please, insert a valid URL"
    },
    notFound: (value) => new Promise((resolve, reject) => {
      const image = new Image()
      image.src = value
      
      image.onload = () => {
        productImage.render(value)
        productImage.element = productImage.form.querySelector("img")
        resolve(true)
      }

      image.onerror = () => {
        productImage.unmount()
        reject("Product image URL is invalid or the image is not available anymore.")
      }
    })
  },
  product_category: {
    required: (value) => value.trim() !== "" || "Product category is required.",
    pattern: (value) => /^[a-zA-ZÀ-ÿ-'\s\d]+$/.test(value) || "Product category is invalid. It must have only letters, numbers, hyphens (-) and apostrophes (').",
    noHyphenOnStart: (value) => !value.startsWith("-") || "Product category is invalid. It cannot start with an hyphen (-).",
    noApostropheOnStart: (value) => !value.startsWith("'") || "Product category is invalid. It cannot start with an apostrophe (').",
    minValue: (value) => value.length >= 3 || "Product category is too short. It must have min of 3 characters.",
    maxValue: (value) => value.length <= 30 || "Product category is too long. It must have max of 30 characters."
  },
  product_name: {
    required: (value) => value.trim() !== "" || "Product name is required.",
    pattern: (value) => /^[a-zA-ZÀ-ÿ-'\s\d]+$/.test(value) || "Product name is invalid. It must have only letters, numbers, hyphens (-) and apostrophes (').",
    noHyphenOnStart: (value) => !value.startsWith("-") || "Product name is invalid. It cannot start with an hyphen (-).",
    noApostropheOnStart: (value) => !value.startsWith("'") || "Product name is invalid. It cannot start with an apostrophe (').",
    minValue: (value) => value.length >= 3 || "Product name is too short. It must have min of 3 characters.",
    maxValue: (value) => value.length <= 160 || "Product name is too long. It must have max of 160 characters."
  },
  product_price: {
    required: (value) => value || "Product price is required.",
    pattern: (value) => /^[\d.,]+$/.test(value) || "Product price is wrong. It must have only numbers.",
    minValue: (value) => value !== form.initialPrice || "Product price cannot be zero. Please, insert a price.",
    maxValue: (value) => value.length <= 12 || "Product price is too high. Please, insert a valid price.",
  }
}

form.submissions = {
  login: session.login,
  add_product: products.add,
  edit_product: products.edit,
  search_product: products.search
}

form.hintMessage.render = (field, message) => {
  let { id, element } = form.hintMessage
  id = field.name + id
  element = document.querySelector(`p#${id}`)

  form.isValid = false

  if (!element) {
    field.setAttribute("aria-describedby", id)
    field.setCustomValidity(message)
    field.parentElement.insertAdjacentHTML("beforeend", `
      <p id="${id}" class="hint-message" role="alert" aria-label="${field.name.charAt(0).toUpperCase() + field.name.slice(1).replace("_", " ")} hint message" aria-live="polite" aria-assertive="true">${message}</p>
    `)
  }
}

form.hintMessage.unmount = (field) => {
  let { id, element } = form.hintMessage
  id = field.name + id
  element = document.querySelector(`p#${id}`)

  if (element) {
    field.removeAttribute("aria-describedby")
    field.setCustomValidity("")
    element.remove()
  }

  form.isValid = true
}

form.validate = (field) => {
  if (form.validations[field.name]) {
    for (const validation of Object.values(form.validations[field.name])) {
      const validityCheck = validation(field.value)
      
      if (typeof validityCheck === "string" && validityCheck !== field.value) {
        form.hintMessage.render(field, validityCheck)
        break
      }

      if (validityCheck instanceof Promise) {
        validityCheck.catch(message => form.hintMessage.render(field, message))
        break
      }
    }
  }

  field.onfocus = () => form.hintMessage.unmount(field)
}

form.data = (e) => {
  const data = new FormData(e.target)
  const dataObject = {}

  for (const [key, value] of data.entries()) {
    const keyToRemove = "product_"

    if (key.includes(keyToRemove)) {
      dataObject[key.replace(keyToRemove, "")] = value
    } else {
      dataObject[key] = value
    }
  }

  return dataObject
}

form.submit = (e) => {
  e.preventDefault()
  
  form.validations.email.value = (value) => value === "admin@alurageek.com" || "Email does not exist. Please, try again."
  form.validations.password.value = (value) => value === "123456" || "Password is wrong. Please, try again."
  
  const { id, elements } = e.target

  if (!id) {
    throw new Error("Form Submit: Missing id attribute.")
  }

  if (!elements?.length > 0) {
    throw new Error("Form Submit: Missing elements.")
  }
  
  for (const element of elements) {
    form.validate(element)
  }

  if (form.isValid) {
    if (!form.submissions[id]) {
      throw new Error(`Form Submit '${id}': Missing submission function.`)
    }

    form.submissions[id](e)
  }
}

form.formatPriceField = (field) => {
  if (!field) {
    throw new Error("Form Format Price Field: Missing field argument.")
  }

  if (field.form.id !== "edit_product") {
    field.value = form.initialPrice
  }

  field.addEventListener("input", (e) => {
    const value = e.target.value

    if (value) {
      const cursorPosition = e.target.selectionStart
      const cleanedInput = value.replace(/\D/g, '')
      let valueAsPrice = (parseInt(cleanedInput, 10) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

      e.target.value = valueAsPrice
      e.target.setSelectionRange(cursorPosition, cursorPosition)
      return
    }

    e.target.value = form.initialPrice
  })
}

form.handle = () => {
  for (const formElement of document.querySelectorAll("form")) {
    formElement.noValidate = true
    formElement.addEventListener("submit", form.submit)
  
    for (const element of formElement.elements) {
      if (element.name) {
        if (formElement.id !== "edit_product" && element.value) {
          element.value = ""
        }
        
        !element.placeholder && (element.placeholder = "")
        element.autocomplete = "off"
        element.ariaAutoComplete = "none"

        if (formElement.id === "edit_product") {
          let previewImage

          for (const [key, value] of products.productToUpdate) {
            if (key.includes("image")) {
              previewImage = value
            }

            if (element.name.includes(key)) {
              element.value = value
            }
          }

          if (element.name.includes("image")) {
            productImage.render(previewImage)
            productImage.element = formElement.querySelector("img")
          }
        }

        if (element.name === "product_price") {
          form.formatPriceField(element)
        }

        if (form.validations[element.name]) {
          element.addEventListener("blur", () => form.validate(element))
        }
      }
    }
  }
}

const { handle, data } = form
export default { handle, data }
