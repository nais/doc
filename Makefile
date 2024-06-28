.PHONY: all install local
SHELL := bash

all: install local

install:
	poetry install

local:
	TENANT=$(tenant) poetry run mkdocs serve
