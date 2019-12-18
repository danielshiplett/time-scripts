// ==UserScript==
// @name         Calculate Hours Needed
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Calculate the number of hours needed for the rest of the month.
// @author       ddshipl
// @match        https://*.unanet.biz/*/action/time/edit*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("starting script");

    // Create a button and a disabled input.
    var html = '<p class="sub-main"><button type="button" title="Calculate" id="calculate">Calculate</button>Hours / Day Remaining: <input id="hoursperdayleft" type="text" size="5" disabled></p>';
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    console.log(template.content.firstChild);

    // Inject the new HTML right after the warning.
    document.querySelector("#timeContent > div.warning > div").append(template.content.firstChild);

    // Add our function to the button click.
    document.querySelector('#calculate').addEventListener('click', function() {
        console.log("Calculating Required Hours");

        // Might need a better selector here.  This is the td in the last row.  It contains your current total hours.
        var totalTime = document.querySelector("#timesheet > tbody:nth-child(3) > tr > td.total > input[type=text]");
        console.log('current total hours: ' + totalTime.value);

        // At my company, we get a warning message near the top that contains a message about how many hours we owe for the month.
        // Using a regex, we can extract the hours from that warning.
        var warningText = document.querySelector("#timeContent > div.warning > div > p.sub-main");
        var regexp = /(?:^|\s)Expected work hours in current timesheet period is (\d+) hours.<br><br>(?:\s|$)/g;
        var warningHours = regexp.exec(warningText.innerHTML);
        console.log('warning hours: ' + warningHours[1]);

        // We can then parse and subtract to get the hours we need to complete.
        var todoHours = parseFloat(warningHours[1]) - parseFloat(totalTime.value);
        console.log('todoHours: ' + todoHours);

        // Then, we can get the totals row.
        var totalRow = document.querySelector("#timesheet > tbody:nth-child(3) > tr");

        // The collection of cells in the row.
        var cells = totalRow.cells;

        // Look for all the cells with class 'weekday-totals'.  We will want to count the number of empty ones.  That is
        // how many work days we have left in the month (my company auto-populates holidays).
        var daysLeft = 0;

        for (let cell of cells) {
            if(cell.className == 'weekday-totals') {
                console.log("cell: " + cell.childNodes[0].value);
                var weekdayValue = cell.childNodes[0].value;

                if(weekdayValue == '') {
                    console.log("emptyDay");
                    daysLeft += 1;
                }
            }
        }

        console.log("days left: " + daysLeft);

        // Now calculate how many hours per day we need to work for the rest of the month to meet our required hours.
        var hoursPerDay = todoHours / daysLeft;
        console.log("hours per day: " + hoursPerDay);

        // And insert the hours into the input text box.
        document.getElementById('hoursperdayleft').value = hoursPerDay;
    })
})();
