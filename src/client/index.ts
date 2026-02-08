import { clientWelcome } from "../internal/gamelogic/gamelogic.js";
import { amqpConnect } from "../internal/pubsub/connect.js";
import { declareAndBind } from "../internal/pubsub/pub.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";

async function main() {
  const conn = await amqpConnect();
  const username = await clientWelcome();
  const [ch, queue] = await declareAndBind(conn, ExchangePerilDirect, `${PauseKey}.${username}`, PauseKey, "transient");
  
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
