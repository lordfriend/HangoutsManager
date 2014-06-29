## Hangouts Manager ##
Hangouts Manager is Hangouts offline Archive browser in offline environment. You can download your archive from https://www.google.com/settings/takeout and import into Hangouts Manager.

### HOW TO BUILD ###
----------
**This project is under development and may change at any time**

 1. Clone this project.
 2. Download dependencies:<br/>
 `$ cd HangoutsManager`<br/>
 `$ npm install`<br/>
 `$ npm install -g bower`<br/>
 `$ npm install -g grunt-cli`<br/>
 `$ bower install`<br />
  Build front end:<br/>
 `$ grunt build`<br/>
  Download server dependencies:<br/>
 `$ cd server`<br/>
 `$ npm install`
 3. Enter `npm start` to start the server
 4. Open your browser, visit http://localhost:8000 , then you will see the **Setting** page.
 5. Go to https://www.google.com/settings/takeout and download your archive. This may take a few minutes. After you have get the archive, place Hangouts.json into your HangoutsManger/server directory.
 6. On the Setting page, add './Hangouts.json' to the location, and hit build.
 7. Refresh the page, and click the home button to view your archive.
 
Note: Search function is not available.

----------
This project is built with [yeoman][1], The server side is developed using [expressjs][2]
You can develop front end by using grunt task runner, bower.

  [1]: http://yeoman.io
  [2]: http://expressjs.com