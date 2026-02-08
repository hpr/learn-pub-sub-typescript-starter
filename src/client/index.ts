import { clientWelcome, commandStatus, getInput, printClientHelp, printQuit } from "../internal/gamelogic/gamelogic.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandMove } from "../internal/gamelogic/move.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { amqpConnect } from "../internal/pubsub/common.js";
import { subscribeJSON } from "../internal/pubsub/sub.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import { handlerPause } from "./handlers.js";

async function main() {
  const conn = await amqpConnect();
  const username = await clientWelcome();

  const gs = new GameState(username);
  const pauseQueueName = `${PauseKey}.${username}`;
  await subscribeJSON(conn, ExchangePerilDirect, pauseQueueName, PauseKey, "transient", handlerPause(gs));
  while (true) {
    try {
      const words = await getInput();
      if (!words.length) continue;
      switch (words[0]) {
        case "spawn":
          commandSpawn(gs, words);
          break;
        case "move":
          commandMove(gs, words);
          break;
        case "status":
          await commandStatus(gs);
          break;
        case "help":
          printClientHelp();
          break;
        case "spam":
          console.log("Spamming not allowed yet!");
          break;
        case "quit":
          printQuit();
          process.kill(process.pid, "SIGINT");
          break;
        default:
          console.log("I don't understand the command");
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
