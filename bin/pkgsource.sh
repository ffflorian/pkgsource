#!/usr/bin/env bash

set -e

SCRIPT_NAME="${0##*/}"
SCRIPT_DIR="$(dirname "$0")"

DOCKER_IMAGE_NAME="ffflorian/pkgsource"
DOCKER_INSTANCE_NAME="pkgsource"

FORCE_STOP="false"

_is_running() {
  sudo docker ps -q --filter ancestor="${DOCKER_IMAGE_NAME}"
}

_start() {
  DOCKER_ID="$(_is_running)"

  if [ -n "${DOCKER_ID}" ]; then
    echo "pkgsource is already running. Please stop it before starting."
    exit 1
  fi

  sudo docker rm "${DOCKER_INSTANCE_NAME}" > /dev/null || true
  sudo docker build -t "${DOCKER_IMAGE_NAME}" "${SCRIPT_DIR}/../"
  sudo docker run \
           --name "${DOCKER_INSTANCE_NAME}" \
           --detach \
           --dns 1.1.1.1 \
           --log-driver json-file \
           --log-opt max-size=10m \
           --restart always \
           -p 4000:4000 \
           "${DOCKER_IMAGE_NAME}" \
           > /dev/null
  echo "Started pkgsource instance."
}

_stop() {
  DOCKER_ID="$(_is_running)"

  if [ -z "${DOCKER_ID}" ] && [ "${FORCE_STOP}" != "true" ]; then
    echo "pkgsource is not running yet. Please start it before stopping."
    exit 1
  fi

  sudo docker stop "${DOCKER_ID}" > /dev/null || true

  echo "Stopped pkgsource instance."
}

_restart() {
  FORCE_STOP="true"
  _stop
  _start
}

_logs() {
  sudo docker logs --follow "${DOCKER_INSTANCE_NAME}"
}

case "$1" in
  start) _start ;;
  stop) _stop ;;
  restart) _restart ;;
  id) _is_running ;;
  logs) _logs ;;
  *)
    echo "Usage: ${SCRIPT_NAME} [start|stop|restart|id|logs]"
    exit 1
esac
