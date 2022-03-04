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
    var bDefaultLang = false;
    var langsMap = {
        "af": "af-ZA",
        "ar": "ar-SA",
        "az": "az-AZ",
        "bg": "bg-BG",
        "ca": "ca-ES",
        "ceb": "ceb",
        "cs": "cs-CZ",
        "cy": "cy-GB",
        "da": "da-DK",
        "de": "de-DE",
        "en": "en-GB",
        "es": "es-ES",
        "et": "et-EE",
        "eu": "eu-ES",
        "fa": "fa-IR",
        "fi": "fi-FI",
        "fr": "fr-FR",
        "ha": "ha",
        "haw": "haw-US",
        "hi": "hi-IN",
        "hr": "hr-HR",
        "hu": "hu-HU",
        "id": "id-ID",
        "is": "is-IS",
        "it": "it-IT",
        "kk": "kk-KZ",
        "ky": "ky-KG",
        "la": "la",
        "lt": "lt-LT",
        "lv": "lv-LV",
        "mk": "mk-MK",
        "mn": "mn-MN",
        "ne": "ne-NP",
        "nl": "nl-NL",
        "no": "nb-NO",
        "nr": "nr",
        "nso": "nso",
        "pl": "pl-PL",
        "ps": "ps-AF",
        "pt": "pt-PT",
        "pt-br": "pt-BR",
        "pt-pt": "pt-PT",
        "ro": "ro-RO",
        "ru": "ru-RU",
        "sk": "sk-SK",
        "sl": "sl-SI",
        "so": "so-SO",
        "sq": "sq-AL",
        "sr": "sr-RS",
        "ss": "ss",
        "st": "st",
        "sv": "sv-SE",
        "sw": "sw-KE",
        "tl": "tl",
        "tlh": "tlh",
        "tn": "tn",
        "tr": "tr-TR",
        "ts": "ts",
        "uk": "uk-UA",
        "ur": "ur-PK",
        "uz": "uz-UZ",
        "ve": "ve",
        "vi": "vi-VN",
        "xh": "xh",
        "zu": "zu-ZA"
    }
    var cyrilic = ["uk", "kk", "uz", "mn", "sr", "ru", "mk", "bg", "ky"]
	window.Asc.plugin.init = function(text)
	{
		if ("" == text)
		{
			window.Asc.plugin.executeCommand("close", "");
			return;
		}
		text_init = text;

		if (voices.length === 0)
	        return;

        guessLanguage.info(text_init, function(info) {
            Run(info[0]);
        });
	};

    function Run(lang)
    {
        if (!lang_name || lang_name === "Auto") {
            for (var i = 0; i < voices.length; i++) {
                if (langsMap[lang]) {
                    if (langsMap[lang].search(voices[i].lang) !== -1) {
                        lang_name = voices[i].name;
                        break;
                    }
                }
            }
            if (!lang_name) {
                for (var i = 0; i < voices.length; i++) {
                    if (langsMap[lang]) {
                        if (langsMap[lang].split('-')[0] === voices[i].lang.split('-')[0]) {
                            lang_name = voices[i].name;
                            break;
                        }
                    }
                }
            }

            if (!lang_name || lang_name === "Auto" && cyrilic.indexOf(lang) !== -1)
                lang_name = langsMap["ru"]
            else if (!lang_name || lang_name === "Auto") {
                bDefaultLang = true;
                lang_name = "en-US";
            }
        }

        speak(text_init);
    };

	function speak(inputTxt){
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            window.Asc.plugin.executeCommand("close", "");
            return;
        }
        var utterThis = new SpeechSynthesisUtterance(inputTxt);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
            window.Asc.plugin.executeCommand("close", "");
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
            window.Asc.plugin.executeCommand("close", "");
        }

        for(i = 0; i < voices.length ; i++) {
            if(voices[i].name === lang_name && !bDefaultLang) {
                utterThis.voice = voices[i];
                break;
            }
            else if (voices[i].lang === lang_name) {
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