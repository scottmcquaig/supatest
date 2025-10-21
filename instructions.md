Here’s the **simplest, cleanest setup** for getting a Chrome Remote Desktop (CRD) GUI working on your VPS where **Coolify is already installed** (Ubuntu/Debian base).
You’ll end up with a full XFCE desktop accessible through your Google account via [remotedesktop.google.com/access](https://remotedesktop.google.com/access).

---

## ⚙️ 1. Install Desktop Environment (XFCE)

Run this on your VPS:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y xfce4 xfce4-goodies
```

> 💡 XFCE is lightweight and plays nicely with CRD.
> If prompted for a display manager, choose **lightdm**.

---

## 🧰 2. Install Chrome Remote Desktop

```bash
wget https://dl.google.com/linux/direct/chrome-remote-desktop_current_amd64.deb
sudo dpkg -i chrome-remote-desktop_current_amd64.deb || sudo apt -f install -y
```

This installs the CRD service and dependencies.

---

## 🪪 3. Log into Chrome Remote Desktop

On your **local computer**, go to:

🔗 [https://remotedesktop.google.com/headless](https://remotedesktop.google.com/headless)

* Click **"Begin" → "Set up another computer"**
* It’ll show commands for **Debian/Ubuntu** — copy the **“Debian Linux (64-bit)”** command.

Example:

```bash
DISPLAY= /opt/google/chrome-remote-desktop/start-host \
--code="YOUR_LONG_AUTH_CODE" \
--redirect-url="https://remotedesktop.google.com/_/oauthredirect" \
--name=$(hostname)
```

Paste and run that command on your VPS.

It will ask for a **PIN** — this will be your remote login PIN.

---

## 🖥️ 4. Set XFCE as Default Desktop

Run:

```bash
echo "exec /usr/bin/xfce4-session" > ~/.chrome-remote-desktop-session
```

---

## 🧹 5. Start the Service

```bash
sudo systemctl enable chrome-remote-desktop@$USER
sudo systemctl start chrome-remote-desktop@$USER
```

Check status:

```bash
sudo systemctl status chrome-remote-desktop@$USER
```

If it’s active and running, you’re good.

---

## 🔑 6. Access It

On your local machine:

* Go to 👉 [https://remotedesktop.google.com/access](https://remotedesktop.google.com/access)
* Log in with the same Google account.
* You’ll see your VPS listed — click it, enter your PIN, and you’ll get a full XFCE desktop.

---

## 🧩 Optional Tweaks

### Add File Manager + Browser

```bash
sudo apt install -y thunar firefox-esr
```

### Fix Clipboard Sync (optional)

```bash
sudo apt install -y xfce4-clipman-plugin
```

---

## 🧠 Summary

| Component       | Command                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| Desktop         | `sudo apt install -y xfce4 xfce4-goodies`                                  |
| CRD             | `wget + dpkg -i + apt -f install`                                          |
| Auth            | Run Google’s “start-host” command                                          |
| Default session | `echo "exec /usr/bin/xfce4-session" > ~/.chrome-remote-desktop-session`    |
| Start           | `sudo systemctl start chrome-remote-desktop@$USER`                         |
| Access          | [remotedesktop.google.com/access](https://remotedesktop.google.com/access) |

---
