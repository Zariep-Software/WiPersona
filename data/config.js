const url = window.location.href;
var DomainURL = window.location.origin + window.location.pathname;
const UrlObj = new URL(url);

var NotParam;
NotParam = (UrlObj.search === "");

// Open or create IndexedDB database
function OpenSettingsDB()
{
	return new Promise((resolve, reject) =>
	{
		const request = indexedDB.open('WiPersona', 1);

		request.onupgradeneeded = function (event)
		{
			const db = event.target.result;
			if (!db.objectStoreNames.contains('settings'))
			{
				db.createObjectStore('settings', { keyPath: 'key' });
			}
			if (!db.objectStoreNames.contains('assets'))
			{
				db.createObjectStore('assets', { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains('images'))
			{
				const store = db.createObjectStore('images', { keyPath: 'id' });
				store.createIndex('type', 'type', { unique: false });
				store.createIndex('timestamp', 'timestamp', { unique: false });
			}
		};

		request.onsuccess = function (event)
		{
			resolve(event.target.result);
		};

		request.onerror = function (event)
		{
			reject(event.target.error);
		};
	});
}

// Save a setting to IndexedDB
function SaveSetting(key, value)
{
	OpenSettingsDB().then(db =>
	{
		const transaction = db.transaction('settings', 'readwrite');
		const store = transaction.objectStore('settings');
		store.put({ key, value });

		//transaction.oncomplete = () => console.log(`Setting ${key} saved.`);
		transaction.onerror = event => console.error(`Error saving ${key}:`, event.target.error);
	}).catch(error => console.error('Error opening DB:', error));
}

function SaveSettings()
{
	SaveSetting('AvatarSize', document.getElementById('StrAvatarSize').value);
	SaveSetting('AvatarPosX', document.getElementById('StrPosX').value);
	SaveSetting('AvatarPosY', document.getElementById('StrPosY').value);
	SaveSetting('DesiredMicrophone', document.getElementById('MicrophoneList').value);
	SaveSetting('SpeechThreshold', document.getElementById('Threshold').value);
	SaveSetting('ScreamThreshold', document.getElementById('ThresholdScream').value);
	SaveSetting('AvatarEffect', document.getElementById('EffectSelect').value);
	SaveSetting('AvatarDimEffect', document.getElementById('DimEffectSelect').value);
	SaveSetting('AvatarAtCenter', document.getElementById('togglecenter').checked);
	SaveSetting('EffectOnScream', document.getElementById('effectonscream').checked);
	SaveSetting('BackgroundColor', document.getElementById('bgcolor').value);
	SaveSetting('ShowBackground', document.getElementById('showbg').checked);
	SaveSetting('ToggleDraggable', document.getElementById('toggledraggable').checked);
	SaveSetting('CurrentWorkspace', document.getElementById('workspace-btn').textContent);
	const el = document.getElementById('str-configurationsaved');
		el.classList.remove('hidden');
		setTimeout(() => {el.classList.add('hidden');}, 3000);
}

function RestoreSettings()
{
	if (confirm("Are you sure?"))
	{
		SaveSetting('AvatarSize', 512);
		SaveSetting('AvatarPosX', 0);
		SaveSetting('AvatarPosY', 0);
		SaveSetting('DesiredMicrophone', 'Default');
		SaveSetting('SpeechThreshold', 15);
		SaveSetting('ScreamThreshold', 30);
		SaveSetting('AvatarEffect', 'none');
		SaveSetting('AvatarDimEffect', 'none');
		SaveSetting('AvatarAtCenter', true);
		SaveSetting('EffectOnScream', false);
		SaveSetting('BackgroundColor', '#000');
		SaveSetting('ShowBackground', false);
		SaveSetting('ToggleDraggable', true);
		SaveSetting('CurrentWorkspace', 'Default');
		location.reload(true);
	}
}

function copyConfigLink()
{
	const textarea = document.getElementById("newlink");
	textarea.select();
	textarea.setSelectionRange(0, 99999);
	document.execCommand("copy");
}

function ShareLink()
{
	const params = new URLSearchParams(
	{
		AvatarAtCenter: document.getElementById('togglecenter').checked,
		BackgroundColor: document.getElementById('bgcolor').value.substring(1),
		ShowBackground: document.getElementById('showbg').checked,
		AvatarSize: document.getElementById('StrAvatarSize').value,
		AvatarPosX: document.getElementById('StrPosX').value,
		AvatarPosY: document.getElementById('StrPosY').value,
		AvatarEffect: document.getElementById('EffectSelect').value,
		AvatarDimEffect: document.getElementById('DimEffectSelect').value,
		EffectOnScream: document.getElementById('effectonscream').checked,
		SpeechThreshold: document.getElementById('ThresholdValue').textContent,
		ScreamThreshold: document.getElementById('ThresholdValueScream').textContent,
		DesiredMicrophone: document.getElementById('MicrophoneList').value,
		ToggleDraggable: document.getElementById('toggledraggable').value,
		CurrentWorkspace: document.getElementById('workspace-btn').textContent
	});
	const configLink = `${DomainURL}?${params.toString()}`;
	document.getElementById("LinkToConfig").innerHTML = `<label for="Link:">Link:</label>
<br> <textarea id="newlink" name="link" rows="7" cols="25">${configLink}</textarea>
<br><button id="copylink" onclick="copyConfigLink()"> <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-copy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg><text id="str-copytoclipboard" >Copy to Clipboard</text></button>
`;
SJTSW_TranslatePage();
}
