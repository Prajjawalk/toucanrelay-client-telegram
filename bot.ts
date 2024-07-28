import { Bot } from "grammy";
import "dotenv/config";

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(process.env.BOT_API_TOKEN as string); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) =>
  ctx.reply(
    "Welcome to ToucanRelay bot. To relay the transaction enter command: /send <IPFS Hash> <Receiver's Address>"
  )
);

bot.command("help", async (ctx) => {
  const msg = `🎉 Welcome to ToucanRelay Bot! 🎉
  
  Here are the commands to get you started -
  
  /start - get started with Toucanrelay magic using this command
  /help - got struck and need some help, try this one!
  /send - relay transaction with this command
  `;
  await ctx.reply(msg);
});

bot.command("send", async (ctx) => {
  try {
    const arg = ctx.match;
    const [ipfsHash, receiverAddress] = arg.split(" ");

    const resp = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, {
      method: "GET",
    });

    const proofData = await resp.json();

    proofData["receiverAddress"] = receiverAddress;

    const txResp = await fetch(
      `${process.env.TOUCAN_RELAY_SERVER}/api/discordbot`,
      {
        method: "POST",
        body: JSON.stringify(proofData),
      }
    );

    const txData = await txResp.json();
    ctx.reply(
      `Transaction successful! Checkout https://sepolia.arbiscan.io/tx/${txData.transaction}`,
      {
        reply_parameters: {
          message_id: ctx.message?.message_id as number,
        },
      }
    );
  } catch (e) {
    console.log(e);
    await ctx.reply(`Error relaying, please check input and try again!`, {
      reply_parameters: {
        message_id: ctx.message?.message_id as number,
      },
    });
  }
});

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.api
  .setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "send", description: "Relay transaction" },
    { command: "help", description: "Help command" },
  ])
  .then(() => bot.start());
