package com.safewalk;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.telephony.SmsManager;
import android.util.Log;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;
import com.safewalk.app.MainActivity;
import java.util.ArrayList;

public class SosService extends Service {
    private static final String TAG = "SosService";
    private static final String CHANNEL_ID = "sos_sms_channel";
    private static final String SENT_ACTION = "SMS_SENT";
    private static final int NOTIFICATION_ID = 9999;
    private static boolean isRunning = false;

    private BroadcastReceiver smsSentReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        registerSmsReceiver();
        Log.d(TAG, "SosService created");
    }

    private void showToast(String message) {
        new Handler(Looper.getMainLooper())
                .post(() -> Toast.makeText(getApplicationContext(), "SOS: " + message, Toast.LENGTH_LONG).show());
    }

    private void registerSmsReceiver() {
        smsSentReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String phoneNumber = intent.getStringExtra("phoneNumber");
                switch (getResultCode()) {
                    case Activity.RESULT_OK:
                        Log.i(TAG, "DELIVERY SUCCESS: SMS sent to " + phoneNumber);
                        break;
                    default:
                        String errorMsg = "Failed to send SMS to " + phoneNumber;
                        if (getResultCode() == SmsManager.RESULT_ERROR_NO_SERVICE)
                            errorMsg += " (No Network Service)";
                        else if (getResultCode() == SmsManager.RESULT_ERROR_RADIO_OFF)
                            errorMsg += " (Airplane Mode?)";
                        else if (getResultCode() == SmsManager.RESULT_ERROR_GENERIC_FAILURE) {
                            errorMsg += " (Carrier Block/No Balance)";
                            // Specific hint for Xiaomi/OEM users
                            new Handler(Looper.getMainLooper()).post(() -> Toast.makeText(getApplicationContext(),
                                    "IMPORTANT: If you use Xiaomi/Redmi, enable 'Send SMS in background' in Security Settings.",
                                    Toast.LENGTH_LONG).show());
                        } else {
                            errorMsg += " (Error Code: " + getResultCode() + ")";
                        }

                        Log.e(TAG, "DELIVERY FAILURE: " + errorMsg + " code: " + getResultCode());
                        showToast(errorMsg);
                        break;
                }
            }
        };

        IntentFilter filter = new IntentFilter(SENT_ACTION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(smsSentReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            registerReceiver(smsSentReceiver, filter);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (isRunning) {
            Log.w(TAG, "Service already running, ignoring duplicate start");
            return START_NOT_STICKY;
        }

        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String[] phoneNumbers = intent.getStringArrayExtra("phoneNumbers");
        String message = intent.getStringExtra("message");

        if (phoneNumbers == null || message == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        isRunning = true;
        Notification notification = createNotification("Emergency SOS processing...");
        startForeground(NOTIFICATION_ID, notification);

        showToast("Sending emergency alerts to " + phoneNumbers.length + " contacts...");

        new Thread(() -> {
            try {
                sendSmsWithDelay(phoneNumbers, message);
                // Wait to capture all delivery reports (up to 10 seconds for carriers)
                Thread.sleep(10000);
            } catch (InterruptedException e) {
                Log.e(TAG, "Service thread interrupted", e);
            } finally {
                isRunning = false;
                stopForeground(true);
                stopSelf();
                Log.d(TAG, "SosService stopped");
            }
        }).start();

        return START_NOT_STICKY;
    }

    private void sendSmsWithDelay(String[] phoneNumbers, String message) {
        SmsManager smsManager;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            smsManager = getSystemService(SmsManager.class);
        } else {
            smsManager = SmsManager.getDefault();
        }

        if (smsManager == null) {
            showToast("Critical Error: SIM Manager not accessible.");
            return;
        }

        for (String phoneNumber : phoneNumbers) {
            try {
                Log.i(TAG, "Dispatching SMS to: " + phoneNumber);

                Intent sentIntent = new Intent(SENT_ACTION);
                sentIntent.putExtra("phoneNumber", phoneNumber);
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        this,
                        phoneNumber.hashCode(),
                        sentIntent,
                        PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

                if (message.length() > 160) {
                    ArrayList<String> parts = smsManager.divideMessage(message);
                    ArrayList<PendingIntent> sentIntents = new ArrayList<>();
                    for (int i = 0; i < parts.size(); i++)
                        sentIntents.add(pendingIntent);
                    smsManager.sendMultipartTextMessage(phoneNumber, null, parts, sentIntents, null);
                } else {
                    smsManager.sendTextMessage(phoneNumber, null, message, pendingIntent, null);
                }

                // Small delay to prevent carrier spam detection and radio congestion
                Thread.sleep(1500);

            } catch (Exception e) {
                Log.e(TAG, "Failed to dispatch to " + phoneNumber, e);
                showToast("System Error for " + phoneNumber + ": " + e.getMessage());
            }
        }
    }

    @Override
    public void onDestroy() {
        if (smsSentReceiver != null) {
            try {
                unregisterReceiver(smsSentReceiver);
            } catch (Exception ignored) {
            }
        }
        super.onDestroy();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Emergency SOS Service",
                    NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null)
                manager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification(String contentText) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Guardian Mode Active")
                .setContentText(contentText)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
