import { expectedOrigin } from "@/credentials/firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import db from "@/lib/firebase.js";
import { useRoomStore } from "@/stores/RoomStore.js";

function subscribeToAllRoomsChange(documentCallback) {
  return onSnapshot(collection(db, "rooms"), (snapshot) => {
    snapshot.forEach(documentCallback);
  });
}

function subscribeToSingleRoomChange(roomId, documentCallback) {
  return onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
    documentCallback(snapshot);
  });
}

async function tryCreatingRoom({ nickname }) {
  const isEmptyNickname = nickname.length === 0;
  const isTooShortNickname = nickname.length < 4;
  if (isEmptyNickname) {
    return { error: "pages.createRoom.errors.emptyNickname" };
  }
  if (isTooShortNickname) {
    return { error: "pages.createRoom.errors.tooShortNickname" };
  }

  try {
    const roomCollection = collection(db, "rooms");
    const docRef = await addDoc(roomCollection, {
      origin: expectedOrigin,
      hostUser: nickname,
    });
    return { result: docRef };
  } catch (error) {
    console.error(error);
    return {
      error: "pages.createRoom.errors.failedCreatingRoom",
      isFatalError: true,
    };
  }
}

async function tryJoiningRoom({ nickname, roomId }) {
  const isEmptyNickname = nickname.length === 0;
  const isTooShortNickname = nickname.length < 4;
  const isEmptyId = roomId.length === 0;

  if (isEmptyNickname) {
    return { error: "pages.joinRoom.errors.emptyNickname" };
  }
  if (isTooShortNickname) {
    return { error: "pages.joinRoom.errors.tooShortNickname" };
  }
  if (isEmptyId) {
    return { error: "pages.joinRoom.errors.emptyRoomId" };
  }

  try {
    const matchingDocumentRef = doc(db, "rooms", roomId);
    const matchingDocument = await getDoc(matchingDocumentRef);

    const noMatchingRoom = !matchingDocument.exists();
    if (noMatchingRoom) {
      return { error: "pages.joinRoom.errors.noMatchingRoom" };
    }

    const documentData = matchingDocument.data();
    const isAlreadyFilledRoom = documentData.guestUser;

    if (isAlreadyFilledRoom) {
      return { error: "pages.joinRoom.errors.alreadyFilledRoom" };
    }

    const newValues = {
      guestUser: nickname,
    };

    await updateDoc(matchingDocumentRef, newValues);

    const roomStore = useRoomStore();
    roomStore.setRoomId(roomId);

    return { isOk: true };
  } catch (error) {
    console.error(error);
    return {
      error: "pages.joinRoom.errors.failedJoiningRoom",
      isFatalError: true,
    };
  }
}

async function tryUpdatingRoom({ newValues, roomId }) {
  try {
    const matchingDocumentRef = doc(db, "rooms", roomId);
    const matchingDocument = await getDoc(matchingDocumentRef);

    const noMatchingRoom = !matchingDocument.exists();
    if (noMatchingRoom) {
      console.error("No matching room when trying to update!");
      return {
        error: "page.generic.errors.failedUpdatingRoom",
        isFatalError: true,
      };
    }

    await updateDoc(matchingDocumentRef, newValues);

    return { isOk: true };
  } catch (error) {
    console.error(error);
    return {
      error: "pages.generic.errors.failedUpdatingRoom",
      isFatalError: true,
    };
  }
}

async function tryReadingRoom({ roomId }) {
  try {
    const matchingDocumentRef = doc(db, "rooms", roomId);
    const matchingDocument = await getDoc(matchingDocumentRef);

    const noMatchingRoom = !matchingDocument.exists();
    if (noMatchingRoom) {
      console.error("No matching room when trying to update!");
      return {
        error: "page.generic.errors.failedUpdatingRoom",
        isFatalError: true,
      };
    }

    return { isOk: true, matchingDocument: matchingDocument.data() };
  } catch (error) {
    console.error(error);
    return {
      error: "pages.generic.errors.failedReadingRoom",
      isFatalError: true,
    };
  }
}

export {
  tryCreatingRoom,
  tryJoiningRoom,
  tryUpdatingRoom,
  tryReadingRoom,
  subscribeToAllRoomsChange,
  subscribeToSingleRoomChange,
};
