// Creation Date: 07/31/2023
// Created By: Sajith Aravindan


// Global Variables.
var today = dayjs();
var strCurrentHour = today.format('h');
var strCurrentAMPM = today.format('A');
var dtEventDate = dayjs(today).format('MMDYYYY')
var intCurrentHour = dayjs().hour();
var divContainer = $('#container');
var divSaveStatus = $('#idSaveStatus');
var strPastCss = "past";
var strPresentCss = "present";
var strFutureCss = "future";

const intFromTime = 9;
const intToTime = 5;



function init() {
  var divDisplayCurrentDay = $('#currentDay');
  var strDisplayedCurrDate = today.format('dddd MMMM, D');
  divDisplayCurrentDay.text(strDisplayedCurrDate);
  divSaveStatus.hide();
  //Event Handler for Button Click
  $('#container').on('click', ':button', fnSaveEvent);
  //start calender
  startCal();
}

function startCal() {  
  var objTimeObject = { //Time object that holds time to displar & Required Hours    
    HourstoDisplay: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
    TimeHours: [9, 10, 11, 12, 13, 14, 15, 16, 17] // Correct answers index in the anwers object
  }

  //alert(objTimeObject.HourstoDisplay.length)
  for (var i = 0; i < objTimeObject.HourstoDisplay.length; i++) {
    let strDivClass = '';
    let strDivId = 'hour-';
    let strTxtAreaId = 't-';
    let strTxtAreaContent = '';
    let strTxtAreaStatus = "enabled";

    if (strCurrentAMPM == "AM" && intCurrentHour < intFromTime)
      strDivClass = strFutureCss;
    else
      strDivClass = fnAssignClass(objTimeObject.TimeHours[i]);

    if (strDivClass == strPastCss) strTxtAreaStatus = "disabled";

    strDivId = strDivId + objTimeObject.HourstoDisplay[i];
    strTxtAreaId = strTxtAreaId + objTimeObject.HourstoDisplay[i];

    var tempArr = JSON.parse(localStorage.getItem('calDayEvents')); //check if theres a event at this timeslot on this day

    if (tempArr != null) { //as long as its not empty try eventDate: dtEventDate
      for (let index = 0; index < tempArr.length; index++) { //loop over all saved calDayEvents
        if ((objTimeObject.HourstoDisplay[i] == tempArr[index].eventTime) && (dtEventDate == tempArr[index].eventDate)) {
          strTxtAreaContent = tempArr[index].eventDescription;
          strTxtAreaId = 'saved-item';
        }
      }
    }
    //create the Time block Div
    var elm = '<div ' +
      'class="row time-block ' + strDivClass + '" ' +
      'id="' + strDivId + '"> <div class="col-2 col-md-1 hour text-center py-3" id="' + objTimeObject.HourstoDisplay[i] + '">' + objTimeObject.HourstoDisplay[i] + '</div> ' +
      '<textarea ' + strTxtAreaStatus + '  class="col-8 col-md-10 description" rows="3" id="' + strTxtAreaId + ' ">' + strTxtAreaContent + ' </textarea> ' +
      '<button class="btn saveBtn col-2 col-md-1" aria-label="save" id="' + objTimeObject.HourstoDisplay[i] + '"><i class="fas fa-save" aria-hidden="true"></i></button>' +
      '</div>';
    $(elm).appendTo(divContainer);
  }
};

//Function to assign relevant classes for the Divs
function fnAssignClass(intDivTimeSlot) {
  let strDivClass = '';
  if (intCurrentHour == intDivTimeSlot) strDivClass = strPresentCss;
  else if (intDivTimeSlot < intCurrentHour) strDivClass = strPastCss;
  else strDivClass = strFutureCss;
  return strDivClass;
}

//Function to Add Event to Local Storage
function fnSaveEvent(event) {
  var tempArr = []; //initialize array
  var strTxtContent = this.parentElement.children[1].value;
  if (localStorage.getItem('calDayEvents') === null) { //if memory is empty make new array
    //make a new array because we dont have one
    if (strTxtContent != '') {
      tempArr = [{ //array of objects
        eventDate: dtEventDate, //day of the year in 365 format so dont have to look at months or month days
        eventTime: this.id, //set as 9am or 5pm format
        eventDescription: strTxtContent, //whatever text is in the textbox
      }];
    }
  } else {
    //trying to add to current memeory
    tempArr = JSON.parse(localStorage.getItem('calDayEvents')); //fill array with exsisting memory
    if (this.parentElement.children[1].id == 'saved-item') { //if item is tagged as already having data stored delete previous
      for (let index = 0; index < tempArr.length; index++) { //go find the data that was already stored in this timeslot
        if ((tempArr[index].eventDate === dtEventDate) && (tempArr[index].eventTime === this.id)) {
          tempArrSliceFront = tempArr.slice(0, index);
          tempArrSliceBack = tempArr.slice(index + 1, tempArr.length);
          tempArr = []; //set array back to empty
          tempArr = tempArr.concat(tempArrSliceFront); //everything before the current index
          tempArr = tempArr.concat(tempArrSliceBack); //everything after the current index
        }
      }
    }
    tempObject = { //temp object to build out the new data to add to the array
      eventDate: dtEventDate, //day of the year in 365 format so dont have to look at months or month days
      eventTime: this.id, //set as 9am or 5pm format
      eventDescription: this.parentElement.children[1].value, //whatever text is in the textbox
    }
    tempArr.push(tempObject); //push new data into the array to be stored with other stuff
  }
  this.parentElement.children[1].id = 'saved-item'; //tag saved descriptions so we remember to erase previous data if overwritten
  localStorage.setItem('calDayEvents', JSON.stringify(tempArr)) //  
  divSaveStatus.show(); //Status
}

init();
