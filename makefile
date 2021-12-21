
ifeq ($(origin mablung-makefile-environment-path),undefined)
export mablung-makefile-environment-path := $(shell npx mablung-makefile-environment get-path)
endif

include $(mablung-makefile-environment-path)

run::
	$(info )
	@$(MAKE) --no-print-directory mongod-stop

pre-run:: mongod-start
	$(eval export NPX_PATH = $(shell npx which npx))

cover::
	$(info )
	@$(MAKE) --no-print-directory mongod-stop

pre-cover:: mongod-start
	$(eval export NPX_PATH = $(shell npx which npx))

test::
	$(info )
	@$(MAKE) --no-print-directory mongod-stop

pre-test:: mongod-start
	$(eval export NPX_PATH = $(shell npx which npx))

# --------------------
.PHONY: mongod-start mongod-stop
# --------------------

mongod-start::
	$(info - mongod-start -------------------------)
	mongod --config data/mongod/configuration.yaml

mongod-stop::
	$(info - mongod-stop --------------------------)
	kill $(shell npx shx cat data/mongod/mongod.lock)