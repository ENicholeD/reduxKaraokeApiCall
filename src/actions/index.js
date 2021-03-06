import * as types from "./../constants/ActionTypes";
import v4 from 'uuid/v4';

export const nextLyric = (currentSongId) => ({
    type: types.NEXT_LYRIC,
    currentSongId
  });

  export const restartSong = (currentSongId) => ({
      type: types.RESTART_SONG,
      currentSongId
  });
  
  export const changeSong = (newSelectedSongId) => ({
    type: types.CHANGE_SONG,
    newSelectedSongId
  });

  export const requestSong = (title, localSongId) => ({
    type: types.REQUEST_SONG,
    title,
    songId: localSongId
  });
  
  export function fetchLyrics(title, artist, musicMatchId, localSongId, dispatch) {
    return fetch('http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' + musicMatchId + '&apikey=271afdce6ff3866141de1b9f7477fd64').then(
      response => response.json(),
      error => console.log('An error occurred.', error)
    ).then(function(json) {
      if (json.message.body.lyrics) {
        let lyrics = json.message.body.lyrics.lyrics_body;
        lyrics = lyrics.replace('"', '');
        const songArray = lyrics.split(/\n/g).filter(entry => entry!="");
        dispatch(receiveSong(title, artist, localSongId, songArray));
        dispatch(changeSong(localSongId));
      } else {
        console.log('We couldn\'t locate lyrics for this song!');
      }
    });
  }

  export const receiveSong = (title, artist, songId, songArray) => ({
    type: types.RECEIVE_SONG,
    songId,
    title,
    artist,
    songArray,
    receivedAt: Date.now()
  });

  // Takes the 'title' from our form as argument:
  export function fetchSongId(title) {
      // Notice the entire method actually returns a function!
      return function(dispatch) {
            // Creates a local ID with UUID:
          const localSongId = v4();
          // Replaces spaces in the user-provided song title with underscores
    // because our API URL cannot contain spaces:
          title = title.replace(' ', '_');
           // Returns the result of the fetch() function contacting the API
    // endpoint, with our title parameters added to request URL
          return fetch('http://api.musixmatch.com/ws/1.1/track.search?&q_track='  + title + '&page_size=1&s_track_rating=desc&apikey=271afdce6ff3866141de1b9f7477fd64')
          // .then() waits until code preceding it completes. So, code here
    // will not run until fetch() returns data from the API:
          .then(
               // Retrieves JSON response from API:
              response => response.json(),
              // Prints any errors to the console IF call is unsuccessful:
              error => console.log('An error occured.', error))
              // Waits until code preceding it finishes to run.
      // The return value from first then() block (API response) is passed to second
      // .then() block as parameter 'json':
          .then(function(json){
            if (json.message.body.track_list.length > 0) {
              const musicMatchId = json.message.body.track_list[0].track.track_id;
              const artist = json.message.body.track_list[0].track.artist_name;
              console.log(artist);
              const title = json.message.body.track_list[0].track.track_name;
              console.log(title);
              fetchLyrics(title, artist, musicMatchId, localSongId, dispatch);
            } else {
              console.log('We couldn\'t locate a song under that ID!');
            }
          });

          
          
    
      };

      
  }