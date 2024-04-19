# Simple chess room

A simple chess room

## For developpers

### Credentials

#### Cloud Firestore

* Create a Cloud Firestore database.

* Create a file  <projectRoot>/src/credentials/firebase.js.
And insert this content, replacing the placeholders with your project firebase configuration :

```javascript
export default {
  apiKey: <YourId>,
  authDomain: <YourId>,
  projectId: <YourId>,
  storageBucket: <YourId>,
  messagingSenderId: <YourId>,
  appId: <YourId>,
};

export const expectedOrigin = <TheExpectedOriginFromYourSecurityRule>;
```

## Credits

### Fonts

Font freeSerif was downloaded from [FontSpace](https://www.fontspace.com/freeserif-font-f13277).

### Images

Pieces vectors definitions from CBurnett and found on [Wikimedia commons](https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces).

Some images have been downloaded from [SvgRepo](https://www.svgrepo.com).

* Icon : https://www.svgrepo.com/svg/85723/chess
* copy : https://www.svgrepo.com/svg/525288/
* paste : https://www.svgrepo.com/svg/525279/clipboard-text
* backward : https://www.svgrepo.com/svg/436646/backward-fill
* backward_end : https://www.svgrepo.com/svg/436645/backward-end-fill
* forward : https://www.svgrepo.com/svg/436766/forward-fill
* forward_end : https://www.svgrepo.com/svg/436765/forward-end-fill
* start : https://www.svgrepo.com/svg/304738/start-line
* stop : https://www.svgrepo.com/svg/411306/stop
* reverse: https://www.svgrepo.com/svg/414907/arrows-vertical-direction
* user: https://www.svgrepo.com/svg/467432/user-6
* save: https://www.svgrepo.com/svg/395640/save
* upArrow: https://www.svgrepo.com/svg/247781/up-arrow-upload
* downArrow: https://www.svgrepo.com/svg/247749/down-arrow-download
* leftArrow: https://www.svgrepo.com/svg/247765/left-arrow-back
* rightArrow: https://www.svgrepo.com/svg/247766/right-arrow-next
* bin: https://www.svgrepo.com/svg/429287/bin-essential-trash