import { clientWelcome, commandStatus, getInput, printClientHelp, printQuit } from "../internal/gamelogic/gamelogic.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandMove } from "../internal/gamelogic/move.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { amqpConnect } from "../internal/pubsub/connect.js";
import { declareAndBind } from "../internal/pubsub/pub.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";

async function main() {
  const conn = await amqpConnect();
  const username = await clientWelcome();
  const [ch, queue] = await declareAndBind(conn, ExchangePerilDirect, `${PauseKey}.${username}`, PauseKey, "transient");

  const gs = new GameState(username);
  while (true) {
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
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
