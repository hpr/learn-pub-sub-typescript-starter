import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/pub.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";

async function main() {
  console.log("Starting Peril server...");
  const conn = await amqp.connect("amqp://guest:guest@localhost:5672/");
  console.log("Connection was successful");
  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await conn.close();
    process.exit()
  });
  
  const ch = await conn.createConfirmChannel();
  const state: PlayingState = { isPaused: true };
  await publishJSON(ch, ExchangePerilDirect, PauseKey, state);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
