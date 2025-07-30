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

  // fix issue: when user click the clear button will get an empty string
  selectedDate.innerText =
    pickedDate || `${currentYear}-${currentMonth}-${currentDate}`

  // fix issue: after user click the calendarPicker, day won't change
  getCurrentDay(chosenDay)
}

// ----- display current day

function getCurrentDay(displayDay) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayElms = document.querySelectorAll('.diffday')

  const dayIndex = displayDay !== undefined ? displayDay : currentDay

  dayElms.forEach((dayElm) => {
    dayElm.textContent = daysOfWeek[dayIndex]
  })
}

// ----- display current time by timezone

let timezone = [8, -4, 1]
let baseLocalTime = ''
let displayLocalTime = ''

function getCurrentTime(timezone) {
  const getTimeByTimezone = (offset) => {
    // make sure the display time is up-to-date
    const now = new Date()
    const utcHours = (now.getUTCHours() + offset).toString().padStart(2, '0')
    const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0')

    // fix issue: ensure that the hour is within the 24-hour format
    if (utcHours < 0) {
      utcHours += 24
    } else if (utcHours >= 24) {
      utcHours -= 24
    }

    return `${utcHours}:${utcMinutes}`
  }

  const elementIds = ['time-user', 'time-from', 'time-to']

  elementIds.forEach((id, index) => {
    document.getElementById(id).textContent = getTimeByTimezone(timezone[index])
  })

  const convertedTime = document.querySelector('.convertedtime')
  const [localTime, newYorkTime, londonTime] = timezone.map(getTimeByTimezone)

  convertedTime.textContent = `${localTime} (Taiwan) ／ ${newYorkTime} (New York) ／ ${londonTime} (London)`

  baseLocalTime = localTime
  displayLocalTime = localTime

  panelPosition(e, baseLocalTime)
}

function addMinutesToTime(timeStr, minutes) {
  const [hour, min] = timeStr.split(':').map(Number)
  const total = (hour * 60 + min + minutes + 1440) % 1440
  const newHour = Math.floor(total / 60)
    .toString()
    .padStart(2, '0')
  const newMin = (total % 60).toString().padStart(2, '0')
  return `${newHour}:${newMin}`
}

// ----- copy the converted time

const clickToCopy = document.querySelector('.time-field')

async function copyConvertedTime(e) {
  const copyBtn = document.querySelector('.copybtn')
  const copiedBtn = document.querySelector('.copiedbtn')
  const copiedSvg = document.querySelector('.copiedsvg')
  const textToCopy = document.querySelector('.convertedtime').innerText

  const showSuccess = () => {
    copyBtn.classList.add('-hidden')
    copiedBtn.classList.remove('-hidden')
    copiedSvg.classList.remove('-hidden')
  }

  const resetToDefault = () => {
    copyBtn.classList.remove('-hidden')
    copiedBtn.classList.add('-hidden')
    copiedSvg.classList.add('-hidden')
  }

  try {
    await navigator.clipboard.writeText(textToCopy)
    showSuccess()

    setTimeout(() => {
      resetToDefault()
    }, 2000)
  } catch (err) {
    console.error(err)
  }
}

// ----- handle the panel ----- //

// ----- calculate the height of the panel in the viewport
const panel = document.querySelector('.panel-container')

function panelPosition(e, time) {
  const tableBody = document.querySelector('.table-body')
  const resetBtn = document.querySelector('.resetbtn')

  // original panel position
  const eachMinPx = parseFloat((tableBody.clientHeight / 1440).toFixed(1))
  const localTimeArr = time.split(':').map(Number)
  const initialPosition = (localTimeArr[0] * 60 + localTimeArr[1]) * eachMinPx
  const step = eachMinPx * 15

  // fix issue: the panel will jump back to its initial position due to setInterval
  if (!panel.dataset.position) {
    panel.dataset.position = initialPosition
    panel.style.top = `${initialPosition}px`
  }

  // set the min & max values ​​of the panel position
  panel.dataset.position = Math.min(
    Math.max(parseFloat(panel.dataset.position), 0),
    tableBody.clientHeight - panel.clientHeight
  )


  // click arrow-buttons to adjust the panel position
  // improve：視窗會跟著按鈕移動
  // error: 時間會跟著按鈕改變

  let adjustMinutes = 0

  if (e.target.dataset.chevron === 'angle-up') {
    panel.dataset.position = parseFloat(panel.dataset.position) - step
    adjustMinutes = -15
  } else if (e.target.dataset.chevron === 'angle-down') {
    panel.dataset.position = parseFloat(panel.dataset.position) + step
    adjustMinutes = 15
  }

  if (adjustMinutes !== 0) {
    displayLocalTime = addMinutesToTime(baseLocalTime, adjustMinutes)

    resetBtn.style.visibility = 'visible'
  }

  // update the position according to data-position
  panel.style.top = `${panel.dataset.position}px`
}

function resetPanel() {
  displayLocalTime = baseLocalTime
  delete panel.dataset.position

  getCurrentTime(timezone)
  resetBtn.style.visibility = 'hidden'
}

getCurrentDate()
getCurrentDay()

setInterval(() => getCurrentTime(timezone), 1000) // improve: performance issues
dateSelector.addEventListener('click', chooseDisplayDate)
/* fix issue: the calendarPicker doesn't update immediately after selecting a date.
Use the input event instead of change. */
calendarPicker.addEventListener('input', changeCalendarPicker)
clickToCopy.addEventListener('click', copyConvertedTime)
panel.addEventListener('click', (e) => {
  panelPosition(e, displayLocalTime)
})
resetBtn.addEventListener('click', resetPanel)
