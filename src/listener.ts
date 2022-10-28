import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to Nats');

  const options = stan
    .subscriptionOptions()
    // this option makes it so that you have to acknowledge you received
    // the event.  That way, you do not lose information on the events
    // you have processed.
    .setManualAckMode(true);

  const subscription = stan.subscribe(
    'ticket:created',
    // you need to put in a group for listeners.  That way, if you
    // have more than one, they do not all get the events, it is spread out
    'orders-service-queue-group',
    options
  );

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    console.log('received!');

    if (typeof data === 'string') {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    // need this line in order to confirm that you have processed the event
    msg.ack();
  });
});
