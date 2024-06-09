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
var Background = "url('res/background.png')";
var AvatarSpeak = "res/speak.png";
var AvatarSilence = "res/silence.png";
var AvatarScream = "res/scream.png";

function GetParamValue(Param, DefaultValue)
{
	return searchParams.has(Param) ? searchParams.get(Param) : DefaultValue;
}

if (NotParam)
{
	// Initialization section: Check and set default values for various configuration cookies
	CheckIfCookie('AvatarSize', 320);
	CheckIfCookie('AvatarAtCenter', true);
	CheckIfCookie('AvatarPosX', 0);
	CheckIfCookie('AvatarPosY', 0);
	CheckIfCookie('ShowBackground', false);
	CheckIfCookie('SpeechThreshold', 15);
	CheckIfCookie('ScreamThreshold', 30);

	// Retrieve configuration values from cookies and convert them to appropriate formats
	var AvatarAtCenter = GetCookie("AvatarAtCenter") === 'true'; 
	var AvatarSize = GetCookie("AvatarSize");
	var AvatarPosX = GetCookie("AvatarPosX");
	var AvatarPosY = GetCookie("AvatarPosY");
	var ShowBackground = GetCookie("ShowBackground") === 'true';
	var SpeechThreshold = GetCookie("SpeechThreshold");
	var ScreamThreshold = GetCookie("ScreamThreshold");
	// Set up initial values in the UI
	document.getElementById('togglecenter').checked = AvatarAtCenter || false;
	document.getElementById('showbg').checked = ShowBackground || false;
	document.getElementById('StrAvatarSize').value = AvatarSize || 320;
	document.getElementById('StrPosX').value = AvatarPosX || 0;
	document.getElementById('StrPosY').value = AvatarPosY || 0;
	document.getElementById('Threshold').value = SpeechThreshold || 15;
	document.getElementById('ThresholdValue').textContent = SpeechThreshold || 15;
	document.getElementById('ThresholdScream').value = ScreamThreshold || 30;
	document.getElementById('ThresholdValueScream').textContent = ScreamThreshold || 30;
}
else
{
	document.getElementById("content").innerHTML = '<h5> Save/Restore is not avaialable on "Config From Link" mode </h5>';
	document.getElementById('togglecenter').checked = GetParamValue('AvatarAtCenter', false) === 'true';
	document.getElementById('showbg').checked = GetParamValue('ShowBackground', false) === 'true';
	document.getElementById('StrAvatarSize').value = GetParamValue('AvatarSize', 320);
	document.getElementById('StrPosX').value = GetParamValue('AvatarPosX', 0);
	document.getElementById('StrPosY').value = GetParamValue('AvatarPosY', 0);
	document.getElementById('Threshold').value = GetParamValue('SpeechThreshold', 15);
	document.getElementById('ThresholdValue').textContent = GetParamValue('SpeechThreshold', 15);
	document.getElementById('ThresholdScream').value = GetParamValue('ScreamThreshold', 30);
	document.getElementById('ThresholdValueScream').textContent = GetParamValue('ScreamThreshold', 30);
}

// Function to update a specific configuration cookie
function UpdateConfigCookies(CookieName, NewValue)
{
	// Set the cookie with the new value
	document.cookie = CookieName + '=' + NewValue;
}

// Function to save current settings into cookies from UI elements
function SaveSettings()
{
if (NotParam)
	{
		UpdateConfigCookies("AvatarSize", document.getElementById('StrAvatarSize').value);
		UpdateConfigCookies("AvatarPosX", document.getElementById('StrPosX').value);
		UpdateConfigCookies("AvatarPosY", document.getElementById('StrPosY').value);
		UpdateConfigCookies("SpeechThreshold", document.getElementById('Threshold').value);
		UpdateConfigCookies("ScreamThreshold", document.getElementById('ThresholdScream').value);
		UpdateConfigCookies("AvatarAtCenter", document.getElementById('togglecenter').checked);
		UpdateConfigCookies("ShowBackground", document.getElementById('showbg').checked);
	}
}

// Function to restore default settings for all configurable items
function RestoreSettings()
{
	if (NotParam)
	{
		if (confirm("Are you sure?"))
		{
			// Reset settings to their defaults and update cookies
			UpdateConfigCookies("AvatarSize", 320);
			UpdateConfigCookies("AvatarPosX", 0);
			UpdateConfigCookies("AvatarPosY", 0);
			UpdateConfigCookies("SpeechThreshold", 15);
			UpdateConfigCookies("ScreamThreshold", 30);
			UpdateConfigCookies("AvatarAtCenter", 1);
			UpdateConfigCookies("ShowBackground", 0);
			location.reload(true); // Reload the page to apply changes
		}
		else
		{
			console.log("Restoration canceled by the user.");
		}
	}
}

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

function LoadAvatarPos()
{
	if (document.getElementById('togglecenter').checked)
	{
		document.getElementById("Avatar").style.top = "50%";
		document.getElementById("Avatar").style.left = "50%";
		document.getElementById("Avatar").style.marginRight = "-50%";
		document.getElementById("Avatar").style.transform = "translate(-50%, -50%)";
	}
	else
	{
		document.getElementById("Avatar").style.left = document.getElementById('StrPosX').value + 'px';
		document.getElementById("Avatar").style.top = document.getElementById('StrPosY').value + 'px'; 
	}
}

document.getElementById('togglecenter').addEventListener('change', function(event)
{
LoadAvatarPos();
});
LoadAvatarPos();

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

function ShareLink()
{
NewParam = "?" + // create very long parameter
	"AvatarAtCenter=" + document.getElementById('togglecenter').checked + "&" +
	"ShowBackground=" + document.getElementById('showbg').checked + "&" +
	"AvatarSize=" + document.getElementById('StrAvatarSize').value + "&" +
	"AvatarPosX=" + document.getElementById('StrPosX').value + "&" +
	"AvatarPosY=" + document.getElementById('StrPosY').value + "&" +
	"SpeechThreshold=" + document.getElementById('ThresholdValue').textContent + "&" +
	"ScreamThreshold=" + document.getElementById('ThresholdValueScream').textContent;

// Create a BoxArea and fill it with NewParam
var ConfigLink = DomainURL+NewParam
	document.getElementById("LinkToConfig").innerHTML = '<label for="Link:">Link:</label><br> <textarea id="newlink" name="link" rows="7" cols="25"</textarea>'
	document.getElementById('newlink').value = ConfigLink;
}


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

		// Event handler for audio processing
		ScriptProcessor.onaudioprocess = () =>
		{
			// Processing audio data
			const Array = new Uint8Array(Analyser.frequencyBinCount);
			Analyser.getByteFrequencyData(Array);
			const Values = Array.reduce((a, b) => a + b, 0);
			const Average = Values / Array.length;

			// Updating UI elements based on audio input
			const VoiceStatus = document.getElementById('VoiceStatus');
			const Threshold = parseInt(ThresholdSlider.value, 10);
			const ThresholdScream = parseInt(ThresholdSliderScream.value, 10);
			const VolumeLevel = document.getElementById('VolumeLevel');

			VolumeLevel.style.width = `${Average}%`;

			// Determining voice status based on audio volume
			if (Average > ThresholdScream)
			{
				VoiceStatus.textContent = 'Status: Screaming';
				Avatar.innerHTML = '<img width='+AvatarSize+'px src="'+AvatarScream+'" alt="Screaming Avatar">';
			}
			else if (Average > Threshold)
			{
				VoiceStatus.textContent = 'Status: Speaking';
				Avatar.innerHTML = '<img width='+AvatarSize+'px src="'+AvatarSpeak+'" alt="Speaking Avatar">';
			}
			else
			{
				VoiceStatus.textContent = 'Status: Silence';
				Avatar.innerHTML = '<img width='+AvatarSize+'px src="'+AvatarSilence+'" alt="Silent Avatar">';
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
