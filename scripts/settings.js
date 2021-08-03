(function(window, undefined) {
    var synth       = window.speechSynthesis;
    var pitch;
    var pitchValue;
    var rate;
    var rateValue;
    var voiceSelect;
    var pitch_default = 1;
    var rate_default  = 1;

    $(document).ready(function () {
        voiceSelect = document.querySelector('select');
        pitch       = document.querySelector('#pitch');
        pitchValue  = document.querySelector('.pitch-value');
        rate        = document.querySelector('#rate');
        rateValue   = document.querySelector('.rate-value');
        voices      = [];
        function populateVoiceList() {
            voices = synth.getVoices().sort(function (a, b) {
                const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
                if ( aname < bname ) return -1;
                else if ( aname == bname ) return 0;
                else return +1;
            });
            var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
            voiceSelect.innerHTML = '';
            for(i = 0; i < voices.length ; i++) {
                var option = document.createElement('option');
                option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

                if(voices[i].default) {
                  option.textContent += ' -- DEFAULT';
                }

                option.setAttribute('data-lang', voices[i].lang);
                option.setAttribute('data-name', voices[i].name);
                voiceSelect.appendChild(option);
            }
            voiceSelect.selectedIndex = selectedIndex;

            if (voices.length !== 0) {
                var lang_val_saved = localStorage.getItem("plugin-speech-lang-val");
                if (lang_val_saved) {
                    $(voiceSelect).val(lang_val_saved);
                    $(voiceSelect).trigger('change');
                }
            }
        };

        populateVoiceList();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        pitch.onchange = function() {
          pitchValue.textContent = pitch.value;
        };

        rate.onchange = function() {
          rateValue.textContent = rate.value;
        };

        var saved_pitch = localStorage.getItem("plugin-speech-pitch");
        if (saved_pitch) {
            $(pitch).val(saved_pitch);
            pitchValue.textContent = saved_pitch;
        }
        else
            pitchValue.textContent = pitch_default;
        var saved_rate = localStorage.getItem("plugin-speech-rate");
        if (saved_rate) {
            $(rate).val(saved_rate);
            rateValue.textContent = saved_rate;
        }
        else
            rateValue.textContent = rate_default;
    });

    window.Asc.plugin.init = function()
    {
        $('#voice-lang').select2({
            minimumResultsForSearch: Infinity,
            width: "100%"
        });
    };
    window.Asc.plugin.button = function(id)
    {
        localStorage.setItem("plugin-speech-pitch", pitch.value);
        localStorage.setItem("plugin-speech-rate", rate.value);
        localStorage.setItem("plugin-speech-lang-name", voiceSelect.selectedOptions[0].getAttribute('data-name'));
        localStorage.setItem("plugin-speech-lang-val", $(voiceSelect).val());

        this.executeCommand("close", "");
    };
    window.Asc.plugin.onThemeChanged = function(theme)
    {
        window.Asc.plugin.onThemeChangedBase(theme);
    };
})(window, undefined);
