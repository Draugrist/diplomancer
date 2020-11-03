const Discord = require('discord.js');
const fs = require('fs');
const { token } = require('./config.json');

const client = new Discord.Client();

const nationNames = ['england', 'germany', 'russia', 'france', 'italy', 'austria', 'turkey'];
const flags = {
  'england': 'flag_gb',
  'germany': 'flag_de',
  'russia': 'flag_ru',
  'france': 'flag_fr',
  'italy': 'flag_it',
  'austria': 'flag_at',
  'turkey': 'flag_tr',
  'global': 'flag_eu',
};

const nationFile = 'nations.json';
const userFile = 'users.json';

const readFile = function (name) {
  if (fs.existsSync(name)) {
    console.log(`Reading file ${name}`);
    return JSON.parse(fs.readFileSync(name));
  } else {
    return {};
  }
};

const nationToUser = readFile(nationFile);
const userToNation = readFile(userFile);

const writeFile = function (name, content) {
  console.log(`Writing file ${name}`);
  fs.writeFileSync(name, JSON.stringify(content));
};

const addNation = function (nation, user) {
  if (!nationNames.includes(nation)) {
    user.send(`Unknown nation ${nation}`);
    return;
  } else if (nation in nationToUser) {
    user.send(`Someone has already registered as ${nation}`);
    return;
  } else if (user.id in userToNation) {
    user.send(`You are already registered as ${userToNation.get(user.id)}`);
    return;
  }

  nationToUser[nation] = user.id;
  userToNation[user.id] = nation;
  writeFile(nationFile, nationToUser);
  writeFile(userFile, userToNation);
  user.send(`Registered as ${nation}!`);
};

const sendMessage = function(toNation, fromUser, message, global = false) {
  const userId = nationToUser[toNation];
  const fromNation = userToNation[fromUser.id];
  if (userId && fromNation) {
    client.users.fetch(userId).then(user => {
      if (user) {
        const flagCode = flags[fromNation.toLowerCase()];
        const prefix = global ? 'GLOBAL/' : '';
        user.send(`[${prefix + fromNation.toUpperCase()} :${flagCode}:]  ${message}`);
      }
    });
  } else if (userId) {
    fromUser.send('You have not registered as a nation!');
  } else if (!global) {
    fromUser.send(`No one has registered as ${toNation}`);
  }
};

const sendMessageToAll = function (fromUser, message) {
  const fromNation = userToNation[fromUser.id];
  nationNames.forEach(nation => {
    if (fromNation !== nation) {
      sendMessage(nation, fromUser, message, true);
    }
  });
};

const parseCommandName = function (command) {
  let parsedCommand = command;
  if (command.length === 1) {
      nationNames.forEach(nation => {
        if (nation.startsWith(command)) {
          parsedCommand = nation;
        }
      });
    }
  }
  return parsedCommand;
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
  if (message.channel.type !== 'dm') {
    return;
  }

  const content = message.content.trim();
  const index = content.indexOf(' ');
  const command = parseCommandName(content.substring(0, index).toLowerCase());
  const args = content.substring(index + 1);

  if (command === 'register') {
    addNation(args.toLowerCase(), message.author);
  } else if (command === 'global') {
    sendMessageToAll(message.author, args);
  } else if (nationNames.includes(command)) {
    sendMessage(command, message.author, args);
  }
});