.PHONY: all install local
SHELL := bash

TENANTS = nav ssb dev-nais tenant

all: install local

install:
	poetry install

local:
	poetry run mkdocs serve
