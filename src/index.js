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
            "TURN_OFF_ALL_MODULES": "Yes, closing all modules.",
            "TURN_OFF_ALL_MODULES_CARD": "Close All Modules",
            "SHOW_VIDEO": "Yes, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you?",
            "SHOW_VIDEO_CARD": "Play Video",
            "ERROR_CARD": "Error",
            "QUESTIONS" : questions["QUESTIONS_EN_US"],
            "GAME_NAME" : "Reindeer Trivia", // Be sure to change this for your skill.
            "HELP_MESSAGE": "I will ask you %s multiple choice questions. Respond with the number of the answer. " +
            "For example, say one, two, three, or four. To start a new game at any time, say, start game. ",
            "REPEAT_QUESTION_MESSAGE": "To repeat the last question, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to start playing?",
            "HELP_REPROMPT": "To give an answer to a question, respond with the number of the answer. ",
            "STOP_MESSAGE": "Would you like to keep playing?",
            "CANCEL_MESSAGE": "Ok, let\'s play again soon.",
            "NO_MESSAGE": "Ok, we\'ll play another time. Goodbye!",
            "TRIVIA_UNHANDLED": "Try saying a number between 1 and %s",
            "HELP_UNHANDLED": "Say yes to continue, or no to end the game.",
            "START_UNHANDLED": "Say start to start a new game.",
            "NEW_GAME_MESSAGE": "Welcome to %s. ",
            "WELCOME_MESSAGE": "I will ask you %s questions, try to get as many right as you can. " +
            "Just say the number of the answer. Let\'s begin. ",
            "ANSWER_CORRECT_MESSAGE": "correct. ",
            "ANSWER_WRONG_MESSAGE": "wrong. ",
            "CORRECT_ANSWER_MESSAGE": "The correct answer is %s: %s. ",
            "ANSWER_IS_MESSAGE": "That answer is ",
            "TELL_QUESTION_MESSAGE": "Question %s. %s ",
            "GAME_OVER_MESSAGE": "You got %s out of %s questions correct. Thank you for playing!",
            "SCORE_IS_MESSAGE": "Your score is %s. "
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
            "ERROR_CARD": "Error",
            "QUESTIONS" : questions["QUESTIONS_EN_US"],
            "GAME_NAME" : "Reindeer Trivia", // Be sure to change this for your skill.
            "HELP_MESSAGE": "I will ask you %s multiple choice questions. Respond with the number of the answer. " +
            "For example, say one, two, three, or four. To start a new game at any time, say, start game. ",
            "REPEAT_QUESTION_MESSAGE": "To repeat the last question, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to start playing?",
            "HELP_REPROMPT": "To give an answer to a question, respond with the number of the answer. ",
            "STOP_MESSAGE": "Would you like to keep playing?",
            "CANCEL_MESSAGE": "Ok, let\'s play again soon.",
            "NO_MESSAGE": "Ok, we\'ll play another time. Goodbye!",
            "TRIVIA_UNHANDLED": "Try saying a number between 1 and %s",
            "HELP_UNHANDLED": "Say yes to continue, or no to end the game.",
            "START_UNHANDLED": "Say start to start a new game.",
            "NEW_GAME_MESSAGE": "Welcome to %s. ",
            "WELCOME_MESSAGE": "I will ask you %s questions, try to get as many right as you can. " +
            "Just say the number of the answer. Let\'s begin. ",
            "ANSWER_CORRECT_MESSAGE": "correct. ",
            "ANSWER_WRONG_MESSAGE": "wrong. ",
            "CORRECT_ANSWER_MESSAGE": "The correct answer is %s: %s. ",
            "ANSWER_IS_MESSAGE": "That answer is ",
            "TELL_QUESTION_MESSAGE": "Question %s. %s ",
            "GAME_OVER_MESSAGE": "You got %s out of %s questions correct. Thank you for playing!",
            "SCORE_IS_MESSAGE": "Your score is %s. "
        }
    }
};

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

            // Search for images
            googleImages.search(searchTerm).then(function(images) {
                // Only https urls are allowed for the Alexa cards
                let imageObj = {
                    smallImageUrl: images[0].thumbnail.url,
                    largeImageUrl: images[0].thumbnail.url
                };
                let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("SHOW_IMAGE", searchTerm), alexa.t("SHOW_IMAGE_CARD"), searchTerm, imageObj)
                }

                // Send publish attempt to AWS IoT
                MirrorMirror.showImages(images, searchTerm, alexaEmit);
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
        let moduleName = this.event.request.intent.slots.moduleName.value;
        console.log("module name "+moduleName);
        if (moduleName) {
            let alexa = this
            if(moduleName.contains("video") || moduleName.contains("images") || moduleName.contains("photos")){
                let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("TURN_OFF_MODULE", "the wall"), alexa.t("TURN_OFF_MODULE_CARD"), alexa.t("TURN_OFF_MODULE", "the wall"))
                }
            } else {
                let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("TURN_OFF_MODULE", moduleName), alexa.t("TURN_OFF_MODULE_CARD"), alexa.t("TURN_OFF_MODULE", moduleName))
                }
            }
            // Send publish attempt to AWS IoT
            MirrorMirror.changeModule(moduleName, false, alexaEmit);
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
                    let alexaEmit = function() {
                        alexa.emit(':tellWithCard', alexa.t("SHOW_VIDEO", searchTerm), alexa.t("SHOW_VIDEO_CARD"), searchTerm, imageObj)
                    }

                    // Send publish attempt to AWS IoT
                    MirrorMirror.showVideo(result.items[0].id.videoId, searchTerm, alexaEmit);
                }
            });
        } else {
            this.emit(':askWithCard', this.t("SHOW_VIDEO_ERR"), this.t("SHOW_VIDEO_ERR"), this.t("ERROR_CARD"), this.t("SHOW_VIDEO_ERR"))
        }
    },
    'showComponentIntent': function(){
          var components = ["daisy biosensing board","headset","gold cup electrodes","conductive paste","leap motion vr kit","cpu + gpu","oculus rift","raspberry pi 3 model b starter kit","starter sensor kit","robotics starter kit","touch screen ","basic electronics kit","rfid kit","gps modules","gsm module","sensor kit","usb to ttl cable","fingerprint sensor","gps antenna","gps cable","camera","soldering iron","multimeter","solder wire","ipad pro wifi ","amazon echo","ubertooth","rubber ducky","proxmark3 kit","3d printer","3d printer spool"];
          for(var i=0; i<components.length;i++){
            com = com+components[i]+" ";
          }
          let alexa = this

          // Alexa voice/card response to invoke after text is published to AWS IoT successfully
          let alexaEmit = function() {
              alexa.emit(':tellWithCard', alexa.t("SHOW_TEXT", com), alexa.t("SHOW_TEXT_CARD"), com)
          }

          // Send publish attempt to AWS IoT
          MirrorMirror.displayText(com, alexaEmit);

    }
};
