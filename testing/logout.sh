#!/bin/bash

curl \
	-X POST \
	-H "Content-Type: application/json" \
	-d "{ \"token\" : \"$1\" }" \
	http://localhost:1707/api/logout