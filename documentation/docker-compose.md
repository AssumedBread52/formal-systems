# Docker compose

This is a tool that comes installed with Docker Desktop for Windows. This greatly simplifies management of docker containers. Many commonly used docker commands require a considerable number of arguments dictating port exposure, volumes, etc. A docker-compose.yaml file allows up to put all that in a file as a part of the project. NOTE: docker-compose isn't really used for production.

## Environment variables

Environment variable files will be used over putting the environment variables in the docker compose configuration file. This puts environment variables near where they are used which is more cohesive.

## Health-check

All non-utility containers in the docker-compose configuration should have a health-check. This will be used in dependency specification which not only must specify the service the container requires but a condition of healthy. If a container doesn't have a health-check then it will never have a status of healthy. This will prevent unexpected and inconsistent errors from containers having been started but not yet ready to play their part in the architecture.

## User

Any files and directories created by the containers are done under the ownership of the root user. This means that these files and directories cannot be editted or removed from the host machine until the ownership is changed by executing the command: `chown USER_ID:GROUP_ID FILENAME`. The user configuration allows specification of the container's user's user ID and group ID which means the files and directories owner will match that of the host machine's current user.
