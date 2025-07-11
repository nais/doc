.PHONY: all install local
SHELL := bash

all: install local

install:
	poetry install

local:
	env TENANT=$(TENANT) poetry run mkdocs serve --dirty

clean-build:
	env TENANT=$(TENANT) poetry run mkdocs build --clean
