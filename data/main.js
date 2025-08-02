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
var toggleDraggable;
var CurrentWorkspace;
var Avatar = document.getElementById('Avatar');

var MicActive;
var MicInitialized;
var CurrentMic;

function GetParamValue(Param, DefaultValue)
{
	return searchParams.has(Param) ? searchParams.get(Param) : DefaultValue;
}

// Load settings from IndexedDB and initialize UI
function LoadSettings()
{
	// If URL has parameters, use them; otherwise use IndexedDB
	const useUrlParams = !NotParam;

	const settings =
	{
		AvatarSize: GetParamValue('AvatarSize', null),
		AvatarAtCenter: GetParamValue('AvatarAtCenter', null),
		AvatarPosX: GetParamValue('AvatarPosX', null),
		AvatarPosY: GetParamValue('AvatarPosY', null),
		AvatarEffect: GetParamValue('AvatarEffect', null),
		AvatarDimEffect: GetParamValue('AvatarDimEffect', null),
		EffectOnScream: GetParamValue('EffectOnScream', null),
		BackgroundColor: GetParamValue('BackgroundColor', null),
		ShowBackground: GetParamValue('ShowBackground', null),
		SpeechThreshold: GetParamValue('SpeechThreshold', null),
		ScreamThreshold: GetParamValue('ScreamThreshold', null),
		DesiredMicrophone: GetParamValue('DesiredMicrophone', null),
		ToggleDraggable: GetParamValue('ToggleDraggable', null),
		CurrentWorkspace: GetParamValue('CurrentWorkspace', null)
	};

	const settingsPromises = Object.entries(settings).map(([key, value]) =>
	{
		if (useUrlParams && value !== null)
		{
			// Parse booleans and numbers if needed
			let parsedValue = value;
			if (value === 'true') parsedValue = true;
			else if (value === 'false') parsedValue = false;
			else if (!isNaN(value)) parsedValue = Number(value);

			document.getElementById('str-saveconfig').classList.add('hidden');
			document.getElementById('str-restoredefaults').classList.add('hidden');
			return Promise.resolve(parsedValue);
		}
		return GetSetting(key, getDefaultValue(key));
	});

	Promise.all(settingsPromises).then(values =>
	{
		const [
			avatarSize, avatarAtCenter, avatarPosX, avatarPosY, avatarEffect,
			avatarDimEffect, effectOnScream, backgroundColor, showBackground,
			speechThreshold, screamThreshold, DesiredMicrophone,
			toggleDraggable, tempWorkspace
		] = values;

		CurrentWorkspace = tempWorkspace;

		document.getElementById('workspace-btn').textContent = CurrentWorkspace;
			try
			{
				document.getElementById('workspace-btn').textContent = CurrentWorkspace;
				updateImages();
			}
			catch (error)
			{
				console.error('Error loading workspace on startup:', error);
				CurrentWorkspace = 'default';
				document.getElementById('workspace-btn').textContent = CurrentWorkspace;
			}

		document.getElementById('togglecenter').checked = avatarAtCenter;
		document.getElementById('StrAvatarSize').value = avatarSize;
		document.getElementById('StrPosX').value = avatarPosX;
		document.getElementById('StrPosY').value = avatarPosY;
		document.getElementById('EffectSelect').value = avatarEffect;
		document.getElementById('DimEffectSelect').value = avatarDimEffect;
		document.getElementById('effectonscream').checked = effectOnScream;
		document.getElementById('bgcolor').value = backgroundColor;
		document.getElementById('showbg').checked = showBackground;
		document.getElementById('toggledraggable').checked = toggleDraggable;


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
		CurrentMic = DesiredMicrophone;
		Avatar.style.width = avatarSize + 'px';
		Avatar.style.height = avatarSize + 'px';

		ShowBackground = showBackground;
		AvatarEffect = avatarEffect;
		AvatarDimEffect = avatarDimEffect;
		document.body.style.backgroundColor = backgroundColor;

		LoadAvatarPos();
	}).catch(error => console.error('Error loading settings:', error));
}

function getDefaultValue(key)
{
	const defaults =
	{
		AvatarSize: 512,
		AvatarAtCenter: true,
		AvatarPosX: 0,
		AvatarPosY: 0,
		AvatarEffect: 'none',
		AvatarDimEffect: 'none',
		EffectOnScream: false,
		BackgroundColor: '#000000',
		ShowBackground: false,
		SpeechThreshold: 15,
		ScreamThreshold: 30,
		DesiredMicrophone: 'Default',
		ToggleDraggable: 'Default',
		CurrentWorkspace: 'Default'
	};
	return defaults[key];
}

const DB_NAME = 'WiPersona';
const ASSETS_STORE_NAME = 'assets';
const SETTINGS_STORE_NAME = 'settings';
let db;

function OpenDB()
{
	return new Promise((resolve, reject) =>
	{
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = function (event)
		{
			db = event.target.result;

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
			document.getElementById('talkingPreview').src = AvatarSpeak;
		AvatarSilence = silence || LocalAvatarSilence;
			document.getElementById('mutePreview').src = AvatarSilence;
		AvatarScream = scream || LocalAvatarScream;
			document.getElementById('screamingPreview').src = AvatarScream;
		Background = background || LocalBackground;

		if (ShowBackground === true)
		{
			document.body.style.backgroundImage = `url(${Background})`;
			document.body.style.backgroundRepeat = "no-repeat";
			document.body.style.backgroundSize = "cover";
			document.body.style.backgroundAttachment = "fixed";
		}
		if (Background)
		{
			document.getElementById('bgImagePreview').src = Background;
			document.getElementById('bgImagePreview').classList.remove('hidden');
			document.getElementById('str-choosefile').classList.add('hidden');
		}

	}).catch((error) =>
	{
		console.error('Error loading avatar images:', error);
	});
}

const saveFile = async (workspace, fileId, file) =>
{
	try
	{
		const base64 = await ConvertFileToBase64(file);
		const key = `${workspace}-${fileId}`;
		SaveImageToDB(base64, key);

		// Update image preview in UI
		updatePreview(fileId, base64);
	}
	catch (err)
	{
		console.error("Error saving file:", err);
	}
};

const updatePreview = (fileId, result) =>
{
	const previewMap =
	{
		'AvatarMuted': 'mutePreview',
		'AvatarSpeaking': 'talkingPreview',
		'AvatarScreaming': 'screamingPreview'
	};
	const previewId = previewMap[fileId];
	if (previewId)
	{
		const img = document.getElementById(previewId);
		img.src = result;

		// fallback logic after setting src
		switch (previewId)
		{
			case 'talkingPreview':
			AvatarSpeak = img.src || LocalAvatarSpeak;
			img.src = AvatarSpeak;
			break;
			case 'mutePreview':
			AvatarSilence = img.src || LocalAvatarSilence;
			img.src = AvatarSilence;
			break;
			case 'screamingPreview':
			AvatarScream = img.src || LocalAvatarScream;
			img.src = AvatarScream;
			break;
		}
	}
};

const loadImage = async (workspace, fileId, imgElement) =>
{
	try
	{
		const key = `${workspace}-${fileId}`;
		const imageData = await GetImageFromDB(key);
		imgElement.src = imageData || '';
	}
	catch (error)
	{
		console.log(`Error loading image ${workspace}-${fileId}:`, error);
	}
};

const updateImages = async () =>
{
	const talkingPreview = document.getElementById('talkingPreview');
	const mutePreview = document.getElementById('mutePreview');
	const screamingPreview = document.getElementById('screamingPreview');

	// Helper function to load image and check validity
	const loadAndValidate = async (workspace, imageName, imgElement, localFallback) =>
	{
		await loadImage(workspace, imageName, imgElement);

		// Wait for image to fully load
		await new Promise((resolve) =>
		{
			if (imgElement.complete)
			{
				resolve();
			}
			else
			{
				imgElement.onload = () => resolve();
				imgElement.onerror = () => resolve();
			}
		});

		if (imgElement.naturalWidth === 0)
		{
			imgElement.src = localFallback;
			return localFallback;
		}
		return imgElement.src;
	};

	console.log(CurrentWorkspace);
	AvatarSpeak = await loadAndValidate(CurrentWorkspace, 'AvatarSpeaking', talkingPreview, LocalAvatarSpeak);
	AvatarSilence = await loadAndValidate(CurrentWorkspace, 'AvatarMuted', mutePreview, LocalAvatarSilence);
	AvatarScream = await loadAndValidate(CurrentWorkspace, 'AvatarScreaming', screamingPreview, LocalAvatarScream);
};

['AvatarMuted', 'AvatarSpeaking', 'AvatarScreaming'].forEach(id =>
{
	const input = document.getElementById(id);
	const buttonMap =
	{
		'AvatarMuted': 'muteButton',
		'AvatarSpeaking': 'talkingButton',
		'AvatarScreaming': 'screamingButton'
	};
	const btn = document.getElementById(buttonMap[id]);

	input.onchange = () =>
	{
		if (input.files[0])
		{
			saveFile(CurrentWorkspace, id, input.files[0]);
		}
	};
});

const getAllWorkspaces = async () =>
{
	return new Promise((resolve, reject) =>
	{
		OpenSettingsDB().then(db =>
		{
			const transaction = db.transaction(ASSETS_STORE_NAME, 'readonly');
			const store = transaction.objectStore(ASSETS_STORE_NAME);
			const request = store.getAllKeys();

			request.onsuccess = () =>
			{
				const keys = request.result;
				const imageKeys = keys.filter(key => key.includes('-') && ['AvatarMuted', 'AvatarSpeaking', 'AvatarScreaming'].includes(key.split('-')[1]));
				const workspaces = [...new Set(imageKeys.map(k => k.split('-')[0]))];
				resolve(workspaces);
			};

			request.onerror = () => reject(request.error);
		}).catch(error => reject(error));
	});
};

const showOverlay = async () =>
{
	try
	{
		const workspaces = await getAllWorkspaces();
		const container = document.getElementById('workspace-container');
		container.innerHTML = '';

	workspaces.forEach(ws =>
	{
		const h2 = document.createElement('h2');
		h2.textContent = ws;

		const div = document.createElement('div');
			div.classList.add('ws-container');
		const btn = document.createElement('button');
			btn.className = 'workspace-select-btn';

		['AvatarMuted', 'AvatarSpeaking', 'AvatarScreaming'].forEach(id =>
		{
			const container = document.createElement('div');
			container.classList.add('ws-img');
			const img = document.createElement('img');
			loadImage(ws, id, img);

			container.appendChild(img);

			//const small = document.createElement('small');
			//small.textContent = id.replace('Avatar', '');
			//container.appendChild(small);
			btn.appendChild(container);
		});

		btn.onclick = () =>
		{
			CurrentWorkspace = ws;
			document.getElementById('workspace-btn').textContent = ws;
			document.getElementById('workspace-overlay').style.display = 'none';
			updateImages();
		};

		container.appendChild(h2);
		div.appendChild(btn);

		if (ws !== 'default')
		{
			const delBtn = document.createElement('button');
			delBtn.textContent = 'Delete';
			delBtn.onclick = async () =>
			{
				// Delete images from 'assets' store
				OpenDB().then(db =>
				{
					const tx = db.transaction(ASSETS_STORE_NAME, 'readwrite');
					const store = tx.objectStore(ASSETS_STORE_NAME);
					['AvatarMuted', 'AvatarSpeaking', 'AvatarScreaming'].forEach(id =>
					{
						const key = `${ws}-${id}`;
						store.delete(key);
					});
				});

				if (ws === CurrentWorkspace)
				{
					CurrentWorkspace = 'default';
					SaveSetting('CurrentWorkspace', 'default');
					document.getElementById('workspace-btn').textContent = 'default';
				}

				showOverlay();
				updateImages();
			};

			div.appendChild(delBtn);
		}

		container.appendChild(div);
	});
	}
	catch (error)
	{
		console.error('Error showing overlay:', error);
	}
};

function createNewWorkspace()
{
	const nameInput = document.getElementById('new-workspace-name');
	const name = nameInput.value.trim();
	if (name && name.toLowerCase() !== 'default')
	{
		CurrentWorkspace = name;
		SaveSetting('CurrentWorkspace', name);
		document.getElementById('workspace-btn').textContent = name;
		document.getElementById('workspace-overlay').style.display = 'none';
		updateImages();
		nameInput.value = '';
	}
}

function closeOverlay()
{
	document.getElementById('workspace-overlay').style.display = 'none';
}

window.createNewWorkspace = createNewWorkspace;
window.closeOverlay = closeOverlay;

document.getElementById('workspace-btn').onclick = () =>
{
	document.getElementById('workspace-overlay').style.display = 'block';
	showOverlay();
};

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
	if (!MicInitialized)
	{
		document.getElementById('Status0').classList.remove('hidden');
	}

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
				MicInitialized = 1;
			}
		};
	}
	catch (Error)
	{
		document.getElementById('Status1').style.display = 'inline-block';
		console.error('Error requesting microphone permission:', Error);
		MicInitialized = 0;
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
	if (MicInitialized)
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
	}
});

document.addEventListener('DOMContentLoaded', () =>
{
	const avatarSizeInput = document.getElementById('StrAvatarSize');
	const resizeHandle = document.querySelector('#avatarmenu span');

	let resizing = false;
	let startY = 0;
	let startSize = 0;

	resizeHandle.addEventListener('mousedown', (e) =>
	{
		e.preventDefault();
		resizing = true;
		startY = e.clientY;
		startSize = parseInt(avatarSizeInput.value, 10);
		document.body.style.userSelect = 'none'; // prevent text selection
	});

	document.addEventListener('mousemove', (e) =>
	{
		if (!resizing) return;
		const dy = e.clientY - startY;
		const newSize = Math.max(32, Math.min(9999, startSize + dy * 2)); // Sensitivity factor
		avatarSizeInput.value = newSize;
		// Optionally, update Avatar element size here too:
		document.getElementById('Avatar').style.width = `${newSize}px`;
		document.getElementById('Avatar').style.height = `${newSize}px`;
	});

	document.addEventListener('mouseup', () =>
	{
		if (resizing)
		{
			resizing = false;
			const toggleMenu = document.getElementById("togglemenu");
			if (toggleMenu)
			{
				toggleMenu.checked = !toggleMenu.checked;
			}
		}
		document.body.style.userSelect = '';
	});

	resizeHandle.addEventListener('touchstart', (e) =>
	{
		e.preventDefault();
		resizing = true;
		startY = e.touches[0].clientY;
		startSize = parseInt(avatarSizeInput.value, 10);
		document.body.style.userSelect = 'none';
	}, { passive: false });

	document.addEventListener('touchmove', (e) =>
	{
		if (!resizing) return;
		const dy = e.touches[0].clientY - startY;
		const newSize = Math.max(32, Math.min(9999, startSize + dy * 2));
		avatarSizeInput.value = newSize;
		document.getElementById('Avatar').style.width = `${newSize}px`;
		document.getElementById('Avatar').style.height = `${newSize}px`;
		e.preventDefault(); // prevent scrolling while resizing
	}, { passive: false });

	document.addEventListener('touchend', () =>
	{
		if (resizing)
		{
			resizing = false;
			const toggleMenu = document.getElementById("togglemenu");
			if (toggleMenu)
			{
				toggleMenu.checked = !toggleMenu.checked;
			}
		}
		document.body.style.userSelect = '';
	});

});

document.getElementById("toggledraggable").addEventListener("change", () =>
{
	const canvas = document.getElementById("canvas");
	if (event.target.checked)
	{
		canvas.classList.remove("hidden");
	}
	else
	{
		canvas.classList.add("hidden");
	}
});

// Draggable avatar feature
const avatar = document.getElementById("Avatar");
const posXInput = document.getElementById("StrPosX");
const posYInput = document.getElementById("StrPosY");

let offsetX = 0, offsetY = 0;
let isDragging = false;

function startDrag(clientX, clientY)
{
	isDragging = true;
	avatar.classList.add("dragging");
	offsetX = clientX - avatar.offsetLeft;
	offsetY = clientY - avatar.offsetTop;
}

function doDrag(clientX, clientY)
{
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

function endDrag()
{
	if (isDragging)
	{
		isDragging = false;
		avatar.classList.remove("dragging");
		document.getElementById('togglemenu').checked = false;
	}
}

// Mouse Events
avatar.addEventListener("mousedown", (e) =>
{
	if (e.target.closest('#avatarmenu'))
	{
		// Clicked inside the menu, don't start dragging
		return;
	}
	startDrag(e.clientX, e.clientY);
});

document.addEventListener("mousemove", (e) => doDrag(e.clientX, e.clientY));
document.addEventListener("mouseup", endDrag);

// Touch Events
avatar.addEventListener("touchstart", (e) =>
{
	const touch = e.touches[0];
	startDrag(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener("touchmove", (e) =>
{
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
		const overlay = document.getElementById("workspace-overlay");
		if (window.getComputedStyle(overlay).display == "none")
		{
			const toggleMenu = document.getElementById("togglemenu");
			if (toggleMenu)
			{
				toggleMenu.checked = !toggleMenu.checked;
			}
		}
		else
		{
			closeOverlay()
		}
	}
});

// List app as installable in Chrome?
if ('serviceWorker' in navigator)
{
	navigator.serviceWorker.register('sw.js');
}
