// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

//
// create root window
//
var window = Titanium.UI.createWindow();
var specRunner = Titanium.UI.createWebView({
  url: "titanium_mobile_spec_runner.html"
});
window.add(specRunner);
window.open({fullscreen: true});