#!/bin/bash

if [ "$#" -ne 1 ]; then
	printf "Usage: $0 <html_file> [<output>] (If no <output> is provided, 'translations.js' will be used. If <output> already exists, it will be overwritten.)\n"
	exit 1
fi

input="$1"
if [ ! -f "$input" ]; then
	echo "$input: File does not exist"
	exit 1
fi

output="$2"
if [ -z "$output" ]; then
	output="translations.js"
fi

printf "var translations = \n{\n	'en':\n	{\n" > $output
grep -oP '<[^>]*id="[^"]*"[^>]*>[^<]*</[^>]*>' "$input" |
sed -E -e 's/.*id="([^"]*)".*>([^<]*)<\/[^>]*>/\1'\'': '\''\2'\'',/' -e "s/^/\t\t'/" >> $output
printf "\t}\n}" >> $output




printf "file saved: $output\n"
