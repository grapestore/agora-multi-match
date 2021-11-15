
/*
 *  These procedures use Agora Video Call SDK for Web to enable local and remote
 *  users to join and leave a Video Call channel managed by Agora Platform.
 */



/*
 *  Create an {@link https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/iagorartcclient.html|AgoraRTCClient} instance.
 *
 * @param {string} mode - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/clientconfig.html#mode| streaming algorithm} used by Agora SDK.
 * @param  {string} codec - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/clientconfig.html#codec| client codec} used by the browser.
 */
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
/*
 * Clear the video and audio tracks used by `client` on initiation.
 */
var localTracks = {
  audioTrack: null
};

/*
 * On initiation no users are connected.
 */
var remoteUsers = {};

/*
 * On initiation. `client` is not attached to any project or channel for any specific user.
 */
var options = {
  appid: null,
  channel: null,
  uid: null,
  token: null
};

/*
 * When this page is called with parameters in the URL, this procedure
 * attempts to join a Video Call channel using those parameters.
 */
$(() => {
  var urlParams = new URL(location.href).searchParams;
  options.uid = urlParams.get("uid");
  if (options.appid && options.channel) {
    $("#uid").val(options.uid);
    $("#join-form").submit();
  }
})
/** chat */

/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
var isStop = false;
$("#join-form").submit(async function (e) {
  e.preventDefault();
  console.log('hello');
  $("#join").attr("disabled", true);
  try {
    /** 매칭 시작 */
    var settings = {
      "url": "http://localhost:8000/room/entrance",
      "method": "POST",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "data": {
        "userId": $("#uid").val(),
        "nickname": $("#uid").val()
      }
    };
    console.log('매칭시작');
    await $.ajax(settings).done(function (response) {
      console.log(response);
    });
    
    var interval = setInterval(async function(){
      if(!isStop){await match();}
      else{clearInterval(interval);}
    }, 3000);
    
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
})

async function match() {
  $("#match").attr("disabled", true);
  try {
    /** 매칭 대기 */
    console.log('waiting');
    var settings = {
      "url": "http://localhost:8000/room/checkqueue",
      "method": "POST",
      "timeout": 1000,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "data": {
        "userId": $("#uid").val()
      }
    };
    let data;
    await $.ajax(settings).done(function (response) {
      // console.log(response);
      data = response;
    });
    if(data['msg'] == 'success'){
      options.appid = data['agora_id'];
      options.token = data['voice_token'];
      options.channel = data['group_room_name'];
      options.uid = $("#uid").val();
      await join();
      if(options.token) {
        $("#success-alert-with-token").css("display", "block");
      } else {
        $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
        $("#success-alert").css("display", "block");
      }
      isStop = true;
    return {msg: 'match success'};
  }
  else{
    return {msg : 'match waiting'};
  }
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
}
/*
 * Called when a user clicks Leave in order to exit a channel.
 */
$("#leave").click(function (e) {
  leave();
})

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
async function join() {

  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
  [ options.uid, localTracks.audioTrack ] = await Promise.all([
    // Join the channel.
    client.join(options.appid, options.channel, options.token || null, options.uid || null),
    // Create tracks to the local microphone and camera.
    AgoraRTC.createMicrophoneAudioTrack()
  ]);

  // Play the local video track to the local browser and update the UI with the user ID.
  // localTracks.videoTrack.play("local-player");
  $("#local-player-name").text(`localVideo(${options.uid})`);

  // Publish the local video and audio tracks to the channel.
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}

/*
 * Stop all local and remote tracks then leave the channel.
 */
async function leave() {
  for (trackName in localTracks) {
    var track = localTracks[trackName];
    if(track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // Remove remote users and player views.
  remoteUsers = {};
  $("#remote-playerlist").html("");

  // leave the channel
  await client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
}


/*
 * Add the local use to a remote channel.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  // if (mediaType === 'video') {
  //   user.videoTrack.play(`player-${uid}`);
  // }
  if (mediaType === 'audio') {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.audioTrack.play();
  }
}

/*
 * Add a user who has subscribed to the live channel to the local interface.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

/*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  $(`#player-wrapper-${id}`).remove();
}
