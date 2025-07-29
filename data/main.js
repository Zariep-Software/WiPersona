// Parse parameters and declare NotParam if there is not parameters
const url = window.location.href;
var DomainURL = window.location.origin + window.location.pathname;
const UrlObj = new URL(url);
var NotParam;
NotParam = (UrlObj.search === "");
const searchParams = new URLSearchParams(UrlObj.search);

// Retrieve a setting from IndexedDB
function GetSetting(key, defaultValue)
{
	return new Promise((resolve, reject) =>
	{
		OpenSettingsDB().then(db =>
		{
			const transaction = db.transaction('settings', 'readonly');
			const store = transaction.objectStore('settings');
			const request = store.get(key);

			request.onsuccess = function (event)
			{
				if (event.target.result)
				{
					resolve(event.target.result.value);
				}
				else
				{
					resolve(defaultValue);
				}
			};

			request.onerror = function (event)
			{
				reject(event.target.error);
			};
		}).catch(error => reject('Error opening DB:', error));
	});
}

// Assigning resources to variables
const body = document.getElementById('body');
import { LocalBackground, LocalAvatarSpeak, LocalAvatarSilence, LocalAvatarScream } from './res/sourcelist.js';
var Background;
var AvatarSpeak;
var AvatarSilence;
var AvatarScream;
var AvatarSize;
var AvatarEffect;
var AvatarDimEffect;
var EffectOnScream;
var ShowBackground;
var Avatar = document.getElementById('Avatar');

var MicActive;
var CurrentMic;

// Load settings from IndexedDB and initialize UI
function LoadSettings()
{
	Promise.all([
		GetSetting('AvatarSize', 512),
		GetSetting('AvatarAtCenter', true),
		GetSetting('AvatarPosX', 0),
		GetSetting('AvatarPosY', 0),
		GetSetting('AvatarEffect', 'none'),
		GetSetting('AvatarDimEffect', 'none'),
		GetSetting('EffectOnScream', false),
		GetSetting('BackgroundColor', '#000000'),
		GetSetting('ShowBackground', false),
		GetSetting('SpeechThreshold', 15),
		GetSetting('ScreamThreshold', 30),
		GetSetting('DesiredMicrophone', 'Default')
	]).then(([avatarSize, avatarAtCenter, avatarPosX, avatarPosY, avatarEffect, avatarDimEffect, effectOnScream, backgroundColor, showBackground, speechThreshold, screamThreshold, DesiredMicrophone]) =>
	{
		// Update UI elements
		document.getElementById('togglecenter').checked = avatarAtCenter;
		document.getElementById('StrAvatarSize').value = avatarSize;
		document.getElementById('StrPosX').value = avatarPosX;
		document.getElementById('StrPosY').value = avatarPosY;
		document.getElementById('EffectSelect').value = avatarEffect;
		document.getElementById('DimEffectSelect').value = avatarDimEffect;
		document.getElementById('effectonscream').checked = effectOnScream;
		document.getElementById('bgcolor').value = backgroundColor;
		document.getElementById('showbg').checked = showBackground;
			if (showBackground)
			{
				body.style.backgroundImage = `url(${Background})`;
				document.body.style.backgroundRepeat = "no-repeat";
				document.body.style.backgroundSize = "cover";
				document.body.style.backgroundAttachment = "fixed";
			}
		document.getElementById('Threshold').value = speechThreshold;
		document.getElementById('ThresholdValue').textContent = speechThreshold;
		document.getElementById('ThresholdScream').value = screamThreshold;
		document.getElementById('ThresholdValueScream').textContent = screamThreshold;
		CurrentMic = DesiredMicrophone
				Avatar.style.width = avatarSize + 'px';
				Avatar.style.height = avatarSize + 'px';

		ShowBackground = showBackground;
		AvatarEffect = avatarEffect;
		AvatarDimEffect = avatarDimEffect;

		// Apply settings
		document.body.style.backgroundColor = backgroundColor;
		LoadAvatarPos();
	}).catch(error => console.error('Error loading settings:', error));
}

function GetParamValue(Param, DefaultValue)
{
	return searchParams.has(Param) ? searchParams.get(Param) : DefaultValue;
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

// Constants for IndexedDB
const DB_NAME = 'WiPersona';
const ASSETS_STORE_NAME = 'assets';
const SETTINGS_STORE_NAME = 'settings';
let db;

// Open or create the consolidated IndexedDB database
function OpenDB()
{
	return new Promise((resolve, reject) =>
	{
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = function (event)
		{
			db = event.target.result;

			// Create stores if they doesn't exist
			if (!db.objectStoreNames.contains(ASSETS_STORE_NAME))
			{
				db.createObjectStore(ASSETS_STORE_NAME, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME))
			{
				db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'key' });
			}
		};

		request.onsuccess = function (event)
		{
			db = event.target.result;
			resolve(db);
		};

		request.onerror = function (event)
		{
			reject(event.target.error);
		};
	});
}

// Convert image file to base64
function ConvertFileToBase64(file)
{
	return new Promise((resolve, reject) =>
	{
		const reader = new FileReader();
		reader.onloadend = function ()
		{
			resolve(reader.result);
		};
		reader.onerror = function ()
		{
			reject("Error converting file to base64");
		};
		reader.readAsDataURL(file);
	});
}

// Save the base64 image to IndexedDB
function SaveImageToDB(base64Data, key)
{
	OpenDB().then((db) =>
	{
		const transaction = db.transaction(ASSETS_STORE_NAME, 'readwrite');
		const store = transaction.objectStore(ASSETS_STORE_NAME);

		store.put({ id: key, data: base64Data });

		transaction.oncomplete = function ()
		{
			console.log(`${key} saved successfully`);
		};

		transaction.onerror = function (event)
		{
			console.error('Error saving image:', event.target.error);
		};
	}).catch((error) =>
	{
		console.error('Error opening DB:', error);
	});
}

// Retrieve a specific image by key from IndexedDB
function GetImageFromDB(key)
{
	return new Promise((resolve, reject) =>
	{
		OpenDB().then((db) =>
		{
			const transaction = db.transaction(ASSETS_STORE_NAME, 'readonly');
			const store = transaction.objectStore(ASSETS_STORE_NAME);

			const request = store.get(key); // Get the image by key

			request.onsuccess = function (event)
			{
				resolve(event.target.result ? event.target.result.data : null); // Return the base64 data
			};

			request.onerror = function (event)
			{
				reject(event.target.error);
			};
		}).catch((error) =>
		{
			reject('Error opening DB:', error);
		});
	});
}

// Function to load the images when the web starts
function LoadAvatarImages()
{
	// Load the images from IndexedDB and store them in the variables
	Promise.all([
		GetImageFromDB('AvatarSpeak'),
		GetImageFromDB('AvatarSilence'),
		GetImageFromDB('AvatarScream'),
		GetImageFromDB('Background')
	]).then(([speak, silence, scream, background]) =>
	{
		AvatarSpeak = speak || LocalAvatarSpeak;
		AvatarSilence = silence || LocalAvatarSilence;
		AvatarScream = scream || LocalAvatarScream;
		Background = background || LocalBackground;

	if (ShowBackground === true)
	{
		document.body.style.backgroundImage = `url(${Background})`;
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundAttachment = "fixed";
	}

	}).catch((error) =>
	{
		console.error('Error loading avatar images:', error);
	});
}

// Avatar file listeners
document.getElementById('AvatarMuted').addEventListener('change', function (event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		ConvertFileToBase64(file).then((base64Data) =>
		{
			AvatarSilence = base64Data;
			SaveImageToDB(base64Data, 'AvatarSilence');
		}).catch((error) =>
		{
			console.error('Error converting AvatarMuted file:', error);
		});
	}
});

document.getElementById('AvatarSpeaking').addEventListener('change', function (event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		ConvertFileToBase64(file).then((base64Data) =>
		{
			AvatarSpeak = base64Data;
			SaveImageToDB(base64Data, 'AvatarSpeak');
		}).catch((error) =>
		{
			console.error('Error converting AvatarSpeak file:', error);
		});
	}
});

document.getElementById('AvatarScreaming').addEventListener('change', function (event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		ConvertFileToBase64(file).then((base64Data) =>
		{
			AvatarScream = base64Data;
			SaveImageToDB(base64Data, 'AvatarScream');
		}).catch((error) =>
		{
			console.error('Error converting AvatarScreaming file:', error);
		});
	}
});

// Background image listener
document.getElementById('SelectBG').addEventListener('change', function (event)
{
	const input = event.target;
	if (input.files.length > 0)
	{
		const file = input.files[0];
		ConvertFileToBase64(file).then((base64Data) =>
		{
			Background = base64Data;
			SaveImageToDB(base64Data, 'Background');

			document.body.style.backgroundImage = `url(${base64Data})`;
			document.body.style.backgroundRepeat = "no-repeat";
			document.body.style.backgroundSize = "cover";
			document.body.style.backgroundAttachment = "fixed";
		}).catch((error) =>
		{
			console.error('Error converting background file:', error);
		});
	}
});

// Background listener
document.getElementById('bgcolor').addEventListener('input', function(event)
{
	document.body.style.backgroundColor = event.target.value;
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
	Avatar.classList.add(AvatarDimEffect);
});
document.getElementById('effectonscream').addEventListener('change', function(event)
{
	EffectOnScream = document.getElementById('effectonscream').checked;
});

// Change background when show "background" button is clicked
document.getElementById('showbg').addEventListener('change', function()
{
	if (this.checked)
	{
		body.style.backgroundImage = `url(${Background})`;
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundAttachment = "fixed";
	}
	else
	{
		body.style.backgroundImage = "";
	}
});

window.addEventListener('load', function ()
{
	LoadAvatarImages();
	LoadSettings();
});

function ListMicrophones()
{
	const microphoneSelect = document.getElementById('MicrophoneList');

	// Get the list of media devices
	navigator.mediaDevices.enumerateDevices()
		.then(devices =>
		{
			// Filter out devices that are not microphones
			const microphones = devices.filter(device => device.kind === 'audioinput');

			// If no microphones are found
			if (microphones.length === 0)
			{
				const noMicOption = document.createElement('option');
				noMicOption.textContent = 'No microphones found.';
				noMicOption.disabled = true;
				microphoneSelect.appendChild(noMicOption);
			}
			else
			{
				// Loop through microphones and add them as options
				microphones.forEach(mic =>
				{
					const micOption = document.createElement('option');
					micOption.value = mic.deviceId;
					micOption.textContent = mic.label || `Unnamed Microphone (ID: ${mic.deviceId})`;
					microphoneSelect.appendChild(micOption);
				});

				// Set the desired mic in the mic list, if not available, set the first option of the list
				// This behavior fallback to the Default device, but when the device is available again, it set it properly
				const isValidOption = [...microphoneSelect.options].some(option => option.value === CurrentMic);
				microphoneSelect.value = isValidOption ? CurrentMic : microphoneSelect.options[0].value;
			}
		})
		.catch(err =>
		{
			console.error('Error accessing media devices:', err);
			const errorOption = document.createElement('option');
			errorOption.textContent = 'Error accessing media devices.';
			errorOption.disabled = true;
			microphoneSelect.appendChild(errorOption);
		});
}

var Stream = null;
var audioCtx = null;
var isCancelled = false;

async function StartMicrophone(selectedDeviceId)
{
	document.getElementById('Status0').classList.remove('hidden');
	if (Stream)
	{
		Stream.getTracks().forEach(track => track.stop());
	}
	Stream = null;

	try
	{
		if (!MicActive)
		{
			MicActive = 1;
			document.getElementById('RequestMicrophone').style.display = "none";
			document.getElementById('str-micaccess').style.display = "none";
		}
		else
		{
			MicActive = 0;
			return;
		}

		const constraints =
		{
			audio: { deviceId: selectedDeviceId }
		};

		Stream = await navigator.mediaDevices.getUserMedia(constraints);
		document.querySelectorAll('.ph').forEach(element =>
		{
			element.style.display = 'inline-block';
		});

		if (audioCtx)
		{
			audioCtx.close();
		}
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();

		let Analyser = audioCtx.createAnalyser();
		let Microphone = audioCtx.createMediaStreamSource(Stream);
		let ScriptProcessor = audioCtx.createScriptProcessor(256, 1, 1);

		Analyser.smoothingTimeConstant = 0.3;
		Analyser.fftSize = 1024;

		Microphone.connect(Analyser);
		Analyser.connect(ScriptProcessor);
		ScriptProcessor.connect(audioCtx.destination);

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

		ThresholdSlider.addEventListener('input', () =>
		{
			ThresholdValueDisplay.textContent = ThresholdSlider.value;
			ThresholdLine.style.left = `${ThresholdSlider.value}%`;
		});

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
			var Array = new Uint8Array(Analyser.frequencyBinCount);
			Analyser.getByteFrequencyData(Array);
			var Values = Array.reduce((a, b) => a + b, 0);
			var Average = Values / Array.length;

			var VoiceStatus = document.getElementById('VoiceStatus');
			var Threshold = parseInt(ThresholdSlider.value, 10);
			var ThresholdScream = parseInt(ThresholdSliderScream.value, 10);
			var VolumeLevel = document.getElementById('VolumeLevel');

			VolumeLevel.style.width = `${Average}%`;

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
			else
			{
				NewStatus = 'Status: Silence';
				NewAvatar = "Silence";
			}

			// Update voice and avatar status only if there is a real change and enough time has passed
			const CurrentTime = new Date().getTime();
			if ((NewAvatar !== PreviousAvatar || VoiceStatus.textContent !== NewStatus) && (CurrentTime - LastUpdateTime > UpdateDelay))
			{
				if (CurrentMic != selectedDeviceId)
				{
					Stream.getTracks().forEach(track => track.stop());
					return 1;
				}

				VoiceStatus.textContent = NewStatus;

				function addDynamicCSSRule(className, imageUrl)
				{
					const styleSheet = document.styleSheets[0];
					const rule = `.${className} { background-image: url(${imageUrl}); }`;
					for (let i = 0; i < styleSheet.cssRules.length; i++)
					{
						if (styleSheet.cssRules[i].selectorText === `.${className}`)
						{
							styleSheet.deleteRule(i);
							break;
						}
					}
					styleSheet.insertRule(rule, styleSheet.cssRules.length);
				}

				addDynamicCSSRule('Scream', AvatarScream);
				addDynamicCSSRule('Speak', AvatarSpeak);
				addDynamicCSSRule('Silence', AvatarSilence);

				Avatar.classList.remove('Scream', 'Speak', 'Silence', AvatarEffect);
				Avatar.style.width = AvatarSize + 'px';
				Avatar.style.height = AvatarSize + 'px';

				if (NewAvatar === "Scream")
				{
					Avatar.classList.add('Scream');
					if (EffectOnScream)
					{
						Avatar.className = 'Scream';
						void Avatar.offsetWidth;
						Avatar.classList.add(AvatarEffect, AvatarDimEffect);
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
						Avatar.classList.add(AvatarEffect, AvatarDimEffect);
					}
					else if (PreviousAvatar === "Scream")
					{
						Avatar.className = 'Speak';
						Avatar.classList.add(AvatarDimEffect + 0);
					}
				}
				else
				{
					Avatar.className = 'Silence';
					Avatar.classList.add(AvatarEffect, AvatarDimEffect);
				}

				void Avatar.offsetWidth;
				PreviousAvatar = NewAvatar;
				LastUpdateTime = CurrentTime;
			}
		};
	}
	catch (Error)
	{
		document.getElementById('Status1').style.display = 'inline-block';
		console.error('Error requesting microphone permission:', Error);
	}
	setTimeout(function()
	{
		document.getElementById('Status0').classList.add('hidden');
	}, 3000);
}

function StopMicrophone()
{
	if (Stream)
	{
		Stream.getTracks().forEach(track => track.stop());
		Stream = null;
	}
	if (audioCtx && audioCtx.state !== 'closed')
	{
		audioCtx.close();
		audioCtx = null;
	}
	isCancelled = true;
}

document.getElementById('MicrophoneList').addEventListener('change', async function ()
{
	StopMicrophone();
	CurrentMic = this.value;
	MicActive = 0;
	StartMicrophone(CurrentMic);
});

document.getElementById('RequestMicrophone').addEventListener('click', async () =>
{
	ListMicrophones();
	StartMicrophone(CurrentMic);
});

document.getElementById('ToggleMicrophone').addEventListener('click', async () =>
{
	if (MicActive === 0)
	{
		StartMicrophone(CurrentMic);
		MicActive = 1;
	}
	else
	{
		StopMicrophone();
		MicActive = 0;
		VoiceStatus.textContent = "Status: Paused";
	}
});

// Draggable avatar feature
const avatar = document.getElementById("Avatar");
const posXInput = document.getElementById("StrPosX");
const posYInput = document.getElementById("StrPosY");

let offsetX = 0, offsetY = 0;
let isDragging = false;

function startDrag(clientX, clientY) {
	isDragging = true;
	avatar.classList.add("dragging");
	offsetX = clientX - avatar.offsetLeft;
	offsetY = clientY - avatar.offsetTop;
}

function doDrag(clientX, clientY) {
	if (!isDragging) return;

	let avatarAtCenter = document.getElementById('togglecenter').checked;
	if (avatarAtCenter) return;

	let newLeft = clientX - offsetX;
	let newTop = clientY - offsetY;

	avatar.style.left = `${newLeft}px`;
	avatar.style.top = `${newTop}px`;

	posXInput.value = Math.round(newLeft);
	posYInput.value = Math.round(newTop);
}

function endDrag() {
	if (isDragging) {
		isDragging = false;
		avatar.classList.remove("dragging");
		document.getElementById('togglemenu').checked = false;
	}
}

// Mouse Events
avatar.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
document.addEventListener("mousemove", (e) => doDrag(e.clientX, e.clientY));
document.addEventListener("mouseup", endDrag);

// Touch Events
avatar.addEventListener("touchstart", (e) => {
	const touch = e.touches[0];
	startDrag(touch.clientX, touch.clientY);
});

document.addEventListener("touchmove", (e) => {
	if (!isDragging) return;
	const touch = e.touches[0];
	doDrag(touch.clientX, touch.clientY);
	e.preventDefault(); // prevent scrolling while dragging
}, { passive: false });

document.addEventListener("touchend", endDrag);

document.addEventListener("keydown", function (event)
{
	if (event.key === "Escape")
	{
		const toggleMenu = document.getElementById("togglemenu");
		if (toggleMenu)
		{
			toggleMenu.checked = !toggleMenu.checked;
		}
	}
});


