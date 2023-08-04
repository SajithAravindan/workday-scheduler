// Creation Date: 07/31/2023
// Created By: Sajith Aravindan


// Global Variables.
var today = dayjs();

var strCurrentAMPM = today.format('A');//Returns AM / PM
var dtEventDate = dayjs(today).format('MMDYYYY')//Date Stamp to use in local Storage
var intCurrentHour = dayjs().hour();// Current Hour
var divContainer = $('#container');
var divSaveStatus = $('#idSaveStatus');
var strPastCss = "past"; //Css for past events time slot
var strPresentCss = "present";//Css for present events time slot
var strFutureCss = "future";//Css for future events time slot

const intFromTime = 15;//start Time
const intToTime = 17;//End Time

//Function on Startup of Application
function init() {
  var divDisplayCurrentDay = $('#currentDay');//Place holder to display Current Day
  var strDisplayedCurrDate = today.format('dddd MMMM, D');// Current Date
  divDisplayCurrentDay.text(strDisplayedCurrDate);
  //Event Handler for Button Click
  $('#container').on('click', ':button', fnSaveEvent);
  //start calender
  startCal();
}

//Function to create the Block to create the Event Mgmt Section
function startCal() {
  divSaveStatus.hide();
  var objTimeObject = { //Time object that holds time to display & Required Hours    
    HourstoDisplay: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
    TimeHours: [9, 10, 11, 12, 13, 14, 15, 16, 17] // Hours - 24 Hour Format    
  }
  //Loop through the Time Object
  for (var i = 0; i < objTimeObject.HourstoDisplay.length; i++) {
    //Local Variables
    let strDivClass = '';
    let strDivId = 'hour-';
    let strTxtAreaId = 't-';
    let strTxtAreaContent = '';

    if (strCurrentAMPM == "AM" && intCurrentHour < intFromTime)//Midnight to From Time (9am)
      strDivClass = strFutureCss;
    else
      strDivClass = fnAssignClass(objTimeObject.TimeHours[i]);//Calls the function to assign Class base on time

    strDivId = strDivId + objTimeObject.HourstoDisplay[i];
    strTxtAreaId = strTxtAreaId + objTimeObject.HourstoDisplay[i];

    var arrEventLocalStorage = JSON.parse(localStorage.getItem('calDayEvents')); //check if theres a event at this timeslot on this day

    if (arrEventLocalStorage != null) { //Not empty
      for (let index = 0; index < arrEventLocalStorage.length; index++) { //loop over all saved calDayEvents
        if ((objTimeObject.HourstoDisplay[i] == arrEventLocalStorage[index].eventTime) && (dtEventDate == arrEventLocalStorage[index].eventDate)) {
          strTxtAreaContent = arrEventLocalStorage[index].eventDescription;
          strTxtAreaId = 'existing-data';//Tag as existing data
        }
      }
    }
    //Create the container Div for the Event Block
    var divTimeBlock = document.createElement('div');
    divTimeBlock.setAttribute('class', 'row time-block ' + strDivClass + '');
    divTimeBlock.setAttribute('id', '' + strDivId + '');
    //Create Div displaying the Hour
    var divHourBlock = document.createElement('div');
    divHourBlock.setAttribute('class', 'col-2 col-md-1 hour text-center py-3');
    divHourBlock.textContent = objTimeObject.HourstoDisplay[i];
    divHourBlock.setAttribute('id', '' + objTimeObject.HourstoDisplay[i] + '');
    //Create the Input element to add event - Textarea
    var txtEventDesc = document.createElement('textarea');
    txtEventDesc.setAttribute('class', 'col-8 col-md-10 description');
    txtEventDesc.setAttribute('rows', '2');
    txtEventDesc.setAttribute('id', '' + strTxtAreaId + '');
    if (strDivClass == strPastCss) txtEventDesc.setAttribute('disabled', 'disabled');
    txtEventDesc.textContent = strTxtAreaContent;
    //Create the Save Event button
    var btnSaveEvent = document.createElement('button');
    btnSaveEvent.setAttribute('class', 'btn saveBtn col-2 col-md-1');
    btnSaveEvent.setAttribute('aria-label', 'save');
    btnSaveEvent.setAttribute('id', '' + objTimeObject.HourstoDisplay[i] + '');
    //Create the save icon
    var imgSave = document.createElement('i');
    imgSave.setAttribute('class', 'fas fa-save');
    imgSave.setAttribute('aria-hidden', 'true');
    //Add the icon to the button
    btnSaveEvent.append(imgSave);
    //Add all items to the container Div
    divTimeBlock.append(divHourBlock);
    divTimeBlock.append(txtEventDesc);
    divTimeBlock.append(btnSaveEvent);
    //append rows onto the container
    divContainer.append(divTimeBlock); 
  }
};

//Function to assign relevant classes for the Divs
function fnAssignClass(intDivTimeSlot) {
  let strDivClass = '';
  if (intCurrentHour == intDivTimeSlot) strDivClass = strPresentCss;//current Hour = Hour of the Slot
  else if (intDivTimeSlot < intCurrentHour) strDivClass = strPastCss;
  else strDivClass = strFutureCss;
  return strDivClass;
}

//Function to Add Event to Local Storage
function fnSaveEvent(event) {
  var arrEventData = []; //initialize array
  var strTxtContent = this.parentElement.children[1].value; //get Value from Textarea
  if (localStorage.getItem('calDayEvents') === null) { //if local storage is null
    //make a new array 
    if (strTxtContent != '') {
        arrEventData = [{ //array of objects
        eventDate: dtEventDate, //current date
        eventTime: this.id, //Current time as same as the Id of the button
        eventDescription: strTxtContent, //content from the textbox
      }];
    }
  } else {
    //if local storage is not null
    arrEventData = JSON.parse(localStorage.getItem('calDayEvents')); //fill array with exsisting data
    if (this.parentElement.children[1].id == 'existing-data') { //if tagged as data stored - delete previous
      for (let index = 0; index < arrEventData.length; index++) { //find the stored data for this timeslot
        if ((arrEventData[index].eventDate === dtEventDate) && (arrEventData[index].eventTime === this.id)) {
          arrEventDataSliceFront = arrEventData.slice(0, index);
          arrEventDataSliceBack = arrEventData.slice(index + 1, arrEventData.length);
          arrEventData = []; //set array back to empty
          arrEventData = arrEventData.concat(arrEventDataSliceFront); //everything before the current index
          arrEventData = arrEventData.concat(arrEventDataSliceBack); //everything after the current index
        }
      }
    }
    var arrNewEventData = { //object for the new data to add to the array
      eventDate: dtEventDate, //current date
      eventTime: this.id, //Current time as same as the Id of the button
      eventDescription: strTxtContent, //content from the textbox
    }
    arrEventData.push(arrNewEventData); //push new data into the array
  }
  divSaveStatus.show(); //Status  
  this.parentElement.children[1].id = 'existing-data'; //tagged as data stored
  localStorage.setItem('calDayEvents', JSON.stringify(arrEventData)) //  store locally 
}

init();
