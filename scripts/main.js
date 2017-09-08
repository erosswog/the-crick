'use strict';

// Template for leaderboard Row
TheCrick.LEADERBOARD_ROW_TEMPLATE =
  '<td class="rank"></td>' +
  '<td class="Player"></td>' +
  '<td class="Total"></td>' +
  '<td class="Rd1"></td>' +
  '<td class="Rd2"></td>' +
  '<td class="Rd3"></td>';

const PAR_NORTH = 70;
const FOURSOME = 4;
const MAX_GROUPS = 3;

// Initializes the App
function TheCrick() {
  this.checkSetup();

  this.myGolfers = [];

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById("user-pic");
  this.userName = document.getElementById("user-name");
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.initFirebase();

  if (location.pathname === "/index.html" || location.pathname === "/")
  {
    this.leaderboard = document.getElementById('leaderboard');
    this.rank = 1;
    this.loadLeaderboard();
  }
  else if(location.pathname === "/post-score.html") {
    this.golfersCB = document.getElementById("golfers");
    this.roundCB = document.getElementById("round");
    this.scoreTB = document.getElementById("Score");
    this.submitButton = document.getElementById("submit");
    this.postScoreForm = document.getElementById("post-score-form");
    this.postScoreSnackbarContainer = document.getElementById('post-score-snackbar');
    this.postScoreForm.addEventListener('submit', this.postScore.bind(this));

    // Toggle for the button.
    var buttonTogglingHandler = this.toggleButton.bind(this);
    this.golfersCB.addEventListener('change', buttonTogglingHandler);
    this.roundCB.addEventListener('change', buttonTogglingHandler);
    this.scoreTB.addEventListener('change', buttonTogglingHandler);
    this.scoreTB.addEventListener('keyup', buttonTogglingHandler);

    this.loadGolferComboBox(this.golfersCB);
  }
  else if(location.pathname === "/groupings.html") {
    this.groupingsTable = document.getElementById("Groupings");
    this.loadGroupingsTable();
  }
  else if(location.pathname === "/register-golfer.html") {
    this.registerGolferForm = document.getElementById("register-golfer-form");
    this.registeredGolfersTable = document.getElementById("registered-golfers-table");
    this.registerButton = document.getElementById("submit");
    this.nameTB = document.getElementById("Name");
    this.handicapTB = document.getElementById("Handicap");
    this.registerGolferSnackbarContainer = document.getElementById('register-golfer-snackbar');

    // Toggle for the button.
    var registerButtonTogglingHandler = this.toggleRegisterButton.bind(this);
    this.nameTB.addEventListener('change', registerButtonTogglingHandler);
    this.nameTB.addEventListener('keyup', registerButtonTogglingHandler);
    this.handicapTB.addEventListener('change', registerButtonTogglingHandler);
    this.handicapTB.addEventListener('keyup', registerButtonTogglingHandler);

    this.registerGolferForm.addEventListener('submit', this.registerGolfer.bind(this));
    this.loadRegisteredGolfersTable();
  }
  else if(location.pathname === '/new-groupings.html') {
    this.newGroupingsForm = document.getElementById("new-groups-form");
    this.submitButton = document.getElementById("submit");
    this.golfer1aCB = document.getElementById("golfer1a");
    this.golfer1bCB = document.getElementById("golfer1b");
    this.golfer1cCB = document.getElementById("golfer1c");
    this.golfer1dCB = document.getElementById("golfer1d");
    this.golfer2aCB = document.getElementById("golfer2a");
    this.golfer2bCB = document.getElementById("golfer2b");
    this.golfer2cCB = document.getElementById("golfer2c");
    this.golfer2dCB = document.getElementById("golfer2d");
    this.golfer3aCB = document.getElementById("golfer3a");
    this.golfer3bCB = document.getElementById("golfer3b");
    this.golfer3cCB = document.getElementById("golfer3c");
    this.golfer3dCB = document.getElementById("golfer3d");
    this.newGroupsSnackBarContainer = document.getElementById("new-groups-snackbar");

    // Toggle for the button.
    var newGroupsButtonTogglingHandler = this.toggleNewGroupsButton.bind(this);
    this.golfer1aCB.addEventListener('change', newGroupsButtonTogglingHandler);
    this.golfer1aCB.addEventListener('keyup', newGroupsButtonTogglingHandler);
    this.golfer2aCB.addEventListener('change', newGroupsButtonTogglingHandler);
    this.golfer2aCB.addEventListener('keyup', newGroupsButtonTogglingHandler);
    this.golfer3aCB.addEventListener('change', newGroupsButtonTogglingHandler);
    this.golfer3aCB.addEventListener('keyup', newGroupsButtonTogglingHandler);

    this.newGroupingsForm.addEventListener('submit', this.processNewGroups.bind(this));
    this.loadRegisterComboBoxes();
  }
};

TheCrick.prototype.processNewGroups = function(e) {
  e.preventDefault();
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    if (currentUser.email === "erosswog@gmail.com" || currentUser.email === "mbsalamacha@gmail.com") {

      var updates = {};
      updates['/groupings/' + 'Group 1'] = [this.golfer1aCB.value, this.golfer1bCB.value, this.golfer1cCB.value, this.golfer1dCB.value];
      updates['/groupings/' + 'Group 2'] = [this.golfer2aCB.value, this.golfer2bCB.value, this.golfer2cCB.value, this.golfer2dCB.value];
      updates['/groupings/' + 'Group 3'] = [this.golfer3aCB.value, this.golfer3bCB.value, this.golfer3cCB.value, this.golfer3dCB.value];

      var data = {
        message: 'New Groups have been recorded.',
        timeout: 2000,
      };
      firebase.database().ref().update(updates);
      this.golfer1aCB.value = "";
      this.golfer1bCB.value = "";
      this.golfer1cCB.value = "";
      this.golfer1dCB.value = "";
      this.golfer2aCB.value = "";
      this.golfer2bCB.value = "";
      this.golfer2cCB.value = "";
      this.golfer2dCB.value = "";
      this.golfer3aCB.value = "";
      this.golfer3bCB.value = "";
      this.golfer3cCB.value = "";
      this.golfer3dCB.value = "";
      this.newGroupsSnackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
  }
};

TheCrick.prototype.loadRegisterComboBoxes = function () {
  // Loads the names of the golfers from the Leaderboard Table
  // Reference to the /leaderboard/ database path.
  this.leaderboardRef = this.database.ref('leaderboard').orderByKey();
  // Make sure we remove all previous listeners
  this.leaderboardRef.off();

  // Loads the names of the golfers from the Leaderboard Table
  var loadGolfer = function(data) {
    var tn1a = document.createTextNode(data.key);
    var opt1a = document.createElement('option');
    opt1a.appendChild(tn1a);
    this.golfer1aCB.appendChild(opt1a);

    var tn1b = document.createTextNode(data.key);
    var opt1b = document.createElement('option');
    opt1b.appendChild(tn1b);
    this.golfer1bCB.appendChild(opt1b);

    var tn1c = document.createTextNode(data.key);
    var opt1c = document.createElement('option');
    opt1c.appendChild(tn1c);
    this.golfer1cCB.appendChild(opt1c);

    var tn1d = document.createTextNode(data.key);
    var opt1d = document.createElement('option');
    opt1d.appendChild(tn1d);
    this.golfer1dCB.appendChild(opt1d);

    var tn2a = document.createTextNode(data.key);
    var opt2a = document.createElement('option');
    opt2a.appendChild(tn2a);
    this.golfer2aCB.appendChild(opt2a);

    var tn2b = document.createTextNode(data.key);
    var opt2b = document.createElement('option');
    opt2b.appendChild(tn2b);
    this.golfer2bCB.appendChild(opt2b);

    var tn2c = document.createTextNode(data.key);
    var opt2c = document.createElement('option');
    opt2c.appendChild(tn2c);
    this.golfer2cCB.appendChild(opt2c);

    var tn2d = document.createTextNode(data.key);
    var opt2d = document.createElement('option');
    opt2d.appendChild(tn2d);
    this.golfer2dCB.appendChild(opt2d);

    var tn3a = document.createTextNode(data.key);
    var opt3a = document.createElement('option');
    opt3a.appendChild(tn3a);
    this.golfer3aCB.appendChild(opt3a);

    var tn3b = document.createTextNode(data.key);
    var opt3b = document.createElement('option');
    opt3b.appendChild(tn3b);
    this.golfer3bCB.appendChild(opt3b);

    var tn3c = document.createTextNode(data.key);
    var opt3c = document.createElement('option');
    opt3c.appendChild(tn3c);
    this.golfer3cCB.appendChild(opt3c);

    var tn3d = document.createTextNode(data.key);
    var opt3d = document.createElement('option');
    opt3d.appendChild(tn3d);
    this.golfer3dCB.appendChild(opt3d);
  }.bind(this);
  this.leaderboardRef.on('child_added', loadGolfer);
  this.leaderboardRef.on('child_changed', loadGolfer);
}

TheCrick.prototype.loadGolferComboBox = function(comboBox) {
  // Reference to the /leaderboard/ database path.
  this.leaderboardRef = this.database.ref('leaderboard').orderByKey();
  // Make sure we remove all previous listeners
  this.leaderboardRef.off();

  // Loads the names of the golfers from the Leaderboard Table
  var loadGolfer = function(data) {
    var opt = document.createElement('option');
    var tn1 = document.createTextNode(data.key);
    opt.appendChild(tn1);
    comboBox.appendChild(opt);
  }.bind(this);
  this.leaderboardRef.on('child_added', loadGolfer);
  this.leaderboardRef.on('child_changed', loadGolfer);
};

TheCrick.prototype.loadGroupingsTable = function() {
  // load golfer names from groupings table and display it.
  // Reference to the /leaderboard/ database path.
  this.groupingsRef = this.database.ref('groupings');
  // Make sure we remove all previous listeners
  this.groupingsRef.off();

  // Loads the names of the golfers from the Leaderboard Table
  var loadGroups = function(data) {
    this.displayGroupingEntry(data.key, data.val());
  }.bind(this);
  this.groupingsRef.on('child_added', loadGroups);
  this.groupingsRef.on('child_changed', loadGroups);
};

TheCrick.prototype.displayGroupingEntry = function(group, groupsArr) {
  var row = document.createElement('tr');
  var cell = document.createElement('td');
  var bold = document.createElement('b');
  var tn = document.createTextNode(group);
  bold.appendChild(tn);
  cell.appendChild(bold);
  row.appendChild(cell);

  for (var i = 0; i < groupsArr.length; i++) {
    cell = document.createElement('td');
    tn = document.createTextNode(groupsArr[i]);
    cell.appendChild(tn);
    row.appendChild(cell);
  }
  this.groupingsTable.appendChild(row);
};

TheCrick.prototype.registerGolfer = function(e) {
  e.preventDefault();
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    if (currentUser.email === "erosswog@gmail.com" || currentUser.email === "mbsalamacha@gmail.com") {
      firebase.database().ref('leaderboard/' + this.nameTB.value).set({
        Total: 0,
        handicap: this.handicapTB.value,
        rd1: 0,
        rd2: 0,
        rd3: 0
      });

      var data = {
        message: this.nameTB.value + ' has been registered.',
        timeout: 2000,
      };

      this.nameTB.value = "";
      this.handicapTB.value = "";
      this.registerGolferSnackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
  }
};

TheCrick.prototype.loadRegisteredGolfersTable = function() {
  // Reference to the /leaderboard/ database path.
  this.leaderboardRef = this.database.ref('leaderboard').orderByKey();
  // Make sure we remove all previous listeners
  this.leaderboardRef.off();

  // Loads the names of the golfers from the Leaderboard Table
  var loadGolfer = function(data) {
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    var tn = document.createTextNode(data.key);
    cell.setAttribute("class", "mdl-data-table__cell--non-numeric");
    cell.appendChild(tn);
    row.appendChild(cell);
    this.registeredGolfersTable.appendChild(row);
  }.bind(this);
  this.leaderboardRef.on('child_added', loadGolfer);
  this.leaderboardRef.on('child_changed', loadGolfer);
};

// Enables or disables the submit button depending on the values of the input
// fields.
TheCrick.prototype.toggleButton = function() {
  if (this.golfersCB.value && this.roundCB.value && this.scoreTB.value) {
    if (this.checkSignedInWithMessage()) {
      var currentUser = this.auth.currentUser;
      if (currentUser.email == "erosswog@gmail.com" || currentUser.email == "mbsalamacha@gmail.com") {
        this.submitButton.removeAttribute('disabled');
      }
      else {
        this.submitButton.setAttribute('disabled', 'true');
      }
    }
    else {
      this.submitButton.setAttribute('disabled', 'true');
    }
  }
  else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Enables or disables the submit button depending on the values of the input
// fields.
TheCrick.prototype.toggleRegisterButton = function() {
  if (this.nameTB.value && this.handicapTB.value) {
    if (this.checkSignedInWithMessage()) {
      var currentUser = this.auth.currentUser;
      if (currentUser.email == "erosswog@gmail.com" || currentUser.email == "mbsalamacha@gmail.com") {
        this.registerButton.removeAttribute('disabled');
      }
      else {
        this.registerButton.setAttribute('disabled', 'true');
      }
    }
    else {
      this.registerButton.setAttribute('disabled', 'true');
    }
  }
  else {
    this.registerButton.setAttribute('disabled', 'true');
  }
};

// Enables or disables the submit button depending on the values of the input
// fields.
TheCrick.prototype.toggleNewGroupsButton = function() {
  if (this.golfer1aCB.value != "" && this.golfer2aCB.value != "" && this.golfer3aCB.value != "") {
    if (this.checkSignedInWithMessage()) {
      var currentUser = this.auth.currentUser;
      if (currentUser.email == "erosswog@gmail.com" || currentUser.email == "mbsalamacha@gmail.com") {
        this.submitButton.removeAttribute('disabled');
      }
      else {
        this.submitButton.setAttribute('disabled', 'true');
      }
    }
    else {
      this.submitButton.setAttribute('disabled', 'true');
    }
  }
  else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Posts a new score on the Firebase DB.
TheCrick.prototype.postScore = function(e) {
  e.preventDefault();
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    if (currentUser.email === "erosswog@gmail.com" || currentUser.email === "mbsalamacha@gmail.com") {
      // Retrieve DB entry corresponding to selected golfer and update data for
      // the round selected. If that round already has an entry, overwrite it.
      var userId = firebase.auth().currentUser.uid;
      var scores = [];
      var updates = {};
      var round = '';
      var par = 0;
      var gross = 0;
      var handicap = 0;

      firebase.database().ref('/leaderboard/' + this.golfersCB.value).once('value', function(snapshot) {
        scores[0] = snapshot.val().rd1;
        scores[1] = snapshot.val().rd2;
        scores[2] = snapshot.val().rd3;
        handicap = snapshot.val().handicap;
      });

      if (this.roundCB.value === 'Rd1') {
        round = 'rd1';
        scores[0] = this.scoreTB.value - handicap;
      }
      else if (this.roundCB.value === 'Rd2') {
        round = 'rd2';
        scores[1] = this.scoreTB.value - handicap;
      }
      else if (this.roundCB.value === 'Rd3') {
        round = 'rd3';
        scores[2] = this.scoreTB.value - handicap;
      }
      else {
        return false;
      }

      for(var i = 0; i < scores.length; i++) {
        if (scores[i] != 0) {
          par += PAR_NORTH;
          gross += scores[i];
        }
      }

      updates['/leaderboard/' + this.golfersCB.value + '/' + round] = this.scoreTB.value - handicap;
      updates['/leaderboard/' + this.golfersCB.value + '/Total'] = gross - par;

      var data = {
        message: this.golfersCB.value + '\'s score has been posted.',
        timeout: 2000,
      };
      firebase.database().ref().update(updates);
      this.golfersCB.value = "";
      this.roundCB.value = "";
      this.scoreTB.value = "";
      this.postScoreSnackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
  }
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
TheCrick.prototype.initFirebase = function() {
  console.log("Got here");
  // Shortcuts to Firebase SDK features
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();

  // Initiates Firebase auth and listen to auth state changes
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-in The Crick
TheCrick.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of The Crick
TheCrick.prototype.signOut = function() {
  // Sign out of Firebase
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or Signs-out
TheCrick.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Get profile pic.
    var userName = user.displayName; // Get user's name.

    // Set the user's profile pic and name
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // Save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  }
  else { // User is signed out
    // Hide user's profile and sign-out button
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
TheCrick.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves the messaging device token to the datastore.
TheCrick.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    }
    else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error) {
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
TheCrick.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permissions...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Checks that the Firebase SDK has been correctly setup and configured
TheCrick.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions and make ' +
      'sure you are running the codelab using `firebase serve`');
  }
};

// Loads the leaderboard from the database
TheCrick.prototype.loadLeaderboard = function() {
  // Reference to the /messages/ database path.
  this.leaderboardRef = this.database.ref('leaderboard').orderByChild('Total');
  // Make sure we remove all previous listeners
  this.leaderboardRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setEntry = function(data) {
    var val = data.val();
    this.displayLeaderboardEntry(data.key, val.Total, val.rd1, val.rd2, val.rd3, val.handicap);
  }.bind(this);
  this.leaderboardRef.on('child_added', setEntry);
  this.leaderboardRef.on('child_changed', setEntry);
};

// Displays the Leaderboard Entry in the table
TheCrick.prototype.displayLeaderboardEntry = function(name, total, rd1, rd2, rd3, handicap) {
  if (total === 0) {
    if (rd1 === 0 && rd2 === 0 && rd3 === 0) {
      total = '-';
    }
    else {
      total = 'E';
    }
  }
  if (rd1 === 0) {
    rd1 = '-';
  }
  if (rd2 === 0) {
    rd2 = '-';
  }
  if (rd3 === 0) {
    rd3 = '-';
  }

  var row = document.createElement('tr');
  var cell1 = document.createElement('td');
  var tn1 = document.createTextNode(this.rank++);
  cell1.appendChild(tn1);
  var cell2 = document.createElement('td');
  cell2.setAttribute("class", "mdl-data-table__cell--non-numeric");
  var tn2 = document.createTextNode(name + ' (' + handicap + ')');
  cell2.appendChild(tn2);
  var cell3 = document.createElement('td');
  var tn3 = document.createTextNode(total);
  cell3.appendChild(tn3);
  var cell4 = document.createElement('td');
  var tn4 = document.createTextNode(rd1);
  cell4.appendChild(tn4);
  var cell5 = document.createElement('td');
  var tn5 = document.createTextNode(rd2);
  cell5.appendChild(tn5);
  var cell6 = document.createElement('td');
  var tn6 = document.createTextNode(rd3);
  cell6.appendChild(tn6);
  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  row.appendChild(cell4);
  row.appendChild(cell5);
  row.appendChild(cell6);
  this.leaderboard.appendChild(row);
};

window.onload = function() {
  window.thecrick = new TheCrick();
};
