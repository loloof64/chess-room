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
      submit: "Créer",
      cancel: "Annuler",
    },
    joinRoom: {
      title: "Rejoindre un salon",
      labels: {
        nickname: "Votre pseudo",
        roomId: "Id du salon",
      },
      placeholders: {
        nickname: "pseudo",
        roomId: "id",
      },
      errors: {
        emptyNickname: "Le pseudo ne doit pas être vide !",
        tooShortNickname: "Le pseudo doit contenir au moins 4 caractères !",
        emptyRoomId: "L'id du salon ne doit pas être vide !",
        noMatchingRoom: "Aucun salon ne correspond !",
        alreadyFilledRoom: "Ce salon est déjà occupé !",
        failedJoiningRoom: "Erreur en tentant de rejoindre le salon !",
        userLostOnTime: "Vous avez perdu au temps !",
        opponentLostOnTime: "Votre adversaire a perdu au temps !",
      },
      submit: "Joindre",
      cancel: "Annuler",
    },
    newGame: {
      title: "Nouvelle partie",
      submit: "Confirmer",
      cancel: "Annuler",
      hasWhite: "Avez-vous les Blancs ?",
      hasWhiteYes: "Oui",
      hasWhiteNo: "Non",
      minutes: "minutes",
      seconds: "secondes",
      increment: "incrément (s)",
      includeTime: "Jouer avec la pendule ?",
      includeTimeYes: "Oui",
      includeTimeNo: "Non",
      timeSetToZero: "Vous avez donné un temps de 0 (sans compter l'incrément) !",
      editStartPosition: "Éditer",
      copyFen: "Copier FEN",
      pasteFen: "Coller FEN",
      resetFen: "Réinitialiser",
      defaultFen: "Par défaut",
      clearFen: "Effacer",
      whiteOO: "O-O Blanc",
      whiteOOO: "O-O-O Blanc",
      blackOO: "O-O Noir",
      blackOOO: "O-O-O Noir",
      enPassantLabel: "En passant",
      noEnPassant: "Aucun",
      nullityHalfMovesCount: "Demi-coups pour la nulle",
      moveNumber: "Numéro de coup",
      oveNumber: "Movimiento número",
      copiedPosition: "Position copiée dans le porte-papiers.",
      refusedCopyingPosition: "Position illégale ! Vérifiez tous les paramètres !",
      cannotCopyFromClipboard: "Impossible de récupérer du texte à partir du presse-papier !",
      illegalPositionFromClipboard: "Le presse-papier ne contient pas de position légale !",
    },
    giveUp: {
      title: "Abandonner ?",
      submit: "Confirmer",
      cancel: "Annuler",
    },
    game: {
      outcomes: {
        gaveUp: "Partie abandonnée par votre adversaire.",
        checkmate: "Échec et mat !",
        stalemate: "Pat !",
        perpetualDraw: "Nulle par triple répétition !",
        missingMaterial: "Nulle par manque de matériel !",
        fiftyMovesDraw: "Nulle par la règle des 50 coups !",
        userLostOnTime: "Vous avez perdu au temps !",
        opponentLostOnTime: "Votre adversaire a perdu au temps !",
      },
    },
    pgn: {
      confirmationMessage: "Télécharger le fichier PGN généré ?",
    },
    generic: {
      errors: {
        failedUpdatingRoom:
          "Échec de mise à jour du salon dans la base de données !",
        failedReadingRoom:
          "Échec de lecture du salon depuis la base de données !",
          failedDeletingFieldsFromRoom: "Échec de suppression de données du salon dans la base de données !"
      },
    },
  },
};
