$(function() {
  if (window.JpegCamera) {
    var camera; //Initialized at the end
    var stream; //frames sent to test
    var sounds = {
      bells: "http://soundbible.com/mp3/Ship_Bell-Mike_Koenig-1911209136.mp3",
      waterfall: "http://soundbible.com/mp3/large_waterfall_1-daniel_simon.mp3",
      scream: "http://soundbible.com/mp3/Female_Scream_Horror-NeoPhyTe-138499973.mp3",
      music: "http://soundbible.com/mp3/Music_Box-Big_Daddy-1389738694.mp3",
      zymbal: "http://soundbible.com/mp3/Zymbel_The_Real_Horst-1113884951.mp3",
      guns: "http://soundbible.com/mp3/9_mm_gunshot-mike-koenig-123.mp3"
    }

    $('#pause').hide();

    var take_snapshots = function(isGood) {
      var snapshot = camera.capture();
      if(isGood) {
        snapshot.get_canvas(add_good);
      } else {
        snapshot.get_canvas(add_bad);
      }
    };

    var add_good = function(element) {
      $(element).data("snapshot", this).addClass("item shadow");

      var $container = $("#good_dataset").append(element);
      var $camera = $("#camera");
      var camera_ratio = $camera.innerWidth() / $camera.innerHeight();

      var height = $container.height()
      element.style.height = "" + height + "px";
      element.style.width = "" + Math.round(camera_ratio * height) + "px";

      var scroll = $container[0].scrollWidth - $container.innerWidth();

      $container.animate({
        scrollLeft: scroll
      }, 200);
    };

    var add_bad = function(element) {
      $(element).data("snapshot", this).addClass("item shadow");

      var $container = $("#bad_dataset").append(element);
      var $camera = $("#camera");
      var camera_ratio = $camera.innerWidth() / $camera.innerHeight();

      var height = $container.height()
      element.style.height = "" + height + "px";
      element.style.width = "" + Math.round(camera_ratio * height) + "px";

      var scroll = $container[0].scrollWidth - $container.innerWidth();

      $container.animate({
        scrollLeft: scroll
      }, 200);
    };

    $('body').on('click', 'canvas', function() {
      $(this).remove();
    });

    $('#good_example').click(function() {
      $('.placeholder').hide();
      take_snapshots(true);
    });

    $('#bad_example').click(function() {
      $('.placeholder').hide();
      take_snapshots(false);
    });

    function predict() {
      var snapshot = camera.capture({
        shutter: false
      });
      snapshot.get_blob(function(blob) {
        $.ajax({
          url: "",
          beforeSend: function(xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Prediction-Key", "");
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Prediction-key", "");
          },
          type: "POST",
          data: blob,
          processData: false
        }).done(function(data) {
          handlePrediction(data.predictions[0]);
          console.log(data.predictions[0].tagName + ', confidence: ' + data.predictions[0].probability);
        }).fail(function(err) {
          console.log(err);
        });
      });
    }

    function handlePrediction(prediction) {
      var percent = prediction.probability * 100;
      var rounded = (Math.round( percent * 100 ) / 100).toFixed(2)
      $("#camera div div").removeClass("warning");
      $("#alarm")[0].pause();

      $("#confidence").text(`Predicting ${prediction.tagName} behaviors with a confidence of: ${rounded}%`);
      if(prediction.tagName === 'bad') {
        $("#camera div div").addClass("warning");
        $("#alarm")[0].play();
      }
    }

    $('#start').click(function() {
      $('#start').hide();
      $('#pause').show();
      var snapshot = camera.capture({
        shutter: false
      });
      stream = setInterval(predict, 1000);
    });

    $('#pause').click(function() {
      $('#confidence').text('Press start to begin tracking.');
      $('#pause').hide();
      $('#start').show();
      $("#camera div div").removeClass("warning");
      clearInterval(stream);
      $("#alarm")[0].pause();
    });

    $('body').on('click', '#changeNoise', function() {
      var val = $('input[name=noise]:checked').val();
      $('audio source').attr('src', sounds[val]);
      $("#alarm")[0].pause();
      $("#alarm")[0].load();
      console.log($('audio source').attr('src'));
    });

    $('#train').click(function() {
      setTimeout(function() {
        $('#loadingModal').modal('hide');
        $('#successModal').modal('show');
      }, 2000);
    });

    var options = {}

    camera = new JpegCamera("#camera", options).ready(function(info) {
      $("#take_snapshots").show();
    });
  }
});
