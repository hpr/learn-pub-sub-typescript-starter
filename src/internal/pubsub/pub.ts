import type { ConfirmChannel } from "amqplib";

export async function publishJSON<T>(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  value: T,
): Promise<void> {
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(value)), { contentType: "application/json" });
}