#!/bin/bash

URLS_TO_REJECT=('infura.io' 'alchemy.com')

FILES=$(git diff --cached --name-only --diff-filter=ACM)
for FILE in $FILES
do
  if [[ $FILE == your-directory/* ]]
  then
    for URL_TO_REJECT in "${URLS_TO_REJECT[@]}"
    do
      if grep -q $URL_TO_REJECT $FILE
      then
        echo "Rejected due to forbidden URL in file: $FILE"
        exit 1
      fi
    done
  fi
done
exit 0
