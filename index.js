const {Client, RichEmbed} = require('discord.js');
const ytdl = require("ytdl-core");
const constant = require('./constants');

const client = new Client();

const token = constant.token;
const name = 'Quorra'; //Ava, Ash, Roy, Jason
const version = "1.1.0";

const prefix = "!";
var servers = {};
var suggestions = [];

client.on('ready', () => {
    console.log('Dev Bot is online!');
});

/*
    ping
    dev
    info (version/bot/server/self)
    clear [num]
*/

/*
    msg.content (Content of the Message)
    msg.reply(text) (Reply text to the author of the message in the same channel)
    msg.channel.send(text) (Send a Message in the same channel as the writer has written in)
    msg.channel.bulkDelete(num) (Delete last num messages)

    msg.author.username (Username)
    msg.author.id (User ID)
    msg.author.avatarURL (User Thumbnail)
*/



//Play Music Function
function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
    server.queue.shift();
    server.dispatcher.on("end", function(){
        if(server.queue[0]) {
            play(connection, message);
        } else {
            connection.disconnect();
        }
    });
}

//Play Playlist Function
function playList(list, msg) {
    if(!msg.member.voiceChannel) {
        msg.channel.send("You must be in a Voice Channel to play a song!");
        return;
    }
    
    if(!servers[msg.guild.id]) servers[msg.guild.id] = {
        queue: []
    }
    
    var server = servers[msg.guild.id];
    //Load 10 Random Tracks
    for(i = 0; i < 10; i++) {
        var sel = list[Math.round(Math.random()*(list.length-1))];
        server.queue.push(sel);
    }
    //Join and Play
    if(!msg.guild.voiceConnection) msg.member.voiceChannel.join().then(function(connection){
        play(connection, msg);
    });
}

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
  if (!channel) return;
  channel.send(`Welcome to the server, ${member}`);
});

client.on('message', msg => {
    if(msg.content.charAt(0) == prefix) {
        let args = msg.content.substring(prefix.length).split(" ");
        switch(args[0]) {
			case 'help':
				msg.reply(
						"\n[Help]\n" +
						prefix+"help           -> Shows this list.\n" + 
						prefix+"ping           -> Pong!\n" + 
						prefix+"dev            -> Shows the Developer\n" + 
						prefix+"info [args]    -> Prints information for the supplied argument\n" +
						prefix+"version        -> Prints current version\n" +
						prefix+"suggest [msg]  -> Suggest something\n" +
						prefix+"play [link]    -> Plays Music from YouTube\n" + 
						prefix+"skip           -> Skips current Song\n" + 
						prefix+"stop           -> Stops Music");
				break;
            case 'ping':
                msg.channel.send("Pong!");
                break;
            case 'dev':
                msg.channel.send("Developer: ProfHaxx");
                break;
			case 'suggest':
				suggestions.push(msg.content);
				console.log(suggestions);
				break;
            case 'info':
                switch (args[1]) {
                    case 'version':
                        msg.channel.send("1.0.2");
                        break;
                    case 'bot':
                        msg.channel.send(`${name} (v1.0.0) was created by ProfHaxx at 01.01.2020`);
                        break;
                    case 'server':
                        msg.channel.send(`Server name: ${msg.guild.name}\nTotal members: ${msg.guild.memberCount}`);
                        break;
                    case 'self':
                        const embed = new RichEmbed()
                        .setTitle("User Information")
                        .addField("User Name", msg.author.username)
                        .addField("User ID", msg.author.id, true)
                        .setColor(0x52ECCC)
                        .setFooter(`${msg.author.username}'s Information`)
                        .setThumbnail(msg.author.avatarURL);
                        msg.channel.send(embed);
                        break;
                    case 'help':
                        msg.channel.send("[Info-Utility] Arguments: version, bot, server, self");
                        break;
                    case '':
                        msg.channel.send(`I'm ${name} (${version})`);
                    default:
                        msg.channel.send("Invalid Arguments. Possible Arguments: version, bot, server, self");
                        break;
                }
                break;
            case 'clear':
                if(!args[1]) return msg.reply('Error: Missing second argument');
                msg.channel.bulkDelete(args[1]);
                break;
            case 'play':
                var patt = /https:\/\/www.youtube.com\/watch\?v=/g;

                if(!msg.member.voiceChannel) {
                    msg.channel.send("You must be in a Voice Channel to play a song!");
                    return;
                }

                if(!args[1] && patt.test(args[1])) {
                    msg.channel.send("You need to provide a correct link!");
                    return;
                }

                if(!servers[msg.guild.id]) servers[msg.guild.id] = {
                    queue: []
                }

                var server = servers[msg.guild.id];

                server.queue.push(args[1]);
                msg.channel.send("Adding the song to the queue.");

                if(!msg.guild.voiceConnection) msg.member.voiceChannel.join().then(function(connection){
                    play(connection, msg);
                });

                break;
            case 'skip':
                var server = servers[msg.guild.id];
                msg.channel.send("Skipping the current Song.");
                if(server.dispatcher) server.dispatcher.end();
                break;

            case 'stop':
                var server = servers[msg.guild.id];
                for(var i = server.queue.length - 1; i>=0; i--) {
                    server.queue.splice(i, 1);
                }
                server.dispatcher.end();
                msg.channel.send("Ending the queue. Leaving the Voice Channel.");

                if(msg.guild.connection) message.guild.voiceConnection.disconnect();
                break;
        }
    } else if(msg.content.includes(name)) {
        switch(constant.keywords(msg.content)) {
            case 1:
                playList(constant.ncs, msg);
                break;
            case 2:
                playList(constant.work, msg);
                break;
            case 3:
                playList(constant.epic, msg);
                break;
            case 4:
                msg.channel.send("I can play electronic, epic and powerful music yet. For suggestions feel free to use +suggest [Suggestion]");
                break;
            case 5:
                msg.reply(constant.jokes[Math.round(Math.random()*(constant.jokes.length-1))]);
                break;
            case 6:
                msg.reply(constant.quotes[Math.round(Math.random()*(constant.quotes.length-1))]);
                break;
            case 7:
                msg.reply(constant.riddles[Math.round(Math.random()*(constant.riddles.length-1))]);
                break;
            case 8:
                msg.reply("Hello " + msg.author.username + ". How can I help you?");
                break;
            default:
                msg.reply("Hello " + msg.author.username + ". By typing '" + prefix +"help' you can find out what I can do at this point in time.");
                break;
        }
    }
});

client.login(token);
