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

// ----- handle time selector ----- //

const date = new Date()
const currentYear = date.getFullYear()
const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0')
const currentDate = date.getDate().toString().padStart(2, '0')
const currentDay = date.getDay()

// ----- display current date

const selectedDate = document.getElementById('selected')

function getCurrentDate() {
  selectedDate.innerText = `${currentYear}-${currentMonth}-${currentDate}`
}

// ----- click button to choose the date

const dateSelector = document.querySelector('.date-selector')

function chooseDisplayDate(e) {
  let [year, month, date] = selectedDate.innerText.split('-').map(Number)

  if (e.target.dataset.chevron === 'forward') {
    date += 1
  } else if (e.target.dataset.chevron === 'forward-double') {
    date += 7
  } else if (e.target.dataset.chevron === 'backward') {
    date -= 1
  } else if (e.target.dataset.chevron === 'backward-double') {
    date -= 7
  }

  // month - 1: to match the date object's month index
  const newDate = new Date(year, month - 1, date)
  const chosenYear = newDate.getFullYear()
  const chosenMonth = (newDate.getMonth() + 1).toString().padStart(2, '0')
  const chosenDate = newDate.getDate().toString().padStart(2, '0')
  const chosenDay = newDate.getDay()

  selectedDate.innerText = `${chosenYear}-${chosenMonth}-${chosenDate}`

  // when the date changes, day will also change
  getCurrentDay(chosenDay)
}

const calendarPicker = document.getElementById('calendar-picker')

function changeCalendarPicker() {
  const pickedDate = this.value

  // fix issue when user click the clear button will get an empty string
  selectedDate.innerText =
    pickedDate || `${currentYear}-${currentMonth}-${currentDate}`
}

getCurrentDate()
dateSelector.addEventListener('click', chooseDisplayDate)
calendarPicker.addEventListener('change', changeCalendarPicker)
