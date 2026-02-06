package com.safewalk.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.safewalk.SosService;
import org.json.JSONException;

@CapacitorPlugin(name = "SosSms", permissions = {
        @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms"),
        @Permission(strings = { Manifest.permission.READ_PHONE_STATE }, alias = "phone"),
        @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications")
})
public class SosSmsPlugin extends Plugin {

    @PluginMethod
    public void sendEmergencySms(PluginCall call) {
        JSArray phoneNumbersArray = call.getArray("phoneNumbers");
        String message = call.getString("message");

        if (phoneNumbersArray == null || message == null) {
            call.reject("Missing phoneNumbers or message");
            return;
        }

        if (getPermissionState("sms") != PermissionState.GRANTED ||
                getPermissionState("phone") != PermissionState.GRANTED ||
                getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAliases(new String[] { "sms", "phone", "notifications" }, call,
                    "smsPermissionCallback");
            return;
        }

        executeSmsService(call, phoneNumbersArray, message);
    }

    private void executeSmsService(PluginCall call, JSArray phoneNumbersArray, String message) {
        try {
            String[] phoneNumbers = new String[phoneNumbersArray.length()];
            for (int i = 0; i < phoneNumbersArray.length(); i++) {
                phoneNumbers[i] = phoneNumbersArray.getString(i);
            }

            Intent serviceIntent = new Intent(getContext(), SosService.class);
            serviceIntent.putExtra("phoneNumbers", phoneNumbers);
            serviceIntent.putExtra("message", message);

            ContextCompat.startForegroundService(getContext(), serviceIntent);
            call.resolve();
        } catch (JSONException e) {
            call.reject("Failed to parse phone numbers", e);
        }
    }

    @PermissionCallback
    private void smsPermissionCallback(PluginCall call) {
        if (getPermissionState("sms") == PermissionState.GRANTED &&
                getPermissionState("phone") == PermissionState.GRANTED &&
                getPermissionState("notifications") == PermissionState.GRANTED) {
            JSArray phoneNumbersArray = call.getArray("phoneNumbers");
            String message = call.getString("message");
            executeSmsService(call, phoneNumbersArray, message);
        } else {
            call.reject("Required permissions (SMS/Phone/Notifications) denied");
        }
    }
}
