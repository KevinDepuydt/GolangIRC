// Constant
const MSG_TYPE_MSG = 'chat_message';
const MSG_TYPE_IMG = 'chat_image';
const MSG_TYPE_DRAW = 'chat_draw';
const MSG_TYPE_NOTIFICATION = 'notification';
const NOTIFICATION_CLIENT_NUMBER = 'client_number';
const CONTENT_TYPE = {
  message: MSG_TYPE_MSG,
  image: MSG_TYPE_IMG,
  draw: MSG_TYPE_DRAW
};

// App
angular.module('goChat', ['ngWebSocket', 'angularMoment', 'ngFileUpload', 'pw.canvas-painter'])
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
      gc.form = NewForm();
      gc.uploadObj = NewUploadObj();
      gc.canvasVersion = 0;

      // Messages
      gc.sendMessage = function() {
        if (gc.form.messageType === MSG_TYPE_DRAW) {
          gc.form.body = document.getElementById('drawCanvas').toDataURL("image/png");
        }
        if (gc.form.author.length > 0 && gc.form.author !== "Anonymous") {
          gc.nickname = gc.form.author;
          gc.nicknameIsChoosen = true;
        }
        var message = Object.assign({date: Date.now()}, gc.form);
        ws.send(message);
        gc.form = NewForm();
        gc.uploadObj = NewUploadObj();
        gc.canvasVersion = 0;
      };

      ws.onMessage(function(message) {
        var newMessage = JSON.parse(message.data);
        switch (newMessage.messageType) {
          case MSG_TYPE_MSG:
          case MSG_TYPE_IMG:
          case MSG_TYPE_DRAW:
            gc.messages.push(newMessage);
            gc.scrollBottom();
            break;
          case MSG_TYPE_NOTIFICATION:
            switch (newMessage.notificationType) {
              case NOTIFICATION_CLIENT_NUMBER:
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

      gc.upload = function (file) {
        Upload.upload({
          url: '/upload',
          data: {file: file}
        }).then(function (res) {
          gc.uploadObj.message = "Le fichier à bien été téléchargé";
          gc.uploadObj.filename = gc.form.body = res.data;
          gc.uploadObj.success = true;
        }, function (res) {
          gc.uploadObj.message = res.status;
          gc.uploadObj.success = false;
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
      };

      gc.setContentType = function(type) {
        if (type === MSG_TYPE_DRAW) {
          gc.form.body = "nice draw";
        } else {
          gc.form.body = "";
        }
        gc.uploadObj = NewUploadObj();
        gc.form.messageType = type;
      };

      // Clean message form
      function NewForm() {
        return {
          author: gc.nicknameIsChoosen ? gc.nickname : "Anonymous",
          body: "",
          messageType: CONTENT_TYPE.message
        };
      }

      function NewUploadObj() {
        return {
          message: "",
          success: false,
          filename: ""
        }
      }

      // Auto scroll bottom on new message
      gc.scrollBottom = function() {
        $location.hash('sb');
        $anchorScroll();
      };
  }]);