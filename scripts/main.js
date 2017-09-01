'use strict';

// Template for leaderboard Row
TheCrick.LEADERBOARD_ROW_TEMPLATE =
  '<td class="rank"></td>' +
  '<td class="Player"></td>' +
  '<td class="Total"></td>' +
  '<td class="Rd1"></td>' +
  '<td class="Rd2"></td>' +
  '<td class="Rd3"></td>';

// Initializes the App
function TheCrick() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById("user-pic");
  this.userName = document.getElementById("user-name");
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.leaderboard = document.getElementById('leaderboard');
  this.rank = 1;

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.initFirebase();
  this.loadLeaderboard();
}

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
  this.leaderboardRef = this.database.ref('leaderboard');
  // Make sure we remove all previous listeners
  this.leaderboardRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setEntry = function(data) {
    var val = data.val();
    this.displayLeaderboardEntry(data.key, val.Total, val.rd1, val.rd2, val.rd3);
  }.bind(this);
  this.leaderboardRef.on('child_added', setEntry);
  this.leaderboardRef.on('child_changed', setEntry);
};

// Displays the Leaderboard Entry in the table
TheCrick.prototype.displayLeaderboardEntry = function(name, total, rd1, rd2, rd3) {
  // First need to create objects for each golfer.
  // Then need to store the golfers in an array
  // Then need to sort the golfers array by score for display.
    // Or make it easier on ourselves and have the serverside handle it by insertion
  var row = document.createElement('tr');
  var cell1 = document.createElement('td');
  var tn1 = document.createTextNode(this.rank++);
  cell1.appendChild(tn1);
  var cell2 = document.createElement('td');
  cell2.setAttribute("class", "mdl-data-table__cell--non-numeric");
  var tn2 = document.createTextNode(name);
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
