#!/bin/bash

# Supervisor event listener to kill supervisor when app enters FATAL state
while true; do
    # Signal ready for events
    echo "READY"

    # Read event from stdin
    read line

    # Log the event (optional, helpful for debugging)
    echo "Event received: $line" >&2

    # Try to kill supervisor process
    if [ -f /var/run/supervisord.pid ]; then
        pid=$(cat /var/run/supervisord.pid)
        if kill -QUIT "$pid" 2>/dev/null; then
            echo "Successfully killed supervisor with PID $pid" >&2
        else
            echo "Could not kill supervisor with PID $pid: $?" >&2
        fi
    else
        echo "Could not kill supervisor: PID file not found" >&2
    fi

    # Required response to supervisor
    echo "RESULT 2"
    echo "OK"
done
