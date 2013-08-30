

var readInterval,
    readIndex = 0,
    textArray = [],
    prefs = {
        speed: 200,
        night: false
    };

function prepare(text) {
    textArray = [];
    for(var i = 0, l = text.length; i < l; i++) {
        var word = text[i];
        if(word !== '') {
            if(/\n/.test(word)) {
                var tempArray = word.split('\n');
                for(var i2 = 0, l2 = tempArray.length; i2 < l2; i2++) {
                    if(tempArray[i2] !== '') {
                        var trimmedWord = $('<div />').text($.trim(tempArray[i2])).html();
                        textArray.push(trimmedWord);
                    }
                }
            } else {
                var trimmedWord = $('<div />').text($.trim(word)).html();
                textArray.push(trimmedWord);
            }
        }
    }
    $('#text-info').html('Words: ' + textArray.length).show();
    $('body').data('prepared', true);
}

function start() {
    if(textArray.length === 0) {
        return false;
    }
    interval = 1000 / (prefs.speed / 60);
    readInterval = window.setInterval(flashWords, interval, textArray);
    $('#start').html('Pause');
    $('body').data('reading', true);
}

function stop() {
    window.clearInterval(readInterval);
    $('#start').html('Read!');
    $('body').data('reading', false);
}

function flashWords(array) {
    var word = array[readIndex],
        length = array.length;
    if(readIndex == length) {
        stop();
        readIndex = 0;
    } else {
        readIndex++;
    }
    $('#word').html(word);
    $('#text-progress').attr({
        'max': textArray.length,
        'value': readIndex,
        'step': 1
    }).show();
}

function savePrefs() {
    localStorage.setItem('prefs', JSON.stringify(prefs));
}



$(document).ready(function() {
    $('body').data({'reading': false, 'prepared': false});
    prepare($('#text-to-read').val().split(' '));

    if(localStorage.getItem('prefs') === null) {
        localStorage.setItem('prefs', JSON.stringify(prefs));
    } else {
        prefs = JSON.parse(localStorage.getItem('prefs'));
    }

    $('#reading-speed').val(prefs.speed);
    if(prefs.night === true) {
        $('body').addClass('night');
        $('#night-mode').attr('checked', 'checked');
    }


    $('#start').on('click', function() {
        var data = $('body').data();
        if(data.reading === false) {
            if(data.prepared === false) {
                var text = $('#text-to-read').val().split(' ');
                prefs.speed = $('#reading-speed').val();
                if(text.length > 1 && prefs.speed > 0) {
                    prepare(text);
                } else {
                    alert('No text to read (or invalid speed settings)');
                }
            }
            $('#text-to-read').fadeOut(250, function() {
                start();
                $('#reading-screen, #new').fadeIn(250);
            });
            $('h1').animate({height: 0, opacity: 0}, 500);
            $('#other').fadeOut(500);
        } else {
            stop();
        }
    });

    $('#text-to-read').on('keyup', function() {
        readIndex = 0;
        prepare($(this).val().split(' '));
    });

    $('#reading-speed').on('change', function() {
        prefs.speed = $(this).val();
        savePrefs();
        if($('body').data('reading') === true) {
            stop();
            start();
        }
    });

    $('#text-progress').on('mousedown', function() {
        if($('body').data('reading')) {
            stop();
            $('body').data('reading', 'paused');
        }
        $(this).on('mousemove', function() {
            var newIndex = $(this).val();
            $('#word').html(textArray[newIndex]);

        });
    }).on('mouseup', function() {
        readIndex = $(this).val();
        $(this).off('mousemove');
        if($('body').data('reading') === 'paused') {
            start();
        }
    });

    $('#new').on('click', function() {
        $('#reading-screen').hide();
        $('#text-to-read, #other').fadeIn(500);
        $('h1').animate({height: '26px', opacity: 1}, 500);
        $(this).fadeOut(500);
        if($('body').data('reading') === true) {
            stop();
        }
    });

    $('#night-mode').on('change', function() {
        if($(this).is(':checked')) {
            $('body').addClass('night');
            prefs.night = true;
        } else {
            $('body').removeClass('night');
            prefs.night = false;
        }
        savePrefs();
    });

    $('body').on('keyup', function(e) {
        if($('#text-to-read').is(':focus')) {
            return false;
        }
        //P or Space
        if(e.keyCode === 80 || e.keyCode == 32) {
            if($('body').data('reading') === true) {
                stop();
            } else {
                start();
            }
        }
    });
});