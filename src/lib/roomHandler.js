import { ID } from "appwrite";
import { databases, databaseId, collectionId } from '@/lib/appwrite.js';

async function tryCreatingRoom({ nickname, onError }) {
    const isEmptyNickname = nickname.length === 0;
    const isTooShortNickname = nickname.length < 4;
    if (isEmptyNickname) {
        onError('pages.createRoom.errors.emptyNickname');
        return;
    }
    if (isTooShortNickname) {
        onError('pages.createRoom.errors.tooShortNickname');
        return;
    }

    try {
        await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            {
                hostUser: nickname,
            }
        );
    }
    catch (error) {
        console.error(error);
        onError('pages.createRoom.errors.failedCreatingRoom');
    }
}

export { tryCreatingRoom };