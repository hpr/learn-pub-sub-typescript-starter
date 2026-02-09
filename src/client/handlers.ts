import type { ConfirmChannel } from "amqplib";
import type { ArmyMove, RecognitionOfWar } from "../internal/gamelogic/gamedata.js";
import type { GameState, PlayingState } from "../internal/gamelogic/gamestate.js";
import { handleMove, MoveOutcome } from "../internal/gamelogic/move.js";
import { handlePause } from "../internal/gamelogic/pause.js";
import { handleWar, WarOutcome } from "../internal/gamelogic/war.js";
import type { AckType } from "../internal/pubsub/common.js";
import { publishJSON } from "../internal/pubsub/pub.js";
import { ExchangePerilTopic, WarRecognitionsPrefix } from "../internal/routing/routing.js";

export const handlerPause = (gs: GameState): (ps: PlayingState) => AckType => {
  return (ps: PlayingState) => {
    handlePause(gs, ps);
    process.stdout.write("> ");
    return "Ack";
  };
};

export const handlerMove = (gs: GameState, ch: ConfirmChannel): (move: ArmyMove) => AckType => {
  return (move: ArmyMove) => {
    const outcome = handleMove(gs, move);
    process.stdout.write("> ");
    switch (outcome) {
      case MoveOutcome.Safe:
        return "Ack";
      case MoveOutcome.MakeWar:
        publishJSON<RecognitionOfWar>(ch, ExchangePerilTopic, `${WarRecognitionsPrefix}.${gs.getUsername()}`, {
          attacker: move.player,
          defender: gs.getPlayerSnap(),
        });
        return "NackRequeue";
      case MoveOutcome.SamePlayer:
      default:
        return "NackDiscard";
    }
  };
};

export const handlerWar = (gs: GameState): (rw: RecognitionOfWar) => AckType => {
  return (rw: RecognitionOfWar) => {
    const resolution = handleWar(gs, rw);
    process.stdout.write("> ");
    switch (resolution.result) {
      case WarOutcome.NotInvolved: return "NackRequeue";
      case WarOutcome.NoUnits: return "NackDiscard";
      case WarOutcome.OpponentWon:
      case WarOutcome.YouWon:
      case WarOutcome.Draw:
        return "Ack";
      default:
        console.error("Unrecognized resolution");
        process.stdout.write("> ");
        return "NackDiscard";
    }
  };
}