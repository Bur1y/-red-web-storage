#!/bin/bash

curl -X POST \
'http://localhost:1707/api/register' \
  -H "Content-Type: application/json" \
	-d "{ \"login\" : \"how\", \"password\": \"123321\"}"