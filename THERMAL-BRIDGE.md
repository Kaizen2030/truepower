# Bluetooth Thermal Printing

The XP-P203A uses a Bluetooth printer connection, not a browser Web Bluetooth connection. The web app therefore sends receipt data to a small bridge running on the same computer as the browser. The bridge writes ESC/POS bytes to the printer's paired Bluetooth serial port.

## One-time setup on Windows

1. Pair the Xprinter in Windows Bluetooth settings. Use `0000` if the printer asks for a PIN.
2. Open PowerShell in this project directory and run:

   ```powershell
   npm run thermal:ports
   ```

3. Find the printer's outgoing Bluetooth COM port, for example `COM7`.
4. Start the bridge:

   ```powershell
   $env:THERMAL_PRINTER_PORT="COM7"
   $env:THERMAL_PRINTER_BAUD_RATE="115200"
   npm run thermal:bridge
   ```

5. Keep that terminal running while using the admin receipt builder.
6. Click **Print Bluetooth** in the receipt builder.

The bridge listens only on `127.0.0.1:18181` by default. The web app sends structured receipt data to it, and the bridge prints native ESC/POS text at the printer's 58mm width. The existing PDF buttons remain available for sharing and archival.

If the web app is hosted on another device, the bridge must run on the device that has the paired printer, and `NEXT_PUBLIC_THERMAL_BRIDGE_URL` must point to that device's bridge address. For a same-computer setup, leave the default URL unchanged.
