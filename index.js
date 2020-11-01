const Discord = require('discord.js');
const { token } = require('./config.json');

const client = new Discord.Client();

const nationNames = ['england', 'germany', 'russia', 'france', 'italy', 'austria', 'turkey'];
const nationToUser = new Map();
const userToNation = new Map();

const addNation = function(nation, user) {
  if (!nationNames.includes(nation)) {
    user.send(`Unknown nation ${nation}`);
    return;
  } else if (nationToUser.has(nation)) {
    user.send(`Someone has already registered as ${nation}`);
    return;
  } else if (userToNation.has(user)) {
    user.send(`You are already registered as ${userToNation.get(user)}`);
    return;
  }

  nationToUser.set(nation, user);
  userToNation.set(user, nation);
  user.send(`Registered as ${nation}!`);
};

const sendMessage = function(toNation, fromUser, message) {
  const toUser = nationToUser.get(toNation);
  const fromNation = userToNation.get(fromUser);
  if (toUser && fromNation) {
    toUser.send(`[${fromNation.toUpperCase()}] ${message}`);
  } else if (toUser) {
    fromUser.send('You have not registered as a nation!');
  } else {
    fromUser.send(`No one has registered as ${toNation}`);
  }
};

client.once('ready', () => {
  console.log('Ready!');
});

client.login(token);

client.on('message', message => {
  if (message.author.bot) {
    return;
  }
  if (message.mentions.users.size === 1 && message.mentions.users.first().id === client.user.id) {
    message.author.send('Welcome to Diplomancer!\nYou can register your nation with\n```register <nation>```To send a message to someone else type```<nation> this is my message```');
    message.author.send(`The nations are ${nationNames}`);
    return;
  }

  const content = message.content.trim();
  const index = content.indexOf(' ');
  const command = content.substring(0, index);
  const args = content.substring(index + 1);

  if (command === 'register') {
    addNation(args, message.author);
  } else if (nationNames.includes(command)) {
    sendMessage(command, message.author, args);
  }
});