# Simple chess room

A simple chess room

## For developpers

### Credentials

#### Appwrite

* Create a database in your AppWrite account, and a collection inside it.

* Create a file  <projectRoot>/src/credentials/appwrite.js.
And insert this content, replacing the placeholders with your project id, database id and collection id :

```javascript
const appId = "<YourAppId>";
const databaseId = "<YourDatabaseId>";
const collectionId = "<YourCollectionId>";
export {appId, databaseId, collectionId};
```

## Credits

### Fonts

Font freeSerif was downloaded from [FontSpace](https://www.fontspace.com/freeserif-font-f13277).

### Images

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