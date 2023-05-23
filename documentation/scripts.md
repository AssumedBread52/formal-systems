# Scripts

Many commands are going to be needed during the development process. To avoid needed to repetively relearn forgetten commands and to avoid learning extremely long commands in the first place, scripts will be created simplifing the processes involving command line interactions. All scripts must satisfy the following conditions:

1. All scripts must only be executed from the projects root directory as `./scripts/[name of script].sh [possible command line arguments]`
2. If the script isn't meant to be called directly from the command line meaning it is only called from other scripts, then it belongs in a subdirectory.
3. All scripts are expected to be useful to the development of this project.
4. All scripts must give a usage dump upon receiving `--help` as a command line argument.

## add-new-bash-script.sh

When a file is created, the default file permissions are `-rw-r--r--`. The file permissions indicate four key pieces of information: (1) whether the file system element is a directory or a file, (2) the read, write, and execute permissions for the root user, (3) the read, write, and execute permissions for the group the file belongs to, and (4) the read, write, and execute permission of the current owner of the file. Every new bash script will need to be modified to be able to be executed. This is achieved with the `chmod` command as `chmod 755 [FILENAME]`. The three numbers indicate the root, group, and user permissions for the file. The number is computed via `r=4`, `w=2`, and `x=1`. Therefore, 755 is read, write, and execute for the root user, read and execute for the group, and read and execute for the current owner.

## down.sh

The docker-compose.yaml configuration requires environment variables. These could be calculated and stored in system environment variables but to be more versitile these can be computed using the `id` command. However, this would require a long command to be memorized so a bash script has been added to store the command.

## up.sh

The docker-compose.yaml configuration requires environment variables. These could be calculated and stored in system environment variables but to be more versitile these can be computed using the `id` command. However, this would require a long command to be memorized so a bash script has been added to store the command. 
