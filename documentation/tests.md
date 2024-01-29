# Tests

All application code needs to be tested. This means the following list is excluded from testing because they cannot be executed or simply exist to help manage the development environment:

1. Configuration files
2. Data storage files
3. Documentation files
4. Script files

## Unit tests

Unit tests are easy to write, don't test much, and are easy to break. If a unit test is written for a cancel button which navigates a user to the previous page, then the test would need to check for the presence of the button and if the function responsible for the back navigation was called. Keep in mind no actual navigation would take place as the back function would be mocked. It would be best to split that test into two separate tests better enabling developers to figure what is going wrong.

## Integration tests

Integration tests are written to test an action: an API request, mouse click, etc. They should include enough configuration data to clearly examine all direct and indirect effects of the action being tested.

1. Mocking must be set up
    1. (Back-end) Data related to the direct and indirect changes must be mocked.
    2. (Front-end) Back-end end points need to be mocked.
2. (Back-end) The initial data must be tested to confirm its existance.
2. The action is triggered.
3. The direct effects must be confirmed.
4. The indirect side effects must be confirmed.

## End-to-end tests

End-to-end tests cover a flow or story. In the sign up process a unit test will cover button clicking, visual appearance, and validation. The integration test will check will confirm proper feedback is given. If the submit button is clicked with invalid inputs, then there should be an error message. Likewise, if the submit button is clicked with valid inputs, then the mocked navigation button should be called. The end-to-end test covers the entire sign up flow: navigating to the sign up page, confirming it appears as expected, entering invalid input data, seeing an error message, correcting the input data, sending the sign up request, handling a positive response, handling a negative response.

## Focus of testing efforts

While all testing types are useful, tests will primarily be integration tests. Unit tests tend to be too easy to break as new features are added. End-to-end tests are very difficult to write and can require significant overhauling for even slight feature changes. Integration tests occupy a reasonable middle ground.
