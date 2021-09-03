.PHONY: all install local

all: install local

install:
	poetry install

local:
	poetry run mkdocs serve
