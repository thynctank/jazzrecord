package org.jazzrecord.titanium.mobile;

import org.appcelerator.titanium.ITiAppInfo;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiProperties;
import org.appcelerator.titanium.util.Log;

/* GENERATED CODE
 * Warning - this class was generated from your application's tiapp.xml
 * Any changes you make here will be overwritten
 */
public class Titanium_mobileAppInfo implements ITiAppInfo
{
	private static final String LCAT = "AppInfo";
	
	public Titanium_mobileAppInfo(TiApplication app) {
		TiProperties properties = app.getAppProperties();
					
		properties.setString("ti.deploytype", "development");
	}
	
	public String getId() {
		return "org.jazzrecord.titanium.mobile";
	}
	
	public String getName() {
		return "titanium_mobile";
	}
	
	public String getVersion() {
		return "1.0";
	}
	
	public String getPublisher() {
		return "not specified";
	}
	
	public String getUrl() {
		return "not specified";
	}
	
	public String getCopyright() {
		return "not specified";
	}
	
	public String getDescription() {
		return "not specified";
	}
	
	public String getIcon() {
		return "appicon.png";
	}
	
	public boolean isAnalyticsEnabled() {
		return true;
	}
	
	public String getGUID() {
		return "4606c827-c33d-4885-a1a1-870b302d19ca";
	}
}
