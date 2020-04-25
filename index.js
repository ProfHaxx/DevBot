const {Client, RichEmbed} = require('discord.js');
const ytdl = require("ytdl-core");
const secret = require('./bot-secret');

const client = new Client();

const token = secret.token;
const name = 'Quorra'; //Ava, Ash, Roy, Jason

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
    /*For commands*/
    if(msg.content.charAt(0) == prefix) {
        let args = msg.content.substring(prefix.length).split(" ");
        switch(args[0]) {
			case 'help':
				msg.reply(
						"\n[Help]\n" +
						prefix+"help        -> Shows this list.\n" + 
						prefix+"ping        -> Displays Connection Speed to the Server\n" + 
						prefix+"dev         -> Shows the Developer\n" + 
						prefix+"info [args] -> Prints information for the supplied argument\n" + 
						prefix+"play [link] -> Plays Music from YouTube\n" + 
						prefix+"skip        -> Skips current Song\n" + 
						prefix+"stop        -> Stops Music");
				break;
            case 'ping':
                msg.channel.send("Pong!");
                break;
            case 'dev':
                msg.channel.send("Developer: ProfHaxx");
                break;
			case 'suggest':
				suggestions.push(msg.content);
				break;
            case 'info':
                switch (args[1]) {
                    case 'version':
                        msg.channel.send("1.0.2");
                        break;
                    case 'bot':
                        msg.channel.send(`${name} was created by ProfHaxx at 01.01.2020`);
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
    } else {
        if((msg.content.includes("Hi") || msg.content.includes("Hello") || msg.content.includes("Hey")) && msg.content.includes(name)) {
            msg.reply("Hello " + msg.author.username + ". Can I help you?");
        } else if(msg.content.toLowerCase().includes("play") && msg.content.includes(name) && 
                (msg.content.toLowerCase().includes("music")||msg.content.toLowerCase().includes("track"))) {
			if(msg.content.toLowerCase().includes("electronic") || msg.content.toLowerCase().includes("ncs")) {
                playList(ncs, msg);
			} else if(msg.content.toLowerCase().includes("epic") || msg.content.toLowerCase().includes("heroic")) {
                playList(epic, msg);
            } else if(msg.content.toLowerCase().includes("power") || msg.content.toLowerCase().includes("workout")) {
                playList(work, msg);
            } else {
				msg.channel.send("I can play electronic, epic and powerful music yet. For suggestions feel free to use +suggest [Suggestion]");
			}
		} else if((msg.content.toLowerCase().includes("joke")) && msg.content.includes(name)) {
            msg.reply(jokes[Math.round(Math.random()*(jokes.length-1))]);
        } else if((msg.content.toLowerCase().includes("riddle")) && msg.content.includes(name)) {
            msg.reply(riddles[Math.round(Math.random()*(riddles.length-1))]);
        } else if((msg.content.toLowerCase().includes("quote")) && msg.content.includes(name)) {
            msg.channel.send("> " + quotes[Math.round(Math.random()*(quotes.length-1))]);
        } else if(msg.content.includes(name)) {
			msg.reply("Hello " + msg.author.username + ". By typing '+help' you can find out what I can do at this point in time.");
		}
    }

	console.log(suggestions);
    /* For usual messages */
});

/*Logs the Bot in*/
client.login(token);


//CONSTANTS

var epic = [
    "https://www.youtube.com/watch?v=uYcIkwOv1tE", //Audiomachine - Dauntless
    "https://www.youtube.com/watch?v=rR0nFmn3XS8", //Audiomachine - Nothing to prove to You
    "https://www.youtube.com/watch?v=7ww_WOb5ais", //Audiomachine - Through the Darkness
    "https://www.youtube.com/watch?v=kUrlZAEndws", //Audiomachine - Age of Dragons
    "https://www.youtube.com/watch?v=BVomQtrtMTM", //Tom Day - Who we want to be
    "https://www.youtube.com/watch?v=MS6ffDHYGZM", //Tom Day - Never Give Up
    "https://www.youtube.com/watch?v=3dpNKdVYST4", //Tom Day - Crossroads
    "https://www.youtube.com/watch?v=95ghfm0vlrs", //Peter Roe - Last Reunion
    "https://www.youtube.com/watch?v=lgVCIBj8qdU", //Two Steps from Hell - Victory
    "https://www.youtube.com/watch?v=vsi1ivi03sE" //Two Steps from Hell - Star Sky
];
var work = [
    "https://www.youtube.com/watch?v=d-kwsG-6Mqg", //50 Cent - Ready for War (Instrumental)
    "https://www.youtube.com/watch?v=fCebJodm0lY", //John Quintero - 300 Violin Orchestra
    "https://www.youtube.com/watch?v=9XNYqOJmqHU", //NEFFEX - Rumors
    "https://www.youtube.com/watch?v=2aMTP6Sxywk", //NEFFEX - Fight Back
    "https://www.youtube.com/watch?v=Ccsh_-Cucl4", //NEFFEX - Soldier
    "https://www.youtube.com/watch?v=Z6L4u2i97Rw", //NEFFEX - Careless
    "https://www.youtube.com/watch?v=_70Q-Xj3rEo", //NEFFEX - Never Give Up
    "https://www.youtube.com/watch?v=24C8r8JupYY", //NEFFEX - Destiny
    "https://www.youtube.com/watch?v=FHW7rIRQl38", //NEFFEX - Things are Gonna get Better
    "https://www.youtube.com/watch?v=_MTbjHKtobY", //NEFFEX - Crown
    "https://www.youtube.com/watch?v=3uBus1Gduq4", //NEFFEX - Light it Up
    "https://www.youtube.com/watch?v=xGTju1I-xFU", //NEFFEX - Unstoppable
    "https://www.youtube.com/watch?v=83RUhxsfLWs", //NEFFEX - Greatful
    "https://www.youtube.com/watch?v=TPCaWQQo11A", //NEFFEX - Life
    "https://www.youtube.com/watch?v=WzQBAc8i73E", //NEFFEX - Cold
    "https://www.youtube.com/watch?v=AHhiRc0Lnq4", //NEFFEX - Lit
    "https://www.youtube.com/watch?v=dC1s0tSsTjo", //NEFFEX - Blow Up
    "https://www.youtube.com/watch?v=0Wa_CR0H8g4", //NEFFEX - Best of me
    "https://www.youtube.com/watch?v=eIeWkOZKidM", //NEFFEX - Flirt
    "https://www.youtube.com/watch?v=FKcDtEtT3wU", //NEFFEX - Pro
    "https://www.youtube.com/watch?v=ErI60JSppdE", //NEFFEX - Head Down
    "https://www.youtube.com/watch?v=W7NWnqB8dQE", //NEFFEX - Graveyard
    "https://www.youtube.com/watch?v=ec6e20BynJI", //NEFFEX - No Sleep
    "https://www.youtube.com/watch?v=EZAnBqnQ_PU", //NEFFEX - Greatest
    "https://www.youtube.com/watch?v=ib9HZzZhG7I", //NEFFEX - Watch Me
    "https://www.youtube.com/watch?v=5fSYGKYDK5E", //NEFFEX - Self Made
    "https://www.youtube.com/watch?v=hyygwbVNI20", //NEFFEX - R.I.P.
    "https://www.youtube.com/watch?v=DcfVqJV8-YM", //NEFFEX - Hype
    "https://www.youtube.com/watch?v=t89lMHr844s", //NEFFEX - Hometown
    "https://www.youtube.com/watch?v=bttuJLPw1o0" //NEFFEX - Save Me 
];
var sad = [];
var happy = [];
var ncs = [
    "https://www.youtube.com/watch?v=ojiGKxIKrWw", //Vexento - Home
	"https://www.youtube.com/watch?v=cOoGIy4C5eY", //Vexento - Tevo
	"https://www.youtube.com/watch?v=ZLhfr8mpzxU", //Vexento - Masked Heroes
	"https://www.youtube.com/watch?v=zHUxhb5-e4w", //Vexento - Masked Raver
	"https://www.youtube.com/watch?v=zUNZLlt39ZA", //Vexento - Return of the Raver
    "https://www.youtube.com/watch?v=2N4t_kChuiU", //Vexento - We are one
    "https://www.youtube.com/watch?v=mWXnlvAlj2w", //Vexento - Spirit
    "https://www.youtube.com/watch?v=a5S-m1g8_sY", //Vexento - Affectus
    "https://www.youtube.com/watch?v=e8yu_k-JBvE", //Vexento - Pollen
    "https://www.youtube.com/watch?v=iHaEVhwxdZM", //Vexento - Glow
    "https://www.youtube.com/watch?v=3qTOgiBVSDc", //Vexento - Happiness
    "https://www.youtube.com/watch?v=6bdyffPwWrA", //Vexento - F17
    "https://www.youtube.com/watch?v=FE2GQB37G1A", //Vexento - Where we belong
    "https://www.youtube.com/watch?v=HlSopqiw0k0", //Vexento - Sunrise
    "https://www.youtube.com/watch?v=d2Ltl8Af0fA", //Vexento - Guava Breeze
    "https://www.youtube.com/watch?v=li6dhoAENjo", //Vexento - Dancing in the Dark
    "https://www.youtube.com/watch?v=p_QxJvLuD_w", //Vexento - Mid-Air
    "https://www.youtube.com/watch?v=WFw2Ij1t2PU", //Vexento - Sakura
    "https://www.youtube.com/watch?v=o5ozNwRGwiw" //Vexento - Ascend
];
//Instrumental
var medieval = [];
var asian = [];


var jokes = [
    "What's the best thing about Switzerland? - I don't know, but the flag's a big plus!",
    "I invented a new word! - Plagiarism",
    "Did you heard about the mathematician who was afraid of negative numbers? He will stop at nothing to avoid them.",
    "Heard about the new Restaurant called Karma? - There is no menu. You get what you deserve.",
    "Did you hear about the actor who fell through the floorboards? He was just going through a stage.",
    "Did you hear about the claustrophobic astronaut? - He just needed a little space.",
    "Why don't scientists trust atoms? - Because they make up anything.",
    "Where are the average things manufactored? At the satisfactory!",
    "What's the difference between cats and commas? A cat has paws at the end of paws. A comma is a pause at the end of a clause.",
    "What did the 0 said to the 8? Nice belt.",
    "What do you call a magic dog? A labracadabrador.",
    "What did the buffalo say when his son left for college? - Bison.",
    "What is an astronauts favorite part of computer? - The Space Bar",
    "What do you call an apology written in dots and dashes? - A Re-Morse Code.",
    "Did you hear about the two guys who stole a calendar? - They each got 6 months.",
    "What breed of dog can jump higher than buildings? -Any dog, because buildings can't jump!",
    "How many times can you subtract 10 for 100? Once. The next time you would be subtracting 10 from 90.",
    "Why did the M&M go to school? It wanted to be a Smartie.",
    "Why aren't koalas actuals bears? They don't meet the koalafications.",
    "How do you throw a space party? You planet.",
    "The number 19 and 20 got into a fight. 21.",
    "What do you call a train carrying a bubblegum? A chew-chew train.",
    "You enter the high school lab and see an experiment. How will you know which class is it?\n" + 
    "If it’s green and wiggles, it’s biology.\nIf it stinks, it’s chemistry.\nIf it doesn’t work, it’s physics.",
    "A neutron walks into a bar and asks, 'How much for a whiskey?' The bartender smiles and says, 'For you, no charge.'",
    "One says, 'I’ll have an ‎H2O.' The other says, 'I’ll have an ‎H2O, too.' The second chemist dies.",
    "What should you do if no one laughs at your chemistry jokes? Keep telling them until you get a reaction.",
    "I tried writing jokes about the periodic table, but I realized I wasn’t quite in my element.",
    "Want to hear a joke about sodium, bromine, and oxygen? NaBrO.",
    "Did you hear about oxygen’s date with potassium? It went OK.",
    "What’s a chemist’s favorite type of dog? -A Laboratory retriever.",
    "What’s the difference between chemistry jokes and physics jokes? Chemistry jokes can be funny periodically, but physics jokes have more potential.",
    "Why did the attacking army use acid? To neutralize the enemy’s base.",
    "Why did the bear dissolve in water? It was a polar bear.",
    "I dare you to lower your body temperature to absolute zero. I'll promise you'll be 0K.",
    "I would tell another chemistry joke, but all the good ones Argon.",
    "I was reading a book on helium. I couldn’t put it down.",
    "Did you hear oxygen and magnesium got together?? OMg",
    "Sign at a music shop: 'Gone chopin. Bach in a minute.'",
    "A photon is going through airport security. The TSA agent asks if he has luggage. The photon says 'No, I'm traveling light'",
    "The bartender says: 'we don't serve time travelers in here.' A time traveler walks into a bar."
];

var quotes = [ //[https://www.brainyquote.com]
    "But man is not made for defeat. A man can be destroyed but not defeated. - E. Hemingway",
    "When you reach the end of your rope, tie a knot in it and hang on. - F.D. Roosevelt",
    "There is nothing permanent except change. - Heraclitus",
    "You cannot shake hands with a clenched fist. - I. Gandhi",
    "Learning never exhausts the mind. - L. da Vinci",
    "There is no charm equal to tenderness of heart. - J. Austen",
    "Good judgment comes from experience, and a lot of that comes from bad judgment. - W. Rogers",
    "Life without love is like a tree without blossoms or fruit. - K. Gibran",
    "Think in the morning. Act in the noon. Eat in the evening. Sleep in the night. - W. Blake",
    "No act of kindness, no matter how small, is ever wasted. - Aesop",
    "Love cures people - both the ones who give it and the ones who receive it. - K.A. Menninger",
    "It is far better to be alone, than to be in bad company. - G. Washington",
    "Work like you don't need the money. Love like you've never been hurt. Dance like nobody's watching. - S. Paige",
    "If you cannot do great things, do small things in a great way. - N. Hill",
    "The supreme art of war is to subdue the enemy without fighting. - Sun Tzu", //SUN TZU
    "If you know your enemy and you know yourself you need not fear the results of a hundred battles. - Sun Tzu",
    "He will win when he knows when to fight and when not to fight. - Sun Tzu",
    "Be extremly subtle, even to the point of formlessness. Be extremly mysterious, even to the point of soundlessness. Thereby you can be the director of your opponents fate - Sun Tzu.",
    "Regard your soldiers as your children, and they will follow you into the deepest valleys; look on them as your own beloved sons, and they will stand by you even unto death. - Sun Tzu",
    "Keep your face always toward the sunshine - and shadows will fall behind you. - W. Whitman",
    "Being entirely honest with oneself is a good exercise. - S. Freud",
    "Love has no age, no limit; and no death. - J. Galsworthy",
    "You can't blame gravity for falling in love. - A. Einstein",
    "There is only one corner of the universe you can be certain of improving, and that's your own self. - A. Huxley",
    "Honesty is the first chapter in the book of wisdom. - T. Jefferson",
    "The journey of a thousand miles begins with one step. - Lao Tzu", //LAO TZU
    "If you do not change direction, you may end up where you are heading. - Lao Tzu",
    "The key to growth is the introduction of higher dimensions of consciousness into our awareness. - Lao Tzu",
    "Knowing others is wisdom, knowing yourself is Enlightenment. - Lao Tzu",
    "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. - Lao Tzu",
    "Truthful words are not beautiful; beautiful words are not truthful. Good words are not persuasive; persuasive words are not good. - Lao Tzu",
    "A leader is best when people barely know he exists, when his work is done, his aim fulfilled, they will say: we did it ourselves. - Lao Tzu",
    "Be content with what you have; rejoice in the way things are. When you realize there is nothing lacking, the whole world belongs to you. - Lao Tzu",
    "Mastering others is strength. Mastering yourself is true power.- Lao Tzu",
    "I believe it is impossible to be sure of anything. - Han Fei",
    "The best preparation for tomorrow is doing your best today. - H.J. Brown (Jr.)",
    "There are two ways of spreading light: to be the candle or the mirror that reflects it. - E. Wharton",
    "Ever tried. Ever failed. No matter. Try Again. Fail again. Fail better. - S. Beckett",
    "Coming together is a beginning; keeping together is progress; working together is success. - E.E. Hale",
    "God gave us the gift of life; it is up to us to give ourselves the gift of living well. - Voltaire", 
    "Not all those who wander are lost. - J.R.R. Tolkien",
    "Whoever is happy will make others happy too. - A. Frank",
    "I have not failed. I've just found 10,000 ways that won't work. - T. A. Edison",
    "Tell me and I forget. Teach me and I remember. Involve me and I learn. - B. Franklin",
    "There is nothing on this earth more to be prized than true friendship. - T. Aquinas",
    "A leader is one who knows the way, goes the way, and shows the way. - J.C. Maxwell",
    "Very little is needed to make a happy life; it is all within yourself, in your way of thinking. - M. Aurelius",
    "There is only one happiness in this life, to love and be loved. - G. Sand",
    "If opportunity doesn't knock, build a door. - M. Berle",
    "The secret of getting ahead is getting started. - M. Twain",
    "Let us be grateful to people who make us happy, they are the charming gardeners who make our souls blossom. - M. Proust",
    "Always remember that you are absolutely unique. Just like everyone else. - M. Mead",
    "Wise men speak because they have something to say; Fools because they have to say something. - Plato",
    "The World is my country, all mankind are my brethren, and to do good is my religion. - T. Paine",
    "Problems are not stop signs, they are guidelines. - R.H. Schuller",
    "What we achieve inwardly will change outer reality. - Plutarch",
    "Spread love everywhere you go. Let no one ever come to you without leaving happier. - Mother Teresa",
    "We love life, not because we are used to living but because we are used to loving. - F. Nietzschke",
    "All our dreams can come true, if we have the courage to pursue them. - W. Disney",
    "We know what we are, but know not what we may be. - W. Shakespeare", //SHAKESPEARE
    "All the world's a stage, and all the men and women merely players: they have their exits and their entrances; and one man in his time plays many parts, his acts being seven ages. - W. Shakespeare",
    "Give every man thy ear, but few thy voice. - W. Shakespeare",
    "A single rose can be my garden... a single friend, my world. - L. Buscaglia",
    "Friends show their love in times of trouble, not in happiness. - Euripides",
    "You don't choose your family. They are God's gift to you, as you are to them. - D. Tutu",
    "Life is not a problem to be solved, but a reality to be experienced. - S. Kierkegaard",
    "Life isn't about finding yourself. Life is about creating yourself. - G.B. Shaw",
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "Everything has beauty, but not everyone sees it. - Confucius",
    "Believe you can and you're halfway there. - T. Roosevelt",
    "Happiness resides not in possessions, and not in gold, happiness dwells in the soul. - Democritus",
    "The future belongs to those who believe in the beauty of their dreams. - E. Roosevelt",
    "Today you are you! That is truer than true! There is no one alive who is you-er than you! - Dr. Seuss",
    "Education is the most powerful weapon which you can use to change the world. - N. Mandela",
    "Change your thoughts and you change your world. - N.V. Peale",
    "In three words I can sum up everything I've learned about life: it goes on. - R. Frost",
    "Love isn't something you find. Love is something that finds you. - L. Young",
    "Blessed are the hearts that can bend; they shall never be broken. - A. Camus",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - W. Churchill",
    "I will not follow where the path may lead, but I will go where there is no path, and I will leave a trail. - M. Strode",
    "Where there is love there is life. - M. Gandhi",
    "One of the most beautiful qualities of true friendship is to understand and to be understood. - L.A. Seneca",
    "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment. - Buddha", //BUDDHA
    "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear. - Buddha",
    "A jug fills drop by drop - Buddha",
    "Work out your own salvation. Do not depend on others. - Buddha",
    "Just as treasures are uncovered from the earth, so virtue appears from good deeds, and wisdom appears from a pure and peaceful mind. To walk safely through the maze of human life, one needs the light of wisdom and the guidance of virtue. - Buddha",
    "Those who are free of resentful thoughts surely find peace. - Buddha",
    "Peace comes from within, do not search from without. - Buddha",
    "Don't judge each day by the harvest you reap but by the seeds that you plant. - R.L. Stevenson",
    "Nothing is impossible, the word itself says 'I'm possible'! - A. Hepburn",
    "Find a place inside where there's joy, and the joy will burn out the pain. - J. Campbell",
    "Try to be a rainbow in someone's cloud. - M. Angelou",
    "Love is composed of a single soul inhabiting two bodies. - Aristotle", //ARISTOTLE
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "It is the mark of an educated mind to be able to entertain a thought without accepting it - Aristotle",
    "I have gained this from philosophy: that I do without being commanded what others do only from fear of the law. - Aristotle",
    "Well begun is half done - Aristotle"
];

var riddles = [
    "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? ||The Echo||",
    "You measure my life in hours and I serve you by expiring. I’m quick when I’m thin and slow when I’m fat. The wind is my enemy. ||A Candle||",
    "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I? ||A Map||",
    "What is seen in the middle of March and April that can’t be seen at the beginning or end of either month? ||The Letter R||",
    "You see a boat filled with people. It has not sunk, but when you look again you don’t see a single person on the boat. Why? ||All people are married.||",
    "What word in the English language does the following: the first two letters signify a male, the first three letters signify a female, the first four letters signify a great, while the entire world signifies a great woman. What is the word? ||Heroine||",
    "What English word has three consecutive double letters? ||Bookkeeper||",
    "A girl has as many brothers as sisters, but each brother has only half as many brothers as sisters. How many brothers and sisters are there in the family? ||Four sisters and three brothers.||",
    "What disappears as soon as you say its name? ||Silence||",
    "I have keys, but no locks and no rooms. You can enter, but you can’t go outside. What am I? ||A keyboard||",
    "How many letters are in the alphabet? ||11 ('the alphabet')||",
    "This belongs to you, but everyone else uses it. ||Your name||",
    "First you eat me, then you get eaten. What am I? ||A fishhook||",
    "What comes once in a minute, twice in a moment, but never in a thousand years? ||The Letter M||",
    "Which word in the dictionary is always spelled incorrectly? ||Incorrectly||",
    "What can you hold in your right hand, but never in your left hand? ||Your left hand.||",
    "How can you physically stand behind your father while he is standing behind you? ||You stand back-to-back.||",
    "What is greater than god, more evil than the devil. The poor have it, while the Rich need it. If you eat it you die!!! ||Nothing||",
    "What is taken before you can get it. ||A picture||"
];
var puns = [];
