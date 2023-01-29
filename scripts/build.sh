#!/bin/bash

GROUP_ID=$(id -g) USER_ID=$(id -u) docker-compose build
