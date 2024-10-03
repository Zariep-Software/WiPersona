// Parse parameters and declare NotParam if there is not parameters
const url = window.location.href;
var DomainURL = window.location.origin + window.location.pathname;
const UrlObj = new URL(url);
var NotParam;
NotParam = (UrlObj.search === "");
const searchParams = new URLSearchParams(UrlObj.search);

// Function to retrieve the value of a specific cookie by its name
function GetCookie(name)
{
	// Split document.cookie string into individual "key=value" pairs
	let CookieArr = document.cookie.split(";");
	for (let i = 0; i < CookieArr.length; i++)
	{
		// Split each pair into key and value
		let CookiePair = CookieArr[i].split("=");
		// Trim whitespace from the key and check if it matches the requested cookie name
		if (name == CookiePair[0].trim())
		{
			// If found, decode the cookie value and return it
			return decodeURIComponent(CookiePair[1]);
		}
	}
	// Return null if no matching cookie is found
	return null;
}

// Function to check for a cookie's existence and set a default value if not found
function CheckIfCookie(cookieName, defaultValue)
{
	// Retrieve cookie value using GetCookie function
	var cookieValue = GetCookie(cookieName);
	if (!cookieValue)
	{
		// If the cookie is not found, log the creation message and create the cookie with a default value
		console.log(cookieName + " Cookie not found, creating a new cookie");
		document.cookie = cookieName + '=' + defaultValue;
	}
}

// Assigning resources to variables
const body = document.getElementById('body');
import { LocalBackground, LocalAvatarSpeak, LocalAvatarSilence, LocalAvatarScream } from './res/sourcelist.js';
var Background = LocalBackground;
var AvatarSpeak = LocalAvatarSpeak;
var AvatarSilence = LocalAvatarSilence;
var AvatarScream = LocalAvatarScream;
var AvatarSize;
var AvatarEffect;
var AvatarDimEffect;
var EffectOnScream;
var Avatar = document.getElementById('Avatar');

function GetParamValue(Param, DefaultValue)
{
	return searchParams.has(Param) ? searchParams.get(Param) : DefaultValue;
}

if (NotParam)
{
	// Initialization section: Check and set default values for various configuration cookies
	CheckIfCookie('AvatarSize', 512);
	CheckIfCookie('AvatarAtCenter', true);
	CheckIfCookie('AvatarPosX', 0);
	CheckIfCookie('AvatarPosY', 0);
	CheckIfCookie('AvatarEffect', "none");
	CheckIfCookie('AvatarDimEffect', "none");
	CheckIfCookie('EffectOnScream', false);
	CheckIfCookie('BackgroundColor', "#000");
	CheckIfCookie('ShowBackground', false);
	CheckIfCookie('SpeechThreshold', 15);
	CheckIfCookie('ScreamThreshold', 30);

	// Retrieve configuration values from cookies and convert them to appropriate formats
	var AvatarAtCenter = GetCookie("AvatarAtCenter") === 'true';
		AvatarSize = GetCookie("AvatarSize");
		AvatarEffect = GetCookie("AvatarEffect");
		AvatarDimEffect = GetCookie("AvatarDimEffect");
		EffectOnScream = GetCookie("EffectOnScream") === 'true';
	var AvatarPosX = GetCookie("AvatarPosX");
	var AvatarPosY = GetCookie("AvatarPosY");
	var ShowBackground = GetCookie("ShowBackground") === 'true';
	var SpeechThreshold = GetCookie("SpeechThreshold");
	var ScreamThreshold = GetCookie("ScreamThreshold");

	// Set up initial values in the UI based on cookies
	document.getElementById('togglecenter').checked = AvatarAtCenter || false;
	document.getElementById('StrPosX').value = AvatarPosX || 0;
	document.getElementById('StrPosY').value = AvatarPosY || 0;
	document.getElementById('StrAvatarSize').value = AvatarSize || 512;
	document.getElementById('EffectSelect').value = AvatarEffect;
	document.getElementById('DimEffectSelect').value = AvatarDimEffect;
	document.getElementById('effectonscream').checked = EffectOnScream;

	document.getElementById('showbg').checked = ShowBackground || false;

	document.getElementById('Threshold').value = SpeechThreshold || 15;
	document.getElementById('ThresholdValue').textContent = SpeechThreshold || 15;
	document.getElementById('ThresholdScream').value = ScreamThreshold || 30;
	document.getElementById('ThresholdValueScream').textContent = ScreamThreshold || 30;
}
else // if there is URL Parameters
{
	document.getElementById("content").innerHTML = '<h5> Save/Restore is not available on "Config From Link" mode </h5>';
	document.getElementById('togglecenter').checked = GetParamValue('AvatarAtCenter', false) === 'true';
	document.getElementById('bgcolor').value = "#" + GetParamValue('BackgroundColor', "#91a555");
		document.body.style.backgroundColor = document.getElementById('bgcolor').value;
	document.getElementById('showbg').checked = GetParamValue('ShowBackground', false) === 'true';
	document.getElementById('StrAvatarSize').value = GetParamValue('AvatarSize', 320);
		AvatarSize = GetParamValue('AvatarSize', 320);
	document.getElementById('DimEffectSelect').value = GetParamValue('AvatarDimEffect', "none");
		AvatarDimEffect = GetParamValue('AvatarDimEffect', "none");
	document.getElementById('EffectSelect').value = GetParamValue('AvatarEffect', "none");
		AvatarEffect = GetParamValue('EffectSelect', "none");
	document.getElementById('effectonscream').checked = GetParamValue('EffectOnScream', false) === 'true';
		EffectOnScream = GetParamValue('EffectOnScream', false);
	document.getElementById('StrPosX').value = GetParamValue('AvatarPosX', 0);
	document.getElementById('StrPosY').value = GetParamValue('AvatarPosY', 0);
	document.getElementById('Threshold').value = GetParamValue('SpeechThreshold', 15);
	document.getElementById('ThresholdValue').textContent = GetParamValue('SpeechThreshold', 15);
	document.getElementById('ThresholdScream').value = GetParamValue('ScreamThreshold', 30);
	document.getElementById('ThresholdValueScream').textContent = GetParamValue('ScreamThreshold', 30);
}

// Position and size listener
document.getElementById('StrAvatarSize').addEventListener('change', function(event)
{
	AvatarSize=document.getElementById('StrAvatarSize').value;
});

document.getElementById('StrPosX').addEventListener('change', function(event)
{
	document.getElementById("Avatar").style.left = document.getElementById('StrPosX').value + 'px';
});

document.getElementById('StrPosY').addEventListener('change', function(event)
{
	document.getElementById("Avatar").style.top = document.getElementById('StrPosY').value + 'px';
});

// Update avatar position
function LoadAvatarPos()
{
	if (document.getElementById('togglecenter').checked)
	{
		document.getElementById("Avatar").style.top = "50%";
		document.getElementById("Avatar").style.left = "50%";
		document.getElementById("Avatar").style.transform = "translate(-50%, -50%)";
	}
	else
	{
		document.getElementById("Avatar").style.left = document.getElementById('StrPosX').value + 'px';
		document.getElementById("Avatar").style.top = document.getElementById('StrPosY').value + 'px';
	}
}

//"Toggle Center" listener
document.getElementById('togglecenter').addEventListener('change', function(event)
{
	LoadAvatarPos();
});
LoadAvatarPos();

// Avatar file listeners
document.getElementById('AvatarMuted').addEventListener('change', function(event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		const FileURL = URL.createObjectURL(file);
		AvatarSilence = FileURL;
	}
	else {}
});

document.getElementById('AvatarSpeaking').addEventListener('change', function(event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		const FileURL = URL.createObjectURL(file);
		AvatarSpeak = FileURL;
	}
	else {}
});

document.getElementById('AvatarScreaming').addEventListener('change', function(event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		const FileURL = URL.createObjectURL(file);
		AvatarScream = FileURL;
	}
	else {}
});

// Background listener

document.getElementById('bgcolor').addEventListener('input', function(event)
{
	document.body.style.backgroundColor = event.target.value;
});

document.getElementById('SelectBG').addEventListener('change', function(event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		const FileURL = URL.createObjectURL(file);
		document.body.style.backgroundImage = `url(${FileURL})`
		document.body.style.backgroundSize = "cover"
		document.body.style.backgroundRepeat = "no-repeat"

		Background = `url(${FileURL})`
	}
	else {}
});

// Avatar Effect listener
document.getElementById('EffectSelect').addEventListener('change', function(event)
{
	AvatarEffect = document.getElementById('EffectSelect').value;
});
document.getElementById('DimEffectSelect').addEventListener('change', function(event)
{
	AvatarDimEffect = document.getElementById('DimEffectSelect').value;
	Avatar.className = 'Silence';
	console.log(AvatarDimEffect)
	Avatar.classList.add(AvatarDimEffect);
});
document.getElementById('effectonscream').addEventListener('change', function(event)
{
	EffectOnScream = document.getElementById('effectonscream').checked;
});

// Set background
if (document.getElementById('showbg').checked)
{
	body.style.backgroundImage = Background;
}

// Change background when show "background" button is clicked
document.getElementById('showbg').addEventListener('change', function()
{
	if (this.checked)
	{
		body.style.backgroundImage = Background;
	}
	else
	{
		body.style.backgroundImage = "";
	}
});

document.getElementById('RequestMicrophone').addEventListener('click', async () =>
{
	try
	{
		// Requesting access to the user's microphone
		const Stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		// Updating the status text to indicate permission granted and microphone active
		document.getElementById('Status').textContent = 'Permission granted. Microphone is active.';

		// Creating an audio context and necessary audio nodes for processing
		const AudioContext = new (window.AudioContext || window.webkitAudioContext)();
		const Analyser = AudioContext.createAnalyser();
		const Microphone = AudioContext.createMediaStreamSource(Stream);
		const ScriptProcessor = AudioContext.createScriptProcessor(256, 1, 1);

		// Setting properties for the analyser node
		Analyser.smoothingTimeConstant = 0.3;
		Analyser.fftSize = 1024;

		// Connecting the audio nodes
		Microphone.connect(Analyser);
		Analyser.connect(ScriptProcessor);
		ScriptProcessor.connect(AudioContext.destination);

		// Getting references to HTML elements for threshold controls
		const ThresholdSlider = document.getElementById('Threshold');
		const ThresholdValueDisplay = document.getElementById('ThresholdValue');
		const ThresholdLine = document.getElementById('ThresholdLine');
		const ThresholdSliderScream = document.getElementById('ThresholdScream');
		const ThresholdValueDisplayScream = document.getElementById('ThresholdValueScream');
		const ThresholdLineScream = document.getElementById('ThresholdLineScream');

		// Initialize threshold line positions based on the initial slider values
		ThresholdValueDisplay.textContent = ThresholdSlider.value;
		ThresholdLine.style.left = `${ThresholdSlider.value}%`;
		ThresholdValueDisplayScream.textContent = ThresholdSliderScream.value;
		ThresholdLineScream.style.left = `${ThresholdSliderScream.value}%`;

		// Event listener for threshold slider to update threshold value display and line position
		ThresholdSlider.addEventListener('input', () =>
		{
			ThresholdValueDisplay.textContent = ThresholdSlider.value;
			ThresholdLine.style.left = `${ThresholdSlider.value}%`;
		});

		// Event listener for scream threshold slider
		ThresholdSliderScream.addEventListener('input', () =>
		{
			ThresholdValueDisplayScream.textContent = ThresholdSliderScream.value;
			ThresholdLineScream.style.left = `${ThresholdSliderScream.value}%`;
		});

		let PreviousAvatar = "";
		let LastUpdateTime = 0;
		const UpdateDelay = 100;

		ScriptProcessor.onaudioprocess = () =>
		{
			// Audio processor
			const Array = new Uint8Array(Analyser.frequencyBinCount);
			Analyser.getByteFrequencyData(Array);
			const Values = Array.reduce((a, b) => a + b, 0);
			const Average = Values / Array.length;

			// Update elements based on audio status
			const VoiceStatus = document.getElementById('VoiceStatus');
			const Threshold = parseInt(ThresholdSlider.value, 10);
			const ThresholdScream = parseInt(ThresholdSliderScream.value, 10);
			const VolumeLevel = document.getElementById('VolumeLevel');

			VolumeLevel.style.width = `${Average}%`;

			// Audio handler
			let NewAvatar = "";
			let NewStatus = "";

			if (Average > ThresholdScream)
			{
				NewStatus = 'Status: Screaming';
				NewAvatar = "Scream";
			}
			else if (Average > Threshold)
			{
				NewStatus = 'Status: Speaking';
				NewAvatar = "Speak";
			}
			else if (Average < Threshold)
			{
				NewStatus = 'Status: Silence';
				NewAvatar = "Silence";
			}

			// Get current time
			const CurrentTime = new Date().getTime();
			// Update voice and avatar status only if there is a real change and enough time has passed
			if ((NewAvatar !== PreviousAvatar || VoiceStatus.textContent !== NewStatus) && (CurrentTime - LastUpdateTime > UpdateDelay))
			{
				VoiceStatus.textContent = NewStatus;


				// Function to dynamically create or update a CSS rule
				function addDynamicCSSRule(className, imageUrl)
				{
					const styleSheet = document.styleSheets[0]; // Get the first stylesheet
					const rule = `.${className} { background-image: url(${imageUrl}); }`;

					// If the rule already exists, remove it before adding the new one
					for (let i = 0; i < styleSheet.cssRules.length; i++)
					{
						if (styleSheet.cssRules[i].selectorText === `.${className}`)
						{
							styleSheet.deleteRule(i);
							break;
						}
					}

					// Add the new rule
					styleSheet.insertRule(rule, styleSheet.cssRules.length);
				}

				// Now dynamically inject the background-image into the CSS classes
				addDynamicCSSRule('Scream', AvatarScream);
				addDynamicCSSRule('Speak', AvatarSpeak);
				addDynamicCSSRule('Silence', AvatarSilence);

				// Clear all avatar state classes first
				Avatar.classList.remove('Scream', 'Speak', 'Silence', AvatarEffect);

				Avatar.style.width = AvatarSize + 'px';
				Avatar.style.height = AvatarSize + 'px';

				// Set the appropriate class based on the avatar state
				if (NewAvatar === "Scream")
				{
					Avatar.classList.add('Scream');
					if (EffectOnScream)
					{
						Avatar.className = 'Scream';
						void Avatar.offsetWidth;
						Avatar.classList.add(AvatarEffect);
						Avatar.classList.add(AvatarDimEffect);
					}
					else
					{
					Avatar.classList.add(AvatarEffect);
					}
				}
				else if (NewAvatar === "Speak")
				{
					if (PreviousAvatar === "Silence")
					{
						Avatar.classList.add('Speak');
						void Avatar.offsetWidth;
						Avatar.classList.add(AvatarEffect);
						Avatar.classList.add(AvatarDimEffect);
					}
					else if (PreviousAvatar === "Scream")
					{
						Avatar.className = 'Speak';
						Avatar.classList.add(AvatarDimEffect+0);
					}
				}
				else if (NewAvatar === "Silence")
				{
					Avatar.className = 'Silence';
					Avatar.classList.add(AvatarEffect);
					Avatar.classList.add(AvatarDimEffect);
				}

				// Update Time and avatar
				void Avatar.offsetWidth;
				PreviousAvatar = NewAvatar;
				LastUpdateTime = CurrentTime;
			}
		};
	}
	catch (Error)
	{
		// Handling errors if permission is denied or there's an error requesting microphone access
		document.getElementById('Status').textContent = 'Permission denied or there was an error. if you are using OBS Studio "Browser", use "--enable-media-stream" flag';
		console.error('Error requesting microphone permission:', Error);
	}
});
