# Learn2Earn Dry Run

This Dry Run is purely experimental and the objective is to test:

- the flow for a User from attempting the quiz, submitting the answers to receiving the result via mail or other medium
- the process for quiz management, operations and validating the quiz answers

Tech Stack used:

- Google Form, to create quiz questions for the User
- Google Sheet, attached to the Google Form that stores all the responses
- Google App Script, that triggers every time a response is submitted, validates all the answers and sends the Respondent a message telling if they got all answers correct or not