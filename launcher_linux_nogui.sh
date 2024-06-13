#!/bin/bash
SCRIPT_PATH=$(realpath "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

show_usage() {
	echo "Usage: $0 [-s | -b | -k]"
	echo "  -s: Start HTTP server"
	echo "  -b: Open HTTP Address in browser"
	echo "  -k: Stop server"
}

if [ $# -ne 1 ]; then
	echo "ERROR: No argument provided"
	show_usage
	exit 1
fi

case "$1" in
	-s)
		$SCRIPT_DIR/busybox httpd -v -f -p 2962 -h $SCRIPT_DIR/data &
		;;
	-b)
		xdg-open http://localhost:2962 &
		;;
	-k)
		kill $(pgrep -f 2962)
		;;
	*)
		echo "Not a valid argument"
		show_usage
		exit 1
		;;
esac