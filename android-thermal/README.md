# TruePower Thermal Android Companion

This companion loads the hosted TruePower admin app and exposes a native
Bluetooth Classic printer bridge named `AndroidThermalPrinter`. The web app
uses it automatically when this APK is open, so the phone prints directly to
its currently paired Xprinter without a computer or Node.js bridge.

## Use

1. Pair the Xprinter in Android Bluetooth settings.
2. Build and install this app.
3. Open the receipt builder inside the app.
4. Press **Print Bluetooth**.

The app selects a paired device whose name contains `XP`, `XPRINTER`, or
`P203A`.

## Build without installing Android Studio

The repository includes a GitHub Actions workflow at
`.github/workflows/build-thermal-apk.yml`. Push the project to GitHub, open
the **Actions** tab, choose **Build TruePower Thermal APK**, and run it with
**Run workflow**. GitHub will build the APK on an Android-capable runner.

When the workflow finishes, open the run and download the
`truepower-thermal-apk` artifact. Extract it and install `app-debug.apk` on
each Android phone that will print receipts.

## Local Build

Install Android Studio, open this `android-thermal` directory, let Gradle
sync, then build the debug APK from **Build > Build App Bundle(s) / APK(s)**.

Change `BuildConfig.WEB_APP_URL` in `app/build.gradle.kts` if the deployed
admin route is different. The current default is
`https://www.truepower.co.ke/admin`.

This uses the printer's standard Bluetooth Serial Port Profile and sends the
same ESC/POS bytes as the desktop bridge. Android 12 and newer will ask for
Nearby devices permission.
