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
    var curTextIdx = 0;
    var allParagraphs = [];
    var pitch     = 1;
    var rate      = 1;
    var voices    = [];
    var bDefaultLang = false;
    var langsMap = {
        "ab": "ab",
        "af": "af-ZA",
        "ar": "ar-SA",
        "az": "az-AZ",
        "be": "be-BY",
        "bg": "bg-BG",
        "bn": "bn-IN",
        "bo": "bo-CN",
        "br": "br-FR",
        "ca": "ca-ES",
        "ceb": "ceb",
        "cs": "cs-CZ",
        "cy": "cy-GB",
        "da": "da-DK",
        "de": "de-DE",
        "el": "el-GR",
        "en": "en-GB",
        "eo": "eo",
        "es": "es-ES",
        "et": "et-EE",
        "eu": "eu-ES",
        "fa": "fa-IR",
        "fi": "fi-FI",
        "fo": "fo-FO",
        "fr": "fr-FR",
        "fy": "fy-NL",
        "gd": "gd-GB",
        "gl": "gl",
        "gu": "gu-IN",
        "ha": "ha",
        "haw": "haw-US",
        "he": "he-IL",
        "hi": "hi-IN",
        "hr": "hr-HR",
        "hu": "hu-HU",
        "hy": "hy-AM",
        "id": "id-ID",
        "is": "is-IS",
        "it": "it-IT",
        "ja": "ja-JP",
        "ka": "ka-GE",
        "kk": "kk-KZ",
        "km": "km-KH",
        "kn": "kn",
        "ko": "ko-KR",
        "ku": "ku",
        "ky": "ky-KG",
        "la": "la",
        "lo": "lo-LA",
        "lt": "lt-LT",
        "lv": "lv-LV",
        "mg": "mg",
        "mk": "mk-MK",
        "ml": "ml-IN",
        "mn": "mn-MN",
        "mr": "mr-IN",
        "ms": "ms-MY",
        "nd": "nd",
        "ne": "ne-NP",
        "nl": "nl-NL",
        "nn": "nn-NO",
        "no": "nb-NO",
        "nso": "nso-ZA",
        "or": "or-IN",
        "nr": "nr",
        "pa": "pa-PK",
        "pl": "pl-PL",
        "ps": "ps-AF",
        "pt": "pt-PT",
        "pt-br": "pt-BR",
        "pt-pt": "pt-PT",
        "ro": "ro-RO",
        "ru": "ru-RU",
        "sa": "sa-IN",
        "sh": "sh",
        "si": "si-LK",
        "sk": "sk-SK",
        "sl": "sl-SI",
        "so": "so-SO",
        "sq": "sq-AL",
        "sr": "sr-RS",
        "ss": "ss",
        "st": "st",
        "sv": "sv-SE",
        "sw": "sw-KE",
        "ta": "ta-LK",
        "te": "te-IN",
        "th": "th-TH",
        "tl": "tl",
        "tlh": "tlh",
        "tn": "tn",
        "tr": "tr-TR",
        "ts": "ts",
        "tw": "tw",
        "uk": "uk-UA",
        "ur": "ur-PK",
        "uz": "uz-UZ",
        "ve": "ve",
        "vi": "vi-VN",
        "xh": "xh",
        "zh": "zh",
        "zh-TW": "zh-TW",
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

		if (!window.speechSynthesis || voices.length === 0)
        {
            window.Asc.plugin.executeCommand("close", "");
            return;
        }

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

        allParagraphs = correctSentLength(text_init.split('\n'));
        speak();
    }

    function initVoices() {
        voices = window.speechSynthesis.getVoices().sort(function (a, b) {
            const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
            if ( aname < bname ) return -1;
            else if ( aname == bname ) return 0;
            else return +1;
        });
    }

    function correctSentLength(allSentenses) {
        if (isChrome && !voice.localService)
            Max_Chars = 100;

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
                    if (sTemp === "")
                        break;

                    if (!sTemp[sTemp.length - 1].match(new RegExp('[.!?,;\r- ]'))) {
                        var aMatches = Array.from(sTemp.matchAll(/[.!?;,\r-]/g)) || Array.from(sTemp.matchAll(/' '/g));
                        if (aMatches.length !== 0)
                            sTemp = sTemp.slice(0, aMatches[aMatches.length - 1].index + 1);
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

    function clear() {  clearTimeout(timer) }

	function speak() {
        inputTxt = allParagraphs[curTextIdx];
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
            curTextIdx += 1;
            inputTxt = allParagraphs[curTextIdx];
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
        
        utterThis.onend = function () {
            clear();
            
            console.log('SpeechSynthesisUtterance.onend');
            curTextIdx += 1;
            speak();
        }

        utterThis.onstart = function () {
            clear();
            console.log("On start!")
        }

        utterThis.onboundary = function() {
            clear();
        }

        utterThis.onerror = function () {
            console.error('SpeechSynthesisUtterance.onerror');
            speechSynthesis.cancel();
            window.Asc.plugin.executeCommand("close", "");
        }
        
        console.log(utterThis);
		window.speechSynthesis.cancel();
		setTimeout(function() {
			window.speechSynthesis.speak(utterThis);
		}, 50);

		timer = setTimeout(function() {
			console.log('Speech dont start speaking, restarting...');
			curTextIdx -= 1;
			window.speechSynthesis.cancel();
		}, 3000);
    }

    $(document).ready(function () {
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