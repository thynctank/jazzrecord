package org.jazzrecord.titanium.mobile;

import org.appcelerator.titanium.TiApplication;

public class Titanium_mobileApplication extends TiApplication {

	@Override
	public void onCreate() {
		super.onCreate();
		
		appInfo = new Titanium_mobileAppInfo(this);
	}
}
