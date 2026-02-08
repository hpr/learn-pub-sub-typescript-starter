import amqp from "amqplib";

export const amqpConnect = async () => {
  console.log("Starting Peril server...");
  const conn = await amqp.connect("amqp://guest:guest@localhost:5672/");
  console.log("Connection was successful");
  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await conn.close();
    process.exit()
  });
  return conn;
};
