import type { ConfirmChannel } from "amqplib";
import { clientWelcome, commandStatus, getInput, getMaliciousLog, printClientHelp, printQuit } from "../internal/gamelogic/gamelogic.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandMove } from "../internal/gamelogic/move.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { amqpConnect } from "../internal/pubsub/common.js";
import { publishJSON, publishMsgPack } from "../internal/pubsub/pub.js";
import { subscribeJSON } from "../internal/pubsub/sub.js";
import { ArmyMovesPrefix, ExchangePerilDirect, ExchangePerilTopic, GameLogSlug, PauseKey, WarRecognitionsPrefix } from "../internal/routing/routing.js";
import { handlerMove, handlerPause, handlerWar } from "./handlers.js";
import type { GameLog } from "../internal/gamelogic/logs.js";

export const publishGameLog = (ch: ConfirmChannel, username: string, message: string) => 
  publishMsgPack<GameLog>(ch, ExchangePerilTopic, `${GameLogSlug}.${username}`, { username, message, currentTime: new Date() });

async function main() {
  const conn = await amqpConnect();
  const username = await clientWelcome();
  const confirmCh = await conn.createConfirmChannel();

  const gs = new GameState(username);
  await subscribeJSON(conn, ExchangePerilDirect, `${PauseKey}.${username}`, PauseKey, "transient", handlerPause(gs));

  const movesQueueName = `${ArmyMovesPrefix}.${username}`;
  await subscribeJSON(conn, ExchangePerilTopic, movesQueueName, `${ArmyMovesPrefix}.*`, "transient", handlerMove(gs, confirmCh));

  await subscribeJSON(conn, ExchangePerilTopic, WarRecognitionsPrefix, `${WarRecognitionsPrefix}.*`, "durable", handlerWar(gs, confirmCh));

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
          if (!words[1]) throw Error("spam: duration required");
          for (let i = 0; i < +words[1]; i++)
            publishGameLog(confirmCh, username, getMaliciousLog());
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
