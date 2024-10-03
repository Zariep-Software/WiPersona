const url = window.location.href;
var DomainURL = window.location.origin + window.location.pathname;
const UrlObj = new URL(url);

var NotParam;
NotParam = (UrlObj.search === "");

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
		UpdateConfigCookies("AvatarEffect", document.getElementById('EffectSelect').value);
		UpdateConfigCookies("AvatarDimEffect", document.getElementById('DimEffectSelect').value);
		UpdateConfigCookies("AvatarAtCenter", document.getElementById('togglecenter').checked);
		UpdateConfigCookies("EffectOnScream", document.getElementById('effectonscream').checked);
		UpdateConfigCookies("BackgroundColor", document.getElementById('bgcolor').checked);
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
			UpdateConfigCookies("AvatarAtCenter", "true");
			UpdateConfigCookies("AvatarSize", 512);
			UpdateConfigCookies("AvatarEffect", "none");
			UpdateConfigCookies("AvatarDimEffect", "none");
			UpdateConfigCookies("EffectOnScream", "true");
			UpdateConfigCookies("ShowBackground", 0);
			UpdateConfigCookies("BackgroundColor", "#000");
			location.reload(true); // Reload the page to apply changes
		}
		else
		{}
	}
}

function ShareLink()
{

//let BgColor = document.getElementById('bgcolor').value.substring(1);

	NewParam = "?" + // create very long parameter
		"AvatarAtCenter=" + document.getElementById('togglecenter').checked + "&" +
		"BackgroundColor=" + document.getElementById('bgcolor').value.substring(1) + "&" +
		"ShowBackground=" + document.getElementById('showbg').checked + "&" +
		"AvatarSize=" + document.getElementById('StrAvatarSize').value + "&" +
		"AvatarPosX=" + document.getElementById('StrPosX').value + "&" +
		"AvatarPosY=" + document.getElementById('StrPosY').value + "&" +
		"AvatarEffect=" + document.getElementById('EffectSelect').value + "&" +
		"AvatarDimEffect=" + document.getElementById('DimEffectSelect').value + "&" +
		"EffectOnScream=" + document.getElementById('effectonscream').checked + "&" +
		"SpeechThreshold=" + document.getElementById('ThresholdValue').textContent + "&" +
		"ScreamThreshold=" + document.getElementById('ThresholdValueScream').textContent;

	// Create a BoxArea and fill it with NewParam
	var ConfigLink = DomainURL+NewParam
		document.getElementById("LinkToConfig").innerHTML = '<label for="Link:">Link:</label><br> <textarea id="newlink" name="link" rows="7" cols="25"</textarea>'
		document.getElementById('newlink').value = ConfigLink;
}