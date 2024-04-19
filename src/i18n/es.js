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
      submit: "Crear",
      cancel: "Anular",
    },
    joinRoom: {
      title: "Entrar a una sala",
      labels: {
        nickname: "Tu apodo",
        roomId: "Identificación de la sala",
      },
      placeholders: {
        nickname: "apodo",
        roomId: "identificación",
      },
      errors: {
        emptyNickname: "¡El apodo no debe estar vacío!",
        tooShortNickname: "¡El apodo debe contener al menos 4 caracteres!",
        emptyRoomId: "¡La identificación de la sala no debe estar vacía!",
        noMatchingRoom: "¡No hay ninguna sala que coincida!",
        alreadyFilledRoom: "¡Esta sala ya está ocupada!",
        failedJoiningRoom: "¡No se pudo entrar a la sala!",
      },
      submit: "Entrar",
      cancel: "Anular",
    },
    newGame: {
      title: "Nueva partida",
      submit: "Confirmar",
      cancel: "Anular",
      hasWhite: "¿Tiene los blancos?",
      hasWhiteYes: "Sí",
      hasWhiteNo: "No",
      minutes: "minutos",
      seconds: "segundos",
      increment: "incremento (s)",
      includeTime: "¿Jugar con el reloj?",
      includeTimeYes: "Sí",
      includeTimeNo: "No",
      timeSetToZero: "¡Diste un tiempo de cero (sin el incremento)!",
      editStartPosition: "Editar",
      copyFen: "Copiar FEN",
      pasteFen: "Pegar FEN",
      resetFen: "Reiniciar",
      defaultFen: "Por defecto",
      clearFen: "Borrar",
      whiteOO: "O-O Blanco",
      whiteOOO: "O-O-O Blanco",
      blackOO: "O-O Negro",
      blackOOO: "O-O-O Negro",
    },
    giveUp: {
      title: "¿Abandonar?",
      submit: "Confirmar",
      cancel: "Anular",
    },
    game: {
      outcomes: {
        gaveUp: "Partida abandonada por su oponente.",
        checkmate: "¡Jaque mate!",
        stalemate: "¡Empate!",
        perpetualDraw: "¡Igualdad por repetición triple!",
        missingMaterial: "¡Igualdad con el material que falta!",
        fiftyMovesDraw: "¡Igualdad según la regla de los 50 movimientos!",
        userLostOnTime: "¡Perdiste por tiempo muerto!",
        opponentLostOnTime: "¡Su oponente perdió por tiempo muerto!",
      },
    },
    pgn: {
      confirmationMessage: "¿Descargar el archivo PGN generado?",
    },
    generic: {
      errors: {
        failedUpdatingRoom:
          "¡No se pudo actualizar la sala en la base de datos!",
        failedReadingRoom: "¡No se pudo leer la sala de la base de datos!",
        failedDeletingFieldsFromRoom:
          "¡No se pudieron eliminar los campos en la sala de la base de datos!",
      },
    },
  },
};
