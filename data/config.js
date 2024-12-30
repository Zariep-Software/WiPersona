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
			if (!db.objectStoreNames.contains('settings')) {
				db.createObjectStore('settings', { keyPath: 'key' });
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
	SaveSetting('SpeechThreshold', document.getElementById('Threshold').value);
	SaveSetting('ScreamThreshold', document.getElementById('ThresholdScream').value);
	SaveSetting('AvatarEffect', document.getElementById('EffectSelect').value);
	SaveSetting('AvatarDimEffect', document.getElementById('DimEffectSelect').value);
	SaveSetting('AvatarAtCenter', document.getElementById('togglecenter').checked);
	SaveSetting('EffectOnScream', document.getElementById('effectonscream').checked);
	SaveSetting('BackgroundColor', document.getElementById('bgcolor').value);
	SaveSetting('ShowBackground', document.getElementById('showbg').checked);
}

function RestoreSettings()
{
	if (confirm("Are you sure?"))
{
		SaveSetting('AvatarSize', 512);
		SaveSetting('AvatarPosX', 0);
		SaveSetting('AvatarPosY', 0);
		SaveSetting('SpeechThreshold', 15);
		SaveSetting('ScreamThreshold', 30);
		SaveSetting('AvatarEffect', 'none');
		SaveSetting('AvatarDimEffect', 'none');
		SaveSetting('AvatarAtCenter', true);
		SaveSetting('EffectOnScream', false);
		SaveSetting('BackgroundColor', '#000');
		SaveSetting('ShowBackground', false);
		location.reload(true);
	}
}

function ShareLink() {
	const params = new URLSearchParams({
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
		ScreamThreshold: document.getElementById('ThresholdValueScream').textContent
	});
	const configLink = `${DomainURL}?${params.toString()}`;
	document.getElementById("LinkToConfig").innerHTML = `<label for="Link:">Link:</label><br> <textarea id="newlink" name="link" rows="7" cols="25">${configLink}</textarea>`;
}
