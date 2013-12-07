'use strict';

angular.module('HangoutsManagerApp')
  .directive('chatMessage', function () {
    return {
      scope: {chatMessage: "="},
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        if(!scope.chatMessage) {
          return;
        }
        var messageContent = scope.chatMessage.message_content;
        angular.forEach(messageContent, function(value, key){
          if(key=='attachment') {
            for(var i = 0; i < value.length; i++) {
              if(value[i].embed_item.type[0]=='PLUS_PHOTO') {
                var plusPhoto = value[i].embed_item['embeds.PlusPhoto.plus_photo'];
                element.append('<a target="_blank" class="chat-image-holder" href="' + plusPhoto.thumbnail.url +'">' +
                                  '<img src="' + plusPhoto.thumbnail.image_url +'">' +
                               '</a>');
              }
            }
          } else if(key=='segment') {
//            console.log(value);
            for(var j = 0; j < value.length; j++) {
              var segment;
              if(value[j].type=='LINK') {
                segment = $('<a target="_blank" class="chat-link" href="'+ value[j].link_data.link_target +'"></a>').appendTo(element);
              } else if(value[j].type=='TEXT') {
                segment = $('<span></span>').appendTo(element);

                value[j].text = value[j].text.replace('\n\n', '<br/>');
              } else if(value[j].type == 'LINE_BREAK') {
                segment = $('<br/>').appendTo(element);
              } else {
                continue;
              }
              if(value[j].formatting) {
                if(value[j].formatting.bold) {
                  segment = $('<strong></strong>').appendTo(segment);
                }
                if(value[j].formatting.italics) {
                  segment = $('<em></em>').appendTo(segment);
                }
                if(value[j].formatting.strikethrough) {
                  segment = $('<del></del>').appendTo(segment);
                }
                if(value[j].formatting.underline) {
                  segment = $('<ins></ins>').appendTo(segment);
                }
              }

              segment.html(value[j].text);
            }
          }
        });
      }
    };
  });
