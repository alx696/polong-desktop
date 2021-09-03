#!/bin/bash

# 模板来自项目目录中 node_modules/app-builder-lib/templates/linux/
# 参考vscode脚本 /var/lib/dpkg/info/code.postinst

# Link to the binary
ln -sf '/opt/${sanitizedProductName}/${executable}' '/usr/bin/${executable}'

# SUID chrome-sandbox for Electron 5+
chmod 4755 '/opt/${sanitizedProductName}/chrome-sandbox' || true

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications
fi
