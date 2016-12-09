angular.module('goChat', ['ngWebSocket', 'angularMoment'])
  .controller('goChatController', ['$websocket', '$location', '$anchorScroll', 'amMoment', function($websocket, $location, $anchorScroll, amMoment) {

    amMoment.changeLocale('fr');

    var gc = this;
    var ws = $websocket('ws://localhost:8080/chat');

    gc.nicknameIsChoosen = false;
    gc.nickname = "";
    gc.messages = [];
    gc.clientNumber = 0;

    gc.form = {
      author: "Anonymous",
      body: ""
    };

    gc.sendMessage = function() {
      if (gc.form.author.length > 0 && gc.form.author !== "Anonymous") {
        gc.nickname = gc.form.author;
        gc.nicknameIsChoosen = true;
      }
      var message = Object.assign({ messageType: "chat_message", date: Date.now()}, gc.form);
      console.log(message);
      ws.send(message);
      cleanForm();
    };

    const MSG_TYPE_MSG = 'chat_message';
    const MSG_TYPE_NOTIFICATION = 'notification';
    const NOTIFICATION_CLIENT_NUMBER = 'client_number';

    ws.onMessage(function(message) {
      var newMessage = JSON.parse(message.data);

      console.log("New message ", newMessage);

      switch (newMessage.messageType) {
        case MSG_TYPE_MSG:
          gc.messages.push(newMessage);
          gc.scrollBottom();
          break;
        case MSG_TYPE_NOTIFICATION:
          switch (newMessage.notificationType) {
            case NOTIFICATION_CLIENT_NUMBER:
              console.log("Client number has changed");
              gc.clientNumber = newMessage.body;
              break;
            default:
              console.log("Bad notification type");
          }
          break;
        default:
          console.log("Bad message type");
      }
    });

    function cleanForm() {
      gc.form = {
        author: gc.nicknameIsChoosen ? gc.nickname : "Anonymous",
        body: ""
      };
    }

    gc.scrollBottom = function() {
      $location.hash('sb');
      $anchorScroll();
    };
  }]);