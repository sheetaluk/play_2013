var SpotifyDomObj = {
  current_playlist: " ",

  init: function ( ) {
    SpotifyDomObj.showNonSpecificElements();
    SpotifyDomObj.showAllPlaylists();
    $("#search-input").TrackSearchViewClass();
    $("#add-new-playlist-button").NewPlaylistCreateViewClass();
    $("#delete-playlist-button").PlaylistDeleteViewClass();
    $("#add-to-playlist-dropdown").TrackAddViewClass();
    $("#remove-tracks-button").TrackRemoveViewClass();
  },

  TracksTable: {
    addTracks: function ( tracks ) {
      SpotifyDomObj.TracksTable.clearTracks();
      $.each(tracks, function(index, track) {
        $('#tracks-table tbody tr:last')
          .after('<tr><td><input type="checkbox" id="'
            +track["external-ids"][0].id
            +'" name="track" /></td><td>'
            +track.name
            +'</td><td>'
            +track.album.name
            +'</td></tr>');
        var lastRow = $('#tracks-table tr:last');
        lastRow.data('trackInfo', track);
        lastRow.data('trackId', track["external-ids"][0].id);
      });
    },

    removeTracks: function ( ) {
      $("input:checkbox[name=track]:checked").each(function() {
        $(this).closest('tr').remove();
      });
    },

    clearTracks: function ( ) {
      $("input:checkbox[name=track]").each(function() {
        $(this).closest('tr').remove();
      });
    }
  },

  showAllPlaylists: function ( ) {
    $.each(Playlist.getAllPlaylistNames(), function(index, playlist) {
      SpotifyDomObj.addPlaylist( playlist );  
    });
  },

  addPlaylist: function ( playlistName ) {
    $("#playlists")
      .prepend("<li contenteditable='true' class='playlists playlistName-"
        +playlistName
        +"'>"
        +playlistName+"</li>");

    var tmpPlaylist = $("#playlists li:first-child");
    tmpPlaylist.PlaylistViewClass();
    tmpPlaylist.trigger('click').focus();
    $("#add-to-playlist-dropdown")
      .append($("<option />").val(playlistName).html(playlistName));
  },

  updatePlaylistNameInDom: function ( oldPlaylistName, newPlaylistName ) {
    $("#add-to-playlist-dropdown option[value='"+oldPlaylistName+"']")
      .attr("value",newPlaylistName).html(newPlaylistName);
    $("#playlists li.playlistName-"+oldPlaylistName)
    .removeClass("playlistName-"+oldPlaylistName).addClass("playlistName-"+newPlaylistName);
    SpotifyDomObj.changePageHeading(newPlaylistName);
  },

  deletePlaylistFromDom: function ( playlistName ) {
    this.current_playlist = " ";
    $("#playlists .playlistName-"+playlistName).remove();
    $("#add-to-playlist-dropdown option[value='"+playlistName+"']").remove();
    this.showNonSpecificElements();
  },

  showPlaylist: function ( playlistName ) {
    this.showPlaylistElements(playlistName);
    this.TracksTable.addTracks(this.current_playlist.getTracks());
  },

  showTrackSearch: function ( tracks ) {
    this.showTrackSearchElements();
    this.TracksTable.addTracks(tracks);
  },

  changePageHeading: function ( headingString ) {
    $("#right-panel header h3").html(headingString);
  },
  
  showPlaylistElements: function ( playlistName ) {
    $("#remove-tracks-button").show();
    $("#delete-playlist-button").show();
    this.changePageHeading(playlistName);
    this.TracksTable.clearTracks();
    $("#tracks-table").show(playlistName);
    $("#add-to-playlist-dropdown").hide();
  },

  resetPlaylistSelect: function( ) {
    $("#add-to-playlist-dropdown").val("_select_playlist");
  },

  showTrackSearchElements: function ( ) {
    $("#remove-tracks-button").hide();
    $("#delete-playlist-button").hide();
    this.resetPlaylistSelect();
    $("#tracks-table").show();
    this.changePageHeading("Search");
    this.TracksTable.clearTracks();
    $("#add-to-playlist-dropdown").show();
  },
  
  showNonSpecificElements: function ( ) {
    $("#remove-tracks-button").hide();
    $("#delete-playlist-button").hide();
    $("#tracks-table").hide();
    $("#add-to-playlist-dropdown").hide();
    this.changePageHeading("Add Playlist or Search Tracks");
  }
};

var PlaylistViewClass = {
  init: function ( options, elem ) {
    this.options = $.extend(this.options, options);
    this.$elem = $(elem);
    this.playlistName = $(elem).html();
    this.eventify();
  },

  options: {
  },

  eventify: function ( ) {
    var that = this;

    this.$elem.live('click', function() {
      SpotifyDomObj.current_playlist = Playlist.get(that.playlistName);
      SpotifyDomObj.showPlaylist(that.playlistName);
    });    

    this.$elem.blur(function() {
      if($(this).html() !== that.playlistName) {
        var oldPlaylistName = that.playlistName;
        SpotifyDomObj.current_playlist =
          SpotifyDomObj.current_playlist.setName($(this).html());
        that.playlistName = $(this).text();
        SpotifyDomObj.updatePlaylistNameInDom(oldPlaylistName, that.playlistName);
      }
    });
  }
};

var PlaylistDeleteViewClass = {
  init: function ( options, elem ) {
    this.options = $.extend(this.options, options);
    this.$elem = $(elem);
    this.eventify();
  },

  options: {
  },
 
  eventify: function ( ) {
    this.$elem.click(function() {
      SpotifyDomObj.current_playlist.remove();
      SpotifyDomObj.deletePlaylistFromDom(SpotifyDomObj.current_playlist.name);
    });
  }
};


var NewPlaylistCreateViewClass = {
  init: function ( options, elem ) {
    this.options = $.extend(this.options, options);
    this.$elem = $(elem);
    this.eventify();
  },

  options: {
    playlistName: "new playlist"
  },
 
  eventify: function ( ) {
    var that = this;

    this.$elem.click(function() {
      var currentTimestamp = new Date().getTime();
      var myNewPlaylist = Object.create(Playlist);
      myNewPlaylist.name = that.options.playlistName.replace(" ","__")+currentTimestamp;
      myNewPlaylist.save();
      SpotifyDomObj.addPlaylist(myNewPlaylist.name);
    });
  }
};


var TrackSearchViewClass = {
  init: function ( options, elem ) {
    this.options = $.extend(this.options, options);
    this.$elem = $(elem);
    this.eventify();
  },

  options: {
  },
 
  eventify: function ( ) {
    this.$elem.keypress(function(event) {
      // if enter key
      if(event.which === 13) {
        var inputString = 
          $.trim("http://ws.spotify.com/search/1/track.json?q="+encodeURIComponent($(this).val()));
        if(inputString !== '') {
          jQuery.get(inputString, function(data){
              SpotifyDomObj.showTrackSearch(data.tracks);  
          });
        }
      }
    });
  }
};

var TrackAddViewClass = {
  init: function( options, elem ) {
    this.options = $.extend(this.options, options);
    this.$elem = $(elem);
    this.tracks = [];
    this.playlist = " ";
    this.eventify();
  },

  options: {
  },
 
  eventify: function ( ) {
    var that = this;
    this.$elem.change(function() {
      that.tracks = [];
      that.playlist = $(this).val();
      $("input:checkbox[name=track]:checked").each(function() {
        that.tracks.push($(this).closest('tr').data('trackInfo')); 
      });
      Playlist.addTracksToPlaylist(that.playlist, that.tracks);
    });
  }
};

var TrackRemoveViewClass = {
  init: function ( options, elem ) {
    this.options = $.extend(this.options, options);
    this.$elem = $(elem);
    this.trackIds = [];
    this.eventify();
  },

  options: {
  },
 
  eventify: function ( ) { 
    var that = this;
    this.$elem.live('click',function() {
      $("input:checkbox[name=track]:checked").each(function() {
        that.trackIds.push($(this).closest('tr').data('trackId'));  
      });
      SpotifyDomObj.current_playlist.removeTracks(that.trackIds);
      SpotifyDomObj.TracksTable.removeTracks(that.trackIds);
    });
  }
};

(function($) {
  $.fn.extend({
    NewPlaylistCreateViewClass: function ( options ) {
      return this.each(function() {
        var myNewPlaylistCreateViewClass = Object.create(NewPlaylistCreateViewClass);

        myNewPlaylistCreateViewClass.init(options, this);
        $(this).data('NewPlaylistCreateViewClass', myNewPlaylistCreateViewClass);
      });  
    },

    PlaylistViewClass: function( options ) {
      return this.each(function() {
        var myPlaylistViewClass = Object.create(PlaylistViewClass);

        myPlaylistViewClass.init(options, this);
        $(this).data('PlaylistViewClass', myPlaylistViewClass);
      });  
    },

    PlaylistDeleteViewClass: function ( options ) {
      return this.each(function() {
        var myPlaylistDeleteViewClass = Object.create(PlaylistDeleteViewClass);

        myPlaylistDeleteViewClass.init(options, this);
        $(this).data('PlaylistDeleteViewClass', myPlaylistDeleteViewClass);
      });  
    },

    TrackSearchViewClass: function ( options ) {
      return this.each(function() {
        var myTrackSearchViewClass = Object.create(TrackSearchViewClass);

        myTrackSearchViewClass.init(options, this);
        $(this).data('TrackSearchViewClass', myTrackSearchViewClass);
      });  
    },

    TrackAddViewClass: function ( options ) {
      return this.each(function() {
        var myTrackAddViewClass = Object.create(TrackAddViewClass);

        myTrackAddViewClass.init(options, this);
        $(this).data('TrackAddViewClass', myTrackAddViewClass);
      });  
    },

    TrackRemoveViewClass: function ( options ) {
      return this.each(function() {
        var myTrackRemoveViewClass = Object.create(TrackRemoveViewClass);

        myTrackRemoveViewClass.init(options, this);
        $(this).data('TrackRemoveViewClass', TrackRemoveViewClass);
      });  
    }
  });
})(jQuery);

var Playlist = {
  trackIds: [],
  name: " ",
  spotifyPlaylistStartWithString: 'SPOTIFY.playlist.',

  getSpotifyLocalStoragePlaylistName: function ( playlistName ) {
    return this.spotifyPlaylistStartWithString+playlistName;
  },

  save: function ( ) {
    localStorage.setItem(
      this.getSpotifyLocalStoragePlaylistName(this.name), JSON.stringify(this));
    return this;
  },

  get: function ( playlistName ) {
    var storedPlaylist = 
      JSON.parse(localStorage.getItem(this.getSpotifyLocalStoragePlaylistName(playlistName)));
    var tmpPlaylist =  Object.create(Playlist);
    tmpPlaylist.name = storedPlaylist.name;
    tmpPlaylist.trackIds = storedPlaylist.trackIds || [];
    return tmpPlaylist;
  },
  
  setName: function ( newName ) {
    this.remove();
    this.name = newName;
    this.save();
    return this;
  },

  remove: function ( ) {
    localStorage.removeItem(this.getSpotifyLocalStoragePlaylistName(this.name));
  },

  getAllPlaylistNames: function ( ) {
    var playlistNames = [];
    var key;

    for (var i = 0; i < window.localStorage.length; i++) {
      key = window.localStorage.key(i);
      if (0 === key.indexOf(this.spotifyPlaylistStartWithString)) {
        playlistNames.push(key.slice(17));
      }
    }
    return playlistNames;
  },

  removeTracks: function ( trackIdsToRemove ) {
    var tmpIndex;
    for(var i = 0; i < trackIdsToRemove.length; i++) {
      tmpIndex = this.trackIds.indexOf(trackIdsToRemove[i]);
      if ( tmpIndex >= 0) {
        this.trackIds.splice(tmpIndex, 1);
      }
    }
    this.save();
    return this;
  },

  addTracksToPlaylist: function ( playlistName, tracks) {
    var myPlaylist = Playlist.get(playlistName);
    for ( var i = 0; i < tracks.length; i++) {
      var currentTrackId = tracks[i]["external-ids"][0].id;
      if ( myPlaylist.trackIds.indexOf(currentTrackId) < 0 ) {
        myPlaylist.trackIds.push(currentTrackId);
      }
      Track.save(tracks[i]);
    }
    return myPlaylist.save();
  },

  getTracks: function ( ) {
    var tracksForPlaylist = [];
    for( var i = 0; i < this.trackIds.length; i++) {
      tracksForPlaylist.push(Track.get(this.trackIds[i]));
    }
    return tracksForPlaylist;
  }
};

var Track = {
  spotifyTrackStartWithString: 'SPOTIFY.track.',

  getSpotifyLocalStorageTrackId: function ( trackId ) {
    return this.spotifyTrackStartWithString+trackId;
  },

  save: function ( trackInfo ) {
    localStorage
      .setItem(this.getSpotifyLocalStorageTrackId(trackInfo["external-ids"][0].id), 
        JSON.stringify(trackInfo));
    return this;
  },
  get: function ( trackId ) {
    return JSON.parse(localStorage.getItem(this.getSpotifyLocalStorageTrackId(trackId)));
  }
};