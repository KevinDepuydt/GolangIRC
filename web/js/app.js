// Constant
const MSG_TYPE_MSG = 'chat_message';
const MSG_TYPE_NOTIFICATION = 'notification';
const NOTIFICATION_CLIENT_NUMBER = 'client_number';

// App
angular.module('goChat', ['ngWebSocket', 'angularMoment', 'ngFileUpload'])
  .controller('goChatController', ['$websocket', '$location', '$anchorScroll', 'amMoment', 'Upload',
    function($websocket, $location, $anchorScroll, amMoment, Upload) {
      // modules config
      amMoment.changeLocale('fr');

      // Controller variables
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

      // Messages
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

      // Uploads
      gc.uploadMessage = "";
      gc.uploadFileSrc = "";
      gc.uploadSuccess = false;

      gc.upload = function (file) {
        gc.uploadMessage = "";
        gc.uploadFileSrc = "";
        gc.uploadSuccess = false;
        Upload.upload({
          url: '/upload',
          data: {file: file}
        }).then(function (res) {
          console.log('Success : file name return by server ' + res.data);
          gc.uploadMessage = "Le fichier à bien été téléchargé";
          gc.uploadFileSrc = res.data;
          gc.uploadSuccess = true;
        }, function (res) {
          console.log('Error status: ' + res.status);
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
      };

      // Clean message form
      function cleanForm() {
        gc.form = {
          author: gc.nicknameIsChoosen ? gc.nickname : "Anonymous",
          body: ""
        };
      }

      // Auto scroll bottom on new message
      gc.scrollBottom = function() {
        $location.hash('sb');
        $anchorScroll();
      };
  }]);