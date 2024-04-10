// describe the process from fetch a set of data from react, then to store the data into 
// redux and get the data from redux to present on the screen.


When a user tries to login into app by filling login form, login api will be hit and it will 
return userToken, which can be used to call apis in different screens of app. 
We save the userToken into redux store by dispatching redux action. In Home screen, we get get 
userToken our of redux store with the help of useSelector hook.
 
