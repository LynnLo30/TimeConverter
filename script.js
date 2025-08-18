// ----- handle header & footer ----- //

function getPageState({
  scrollY,
  innerHeight,
  bodyOffsetHeight,
  arrowBtnTop,
  arrowBtnHeight
}) {
  // if user hasn't scrolled the window or header isn't near the panel
  const atTop = scrollY === 0 || arrowBtnTop <= arrowBtnHeight / 2
  // if user has scrolled to the bottom of the page
  const atBottom = scrollY + innerHeight >= bodyOffsetHeight

  return {
    headerShadow: !atTop,
    footerShadow: !atBottom
  }
}

function handleScroll() {
  const header = document.querySelector('.table-header')
  const arrowBtn = document.querySelector('.arrow-buttons')
  const footer = document.querySelector('.table-footer')

  // recalculated each time
  const arrowBtnRect = arrowBtn.getBoundingClientRect()

  const state = getPageState({
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    bodyOffsetHeight: document.body.offsetHeight,
    arrowBtnTop: arrowBtnRect.top,
    arrowBtnHeight: arrowBtn.clientHeight
  })

  header.classList.toggle('-shadow', state.headerShadow)
  footer.classList.toggle('-shadow', state.footerShadow)
}

// ----- handle date selector ----- //

const dom = {
  selectedDate: document.getElementById('selected'),
  dateSelector: document.querySelector('.date-selector'),
  calendarPicker: document.getElementById('calendar-picker'),
  dayElms: document.querySelectorAll('.diffday'),
  convertedTimeSum: document.querySelector('.convertedtime'),
  clickToCopy: document.querySelector('.time-field'),
  copyBtn: document.querySelector('.copybtn'),
  copiedBtn: document.querySelector('.copiedbtn'),
  copiedSvg: document.querySelector('.copiedsvg'),
  panel: document.querySelector('.panel-container'),
  currentText: document.getElementById('current'),
  tableBody: document.querySelector('.table-body'),
  chevronButtons: document.querySelectorAll('[data-chevron]'),
  resetBtn: document.querySelector('.resetbtn')
}

function getDateObj(dateObj = new Date()) {
  return {
    year: dateObj.getFullYear(),
    month: (dateObj.getMonth() + 1).toString().padStart(2, '0'),
    date: dateObj.getDate().toString().padStart(2, '0'),
    day: dateObj.getDay()
  }
}

function formatDate(dateObj) {
  return `${dateObj.year}-${dateObj.month}-${dateObj.date}`
}

function formatTime({hours, minutes}) {
  const hh = hours.toString().padStart(2, '0')
  const mm = minutes.toString().padStart(2, '0')

  return `${hh}:${mm}`
}

// ----- display current date

function displayCurrentDate(dateObj = getDateObj()) {
  dom.selectedDate.textContent = formatDate(dateObj)
}

// ----- display current day

function getDayLabel(dayIndex) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return daysOfWeek[dayIndex]
}

function displayCurrentDay(dayIndex = getDateObj().day) {
  dom.dayElms.forEach((dayElm) => {
    dayElm.textContent = getDayLabel(dayIndex)
  })
}

// ----- click button to choose the date

function chooseDisplayDateByBtn(e) {
  let [year, month, date] = dom.selectedDate.textContent.split('-').map(Number)
  let offset = 0

  switch (e.target.dataset.chevron) {
    case 'forward':
      offset = 1
      break
    case 'forward-double':
      offset = 7
      break
    case 'backward':
      offset = -1
      break
    case 'backward-double':
      offset = -7
      break
  }

  // month - 1: to match the date object's month index
  const chosenDateObj = getDateObj(new Date(year, month - 1, date + offset))

  displayCurrentDate(chosenDateObj)
  displayCurrentDay(chosenDateObj.day)
}

function changeByCalendarPicker() {
  const pickedDate = this.value

  // fix issue: when user click the clear button will get an empty string
  const pickedDateObj = pickedDate
    ? getDateObj(new Date(pickedDate))
    : getDateObj()

  displayCurrentDate(pickedDateObj)
  displayCurrentDay(pickedDateObj.day)
}

// ----- display current time by timezone

let modifiedTime = null

function getUtcTime(offset) {
  const utcDateObj = new Date()
  // fix issue: ensure that the hour is within th24-hour format
  const hours = (utcDateObj.getUTCHours() + offset + 24) % 24
  const minutes = utcDateObj.getUTCMinutes()

  return {hours, minutes}
}

function displayCurrentTime(timeObj = getUtcTime(8)) {
  const panelElementIds = ['time-user', 'time-from', 'time-to']
  const regions = ['Taiwan', 'New York', 'London']
  const timeDiff = [0, -4, 1]

  const baseMinutes = timeObj.hours * 60 + timeObj.minutes
  const timeObjAry = timeDiff.map((offset) => {
    const totalMinutes = (baseMinutes + offset * 60 + 1440) % 1440
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    }
  })

  const convertedTimeAry = timeObjAry.map(formatTime)

  panelElementIds.forEach((id, index) => {
    document.getElementById(id).textContent = convertedTimeAry[index]
  })

  const summary = convertedTimeAry
    .map((time, index) => `${time} (${regions[index]})`)
    .join(' ／ ')

  dom.convertedTimeSum.textContent = summary

  displayPanelPosition(timeObj)
}

// ----- handle time panel ----- //

// ----- calculate the height of the panel in the viewport

const eachMinPx = parseFloat((dom.tableBody.clientHeight / 1440).toFixed(1))

function getPanelPosition({hours, minutes}) {
  return (hours * 60 + minutes) * eachMinPx
}

// ----- adjust panel position by time

function displayPanelPosition(timeObj) {
  let position = Math.round(getPanelPosition(timeObj) * 10) / 10

  // set the min & max values ​​of the panel position
  position = Math.min(
    Math.max(position, 0),
    dom.tableBody.clientHeight - dom.panel.clientHeight
  )

  dom.panel.dataset.position = position
  dom.panel.style.top = `${position}px`
}

// ----- click arrow-buttons to adjust the panel position and time

function handleTimePanel(e) {
  const step = 15
  const direction = e.target.dataset.chevron === 'angle-up' ? -1 : 1
  const baseTime = modifiedTime || getUtcTime(8) // currentTime
  const baseTotalMin = baseTime.hours * 60 + baseTime.minutes
  const checkTotalMin = baseTotalMin + direction * step

  if (checkTotalMin < 0 || checkTotalMin >= 1440) return

  modifiedTime = {
    hours: Math.floor(checkTotalMin / 60),
    minutes: checkTotalMin % 60
  }

  displayCurrentTime(modifiedTime)
  dom.resetBtn.style.visibility = 'visible'
  dom.currentText.style.visibility = 'hidden'

  const nowTime = getUtcTime(8)
  if (
    modifiedTime.hours === nowTime.hours &&
    modifiedTime.minutes === nowTime.minutes
  ) {
    resetPanel()
  }
}

// ----- reset the time on the panel by button

function resetPanel() {
  modifiedTime = null
  displayCurrentTime()

  delete dom.panel.dataset.position
  dom.resetBtn.style.visibility = 'hidden'
  dom.currentText.style.visibility = 'visible'
}

// ----- copy the converted time summary

async function copyConvertedTime(e) {
  const showSuccess = () => {
    dom.copyBtn.classList.add('-hidden')
    dom.copiedBtn.classList.remove('-hidden')
    dom.copiedSvg.classList.remove('-hidden')
  }

  const resetToDefault = () => {
    dom.copyBtn.classList.remove('-hidden')
    dom.copiedBtn.classList.add('-hidden')
    dom.copiedSvg.classList.add('-hidden')
  }

  try {
    await navigator.clipboard.writeText(dom.convertedTimeSum.textContent)
    showSuccess()

    setTimeout(() => {
      resetToDefault()
    }, 2000)
  } catch (err) {
    console.error(err)
  }
}

window.addEventListener('scroll', handleScroll)

displayCurrentDate()
displayCurrentDay()
setInterval(() => {
  if (!modifiedTime) {
    displayCurrentTime()
  }
}, 1000)

dom.dateSelector.addEventListener('click', chooseDisplayDateByBtn)
/* the calendarPicker doesn't update immediately after selecting a date.
Use the input event instead of change. */
dom.calendarPicker.addEventListener('input', changeByCalendarPicker)
dom.clickToCopy.addEventListener('click', copyConvertedTime)
dom.chevronButtons.forEach((btn) => {
  btn.addEventListener('click', handleTimePanel)
})
dom.resetBtn.addEventListener('click', resetPanel)
