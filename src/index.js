'use strict';
/**
 * A Lambda function for handling Alexa Skill MirrorMirrorOnTheWall requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa On The Wall, find Snow White."
 *  Alexa: "Yes , showing images of Snow White."
 */

const Alexa = require('alexa-sdk');

/**
 * App ID for the skill
 *
 * replace with your app ID
 */
const APP_ID = "amzn1.ask.skill.b728a918-d114-48f4-9294-33d3b40f7835";

const MirrorMirror = require('./MirrorMirror');
MirrorMirror.setup();

const Keys = require("./certs/keys.json");
const GoogleImages = require('google-images');
var googleImages = new GoogleImages(Keys.cse.ID, Keys.cse.API_key);

const YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(Keys.youtube.API_key);

var ANSWER_COUNT = 4; // The number of possible answers per trivia question.
var GAME_LENGTH = 5;  // The number of questions per trivia game.
var GAME_STATES = {
    TRIVIA: "_TRIVIAMODE", // Asking trivia questions.
    START: "_STARTMODE", // Entry point, start the game.
    HELP: "_HELPMODE" // The user is asking for help.
};
var questions = require("./questions");

exports.handler = function(event, context, callback) {
    let alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const shutWall = function(alexa, _close) {
  return new Promise((resolve) => {
    let shutOff = function() {
        _close.emit(':tellWithCard', _close.t("TURN_OFF_ALL_MODULES"), _close.t("TURN_OFF_ALL_MODULES_CARD"), _close.t("TURN_OFF_ALL_MODULES"))
    }
    resolve(alexa, MirrorMirror.changeModule('all_modules', false, shutOff));
  });
}

var languageStrings = {
    "en-US": {
        "translation": {
            "WELCOME_MESSAGE": "Hello , what can I do for you? ",
            "WELCOME_REPROMPT": "I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you?",
            "WELCOME_CARD": "Hello",
            "HELP_MESSAGE": "Hello , I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you?",
            "HELP_CARD": "Help",
            "STOP_MESSAGE": "See you next time!",
            "STOP_CARD": "Goodbye",
            "SHOW_TEXT": "Yes. %s.",
            "SHOW_TEXT_ERR": "Sorry, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you?",
            "SHOW_TEXT_CARD": "Display Text",
            "SHOW_IMAGE": "Yes, showing images of %s.",
            "SHOW_IMAGE_ERR": "Sorry, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you?",
            "SHOW_IMAGE_CARD": "Show Image",
            "TURN_ON_MODULE": "Yes, opening module %s.",
            "TURN_ON_MODULE_ERR": "Sorry, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you?",
            "TURN_ON_MODULE_CARD": "Open Module",
            "TURN_ON_ALL_MODULES": "Yes, opening all modules.",
            "TURN_ON_ALL_MODULES_CARD": "Open All Modules",
            "TURN_OFF_MODULE": "Yes, closing module %s.",
            "TURN_OFF_MODULE_ERR": "Sorry, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you?",
            "TURN_OFF_MODULE_CARD": "Close Module",
            "TURN_OFF_ALL_MODULES": "Alright",
            "TURN_OFF_ALL_MODULES_CARD": "Alright",
            "SHOW_VIDEO": "Yes, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you?",
            "SHOW_VIDEO_CARD": "Play Video",
            "ERROR_CARD": "Error"
        }
    },
    "en-GB": {
        "translation": {
            "WELCOME_MESSAGE": "Hello , what can I do for you? ",
            "WELCOME_REPROMPT": "I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you?",
            "WELCOME_CARD": "Hello",
            "HELP_MESSAGE": "Hello , I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you?",
            "HELP_CARD": "Help",
            "STOP_MESSAGE": "See you next time!",
            "STOP_CARD": "Goodbye",
            "SHOW_TEXT": "Yes. %s.",
            "SHOW_TEXT_ERR": "Sorry, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you?",
            "SHOW_TEXT_CARD": "Display Text",
            "SHOW_IMAGE": "Yes, showing images of %s.",
            "SHOW_IMAGE_ERR": "Sorry, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you?",
            "SHOW_IMAGE_CARD": "Show Image",
            "TURN_ON_MODULE": "Yes, opening module %s.",
            "TURN_ON_MODULE_ERR": "Sorry, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you?",
            "TURN_ON_MODULE_CARD": "Open Module",
            "TURN_ON_ALL_MODULES": "Yes, opening all modules.",
            "TURN_ON_ALL_MODULES_CARD": "Open All Modules",
            "TURN_OFF_MODULE": "Yes, closing module %s.",
            "TURN_OFF_MODULE_ERR": "Sorry, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you?",
            "TURN_OFF_MODULE_CARD": "Close Module",
            "TURN_OFF_ALL_MODULES": "Yes, closing all modules.",
            "TURN_OFF_ALL_MODULES_CARD": "Close All Modules",
            "SHOW_VIDEO": "Yes, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you?",
            "SHOW_VIDEO_CARD": "Play Video",
            "ERROR_CARD": "Error"
        }
    }
};



var components = [
                  "cpu + gpu",
                  "raspberry pi",
                  "alphabot kit",
                  "iot kit",
                  "amazon echo",
                  "aiy kit",
                  "leap motion controller",
                  "3d printer",
                  "proxmark 3 kit",
                  "hackrf on",
                  "ubertooth on"];

var description = [" This new computing model uses massively parallel graphics processors to accelerate applications also parallel in nature.Machine learning algorithms have lots of simple operations that don’t depend on one another. Multiple cores within a GPU can handle simple operations in parallel leading to rapid data processing"
                    ,"A credit-card sized computer that plugs into a computer monitor or TV, and uses a standard keyboard and mouse. A capable little device, it enables people of all ages to explore computing, and to learn how to program in languages like Scratch and Python."
                    ,"An amazing starter kit for robotic development, the AlphaBot robotic platform facilitates activities like line tracking, obstacle avoidance,  speed measuring, IR remote control, video monitoring via network, etc. What's more? Thanks to the rich Raspberry Pi open source resources, and the modular design of AlphaBot, you'll learn how to extend and refit, and finally build your own Raspberry Pi robot."
                    ,"The Internet of Things (IOT) devices are everyday items with added sensors, motors, and other electronics, which are connected to online services to analyse the data they collect. A way to prove or enhance your ideas or turn them into products. The kit provides all the hardware and software you need to speed up prototyping and time to production - The developer kit is optimized for rapid prototyping"
                    ,"Alexa—the brain behind Echo enables making calls and messaging. Built on the cloud, the Echo adapts to your speech patterns, vocabulary, and preferences.",
                    "This project demonstrates how to get a natural language recognizer up and running and connect it to the Google Assistant, using your AIY Projects voice kit. Along with everything the Google Assistant already does, you can add your own question and answer pairs. All in a handy little cardboard cube, powered by a Raspberry Pi.",
                    "Reach into virtual reality with your bare hands. The Leap Motion Controller captures the movement of your hands and fingers so you can interact with your computer in a whole new way",
                    "Enables creation of a physical object from a three-dimensional digital model, typically by laying down many thin layers of a material in succession",
                    "The Proxmark targets NFC and RFID frequencies that is capable of both transmitting and receiving while meeting the timing requirements of most proximity protocols",
                    "HackRF One, an open source platform which acts like a sound card of computer. The ability to process Digital Signals to Radio waveforms allowing integration of large-scale communication networks",
                    "Simulate Bluetooth connection senarios with this device"];

var handlers = {
    'LaunchRequest': function() {
        this.emit('SayHello');
    },
    'MirrorMirrorHelloIntent': function() {
        this.emit('SayHello');
    },
    'SayHello': function() {
        this.emit(':askWithCard', this.t("WELCOME_MESSAGE"), this.t("WELCOME_REPROMPT"), this.t("WELCOME_CARD"), this.t("WELCOME_MESSAGE") + this.t("WELCOME_REPROMPT"));
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':askWithCard', this.t("HELP_MESSAGE"), this.t("HELP_MESSAGE"), this.t("HELP_CARD"), this.t("HELP_MESSAGE"));
    },
    'AMAZON.StopIntent': function() {
        this.emit('StopCommand');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('StopCommand');
    },
    'StopCommand': function() {
        this.emit(':tellWithCard', this.t("STOP_MESSAGE"), this.t("STOP_CARD"), this.t("STOP_MESSAGE"));
    },
    'ShowTextIntent': function() {
        let displayText = this.event.request.intent.slots.displayText.value;
        if (displayText) {
            let alexa = this

            // Alexa voice/card response to invoke after text is published to AWS IoT successfully
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("SHOW_TEXT", displayText), alexa.t("SHOW_TEXT_CARD"), displayText)
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.displayText(displayText, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("SHOW_TEXT_ERR"), this.t("SHOW_TEXT_ERR"), this.t("ERROR_CARD"), this.t("SHOW_TEXT_ERR"))
        }
    },
    'ShowImagesIntent': function() {
        let searchTerm = this.event.request.intent.slots.searchTerm.value;
        if (searchTerm) {
            let alexa = this
            let _close = this
            // Search for images
            googleImages.search(searchTerm).then(function(images) {
                // Only https urls are allowed for the Alexa cards
                let imageObj = {
                    smallImageUrl: images[0].thumbnail.url,
                    largeImageUrl: images[0].thumbnail.url
                };

                shutWall(alexa, _close).then((alexa) => {
                  let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("SHOW_IMAGE", searchTerm), alexa.t("SHOW_IMAGE_CARD"), searchTerm, imageObj)
                  };
                  MirrorMirror.showImages(images, searchTerm, alexaEmit);
                });
                // Send publish attempt to AWS IoT
            })
        } else {
            this.emit(':askWithCard', this.t("SHOW_IMAGE_ERR"), this.t("SHOW_IMAGE_ERR"), this.t("ERROR_CARD"), this.t("SHOW_IMAGE_ERR"))
        }
    },
    'TurnOnModuleIntent': function() {
        let moduleName = this.event.request.intent.slots.moduleName.value;
        console.log("module name "+moduleName);
        if (moduleName) {
            let alexa = this
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("TURN_ON_MODULE", moduleName), alexa.t("TURN_ON_MODULE_CARD"), alexa.t("TURN_ON_MODULE", moduleName))
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.changeModule(moduleName, true, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("TURN_ON_MODULE_ERR"), this.t("TURN_ON_MODULE_ERR"), this.t("ERROR_CARD"), this.t("TURN_ON_MODULE_ERR"))
        }
    },
    'TurnOnAllModuleIntent': function() {
        let alexa = this
        let alexaEmit = function() {
            alexa.emit(':tellWithCard', alexa.t("TURN_ON_ALL_MODULES"), alexa.t("TURN_ON_ALL_MODULES_CARD"), alexa.t("TURN_ON_ALL_MODULES"))
        }
        MirrorMirror.changeModule('all_modules', true, alexaEmit);

    },
    'TurnOffModuleIntent': function() {
        let moduleName = this.event.request.intent.slots.packets.value;
        console.log("module name "+moduleName);
        if (moduleName) {
            let alexa = this
            if(moduleName.includes("video") || moduleName.includes("images") || moduleName.includes("photos") || moduleName.includes("wall")){
                let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("TURN_OFF_MODULE", "wall"), alexa.t("TURN_OFF_MODULE_CARD"), alexa.t("TURN_OFF_MODULE", "wall"))
                }
                MirrorMirror.changeModule(moduleName, false, alexaEmit);
            } else {
                let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("TURN_OFF_MODULE", moduleName), alexa.t("TURN_OFF_MODULE_CARD"), alexa.t("TURN_OFF_MODULE", moduleName))
                }
                MirrorMirror.changeModule(moduleName, false, alexaEmit);
            }
            // Send publish attempt to AWS IoT

        } else {
            this.emit(':askWithCard', this.t("TURN_OFF_MODULE_ERR"), this.t("TURN_OFF_MODULE_ERR"), this.t("ERROR_CARD"), this.t("TURN_OFF_MODULE_ERR"))
        }
    },
    'TurnOffAllModuleIntent': function() {
        let alexa = this
        let alexaEmit = function() {
            alexa.emit(':tellWithCard', alexa.t("TURN_OFF_ALL_MODULES"), alexa.t("TURN_OFF_ALL_MODULES_CARD"), alexa.t("TURN_OFF_ALL_MODULES"))
        }
        MirrorMirror.changeModule('all_modules', false, alexaEmit);

    },
    'ShowVideoIntent': function() {
        let searchTerm = this.event.request.intent.slots.searchTermVideo.value;
        if (searchTerm) {
            let alexa = this
            let _close = this
            // search for Youtube video
            youTube.search(searchTerm, 1, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(JSON.stringify(result, null, 2));

                    let imageObj = {
                        smallImageUrl: result.items[0].snippet.thumbnails.default.url,
                        largeImageUrl: result.items[0].snippet.thumbnails.high.url
                    };
                    shutWall(alexa, _close).then((alexa) => {
                      let alexaEmit = function() {
                        alexa.emit(':tellWithCard', alexa.t("SHOW_VIDEO", searchTerm), alexa.t("SHOW_VIDEO_CARD"), searchTerm, imageObj)
                      }
                      MirrorMirror.showVideo(result.items[0].id.videoId, searchTerm, alexaEmit);
                    });

                    // Send publish attempt to AWS IoT
                }
            });
        } else {
            this.emit(':askWithCard', this.t("SHOW_VIDEO_ERR"), this.t("SHOW_VIDEO_ERR"), this.t("ERROR_CARD"), this.t("SHOW_VIDEO_ERR"))
        }
    },
    'showComponentIntent': function(){
          var components =  [
                            "cpu + gpu ",
                            "raspberry pi ",
                            "AlphaBot kit ",
                            " IoT kit ",
                            "Amazon Echo ",
                            "AIY kit ",
                            "Leap motion Controller ",
                            "3D Printer ",
                            "Proxmark 3 Kit ",
                            "HackRF One ",
                            "Ubertooth One "];
          var com = "";
          for(var i=0; i<components.length;i++){
            com = com+components[i]+" ";
          }
          let alexa = this
          let _close = this
          // Alexa voice/card response to invoke after text is published to AWS IoT successfully
          shutWall(alexa, _close).then((alexa) => {
            let alexaEmit = function() {
              alexa.emit(':tellWithCard', alexa.t("SHOW_TEXT", com), alexa.t("SHOW_TEXT_CARD"), com)
            }
            MirrorMirror.displayText(com, alexaEmit);
          });

          // Send publish attempt to AWS IoT

    },
    'GetComponentInfo': function() {
        var component = this.event.request.intent.slots.comp;
        var desc="";
        if(components.indexOf(component.value.toLowerCase())>-1){
          desc = description[components.indexOf(component.value.toLowerCase())];
        } else {
            desc = "Ohh sorry we don't have that product here";
        }
        let alexa = this
        let _close = this
        shutWall(alexa, _close).then((alexa) => {
          let alexaEmit = function() {
            alexa.emit(':tellWithCard', alexa.t("SHOW_TEXT", desc), alexa.t("SHOW_TEXT_CARD"), desc)
          }
          MirrorMirror.displayText(desc,alexaEmit);
        });
    }
};
