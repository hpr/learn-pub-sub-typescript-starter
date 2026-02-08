import { publishJSON } from "../internal/pubsub/pub.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { amqpConnect } from "../internal/pubsub/connect.js";

async function main() {
  const conn = await amqpConnect();
  
  const ch = await conn.createConfirmChannel();
  const state: PlayingState = { isPaused: true };
  publishJSON(ch, ExchangePerilDirect, PauseKey, state);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
