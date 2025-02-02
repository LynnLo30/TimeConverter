// ----- handle header & footer ----- //

function handleScroll() {
  const header = document.querySelector('.table-header')
  const arrowBtn = document.querySelector('.arrow-buttons')
  const footer = document.querySelector('.table-footer')

  // recalculated each time
  const positionOfArrowBtn = arrowBtn.getBoundingClientRect()

  // if user hasn't scrolled the window or arrowBtn has scrolled over the panel
  const atTop =
    window.scrollY === 0 || positionOfArrowBtn.top <= arrowBtn.clientHeight / 2
  // if user has scrolled to the bottom of the page
  const atBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight

  header.classList.toggle('-shadow', !atTop)
  footer.classList.toggle('-shadow', !atBottom)
}

window.addEventListener('scroll', handleScroll)
