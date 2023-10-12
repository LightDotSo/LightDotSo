#!/bin/bash

SLUGS_TO_REJECT=('infura.io' 'alchemy.com' 'noderpc.xyz' 'pimlico.io' 'Bearer')

FILES=$(git diff --cached --name-only --diff-filter=ACM)
for FILE in $FILES
do
  if [[ $FILE == thunder-tests/* ]]
  then
    for SLUG_TO_REJECT in "${SLUGS_TO_REJECT[@]}"
    do
      if grep -q $SLUG_TO_REJECT $FILE
      then
        echo "Rejected due to forbidden slug in file: $FILE"
        exit 1
      fi
    done
  fi
done
exit 0
