#!/bin/bash
SCRIPT_PATH=$(realpath "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

yad --form \
--title="WiPersona Linux launcher" \
--width=300 --height=100 \
--field="":LBL "" \
--field="Start server":BTN "$SCRIPT_DIR/launcher_linux_nogui.sh -s" \
--field="Stop server":BTN "$SCRIPT_DIR/launcher_linux_nogui.sh -k" \
--field="Open browser":BTN "$SCRIPT_DIR/launcher_linux_nogui.sh -b" \
--button="Exit"