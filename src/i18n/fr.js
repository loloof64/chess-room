export default {
    pages: {
        home: {
            title: "Accueil",
            createRoom: "Créér un salon",
            joinRoom: "Rejoindre un salon",
            yourRoom: "Votre salon",
            roomIdCopied: "ID du salon copié dans le presse-papiers.",
        },
        createRoom: {
            title: "Créér un salon",
            labels: {
                nickname: "Votre pseudo",
            },
            placeholders: {
                nickname: "pseudo",
            },
            errors: {
                emptyNickname: "Le pseudo ne doit pas être vide !",
                tooShortNickname: "Le pseudo doit contenir au moins 4 caractères !",
                failedCreatingRoom: "Échec de création du salon !",
            },
            submit: "Créer"
        },
        joinRoom: {
            title: "Rejoindre un salon",
            labels: {
                nickname: "Votre pseudo",
                roomId: "Id du salon"
            },
            placeholders: {
                nickname: "pseudo",
                roomId: "id"
            },
            errors: {
                emptyNickname: "Le pseudo ne doit pas être vide !",
                tooShortNickname: "Le pseudo doit contenir au moins 4 caractères !",
                emptyRoomId: "L'id du salon ne doit pas être vide !",
                noMatchingRoom: "Aucun salon ne correspond !",
                failedJoiningRoom: "Erreur en tentant de rejoindre le salon !",
            },
            submit: "Joindre"
        }
    }
};