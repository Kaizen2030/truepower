package co.truepower.thermal

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.util.Base64
import java.util.UUID
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private val sppUuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) { permissions ->
        if (permissions.values.any { it }) {
            toast("Bluetooth permission granted. Try printing again.")
        } else {
            toast("Bluetooth permission is required to print.")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            webViewClient = WebViewClient()
            addJavascriptInterface(ThermalBridge(), "AndroidThermalPrinter")
            loadUrl(BuildConfig.WEB_APP_URL)
        }
        setContentView(webView)

        requestBluetoothPermissionsIfNeeded()
    }

    private fun requestBluetoothPermissionsIfNeeded() {
        if (android.os.Build.VERSION.SDK_INT < 31) return

        val permissions = arrayOf(
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
        )
        if (permissions.any { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }) {
            permissionLauncher.launch(permissions)
        }
    }

    private fun hasBluetoothPermission(): Boolean {
        return android.os.Build.VERSION.SDK_INT < 31 ||
            checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
    }

    @SuppressLint("MissingPermission")
    private fun printBytes(bytes: ByteArray) {
        if (!hasBluetoothPermission()) {
            toast("Allow Bluetooth permission before printing.")
            return
        }

        val manager = getSystemService(BluetoothManager::class.java)
        val adapter = manager?.adapter
        if (adapter == null || !adapter.isEnabled) {
            toast("Turn on Bluetooth and pair the Xprinter first.")
            return
        }

        val printer = adapter.bondedDevices
            .firstOrNull { device ->
                val name = device.name.orEmpty().uppercase()
                name.contains("XP") || name.contains("XPRINTER") || name.contains("P203A")
            }

        if (printer == null) {
            toast("Pair an XP or Xprinter device in Android Bluetooth settings first.")
            return
        }

        thread(name = "truepower-thermal-print") {
            try {
                adapter.cancelDiscovery()
                printer.createRfcommSocketToServiceRecord(sppUuid).use { socket ->
                    socket.connect()
                    socket.outputStream.use { output ->
                        output.write(bytes)
                        output.flush()
                    }
                }
                toast("Receipt sent to ${printer.name ?: "printer"}.")
            } catch (error: Exception) {
                toast("Bluetooth print failed: ${error.message ?: "unknown error"}")
            }
        }
    }

    private fun toast(message: String) {
        runOnUiThread { Toast.makeText(this, message, Toast.LENGTH_LONG).show() }
    }

    inner class ThermalBridge {
        @JavascriptInterface
        fun printReceipt(base64EscPos: String) {
            try {
                printBytes(Base64.getDecoder().decode(base64EscPos))
            } catch (_: IllegalArgumentException) {
                toast("The receipt data was invalid.")
            }
        }
    }
}
