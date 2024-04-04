export default {
    pages: {
        home: {
            title: "Bienvenida",
            createRoom: "Crear una sala de estar",
            joinRoom: "Entrar a una sala",
            yourRoom: "Su sala",
            roomIdCopied: "ID de la sala copiada en el portapapeles.",
        },
        createRoom: {
            title: "Crear una sala de estar",
            labels: {
                nickname: "Tu apodo",
            },
            placeholders: {
                nickname: "apodo",
            },
            errors: {
                emptyNickname: "¡El apodo no debe estar vacío!",
                tooShortNickname: "¡El apodo debe contener al menos 4 caracteres!",
                failedCreatingRoom: "¡No se pudo crear sala!",
            },
            submit: "Crear"
        },
        joinRoom: {
            title: "Entrar a una sala",
            labels: {
                nickname: "Tu apodo",
                roomId: "Identificación de la sala"
            },
            placeholders: {
                nickname: "apodo",
                roomId: "identificación"
            },
            errors: {
                emptyNickname: "¡El apodo no debe estar vacío!",
                tooShortNickname: "¡El apodo debe contener al menos 4 caracteres!",
                emptyRoomId: "¡La identificación de la sala no debe estar vacía!",
                noMatchingRoom: "¡No hay ninguna sala que coincida!",
                failedJoiningRoom: "¡No se pudo entrar a la sala!",
            },
            submit: "Entrar"
        }
    }
};