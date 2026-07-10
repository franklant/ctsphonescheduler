const NEW_ENTRY_FORM = $("#new-entry")

const NEW_ENTRY_NAME = $("#new-entry-name")
const SIGN_IN_BTN = $("#sign-in-btn")
const CLEAR_ERROR_BTN = $("#clear-error-btn")
const ERROR_ELEMENT = $("#error")

const SCHEDULE_TABLE = $("#schedule-table")

// TODO: figure out how to save information
// TODO: fix error where whitespace can be submitted as an entry name. Needs letter or characters.
class ElapsedTime {
    // the date object used to manipulate and show elapsed time
    _dateObject = null;

    // the counter used to store the number of seconds passed since construction
    _counter = null;

    // the id of the interval used to update the elapsed time
    _intervalId = null;

    // the name of the entry this timer belongs to
    _name = null;

    // the id of the dom element we'll use to display the elapsed time
    // _elapsedDomID = null;

    constructor(name) {
        this._dateObject = new Date()
        this._dateObject.setHours(0)
        this._dateObject.setMinutes(0)
        this._dateObject.setSeconds(0)

        this._counter = 0

        this._name = removeWhitespace(name)
        // this._elapsedDomID = domID
    }

    showTime() {
        if (this._dateObject) console.log(this._dateObject.toTimeString())
    }

    startTimer() {
        this._intervalId = setInterval(
            () => {
                // increment the counter
                this._counter += 1

                // convert 1 second to milliseconds
                let inMillis = this._counter * 1000

                // we'll only need the milliseconds to change
                this._dateObject.setHours(0)
                this._dateObject.setMinutes(0)
                this._dateObject.setSeconds(0)

                // update the date object
                this._dateObject.setMilliseconds(
                    this._dateObject.getMilliseconds() + inMillis
                )

                // trim to only show the numbers
                let dateTime = this._dateObject.toTimeString().substring(0, 9)

                let ENTRY_TIME_ELAPSED = $(`#${this._name}-timeElapsed`)

                ENTRY_TIME_ELAPSED.html(dateTime)

                // stop timer once 2 hours are reached
                if (this._dateObject.getHours() >= 2) {
                    // Grey out the table row and end the interval timer
                    ENTRY_TIME_ELAPSED.parent().css("background-color", "grey")
                    this.endTimer()
                }
            },
            1000
        )
    }

    endTimer() {
        clearInterval(this._intervalId)
    }
}


// returns the time and whether it's currently in the afternoon
function getCurrentTime() {
    let now = new Date()
    let hour = now.getHours()
    let min = now.getMinutes()
    let minString = String(min)

    if (minString.length <= 1) minString = "0" + minString

    // after noon
    if (hour >= 12) {
        if (hour > 12) hour = hour - 12

        return {
            time: `${hour}:${minString} PM`,
            date: now
        }
    }

    // midnight
    else if (hour === 0) {
        hour = hour + 12
        return {
            time: `${hour}:${minString} AM`,
            date: now
        }
    }

    // before noon
    return {
        time: `${hour}:${minString} AM`,
        date: now
    }
}


function add2HoursToTime(date) {
    // assuming the argument passed is a Date()
    const currentHour = date.getHours()
    date.setHours(currentHour + 2);     // adds 2 hours

    let hour = date.getHours()
    let min = date.getMinutes()
    let minString = String(min)

    if (minString.length <= 1) minString = "0" + minString

    // after noon
    if (hour >= 12) {
        if (hour > 12) hour = hour - 12

        return {
            time: `${hour}:${minString} PM`,
            date: date,
        }
    }

    // midnight
    else if (hour === 0) {
        hour = hour + 12
        return {
            time: `${hour}:${minString} AM`,
            date: now
        }
    }

    // before noon
    return {
        time: `${hour}:${minString} AM`,
        date: date,
    }
}

// remove the entry from the table by stopping the timer and deleting it from the table
function removeEntry(btnElement, elapsedTimerId) {
    // stop the timer
    clearInterval(elapsedTimerId)

    // <tr> -> <td> -> <button>
    $(btnElement).parent().parent().remove()
}


function tableEntry(name, timeIn, timeOut, elapsedTimer) {
    let idName = removeWhitespace(name)

    return `
        <tr>
            <td id="name">${name}</td>
            <td id="timeIn">${timeIn}</td>
            <td id="timeOut">${timeOut}</td>
            <td id="${idName}-timeElapsed">00:00:00</td>
            <td id="${idName}-btn">
                <button id="${idName}-btn" onclick="removeEntry(this, ${elapsedTimer._intervalId})">Remove</button>
            </td>
        </tr>
    `
}

// shows the dom element as well as the error message in the specified color
function showError(message, color) {
    ERROR_ELEMENT.show()
    ERROR_ELEMENT.css("color", color)
    ERROR_ELEMENT.text(message)

    // give the user the ability to remove the error
    CLEAR_ERROR_BTN.show()
}

// clear both the error and remove the hide error button
function clearError() {
    ERROR_ELEMENT.hide()
    CLEAR_ERROR_BTN.hide()
}

// remove whitespace from the name and replace it with a dash (-)
// return that new string
function removeWhitespace(name) {
    let splitName = name.split(" ")
    let reformattedName = ""

    for (let i = 0; i < splitName.length; i++) {
        if (i !== splitName.length - 1) {
            reformattedName += splitName[i] + "-"
        } else {
            reformattedName += splitName[i]
        }
    }

    return reformattedName
}

function submitNewEntry() {
    let newName = NEW_ENTRY_NAME.val().trim();
    let newTimeIn = getCurrentTime()
    let newTimeOut = add2HoursToTime(newTimeIn.date)

    const WHITE_SPACE_REGX = /^\s+/
    const SPECIAL_CHARACTER_REGX = /[^a-zA-Z0-9\s]/

    if (newName.match(WHITE_SPACE_REGX) || newName === "") {
        showError("One or more fields are empty.", "red")
        return
    }

    if (newName.match(SPECIAL_CHARACTER_REGX)) {
        showError("Name cannot contain special characters.", "red")
        return
    }

    /// CHECK FOR DUPLICATE NAME FIRST ///

    // first child is tbody regardless (sigh), next child is the actual rows
    const TABLE_ROWS = SCHEDULE_TABLE.children()
    const NUM_ENTRIES = TABLE_ROWS.length

    // start at one to skip the header/tbody element
    for (let i = 1; i < NUM_ENTRIES; i++) {
        const ENTRY_INFO = $(TABLE_ROWS[i]).children()

        // check any of the entry names match the new name to be entered
        if ($(ENTRY_INFO[0]).text() === newName) {
            showError(`${newName} has already signed in.`, "green")
            NEW_ENTRY_NAME.val("")
            return
        }

        /// LOOSER CHECK TO ALLOW SAME PERSON TO SIGN IN ONLY IF THEY ARE NOT IN A ROTATION
        // not tested...
        // check any of the entry names match the new name to be entered
        // check if the elapsed time is not equal to 2 hours
        // if ($(ENTRY_INFO[0]).text() === newName && $(ENTRY_INFO[3]).text() !== "02:00:00") {
        //     alert(`[ERROR] ${newName} is already in the current rotation.`)
        //     return
        // }
    }

    let idName = removeWhitespace(newName)
    let eT = new ElapsedTime(idName)
    eT.startTimer()

    SCHEDULE_TABLE.append(
        tableEntry(
            newName,
            newTimeIn.time,
            newTimeOut.time,
            eT
        )
    )

    // clear fields
    NEW_ENTRY_NAME.val("")
    ERROR_ELEMENT.hide()
}

// TODO: now how can we get the elapsed time to show up (uniquely) for each entry????
// we found the answer. great work man.

$(document).ready(() => {
    ERROR_ELEMENT.hide()
    CLEAR_ERROR_BTN.hide()

    // prevent refreshing the screen when pressing enter
    // just submit the entry instead
    NEW_ENTRY_FORM.submit((event) => {
        event.preventDefault()
        submitNewEntry()
    })

    SIGN_IN_BTN.on("click", () => {
        submitNewEntry()
    })

    CLEAR_ERROR_BTN.on("click", () => {
        clearError()
    })
})