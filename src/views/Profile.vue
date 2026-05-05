<template>
  <div class="profile-page">
    <div class="profile-header card">
      <div class="profile-avatar">
        <div class="avatar-placeholder">
          {{ authStore.profile?.full_name?.charAt(0) || 'U' }}
        </div>
      </div>
      <h2>{{ authStore.profile?.full_name }}</h2>
      <p>{{ authStore.user?.email }}</p>
    </div>

    <div class="install-section card">
      <h3>📱 Download Listara App</h3>
      <p>Get the app on your device</p>

      <div class="download-buttons">
        <button @click="downloadApp" class="btn-download" :class="deviceClass">
          <span class="btn-icon">{{ deviceIcon }}</span>
          <span class="btn-text">{{ downloadText }}</span>
        </button>
      </div>

      <p class="device-detected">📱 Detected: {{ deviceName }}</p>
      <p class="download-note">💡 Click the button above to download Listara for your device</p>
    </div>

    <div class="profile-stats card">
      <h3>Your Kitchen Stats</h3>
      <div class="stats-list">
        <div class="stat-row">
          <span>Total Items</span>
          <span class="stat-value">{{ kitchenStore.items.length }}</span>
        </div>
        <div class="stat-row">
          <span>Low Stock Items</span>
          <span class="stat-value">{{ lowStockCount }}</span>
        </div>
        <div class="stat-row">
          <span>Shopping Items</span>
          <span class="stat-value">{{ pendingShopping.length }}</span>
        </div>
      </div>
    </div>

    <div class="profile-actions card">
      <h3>Account Settings</h3>
      <button @click="logout" class="btn btn-danger">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useKitchenStore } from '../stores/kitchen'
import { useShoppingStore } from '../stores/shopping'

const router = useRouter()
const authStore = useAuthStore()
const kitchenStore = useKitchenStore()
const shoppingStore = useShoppingStore()

const deviceName = ref('')
const deviceIcon = ref('📱')
const downloadText = ref('Download App')
const deviceClass = ref('')

const lowStockCount = computed(() => kitchenStore.items.filter(i => i.status === 'low').length)
const pendingShopping = computed(() => shoppingStore.items.filter(i => i.status === 'pending'))

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/android/.test(userAgent)) {
    deviceName.value = 'Android Phone/Tablet'
    deviceIcon.value = '🤖'
    downloadText.value = 'Download for Android'
    deviceClass.value = 'android'
  }
  else if (/iphone|ipad|ipod/.test(userAgent)) {
    deviceName.value = 'iPhone / iPad'
    deviceIcon.value = '🍎'
    downloadText.value = 'Install on iOS'
    deviceClass.value = 'ios'
  }
  else if (/windows/.test(userAgent)) {
    deviceName.value = 'Windows PC'
    deviceIcon.value = '💻'
    downloadText.value = 'Download for Windows'
    deviceClass.value = 'windows'
  }
  else if (/mac/.test(userAgent)) {
    deviceName.value = 'Mac Computer'
    deviceIcon.value = '🍎'
    downloadText.value = 'Download for Mac'
    deviceClass.value = 'mac'
  }
  else if (/linux/.test(userAgent)) {
    deviceName.value = 'Linux Computer'
    deviceIcon.value = '🐧'
    downloadText.value = 'Download for Linux'
    deviceClass.value = 'linux'
  }
  else {
    deviceName.value = 'Generic Device'
    deviceIcon.value = '📱'
    downloadText.value = 'Download App'
    deviceClass.value = 'generic'
  }
}

const downloadApp = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/android/.test(userAgent)) {
    downloadForAndroid()
  }
  else if (/iphone|ipad|ipod/.test(userAgent)) {
    installForIOS()
  }
  else if (/windows/.test(userAgent)) {
    downloadForWindows()
  }
  else if (/mac/.test(userAgent)) {
    downloadForMac()
  }
  else if (/linux/.test(userAgent)) {
    downloadForLinux()
  }
  else {
    downloadUniversal()
  }
}

const downloadForAndroid = () => {
  const installerHtml = '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head><title>Install Listara</title>\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<style>\n' +
    'body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #FF6B35, #4ECDC4); }\n' +
    '.card { background: white; border-radius: 20px; padding: 40px; max-width: 400px; margin: 0 auto; }\n' +
    'button { background: #FF6B35; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 18px; cursor: pointer; }\n' +
    '</style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<div class="card">\n' +
    '<h1>📱 Install Listara</h1>\n' +
    '<p>Click the button below to install Listara on your Android device</p>\n' +
    '<button onclick="showInstructions()">Install Listara</button>\n' +
    '<p style="margin-top: 20px; font-size: 12px; color: #666;">Make sure you are using Chrome browser</p>\n' +
    '</div>\n' +
    '<script>\n' +
    'function showInstructions() {\n' +
    '  alert("To install Listara:\\n\\n1. Tap the menu (3 dots)\\n2. Select \\"Install App\\"\\n3. Tap Install");\n' +
    '  window.location.href = "/";\n' +
    '}\n' +
    '<\/script>\n' +
    '</body>\n' +
    '</html>'

  const blob = new Blob([installerHtml], { type: 'text/html' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Listara-Android.html'
  link.click()
  URL.revokeObjectURL(link.href)

  setTimeout(() => {
    alert('Download complete! Open the downloaded file to install Listara.')
  }, 500)
}

const installForIOS = () => {
  alert('To install Listara on your iPhone/iPad:\n\n1️⃣ Open this page in Safari browser\n2️⃣ Tap the Share button (⬆️)\n3️⃣ Scroll down and tap "Add to Home Screen"\n4️⃣ Tap "Add" in the top right\n\nThe app will appear on your home screen!')
}

const downloadForWindows = () => {
  const batchContent = '@echo off\n' +
    'title Listara Installer\n' +
    'color 0A\n' +
    'echo ========================================\n' +
    'echo     Listara Windows Installer\n' +
    'echo ========================================\n' +
    'echo.\n' +
    'echo Installing Listara on your computer...\n' +
    'echo.\n' +
    'echo Creating desktop shortcut...\n' +
    'powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut(\'%USERPROFILE%\\Desktop\\Listara.url\'); $SC.TargetPath = \'' + window.location.origin + '\'; $SC.Save()"\n' +
    'echo.\n' +
    'echo Creating start menu shortcut...\n' +
    'powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut(\'%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Listara.url\'); $SC.TargetPath = \'' + window.location.origin + '\'; $SC.Save()"\n' +
    'echo.\n' +
    'echo ========================================\n' +
    'echo     Installation Complete!\n' +
    'echo ========================================\n' +
    'echo.\n' +
    'echo Listara has been installed successfully!\n' +
    'echo Check your desktop for the Listara shortcut.\n' +
    'echo.\n' +
    'pause'

  const blob = new Blob([batchContent], { type: 'application/bat' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Listara-Setup.bat'
  link.click()
  URL.revokeObjectURL(link.href)

  setTimeout(() => {
    alert('Windows installer downloaded! Run "Listara-Setup.bat" to install.')
  }, 500)
}

const downloadForMac = () => {
  const macScript = '#!/bin/bash\n' +
    'echo "========================================\n' +
    'echo "     Listara Mac Installer"\n' +
    'echo "========================================\n' +
    'echo "\n' +
    'echo "Installing Listara on your Mac..."\n' +
    'echo "\n' +
    'cat > ~/Desktop/Listara.command << EOF\n' +
    '#!/bin/bash\n' +
    'open "' + window.location.origin + '"\n' +
    'EOF\n' +
    'chmod +x ~/Desktop/Listara.command\n' +
    'echo "\n' +
    'echo "========================================\n' +
    'echo "     Installation Complete!"\n' +
    'echo "========================================\n' +
    'echo "\n' +
    'echo "Listara has been installed on your desktop!"\n' +
    'echo "\n' +
    'read -p "Press enter to close..."'

  const blob = new Blob([macScript], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Listara-Installer.command'
  link.click()
  URL.revokeObjectURL(link.href)

  setTimeout(() => {
    alert('Mac installer downloaded! Run "Listara-Installer.command" to install.')
  }, 500)
}

const downloadForLinux = () => {
  const linuxScript = '#!/bin/bash\n' +
    'echo "========================================\n' +
    'echo "     Listara Linux Installer"\n' +
    'echo "========================================\n' +
    'echo "\n' +
    'echo "Installing Listara on your Linux system..."\n' +
    'echo "\n' +
    'mkdir -p ~/.local/share/applications\n' +
    'cat > ~/.local/share/applications/listara.desktop << EOF\n' +
    '[Desktop Entry]\n' +
    'Name=Listara\n' +
    'Type=Application\n' +
    'Exec=xdg-open ' + window.location.origin + '\n' +
    'Icon=web-browser\n' +
    'Terminal=false\n' +
    'Categories=Utility;\n' +
    'EOF\n' +
    'echo "\n' +
    'echo "========================================\n' +
    'echo "     Installation Complete!"\n' +
    'echo "========================================\n' +
    'echo "\n' +
    'echo "Listara has been installed! Find it in your applications menu."\n' +
    'echo "\n' +
    'read -p "Press enter to close..."'

  const blob = new Blob([linuxScript], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Listara-Installer.sh'
  link.click()
  URL.revokeObjectURL(link.href)

  setTimeout(() => {
    alert('Linux installer downloaded! Run "chmod +x Listara-Installer.sh" then "./Listara-Installer.sh" to install.')
  }, 500)
}

const downloadUniversal = () => {
  const universalHtml = '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head>\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>Install Listara</title>\n' +
    '  <style>\n' +
    '    body { font-family: Arial; text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #FF6B35, #4ECDC4); min-height: 100vh; }\n' +
    '    .card { background: white; border-radius: 20px; padding: 40px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }\n' +
    '    h1 { color: #FF6B35; }\n' +
    '    button { background: #FF6B35; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 18px; margin: 10px; cursor: pointer; }\n' +
    '    button:hover { transform: translateY(-2px); }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <div class="card">\n' +
    '    <h1>📱 Install Listara</h1>\n' +
    '    <p>Choose your device to get started</p>\n' +
    '    <button onclick="location.href=\'/?device=android\'">🤖 Android</button>\n' +
    '    <button onclick="location.href=\'/?device=ios\'">🍎 iPhone/iPad</button>\n' +
    '    <button onclick="location.href=\'/?device=windows\'">💻 Windows</button>\n' +
    '    <button onclick="location.href=\'/?device=mac\'">🍎 Mac</button>\n' +
    '    <button onclick="location.href=\'/?device=linux\'">🐧 Linux</button>\n' +
    '  </div>\n' +
    '</body>\n' +
    '</html>'

  const blob = new Blob([universalHtml], { type: 'text/html' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Listara-Install.html'
  link.click()
  URL.revokeObjectURL(link.href)

  alert('Download complete! Open the downloaded file to install Listara.')
}

onMounted(async () => {
  await kitchenStore.loadItems()
  await shoppingStore.loadList()
  detectDevice()
})
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.install-section {
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(78, 205, 196, 0.1));
  border: 2px solid var(--primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
}

.install-section h3 {
  color: var(--primary);
  margin-bottom: 8px;
}

.install-section p {
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 15px;
}

.download-buttons {
  margin: 20px 0;
}

.btn-download {
  width: 100%;
  padding: 18px 20px;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-download:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.btn-download.android {
  background: linear-gradient(135deg, #3DDC84, #2B9E5E);
}

.btn-download.ios {
  background: linear-gradient(135deg, #000000, #333333);
}

.btn-download.windows {
  background: linear-gradient(135deg, #0078D4, #005A9E);
}

.btn-download.mac {
  background: linear-gradient(135deg, #555555, #333333);
}

.btn-download.linux {
  background: linear-gradient(135deg, #FCC624, #F49B15);
  color: #000;
}

.btn-download.generic {
  background: linear-gradient(135deg, #FF6B35, #E55A2B);
}

.btn-icon {
  font-size: 28px;
}

.btn-text {
  font-size: 18px;
}

.device-detected {
  font-size: 12px;
  color: var(--primary);
  margin-top: 10px;
  font-weight: 500;
}

.download-note {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 10px;
}

.profile-avatar {
  margin-bottom: 16px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}

.profile-header h2 {
  margin-bottom: 4px;
}

.profile-header p {
  color: var(--gray-600);
}

.stats-list {
  margin-top: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-200);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-value {
  font-weight: bold;
  color: var(--primary);
}

.profile-actions {
  text-align: center;
}

.btn-danger {
  background: var(--danger);
  color: white;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .btn-download {
    padding: 15px 20px;
  }

  .btn-icon {
    font-size: 24px;
  }

  .btn-text {
    font-size: 16px;
  }
}
</style>
