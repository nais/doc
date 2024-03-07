.PHONY: all install local
SHELL := bash

all: install local

install:
	poetry install

local:
	poetry run mkdocs serve
