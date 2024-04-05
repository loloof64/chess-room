import { ID, Query } from "appwrite";
import { databases, databaseId, collectionId } from '@/lib/appwrite.js';
import { useRoomStore } from '@/stores/RoomStore.js';

function generateId() {
    const now = Date.now();
    const factor = Math.floor(Math.random() * 100);

    return (now * factor).toString();
}

async function tryCreatingRoom({ nickname }) {
    const isEmptyNickname = nickname.length === 0;
    const isTooShortNickname = nickname.length < 4;
    if (isEmptyNickname) {
        return { error: 'pages.createRoom.errors.emptyNickname' };
    }
    if (isTooShortNickname) {
        return { error: 'pages.createRoom.errors.tooShortNickname' };
    }

    try {
        const result = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            {
                id: generateId(),
                hostUser: nickname,
            }
        );
        return { result };
    }
    catch (error) {
        console.error(error);
        return { error: 'pages.createRoom.errors.failedCreatingRoom', isFatalError: true };
    }
}

async function tryJoiningRoom({ nickname, roomId }) {
    const isEmptyNickname = nickname.length === 0;
    const isTooShortNickname = nickname.length < 4;
    const isEmptyId = roomId.length === 0;

    if (isEmptyNickname) {
        return { error: 'pages.joinRoom.errors.emptyNickname' };
    }
    if (isTooShortNickname) {
        return { error: 'pages.joinRoom.errors.tooShortNickname' };
    }
    if (isEmptyId) {
        return { error: 'pages.joinRoom.errors.emptyRoomId' }
    }

    try {
        const matchingDocuments = await databases.listDocuments(
            databaseId,
            collectionId,
            [
                Query.equal('id', roomId)
            ]
        );
        const noMatchingRoom = matchingDocuments.total === 0;
        if (noMatchingRoom) {
            return { error: 'pages.joinRoom.errors.noMatchingRoom' }
        }

        const matchingDocument = matchingDocuments.documents[0];
        const isAlreadyFilledRoom = matchingDocument.guestUser;

        if (isAlreadyFilledRoom) {
            return { error: 'pages.joinRoom.errors.alreadyFilledRoom' }
        }

        const docId = matchingDocument.$id;

        await databases.updateDocument(databaseId, collectionId, docId, {
            guestUser: nickname,
        });

        const roomStore = useRoomStore();
        roomStore.setDocId(docId);

        return { isOk: true };
    }
    catch (error) {
        console.error(error);
        return { error: 'pages.joinRoom.errors.failedJoiningRoom', isFatalError: true };
    }
}

async function tryUpdatingRoom({ newValues, roomId }) {
    try {
        const matchingDocuments = await databases.listDocuments(
            databaseId,
            collectionId,
            [
                Query.equal('id', roomId)
            ]
        );
        const noMatchingRoom = matchingDocuments.total === 0;
        if (noMatchingRoom) {
            console.error('No matching room when trying to update!');
            return { error: 'page.generic.errors.failedUpdatingRoom', isFatalError: true }
        }

        const matchingDocument = matchingDocuments.documents[0];
        const docId = matchingDocument.$id;

        await databases.updateDocument(databaseId, collectionId, docId, newValues);

        return { isOk: true };
    }
    catch (error) {
        console.error(error);
        return { error: 'pages.generic.errors.failedUpdatingRoom', isFatalError: true };
    }
}

export { tryCreatingRoom, tryJoiningRoom, tryUpdatingRoom };