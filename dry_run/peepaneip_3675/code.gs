/*
* This is a Google App Script for Dry-Run of Learn2Earn (PEEPAnEIP 3675)
*/

// Stores Pre-defined correct answers. Each index represents the correct answer for the question in the Google Form, in sequence.
const a = ["Downgrade consensus mechanism to prove of existence", "A new sidechain that executes smart contracts", "The consensus chain", "STAKE_", "Beacon chain network and execution chain network"];

// Total no. of Questions are 5. So the total correct answers = 5
const SCORE = 5;

// This function is a trigger attached to the Google Form and triggers whenever a response is submitted
function onFormSubmit(event) {

  var formResponse = event.response;
  var itemResponses = formResponse.getItemResponses();
  var score = 0;

  Logger.log(itemResponses);

  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];

    // Logging the submitted question and response from the submitted response
    Logger.log('Response to the question "%s" was "%s"',
      itemResponse.getItem().getTitle(),
      itemResponse.getResponse()
    );

    // Validating the submitted answer in a response with the correct answer
    if (itemResponse.getResponse() === a[j])
      score = score + 1;
  }

  // Checking if the submitted answer are equal to the SCORE defined above
  if (score !== SCORE)
    Logger.log("Better luck next time. You got only %s correct answers out of %s", String(score), String(SCORE));
  else
    Logger.log("Congratulations! You got all correct answers!", String(score), String(SCORE));
}