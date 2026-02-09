import type { ChannelModel, ConsumeMessage } from "amqplib";
import type { AckType, SimpleQueueType } from "./common.js"
import { declareAndBind } from "./pub.js";
import msgpack from "@msgpack/msgpack";

export async function subscribe<T>(
  conn: ChannelModel,
  exchange: string,
  queueName: string,
  routingKey: string,
  simpleQueueType: SimpleQueueType,
  handler: (data: T) => Promise<AckType> | AckType,
  unmarshaller: (data: Buffer) => T,
): Promise<void> {
  const [ch, queue] = await declareAndBind(conn, exchange, queueName, routingKey, simpleQueueType);
  ch.consume(queue.queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    const content: T = unmarshaller(msg.content);
    const ackType = await handler(content);
    console.log(`AckType: ${ackType}`);
    switch (ackType) {
      case "Ack": ch.ack(msg); break;
      case "NackRequeue": ch.nack(msg, false, true); break;
      case "NackDiscard": ch.nack(msg, false, false); break;
    }
  });
}

export const subscribeJSON = <T>(conn: ChannelModel, exchange: string, queueName: string, key: string, queueType: SimpleQueueType, handler: (data: T) => Promise<AckType> | AckType): Promise<void> =>
  subscribe(conn, exchange, queueName, key, queueType, handler, data => JSON.parse(data.toString()));

export const subscribeMsgPack = <T>(conn: ChannelModel, exchange: string, queueName: string, key: string, queueType: SimpleQueueType, handler: (data: T) => Promise<AckType> | AckType): Promise<void> =>
  subscribe(conn, exchange, queueName, key, queueType, handler, data => <T>msgpack.decode(data));
