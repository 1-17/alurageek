const setPageTitle = (pageTitle) => {
  if (!pageTitle) {
    throw new Error("Set Page Title: Missing title argument.")
  }
  
  const documentTitle = document.querySelector("title")
  const openGraphTitle = document.querySelector("[property='og:title']")
  const twitterTitle = document.querySelector("[property='twitter:title']")

  if (!documentTitle) {
    throw new Error("Set Page Title: Missing title element.")
  }
  
  if (!openGraphTitle) {
    throw new Error("Set Page Title: Missing Open Graph title element.")
  }

  if (!twitterTitle) {
    throw new Error("Set Page Title: Missing Twitter title element.")
  }

  pageTitle = ` | ${pageTitle}`
  documentTitle.textContent += pageTitle

  for (const element of [openGraphTitle, twitterTitle]) {
    element.content += pageTitle
  }
}

export default setPageTitle
