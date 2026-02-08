import { clientWelcome, commandStatus, getInput, printClientHelp, printQuit } from "../internal/gamelogic/gamelogic.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandMove } from "../internal/gamelogic/move.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { amqpConnect } from "../internal/pubsub/common.js";
import { publishJSON } from "../internal/pubsub/pub.js";
import { subscribeJSON } from "../internal/pubsub/sub.js";
import { ArmyMovesPrefix, ExchangePerilDirect, ExchangePerilTopic, PauseKey } from "../internal/routing/routing.js";
import { handlerMove, handlerPause } from "./handlers.js";

async function main() {
  const conn = await amqpConnect();
  const username = await clientWelcome();

  const gs = new GameState(username);
  await subscribeJSON(conn, ExchangePerilDirect, `${PauseKey}.${username}`, PauseKey, "transient", handlerPause(gs));

  const movesQueueName = `${ArmyMovesPrefix}.${username}`;
  await subscribeJSON(conn, ExchangePerilTopic, movesQueueName, `${ArmyMovesPrefix}.*`, "transient", handlerMove(gs));

  const confirmCh = await conn.createConfirmChannel();
  while (true) {
    try {
      const words = await getInput();
      if (!words.length) continue;
      switch (words[0]) {
        case "spawn":
          commandSpawn(gs, words);
          break;
        case "move":
          const move = commandMove(gs, words);
          publishJSON(confirmCh, ExchangePerilTopic, movesQueueName, move);
          console.log("Move published successfully");
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
