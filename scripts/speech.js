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
    function detectChrome(){
        var isChromium = window.chrome;
        var winNav = window.navigator;
        var vendorName = winNav.vendor;
        var isOpera = typeof window.opr !== "undefined";
        var isIEedge = winNav.userAgent.indexOf("Edg") > -1;

        if (isChromium !== null &&
            typeof isChromium !== "undefined" &&
            vendorName === "Google Inc." &&
            isOpera === false &&
            isIEedge === false)
            return true;

        return false;
    };

    var isChrome = detectChrome();
    var Max_Chars = 32767; // max chars in one sentense
	var text_init = "";
    var timer;
    var lang_name, voice;
    var curText = 0;
    var allParagraphs = [];
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

            if ((!lang_name || lang_name === "Auto") && cyrilic.indexOf(lang) !== -1)
                lang_name = langsMap["ru"]
            else if (!lang_name || lang_name === "Auto") {
                bDefaultLang = true;
                lang_name = "en-US";
            }
        }

        allParagraphs = correctSentLength(text_init.split('\n'));
        speak();
    };

    function correctSentLength(allSentenses) {
        var aResult = [];
        var sCurSentense, nTimes, nTempLength, nTempPos;
        var sTemp = "";
        
        for (var nSen = 0; nSen < allSentenses.length; nSen++) {
            sCurSentense = allSentenses[nSen];
            nTempLength = 0;
            if(sCurSentense.length > Max_Chars) {
                aSplitSentense = [];
                nTimes =  Math.floor(sCurSentense.length / Max_Chars) + 1;

                for (var nTime = 0; nTime < nTimes; nTime++) {
                    nTempPos = -1;
                    sTemp = sCurSentense.slice(nTempLength, Max_Chars * (nTime + 1));

                    if (!sTemp[sTemp.length - 1].match(new RegExp('[.!?;\r ]'))) {
                        for (nChar = sTemp.length - 1; nChar >= sTemp.length - 150; nChar--) {
                            if (sTemp[nChar] === " ") {
                                sTemp = sTemp.slice(0, nChar + 1);
                                break;
                            }
                        }
                    }

                    nTempLength += sTemp.length;
                    aResult.push(sTemp);
                }
            }
            else
                aResult.push(sCurSentense);
        }
        return aResult;
    }

    // function resumeInfinity(target) {
    //     speechSynthesis.pause()
    //     speechSynthesis.resume()
    //     timer = setTimeout(function () {
    //         resumeInfinity(target)
    //     }, 5000)
    // }
    function clear() {  timer = null }

    function cancel_voice() {
        while (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    }

	function speak() {
        if (!voice) {
            for(i = 0; i < voices.length ; i++) {
                if(voices[i].name === lang_name && !bDefaultLang) {
                    voice = voices[i];
                    break;
                }
                else if (voices[i].lang === lang_name) {
                    voice = voices[i];
                    break;
                }
            }
        }
        
        inputTxt = allParagraphs[curText];
        while (true) {
            if (inputTxt !== undefined) {
                if (inputTxt.trim() !== "")
                    break;
            }
            else {
                speechSynthesis.cancel();
                window.Asc.plugin.executeCommand("close", "");
                return;
            }
            curText += 1;
            inputTxt = allParagraphs[curText];
        }
        
        var utterThis = new SpeechSynthesisUtterance(inputTxt);
        utterThis.voice = voice;
        utterThis.pitch = pitch;
        utterThis.rate = rate;

        if (window.speechSynthesis.speaking) {
            console.error('speechSynthesis.speaking');
            speechSynthesis.cancel();
            window.Asc.plugin.executeCommand("close", "");
            return;
        }
        
        utterThis.onend = function (event) {
            clear();
            
            console.log('SpeechSynthesisUtterance.onend');
            curText += 1;
            speak();
        }

        utterThis.onstart = function (event) {
            clear();
            console.log("On start!")
        }

        utterThis.onboundary = function() {
            clear();
        }

        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
            speechSynthesis.cancel();
            window.Asc.plugin.executeCommand("close", "");
        }
        
        console.log(utterThis);
        cancel_voice();
        window.speechSynthesis.speak(utterThis);

        timer = setTimeout(function() {
            console.log('Speech dont start speaking, restarting...');
            curText -= 1;
            cancel_voice();
        }, 2000);

        // if (isChrome) {
        //     resumeInfinity(utterThis);
        // }
    };

    $(document).ready(function () {
        function initVoices() {
            voices = window.speechSynthesis.getVoices().sort(function (a, b) {
                const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
                if ( aname < bname ) return -1;
                else if ( aname == bname ) return 0;
                else return +1;
            });
            // remove Google voices (speechSynthesis has bugs with Google voices)
            if (isChrome){
                for (var nVoice = 0; nVoice < voices.length; nVoice++) {
                    if (voices[nVoice].localService === false) {
                        voices.splice(nVoice, 1);
                        nVoice -= 1;
                    }
                }
            }
        };

        initVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = initVoices;
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

        speechSynthesis.cancel();
		this.executeCommand("close", "");
	};

})(window, undefined);