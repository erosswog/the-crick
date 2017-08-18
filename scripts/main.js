'use strict';

// Initializes the App
function TheCrick() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById("user-pic");
  this.userName = document.getElementById("user-name");
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.initFirebase();
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

window.onload = function() {
  window.thecrick = new TheCrick();
}
