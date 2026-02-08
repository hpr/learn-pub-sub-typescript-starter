import type { ArmyMove } from "../internal/gamelogic/gamedata.js";
import type { GameState, PlayingState } from "../internal/gamelogic/gamestate.js";
import { handleMove, MoveOutcome } from "../internal/gamelogic/move.js";
import { handlePause } from "../internal/gamelogic/pause.js";
import type { AckType } from "../internal/pubsub/common.js";

export const handlerPause = (gs: GameState): (ps: PlayingState) => AckType => {
  return (ps: PlayingState) => {
    handlePause(gs, ps);
    process.stdout.write("> ");
    return "Ack";
  };
};

export const handlerMove = (gs: GameState): (move: ArmyMove) => AckType => {
  return (move: ArmyMove) => {
    const outcome = handleMove(gs, move);
    process.stdout.write("> ");
    switch (outcome) {
      case MoveOutcome.Safe:
      case MoveOutcome.MakeWar:
        return "Ack";
      case MoveOutcome.SamePlayer:
      default:
        return "NackDiscard";
    }
  };
};
