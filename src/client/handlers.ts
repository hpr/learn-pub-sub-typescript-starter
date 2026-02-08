import type { GameState, PlayingState } from "../internal/gamelogic/gamestate.js";
import { handlePause } from "../internal/gamelogic/pause.js";

export const handlerPause = (gs: GameState): (ps: PlayingState) => void => {
  return (ps: PlayingState) => {
    handlePause(gs, ps);
    console.log("> ");
  };
};
