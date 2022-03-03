/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function(window, undefined)
{
	var text_init = "";
    var synth     = window.speechSynthesis;
    var lang_name;
    var pitch     = 1;
    var rate      = 1;
    var voices    = [];

	window.Asc.plugin.init = async function(text)
	{
		if ("" == text)
		{
			window.Asc.plugin.executeCommand("close", "");
			return;
		}
		text_init = text;

		if (voices.length === 0)
	        return;

        console.log('Detected Language');

        var response = await fetch("https://api.translatedlabs.com/language-identifier/identify", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                etnologue: true,
                text: text,
                uiLanguage: "en"
            })
        })
        var lang;
        var result = await response.json();
        if (result.code)
            lang = result.code.split("-")[0].toLowerCase();

        Run(lang);
		window.Asc.plugin.executeCommand("close", "");
	};

    function Run(lang)
    {
        if (!lang_name || lang_name === "Auto") {
            var _map   = {};
            _map["id"] = ["id-ID"];
            _map["de"] = ["de-DE"];
            _map["es"] = ["es-ES"];
            _map["fr"] = ["fr-FR"]; //ua not supported
            _map["it"] = ["it-IT"];
            _map["nl"] = ["nl-NL"];
            _map["pl"] = ["pl-PL"];
            _map["pt"] = ["pt-BR"];
            _map["en"] = ["en-GB"];
            _map["ru"] = ["ru-RU"];
            _map["ne"] = ["hi-IN"];
            _map["zh"] = ["zh-CN"];
            _map["ja"] = ["ja-JP"];
            _map["ko"] = ["ko-KR"];
            for (var i = 0; i < voices.length; i++)
            {
                if (_map[lang])
                {
                    for (var k = 0; k < _map[lang].length; k++)
                    {
                        if (voices[i].lang == _map[lang][k])
                        {
                            lang_name = voices[i].name;
                            break;
                        }
                    }
                }
            }
            if (!lang_name || lang_name === "Auto") {
                lang_name = "Google US English";
            }
        }

        speak(text_init);
    };

	function speak(inputTxt){
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }
        var utterThis = new SpeechSynthesisUtterance(inputTxt);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }

        for(i = 0; i < voices.length ; i++) {
            if(voices[i].name === lang_name) {
                utterThis.voice = voices[i];
                break;
            }
        }

        utterThis.pitch = pitch;
        utterThis.rate = rate;
        synth.speak(utterThis);
      };

    $(document).ready(function () {
        function populateVoiceList() {
            voices = synth.getVoices().sort(function (a, b) {
                const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
                if ( aname < bname ) return -1;
                else if ( aname == bname ) return 0;
                else return +1;
            });
        };

        populateVoiceList();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        var saved_pitch = localStorage.getItem("plugin-speech-pitch");
        if (saved_pitch)
            pitch = saved_pitch;

        var saved_rate = localStorage.getItem("plugin-speech-rate");
        if (saved_rate)
            rate = saved_rate;

        var saved_lang = localStorage.getItem("plugin-speech-lang-name");
        if (saved_lang)
            lang_name = saved_lang;
    });
	window.Asc.plugin.button = function(id)
	{
		if (-1 == id)
			responsiveVoice.cancel();

		this.executeCommand("close", "");
	};

})(window, undefined);