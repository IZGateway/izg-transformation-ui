#!/bin/bash
set -e

# Setup nginx configuration by replacing environment variable placeholders
envsubst '${XFORM_SERVICE_ENDPOINT_CRT_PATH} ${XFORM_SERVICE_ENDPOINT_KEY_PATH}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx
nginx -g 'daemon off;' &
NGINX_PID=$!
echo "nginx started, PID $NGINX_PID"

# Replace BAKED variables for app
/app/replace-variable.sh

# Start app
cd /app && npm start &
APP_PID=$!
echo "node application started, PID $APP_PID"

# Start filebeat if ELASTIC_API_KEY is set
if [ -n "$ELASTIC_API_KEY" ]; then
  /usr/bin/filebeat -e &
  FILEBEAT_PID=$!
  echo "filebeat started, PID $FILEBEAT_PID"
else
  FILEBEAT_PID=""
  echo "Filebeat not started - ELASTIC_API_KEY not set"
fi

# Start metricbeat if ELASTIC_API_KEY is set
if [ -n "$ELASTIC_API_KEY" ]; then
  /usr/bin/metricbeat -e &
  METRICBEAT_PID=$!
  echo "metricbeat started, PID $METRICBEAT_PID"
else
  METRICBEAT_PID=""
  echo "Metricbeat not started - ELASTIC_API_KEY not set"
fi

process_running() {
  if [ -n "$1" ] && kill -0 $1 2>/dev/null; then
    return 0
  else
    return 1
  fi
}

# Monitor
while true; do

  if ! process_running $NGINX_PID; then
    echo "nginx service has stopped.  Exiting container."
    exit 1
  fi

  if ! process_running $APP_PID; then
    echo "Node application has stopped. Exiting container."
    exit 1
  fi

  # Check if filebeat should be running but isn't
  if [ -n "$ELASTIC_API_KEY" ] && [ -n "$FILEBEAT_PID" ] && ! process_running $FILEBEAT_PID; then
    echo "Filebeat has stopped unexpectedly. Exiting container."
    exit 1
  fi

  # Check if metricbeat should be running but isn't
  if [ -n "$ELASTIC_API_KEY" ] && [ -n "$METRICBEAT_PID" ] && ! process_running $METRICBEAT_PID; then
    echo "Metricbeat has stopped unexpectedly. Exiting container."
    exit 1
  fi

  sleep 5
done
