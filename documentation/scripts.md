# Scripting

Many commands are going to be needed during the development process. To avoid needed to repetively relearn forgetten commands and to avoid learning extremely long commands in the first place, scripts will be created simplifing the processes involving command line interactions. All scripts must satisfy the following conditions:

1. All scripts must only be executed from the projects root directory as `scripts/[name of script].sh`
2. If the script isn't meant to be called directly from the command line meaning it is only called from other scripts, then it belongs in a subdirectory.
3. All scripts are expected to be useful to the development of this project.
4. All scripts must give a usage dump upon receiving `--help` as a command line argument.
