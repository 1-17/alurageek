const handleResponsiveSearchbar = () => {
  const elementsToToggle = [document.querySelector("form#search_product"), document.querySelector("a#nav_button") || {}]
  const searchToggleButton = document.querySelector("button#searchbar_toggler")

  Array(...elementsToToggle, searchToggleButton).forEach(element => {
    element.ariaLive = "polite"
    element.ariaAtomic = "true"
  })
  
  searchToggleButton.addEventListener("click", ({ currentTarget: toggleButton }) => {
    const { ariaLabel, children: icons } = toggleButton

    elementsToToggle.forEach(element => {
      if (element.classList) {
        element.classList.toggle("hidden")
        element.ariaHidden = element.classList.contains("hidden")
      }
    })
    
    toggleButton.ariaLabel = ariaLabel.includes("Open")
      ? ariaLabel.replace("Open", "Close")
      : ariaLabel.replace("Close", "Open")

    Array(...icons).forEach(icon => {
      icon.toggleAttribute("hidden")
      icon.ariaHidden = icon.hasAttribute("hidden")
    })
  })

  window.addEventListener("resize", () => elementsToToggle.forEach(element => {
    if (element.ariaHidden) {
      element.ariaHidden = getComputedStyle(element).display === "none"
    }
  }))
}

export default handleResponsiveSearchbar
