import { publishJSON } from "../internal/pubsub/pub.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { amqpConnect } from "../internal/pubsub/connect.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";

async function main() {
  const conn = await amqpConnect();
  const ch = await conn.createConfirmChannel();
  printServerHelp();
  while (true) {
    const words = await getInput();
    if (!words.length) continue;
    switch (words[0]) {
      case "pause":
        console.log("Sending pause message");
        publishJSON<PlayingState>(ch, ExchangePerilDirect, PauseKey, { isPaused: true });
        break;
      case "resume":
        console.log("Sending resume message");
        publishJSON<PlayingState>(ch, ExchangePerilDirect, PauseKey, { isPaused: false });
        break;
      case "quit":
        console.log("Exiting");
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
