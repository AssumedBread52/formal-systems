# Docker

Docker is a great tool to develop stable isolated environments for development and deployment. Additionally, it allows for the use of a considerable number of tools without the need for a complicated clean up or management system.

## Best practice

Docker containers, and therefore the images the containers are created from, should be focused in their efforts. Having a single container responsible for the entire application (database, messaging-service, back-end, and front-end) or even more than are of responsibility should be considered an anti-pattern.

## Installation

I'm developing this project on a windows machine. Meaning docker requires three programs installed.

1. Windows Subsystem for Linux (WSL)
2. A linux distro
3. Docker Desktop for Windows

Step 1 is to install WSL this is done via the following command: `wsl --install`. This command also installs a linux distro at the time of this commit Ubuntu 22.04. If you would like to specify a different distro you can with an additional command line argument: `wsl --install -d <Distribution Name>`. Spaces should be hyphens see official page for more details and updates [here](https://learn.microsoft.com/en-us/windows/wsl/install).

Next install Docker Desktop for Windows from [here](https://docs.docker.com/desktop/install/windows-install/).
