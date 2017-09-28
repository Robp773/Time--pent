'use strict';
let globalVars = {
  // total mins in a day
  dailyBudget: 1440,
  // returned data from GET requests to /homeRecorded
  recordedData: null,
  // total cost of all recorded item
  recordedCost: 0,
  // returned data from GET requests to /homePlanned
  plannedData: null,
  // total cost of all planend items
  plannedCost: 0,
  // amount of time left in the day that is not taken up by planned activites
  futureFreeTime: null,
  // mins passed as of current time
  totalMinsPassed: 0,
  // mins that have passed that were not recorded
  unusedPastTime: 0
};
// tracks expenses with time passed and fills out totals column
function calculateTotals() {
  globalVars.recordedData.forEach(function(item) {
    globalVars.recordedCost = globalVars.recordedCost + item.cost;
  });
  globalVars.plannedData.forEach(function(item) {
    globalVars.plannedCost = globalVars.plannedCost + item.cost;
  });
  let date = new Date();
  // amount of hours passed up until now
  let passedHours = date.getHours();
  // remainder of minutes this hour - example 6:40 = 40 mins
  let passedMinsThisHour = date.getMinutes();
  // hours and mins added together for total mins
  let totalMinsPassed = (passedHours * 60) + passedMinsThisHour;
  // globalVars.totalMinsPassed + totalMinsPassed = globalVars.totalMinsPassed;
  globalVars.totalMinsPassed = globalVars.totalMinsPassed + totalMinsPassed;
  // time that was not recorded or planned for up until now
  let pastFreeTime = totalMinsPassed - globalVars.recordedCost;
  globalVars.unusedPastTime = pastFreeTime;
  // Unspent time in the future based on how much time is left in the day and planned and recorded expenses
  let futureFreeTime = 1440 - totalMinsPassed;
  let todaysUnusedMins = futureFreeTime - globalVars.plannedCost;
  buildChart(pastFreeTime, todaysUnusedMins);
  $('.unUsedPlanned').html(`Unplanned Minutes: ${todaysUnusedMins}`);
  $('.unRecordedMins').html(`Unrecorded Minutes: ${pastFreeTime}`);
  $('.totalList').empty();
  $('.totalList').append(`
   <tr class="total">
   <td data-balloon="Total number of minutes in a day" data-balloon-pos="left">Daily Budget</td>
   <td>1440 mins</td>
   </tr>
   <tr class="recordedTotal">
   <td data-balloon="Current recorded mins from 'Recorded Expenses'" data-balloon-pos="left">Recorded Expenses</td>
   <td>-${globalVars.recordedCost} mins</td>
   </tr>
   <tr class="unspentTotal">
   <td data-balloon="Number of minutes passed that were not recorded" data-balloon-pos="left">Unspent Passed Time</td>
   <td>-${pastFreeTime} mins</td>
   </tr>
   <tr class="total">
   <td data-balloon="Minutes left in the day" data-balloon-pos="left"><b>Current Budget</b></td>
   <td>${futureFreeTime} mins</td>
   </tr>
   <tr class="plannedTotal">
   <td data-balloon="Minutes used in future plans" data-balloon-pos="left">Planned Expenses</td>
   <td>-${globalVars.plannedCost} mins</td>
   </tr>
   <tr class="total projected">
    <td data-balloon="Number of minutes left after accounting for future plans" data-balloon-pos="left">Projected Budget</td>
    <td>${todaysUnusedMins} mins</td>
   </tr>
  `);
  // if more minutes are spent than available
  if (todaysUnusedMins < 0) {
    $('.projected').addClass('red');
  }
}
// figure out the current date and time
function calcTimeDate() {
  let currentTime = new Date(),
    hours = currentTime.getHours(),
    minutes = currentTime.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  let suffix = 'AM';
  if (hours >= 12) {
    suffix = 'PM';
    hours = hours - 12;
  }
  if (hours === 0) {
    hours = 12;
  }
  let finalTime = `${hours}:${minutes} ${suffix}`;
  $('.totalsTime').html(`As of ${finalTime}`);
  $('.topNavTime').html(finalTime);
  let dayArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let monthName = monthNames[currentTime.getMonth()];
  let dayName = dayArray[currentTime.getDay()];
  let numberDay = currentTime.getDate();
  if (numberDay === 1 || 21 || 31) {
    numberDay = `${numberDay}th`;
  } else if (numberDay === 2 || 22) {
    numberDay = `${numberDay}nd`;
  } else if (numberDay === 3 || 23) {
    numberDay === `${numberDay}rd`;
  } else {
    numberDay = `${numberDay}th`;
  }
  let year = currentTime.getFullYear();
  $('.topNavDate').html(`${dayName} ${monthName} ${numberDay}, ${year}`);
}
function loadRecorded() {
  $.ajax({
    url: '/homeRecorded',
    contentType: 'application/json',
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    success: function(data) {
      // needed for calculateTotals function, cannot pass as argument 
      // because calculate totals is also called by loadPlanned()
      globalVars.recordedData = data;
      loadPlanned();
      populateRecorded(data);
    }
  });
}
function populateRecorded(data) {
  $('.recordedList').empty();
  $('.recordedList').append(` <tr>
    <th data-balloon="Name of Record" data-balloon-pos="up">Name</th> 
    <th data-balloon="Example- 'Health' or 'Studying'" data-balloon-pos="up">Category</th> 
    <th data-balloon="Was this task productive or unproductive?" data-balloon-pos="up">Type</th> 
    <th data-balloon="Number of minutes used for task" data-balloon-pos="up">Cost</th> 
</tr>`);
  data.forEach(function(item) {
    $('.recordedList').append(`
      <tr class="listedRecord">
      <td class="res recordedName">${item.name}</td>
      <td class="res recordedCategory">${item.category}</td>
      <td class="res recordedProductive">${item.productive}</td>
      <td class="res recordedCost">${item.cost} mins</td>
      </tr>
      `);
  });
}

function loadPlanned() {
  $.ajax({
    url: '/homePlanned',
    contentType: 'application/json',
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    success: function(data) {
      globalVars.plannedData = data;
      populatePlanned(data);
      calculateTotals();
    }
  });
}

function populatePlanned(data) {
  $('.plannedList').empty();
  $('.plannedList').append(`
        <tr>
        <th data-balloon="Name of planned expense" data-balloon-pos="up">Name</th> 
        <th data-balloon="Example- 'Health' or 'Studying'" data-balloon-pos="up">Category</th> 
        <th data-balloon="Will this task be productive or unproductive?" data-balloon-pos="up">Type</th> 
        <th data-balloon="Estimate of minutes needed" data-balloon-pos="top">Cost</th> 
  </tr>`);
  data.forEach(function(item) {
    $('.plannedList').append(`
      <tr class="listedPlanned">
            <td class="res plannedName">${item.name}</td>
            <td class="res plannedCategory">${item.category}</td>
            <td class="res plannedProductive">${item.productive}</td>
            <td class="res plannedCost">${item.cost} mins</td>
      </tr>`);
  });
}
// builds 3 charts from chart.js
function buildChart(pastFreeTime, todaysUnusedMins) {
  Chart.defaults.global.defaultFontSize = 13;
  Chart.defaults.global.defaultFontColor = 'black';
  Chart.defaults.global.layout.padding = 0;
  Chart.defaults.global.layout.margin = 0;
  const ctxTotal = $('#totalChart');
  ctxTotal.height = 250;
  const totalChart = new Chart(ctxTotal, {
    type: 'pie',
    data: {
      labels: ['Recorded', 'Planned', 'Past Unused', 'Future Unused'],
      datasets: [{
        label: 'Time Spent',
        data: [globalVars.recordedCost, globalVars.plannedCost, pastFreeTime, todaysUnusedMins],
        backgroundColor: ['#E45641', '#44B3C2', '#ffb84d', '#42f465'],
        borderColor: ['#FFFFF', '#FFFFF', '#FFFFF', '#FFFFF', '#FFFFF', ],
        borderWidth: .5
      }]
    },
    options: {
      title: {
        fontSize: 25,
      }
    }
  });
  const ctxRecord = $('#recordChart');
  const recordChart = new Chart(ctxRecord, {
    type: 'doughnut',
    data: {
      labels: ['Recorded', 'Unused'],
      datasets: [{
        label: 'Time Spent',
        data: [globalVars.recordedCost, pastFreeTime],
        backgroundColor: ['#E45641', '#ffb84d', ],
        borderColor: ['#FFFFF', '#FFFFF', '#FFFFF'],
        borderWidth: .5
      }]
    },
  });
  const ctxPlanned = $('#plannedChart');
  const plannedChart = new Chart(ctxPlanned, {
    type: 'doughnut',
    data: {
      labels: ['Future Unused', 'Planned'],
      datasets: [{
        label: 'Time Spent',
        data: [todaysUnusedMins, globalVars.plannedCost],
        backgroundColor: ['#42f465', '#44B3C2', ],
        borderColor: ['#FFFFF', '#FFFFF', ],
        borderWidth: .5
      }]
    },
  });
}
// submit button from submit recorded modal
$('.submitRecorded').click(function(event) {
  event.preventDefault();
  let name = $('.name').val();
  let category = $('.category').val();
  let productive = $('.productive').val();
  let cost = $('.cost').val();
  if (!(cost > globalVars.unusedPastTime)) {
    resetGlobal();
    $.ajax({
      url: '/homeRecorded',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
        name: name,
        cost: cost,
        productive: productive,
        category: category
      }),
      success: function() {
        loadRecorded();
      }
    });
  } 
  // prevent user from recording more minutes than have actually passed at that point. 
  else {
    alert(`You tried to spend ${cost} minutes but only have ${globalVars.unusedPastTime} minutes to spend`);
  }
});
// submit button from submit planned modal
$('.submitPlanned').click(function(event) {
  event.preventDefault();
  let name = $('.name').val();
  let category = $('.category').val();
  let productive = $('.productive').val();
  let cost = $('.cost').val();
  let data = {
    name: name,
    cost: cost,
    productive: productive,
    category: category
  };
  // prevent user from planning more time than is left in the day.
  if (!(globalVars.unusedPastTime < cost)) {
    resetGlobal();
    addPlanned(data);
  } else {
    alert('You tried to spend more mins than have passed so far today');
  }
});

function addRecorded(data) {
  $.ajax({
    url: '/homeRecorded',
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function() {
      loadRecorded();
    }
  });
}

function addPlanned(data) {
  $.ajax({
    url: '/homePlanned',
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function() {
      loadRecorded();
    }
  });
}
// on click listener for recorded table
// brings up modal with that table elements data
$('.recordedList').on('click', '.listedRecord', function() {
  $('.form, .formBackground, .deleteRecorded, .updateRecorded').removeClass('hidden');
  $('.submitRecorded, .submitPlanned').addClass('hidden');
  $('.form ').addClass('recordBG');
  $('.legend').html('Edit or Delete');
  let name = $(this).closest('tr').find('.recordedName').text();
  let cost = $(this).closest('tr').find('.recordedCost').text();
  let numCost = cost.match(/\d+/);
  let actualCost = numCost[0];
  let productive = $(this).closest('tr').find('.recordedProductive').text();
  let category = $(this).closest('tr').find('.recordedCategory').text();
  $('.form input[name=name]').val(`${name}`);
  $('.form input[name=cost]').val(`${actualCost}`);
  $('.form input[name=category]').val(`${category}`);
  $('.form select[name=productive]').val(`${productive}`);
  let data = {
    name: name,
    cost: actualCost,
    productive: productive,
    category: category
  };
  // deletes this table element
  $('.deleteRecorded').click(function(event) {
    event.preventDefault();
    deleteRecord(data);
  });
  // update button clicked
  $('.updateRecorded').on('click', function(event) {
    event.preventDefault();
    let updateData = {};
    // current values of the inputs to account for changes made
    let newName = $('.form input[name=name]').val();
    let newCost = $('.form input[name=cost]').val().match(/\d+/)[0];
    let newCategory = $('.form input[name=category]').val();
    let newProductive = $('.form select[name=productive]').val();
    
    let newData = {
      name: newName,
      cost: newCost,
      productive: newProductive,
      category: newCategory
    };
    // compares new data to old data to find changes for PUT request
    $.each(newData, function(item) {
      if (newData[item] !== data[item]) {
        updateData[item] = newData[item];
      }
    });
    // object sent for PUT request
    let putData = {
      // sets the new document values in server
      updated: updateData,
      // finds the old document
      old: data
    };
    updateRecorded(putData);
  });
});

function deleteRecord(data) {
  $.ajax({
    url: '/homeRecorded',
    contentType: 'application/json',
    type: 'DELETE',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function() {
    }
  });
}

function updateRecorded(updateData) {
  $.ajax({
    url: '/homeRecorded',
    contentType: 'application/json',
    type: 'PUT',
    dataType: 'json',
    data: JSON.stringify(updateData),
    success: function() {
      console.log('success function ran');
    }
  });
}
// on click listener for planned column table
$('.plannedList').on('click', '.listedPlanned', function() {
  //  opens up modal for edit and delete
  $('.form, .formBackground, .deletePlanned, .updatePlanned, .addPlannedRecord').removeClass('hidden');
  $('.submitRecorded, .submitPlanned').addClass('hidden');
  $('.form ').addClass('plannedBG');
  $('.legend').html('Edit, Delete, or Mark Completed');
  // getting the table data text values from the tr that was clicked on.
  let name = $(this).closest('tr').find('.plannedName').text();
  let cost = $(this).closest('tr').find('.plannedCost').text();
  let numCost = cost.match(/\d+/);
  let actualCost = numCost[0];
  let productive = $(this).closest('tr').find('.plannedProductive').text();
  let category = $(this).closest('tr').find('.plannedCategory').text();
  $('.form input[name=name]').val(`${name}`);
  $('.form input[name=cost]').val(`${cost}`);
  $('.form input[name=category]').val(`${category}`);
  $('.form select[name=productive]').val(`${productive}`);
  let data = {
    name: name,
    cost: actualCost,
    productive: productive,
    category: category
  };
  $('.deletePlanned').click(function(event) {
    event.preventDefault();
    deletePlanned(data);
  });
  $('.updatePlanned').on('click', function(event) {
    event.preventDefault();
    let updateData = {};
    // current values of the inputs to account for changes made
    let newName = $('.form input[name=name]').val();
    let newCost = $('.form input[name=cost]').val().match(/\d+/)[0];
    let newCategory = $('.form input[name=category]').val();
    let newProductive = $('.form select[name=productive]').val();
    let newData = {
      name: newName,
      cost: newCost,
      productive: newProductive,
      category: newCategory
    };
    $.each(newData, function(item) {
      if (newData[item] !== data[item]) {
        updateData[item] = newData[item];
      }
    });
    let putData = {
      updated: updateData,
      old: data
    };
    updatePlanned(putData);
  });
  $('.addPlannedRecord').click(function(event) {
    event.preventDefault();
    let newName = $('.form input[name=name]').val();
    let newCost = $('.form input[name=cost]').val().match(/\d+/)[0];
    let newCategory = $('.form input[name=category]').val();
    let newProductive = $('.form select[name=productive]').val();
    let dataForRecord = {
      name: newName,
      cost: newCost,
      productive: newProductive,
      category: newCategory
    };
    deletePlanned(data);
    addRecorded(dataForRecord);
  });
});

function deletePlanned(data) {
  $.ajax({
    url: '/homePlanned',
    contentType: 'application/json',
    type: 'DELETE',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function() {
      console.log('success function ran');
    }
  });
}

function updatePlanned(updateData) {
  $.ajax({
    url: '/homePlanned',
    contentType: 'application/json',
    type: 'PUT',
    dataType: 'json',
    data: JSON.stringify(updateData),
    success: function() {
      console.log('success function ran');
    }
  });
}

function resetGlobal() {
  globalVars = {
    dailyBudget: 1440,
    recordedData: null,
    recordedCost: 0,
    plannedData: null,
    plannedCost: 0,
    futureFreeTime: null,
    totalMinsPassed: 0
  };
}
$('.addPlanned').click(function() {
  $('.form, .submitPlanned, .formBackground').removeClass('hidden');
  $('.submitRecorded').addClass('hidden');
  $('.legend').html('Add Planned Expense ');
  $('.form').addClass('plannedBG');
});
$('.addRecord').click(function() {
  $('.form, .submitRecorded, .formBackground').removeClass('hidden');
  $('.submitPlanned').addClass('hidden');
  $('.legend').html('Add a Record');
  $('.form').addClass('recordBG');
});
$('.closer').click(function() {
  $(this).closest('form').addClass('hidden');
  $('.formBackground, .helpText').addClass('hidden');
});
$('.helpButton').click(function() {
  $('.helpText, .formBackground').removeClass('hidden');
});

$('.mobileRecords').click(function(){
  $('.recorded').css('display', 'block');
  $('.totals, .planned').css('display', 'none');
  $('.mobileBudget').css('padding', '3px');
  // temporary fix for off center display columns in mobile layout
  $('body').css('position', 'relative');
  $('body').css('left', '35px');
});

$('.mobileToDos').click(function(){
  $('.mobileBudget').css('padding', '3px');
  $('.planned').css('display', 'block'); 
  $('.totals, .recorded').css('display', 'none');
  // temporary fix for off center display columns in mobile layout
  $('body').css('position', 'relative');
  $('body').css('left', '35px');
  
});

$('.mobileBudget').click(function(){ 
  
  $('.totals').css('display', 'block');
  $('.recorded, .planned').css('display', 'none');
  $('.mobileBudget').css('padding', '10px');
  // temporary fix for off center display columns in mobile layout
  $('body').css('position', 'static');
 
 
});

if(($('.recorded').css('display')) && ($('.planned').css('display')) === 'none'){
  $('.mobileBudget').css('padding', '10px');
}

$(document).ready(function() {
  loadRecorded();
  calcTimeDate();
});