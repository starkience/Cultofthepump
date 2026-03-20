.PHONY: $(MAKECMDGOALS)
MAKEFLAGS += --no-print-directory
##
##  🚧 DipDup developer tools
##
PACKAGE=cotp_indexer
TAG=latest
COMPOSE=deploy/docker-compose.yaml

help:           ## Show this help (default)
	@grep -Fh "##" $(MAKEFILE_LIST) | grep -Fv grep -F | sed -e 's/\\$$//' | sed -e 's/##//'

all:            ## Run an entire CI pipeline
	make format lint

##

install:        ## Install dependencies
	pdm install

update:         ## Update dependencies
	pdm update
	dipdup self update -q

format:         ## Format with all tools
	make black

lint:           ## Lint with all tools
	make ruff mypy

##

black:          ## Format with black
	black .

ruff:           ## Lint with ruff
	ruff check --fix .

mypy:           ## Lint with mypy
	mypy .

##

image:          ## Build Docker image
	docker buildx build . -f deploy/Dockerfile -t ghcr.io/cultofthepump/indexer:${TAG} --platform linux/amd64,linux/arm64 --load

push-gar:
	docker tag ghcr.io/cultofthepump/indexer:${TAG} us-central1-docker.pkg.dev/exploration-dev-417917/cotp/indexer:latest
	docker push us-central1-docker.pkg.dev/exploration-dev-417917/cotp/indexer:latest

up:             ## Start Compose stack
	docker-compose -f ${COMPOSE} up -d --build
	docker-compose -f ${COMPOSE} logs -f

down:           ## Stop Compose stack
	docker-compose -f ${COMPOSE} down -v

##