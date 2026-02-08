import amqp from "amqplib";

async function main() {
  console.log("Starting Peril server...");
  const conn = await amqp.connect("amqp://guest:guest@localhost:5672/");
  console.log("Connection was successful");
  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await conn.close();
    process.exit()
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
