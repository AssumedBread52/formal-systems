# Docker compose

This is a tool that comes installed with Docker Desktop for Windows. This greatly simplifies management of docker containers. Many commonly used docker commands require a considerable number of arguments dictating port exposure, volumes, etc. A docker-compose.yaml file allows up to put all that in a file as a part of the project. NOTE: docker-compose isn't really used for production.

## Health-check

All non-utility containers in the docker-compose configuration should have a health-check. This will be used in dependency specification which not only must specify the service the container requires but a condition of healthy. If a container doesn't have a health-check then it will never have a status of healthy.
