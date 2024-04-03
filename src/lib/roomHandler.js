import { ID } from "appwrite";
import { databases, databaseId, collectionId } from '@/lib/appwrite.js';

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

export { tryCreatingRoom };