
ifeq ($(origin mablung-makefile-environment-path),undefined)
export mablung-makefile-environment-path := $(shell npx mablung-makefile-environment get-path)
endif

include $(mablung-makefile-environment-path)

cover::
	$(info )
	@$(MAKE) --no-print-directory mongod-stop

pre-cover:: mongod-start

test::
	$(info )
	@$(MAKE) --no-print-directory mongod-stop

pre-test:: mongod-start

# --------------------
.PHONY: mongod-start mongod-stop
# --------------------

mongod-start::
	$(info - mongod-start -------------------------)
	mongod --config data/mongod/configuration.yaml

mongod-stop::
	$(info - mongod-stop --------------------------)
	kill $(shell npx shx cat data/mongod/mongod.lock)