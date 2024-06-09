#!/bin/bash

yad --form \
--title="WiPersona Linux launcher" \
--width=300 --height=100 \
--field="":LBL "" \
--field="Start server":BTN "./launcher_linux_nogui.sh -s" \
--field="Stop server":BTN "./launcher_linux_nogui.sh -k" \
--field="Open browser":BTN "./launcher_linux_nogui.sh -b" \
--button="Exit"
