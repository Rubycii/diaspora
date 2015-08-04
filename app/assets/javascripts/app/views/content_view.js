// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-v3-or-Later

app.views.Content = app.views.Base.extend({
  events: {
    "click .expander": "expandPost"
  },

  presenter : function(){
    return _.extend(this.defaultPresenter(), {
      text : app.helpers.textFormatter(this.model.get("text"), this.model.get("mentioned_people")),
      largePhoto : this.largePhoto(),
      smallPhotos : this.smallPhotos(),
      location: this.location(),
      isReshare : this.model.get("post_type") === "Reshare"
    });
  },


  largePhoto : function() {
    var photos = this.model.get("photos");
    if(!photos || photos.length === 0) { return }
    return photos[0];
  },

  smallPhotos : function() {
    var photos = this.model.get("photos");
    if(!photos || photos.length < 2) { return }
    photos.splice(0, 1); // remove first photo as it is already shown as largePhoto
    return photos;
  },

  expandPost: function(evt) {
    var el = $(this.el).find('.collapsible');
    el.removeClass('collapsed').addClass('opened');
    el.animate({'height':el.data('orig-height')}, 550, function() {
      el.css('height','auto');
    });
    $(evt.currentTarget).hide();
  },

  location: function(){
    var location = this.model.get("location")? this.model.get("location") : "";
    return location;
  },

  collapseOversized : function() {
    var collHeight = 200
      , elem = this.$(".collapsible")
      , oembed = elem.find(".oembed")
      , opengraph = elem.find(".opengraph")
      , addHeight = 0;
    if($.trim(oembed.html()) !== "") {
      addHeight += oembed.height();
    }
    if($.trim(opengraph.html()) !== "") {
      addHeight += opengraph.height();
    }

    // only collapse if height exceeds collHeight+20%
    if( elem.height() > ((collHeight*1.2)+addHeight) && !elem.is(".opened") ) {
      elem.data("orig-height", elem.height() );
      elem
        .height( Math.max(collHeight, addHeight) )
        .addClass("collapsed")
        .append(
        $('<div />')
          .addClass('expander')
          .text( Diaspora.I18n.t("show_more") )
      );
    }
  },

  postRenderTemplate : function(){
    _.defer(_.bind(this.collapseOversized, this));
    var photoAttachments = this.$(".photo_attachments");
    if(photoAttachments.length > 0) {
      new app.views.Gallery({ el: photoAttachments });
    }
  }
});

app.views.StatusMessage = app.views.Content.extend({
  templateName : "status-message"
});

app.views.ExpandedStatusMessage = app.views.StatusMessage.extend({
  postRenderTemplate : function(){
    var photoAttachments = this.$(".photo_attachments");
    if(photoAttachments.length > 0) {
      new app.views.Gallery({ el: photoAttachments });
    }
  }
});

app.views.Reshare = app.views.Content.extend({
  templateName : "reshare"
});

app.views.OEmbed = app.views.Base.extend({
  templateName : "oembed",
  events : {
    "click .thumb": "showOembedContent"
  },

  presenter:function () {
    var o_embed_cache = this.model.get("o_embed_cache");
    if(o_embed_cache) {
      var typemodel = { rich: false, photo: false, video: false, link: false };
      typemodel[o_embed_cache.data.type] = true;
      o_embed_cache.data.types = typemodel;
    }
    return _.extend(this.defaultPresenter(), {
      o_embed_html : app.helpers.oEmbed.html(o_embed_cache)
    });
  },

  showOembedContent : function (evt) {
    if( $(evt.target).is('a') ) return;
    var clickedThumb = false;
    if ($(evt.target).hasClass(".thumb")) {
      clickedThumb = $(evt.target);
    } else {
      clickedThumb = $(evt.target).parent(".thumb");
    }
    var insertHTML = $(app.helpers.oEmbed.html(this.model.get("o_embed_cache")));
    var paramSeparator = ( /\?/.test(insertHTML.attr("src")) ) ? "&" : "?";
    insertHTML.attr("src", insertHTML.attr("src") + paramSeparator + "autoplay=1&wmode=opaque");
    if (clickedThumb) {
      insertHTML.attr("width", clickedThumb.width());
      insertHTML.attr("height", clickedThumb.height());
    }
    this.$el.html(insertHTML);
  }
});

app.views.OpenGraph = app.views.Base.extend({
  templateName : "opengraph",

  initialize: function() {
    this.truncateDescription();
  },

  truncateDescription: function() {
    // truncate opengraph description to 250 for stream view
    if(this.model.has('open_graph_cache')) {
      var ogdesc = this.model.get('open_graph_cache');
      ogdesc.description = app.helpers.truncate(ogdesc.description, 250);
    }
  }
});

app.views.SPVOpenGraph = app.views.OpenGraph.extend({
  truncateDescription: function () {
    // override with nothing
  }
});

// @license-end
