export function calculateNextScore(currentScore, addedScore, settings) {
  const nextScore = currentScore + addedScore;

  if (nextScore > settings.winPoint) {
    return {
      scoreAfter: settings.resetScoreOnBust,
      busted: true,
      won: false,
      displayScore: settings.resetScoreOnBust
    };
  }

  if (nextScore === settings.winPoint) {
    const displayScore = settings.bonusTenOnFifty
      ? settings.winPoint + 10
      : settings.winPoint;

    return {
      scoreAfter: settings.winPoint,
      busted: false,
      won: true,
      displayScore
    };
  }

  return {
    scoreAfter: nextScore,
    busted: false,
    won: false,
    displayScore: nextScore
  };
}
